-- Normalização do modelo de propostas
-- Objetivo: separar responsabilidades (clientes, propostas, itens, andamento, contratos)
-- e reduzir redundâncias mantendo apenas o necessário em snapshots.

-- Observação: este script é incremental e não remove colunas existentes.
-- Após validação e backfill, podemos fazer uma Fase 2 para eliminar redundâncias.

-- Garantir uso do schema public
SET search_path TO public;

-- 1) Complementar a tabela base com referências e snapshots
-- Adiciona responsável como referência ao usuário autenticado
ALTER TABLE IF EXISTS public.propostas_criadas
  ADD COLUMN IF NOT EXISTS responsavel_user_id uuid NULL;

-- Garantir unicidade em public.usuarios.user_id para permitir FKs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'usuarios'
      AND c.conname = 'usuarios_user_id_unique'
  ) THEN
    ALTER TABLE public.usuarios
      ADD CONSTRAINT usuarios_user_id_unique UNIQUE (user_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'propostas_criadas'
      AND c.conname = 'fk_propostas_criadas_responsavel_user'
  ) THEN
    ALTER TABLE public.propostas_criadas
      ADD CONSTRAINT fk_propostas_criadas_responsavel_user
      FOREIGN KEY (responsavel_user_id)
      REFERENCES public.usuarios (user_id)
      ON UPDATE CASCADE
      ON DELETE SET NULL;
  END IF;
END
$$;

-- Snapshot compacto de dados do cliente no momento da proposta (opcional)
ALTER TABLE IF EXISTS public.propostas_criadas
  ADD COLUMN IF NOT EXISTS cliente_snapshot jsonb NULL;

COMMENT ON COLUMN public.propostas_criadas.cliente_snapshot IS
  'Snapshot opcional dos dados do cliente na geração da proposta (nome, documento, empresa, endereço, contato). Use cliente_id para dados atuais.';

-- 2) Itens/serviços da proposta (linha a linha)
CREATE TABLE IF NOT EXISTS public.proposta_itens (
  id bigserial PRIMARY KEY,
  proposta_criada_id uuid NOT NULL,
  nome_servico text NOT NULL,
  descricao text NULL,
  quantidade numeric(12,2) NOT NULL DEFAULT 1,
  preco_unitario numeric(12,2) NOT NULL,
  desconto_percentual numeric(5,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT fk_itens_proposta_criada
    FOREIGN KEY (proposta_criada_id)
    REFERENCES public.propostas_criadas(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_proposta_itens_proposta ON public.proposta_itens (proposta_criada_id);
CREATE INDEX IF NOT EXISTS idx_proposta_itens_created_at ON public.proposta_itens (created_at);

COMMENT ON TABLE public.proposta_itens IS 'Itens/serviços associados a uma proposta criada (1:N).';

-- 3) Andamento / histórico de status da proposta
CREATE TABLE IF NOT EXISTS public.proposta_status_history (
  id bigserial PRIMARY KEY,
  proposta_criada_id uuid NOT NULL,
  status text NOT NULL,
  observacao text NULL,
  created_by uuid NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT fk_status_proposta_criada
    FOREIGN KEY (proposta_criada_id)
    REFERENCES public.propostas_criadas(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_status_created_by
    FOREIGN KEY (created_by)
    REFERENCES public.usuarios(user_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_status_history_proposta ON public.proposta_status_history (proposta_criada_id);
CREATE INDEX IF NOT EXISTS idx_status_history_status ON public.proposta_status_history (status);
CREATE INDEX IF NOT EXISTS idx_status_history_created_at ON public.proposta_status_history (created_at);

COMMENT ON TABLE public.proposta_status_history IS 'Histórico de andamento/status das propostas.';
COMMENT ON COLUMN public.proposta_status_history.status IS 'Ex.: nova, enviada, aceita, rejeitada, negociacao, expirada, cancelada, contrato_gerado, contrato_assinado.';

-- 4) Contratos associados à proposta
CREATE TABLE IF NOT EXISTS public.proposta_contratos (
  id bigserial PRIMARY KEY,
  proposta_criada_id uuid NOT NULL,
  contrato_url text NULL,
  contrato_sha256 text NULL,
  status text NULL,
  created_by uuid NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT fk_contratos_proposta_criada
    FOREIGN KEY (proposta_criada_id)
    REFERENCES public.propostas_criadas(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_contratos_created_by
    FOREIGN KEY (created_by)
    REFERENCES public.usuarios(user_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_contratos_proposta ON public.proposta_contratos (proposta_criada_id);
CREATE INDEX IF NOT EXISTS idx_contratos_status ON public.proposta_contratos (status);
CREATE INDEX IF NOT EXISTS idx_contratos_created_at ON public.proposta_contratos (created_at);

COMMENT ON TABLE public.proposta_contratos IS 'Contratos gerados/associados às propostas, com status e origem.';

-- 5) RLS para novas tabelas (reutiliza is_editor_or_admin() definida em MIGRATION-OTIMIZACOES)
ALTER TABLE IF EXISTS public.proposta_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.proposta_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.proposta_contratos ENABLE ROW LEVEL SECURITY;

-- Política de leitura ampla (ajuste se quiser restringir a leitura)
DROP POLICY IF EXISTS proposta_itens_select_all ON public.proposta_itens;
CREATE POLICY proposta_itens_select_all ON public.proposta_itens
  FOR SELECT USING (true);

DROP POLICY IF EXISTS proposta_status_select_all ON public.proposta_status_history;
CREATE POLICY proposta_status_select_all ON public.proposta_status_history
  FOR SELECT USING (true);

DROP POLICY IF EXISTS proposta_contratos_select_all ON public.proposta_contratos;
CREATE POLICY proposta_contratos_select_all ON public.proposta_contratos
  FOR SELECT USING (true);

-- Inserção pública para permitir que o cliente selecione itens
DROP POLICY IF EXISTS proposta_itens_insert_public ON public.proposta_itens;
CREATE POLICY proposta_itens_insert_public ON public.proposta_itens
  FOR INSERT TO public
  WITH CHECK (true);

-- Inserção pública para registrar eventos básicos de status (ex.: itens_preenchidos)
DROP POLICY IF EXISTS proposta_status_insert_public ON public.proposta_status_history;
CREATE POLICY proposta_status_insert_public ON public.proposta_status_history
  FOR INSERT TO public
  WITH CHECK (true);

-- Inserção/atualização/exclusão por editores/admins autenticados
DROP POLICY IF EXISTS proposta_itens_write ON public.proposta_itens;
CREATE POLICY proposta_itens_write ON public.proposta_itens
  FOR ALL TO authenticated
  USING ( public.is_editor_or_admin(auth.uid()) )
  WITH CHECK ( public.is_editor_or_admin(auth.uid()) );

DROP POLICY IF EXISTS proposta_status_write ON public.proposta_status_history;
CREATE POLICY proposta_status_write ON public.proposta_status_history
  FOR ALL TO authenticated
  USING ( public.is_editor_or_admin(auth.uid()) )
  WITH CHECK ( public.is_editor_or_admin(auth.uid()) );

DROP POLICY IF EXISTS proposta_contratos_write ON public.proposta_contratos;
CREATE POLICY proposta_contratos_write ON public.proposta_contratos
  FOR ALL TO authenticated
  USING ( public.is_editor_or_admin(auth.uid()) )
  WITH CHECK ( public.is_editor_or_admin(auth.uid()) );

-- 6) Índices úteis na base
CREATE INDEX IF NOT EXISTS idx_propostas_criadas_responsavel_user ON public.propostas_criadas (responsavel_user_id);
CREATE INDEX IF NOT EXISTS idx_propostas_criadas_cliente_snapshot ON public.propostas_criadas USING GIN (cliente_snapshot);

-- 7) Passos de backfill (opcionais, ajustar nomes das colunas conforme seu schema)
-- Exemplo: preencher cliente_snapshot a partir de colunas existentes, se presentes.
-- Descomente e ajuste conforme os nomes no seu banco:
-- UPDATE public.propostas_criadas pc
-- SET cliente_snapshot = jsonb_build_object(
--   'nome', pc.cliente_nome,
--   'documento', pc.cpf_cnpj_cliente,
--   'empresa', pc.empresa_cliente,
--   'endereco', pc.endereco_cliente,
--   'representante', pc.representante_cliente,
--   'email', pc.email_cliente,
--   'telefone', pc.telefone_cliente
-- )
-- WHERE pc.cliente_snapshot IS NULL;

-- Fase 2 (posterior): remover colunas redundantes em propostas_criadas e
-- ajustar views (ex.: public.resumo_propostas) para usar joins e snapshots.

-- Fim do script de normalização