-- ============================================
-- INSTALAÇÃO CONSOLIDADA: Sistema de Propostas
-- Cria/atualiza a tabela public.propostas_criadas, índices, RLS, trigger
-- e a view public.resumo_propostas com guardas de existência.
-- Execute este script no SQL Editor do Supabase.
-- É idempotente e seguro em múltiplas execuções.
-- ============================================

-- 1) Tabela principal: propostas_criadas
CREATE TABLE IF NOT EXISTS public.propostas_criadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Dados do cliente
  nome_cliente TEXT NOT NULL,
  empresa_cliente TEXT,
  email_cliente TEXT NOT NULL,
  telefone_cliente TEXT,
  cpf_cnpj TEXT,
  endereco_cliente TEXT,
  representante_cliente TEXT,

  -- Serviços e valores
  servico_social_midia TEXT,
  servico_trafego_pago TEXT,
  investimento_midia TEXT,
  valor_social_midia DECIMAL(10,2) DEFAULT 0,
  valor_trafego_pago DECIMAL(10,2) DEFAULT 0,
  tem_comissao_vendas BOOLEAN DEFAULT false,
  percentual_comissao DECIMAL(5,2) DEFAULT 0,
  valor_fixo_trafego DECIMAL(10,2) DEFAULT 0,
  tipo_comissao_hibrido VARCHAR(20) DEFAULT 'percentual',
  valor_comissao_fixa DECIMAL(10,2) DEFAULT 0,

  -- Totais e cobrança
  valor_mensal DECIMAL(10,2) NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  desconto_aplicado DECIMAL(5,2) DEFAULT 0,
  recorrencia TEXT NOT NULL,
  forma_pagamento TEXT NOT NULL,

  -- Controle
  status TEXT DEFAULT 'pendente',
  responsavel_proposta TEXT,
  dias_validade INTEGER DEFAULT 7,
  observacoes TEXT,

  -- Metadados flexíveis
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  cliente_snapshot JSONB NULL,

  -- Metadados de sistema
  criada_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expira_em TIMESTAMP WITH TIME ZONE,
  aceita_em TIMESTAMP WITH TIME ZONE,
  ip_criacao INET,
  user_agent TEXT
);

-- Garante que a coluna metadata exista mesmo se a tabela já existir
ALTER TABLE public.propostas_criadas
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2) Índices
CREATE INDEX IF NOT EXISTS idx_propostas_criadas_criada_em ON public.propostas_criadas (criada_em);
CREATE INDEX IF NOT EXISTS idx_propostas_criadas_status ON public.propostas_criadas (status);

-- 3) Função e Trigger para expiração automática
CREATE OR REPLACE FUNCTION set_expiracao_proposta()
RETURNS trigger AS $$
BEGIN
  IF NEW.expira_em IS NULL THEN
    NEW.expira_em := COALESCE(NEW.criada_em, NOW()) + (COALESCE(NEW.dias_validade, 7) || ' days')::INTERVAL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_expiracao ON public.propostas_criadas;
CREATE TRIGGER trigger_set_expiracao
  BEFORE INSERT ON public.propostas_criadas
  FOR EACH ROW
  EXECUTE FUNCTION set_expiracao_proposta();

-- 4) RLS (Row Level Security) e Políticas
ALTER TABLE public.propostas_criadas ENABLE ROW LEVEL SECURITY;

-- Inserção pública (para geração de link sem login)
DROP POLICY IF EXISTS "Permitir INSERT público em propostas_criadas" ON public.propostas_criadas;
CREATE POLICY "Permitir INSERT público em propostas_criadas"
  ON public.propostas_criadas
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Leitura pública por ID (visualização pelo link)
DROP POLICY IF EXISTS "Permitir SELECT público em propostas_criadas por ID" ON public.propostas_criadas;
CREATE POLICY "Permitir SELECT público em propostas_criadas por ID"
  ON public.propostas_criadas
  FOR SELECT
  TO public
  USING (true);

-- Atualização limitada (ex.: marcar aceita/recusada)
DROP POLICY IF EXISTS "Permitir UPDATE de status para aceita" ON public.propostas_criadas;
CREATE POLICY "Permitir UPDATE de status para aceita"
  ON public.propostas_criadas
  FOR UPDATE
  TO public
  USING (status = 'pendente')
  WITH CHECK (status IN ('aceita', 'recusada'));

-- 5) View administrativa com guardas de existência
DROP VIEW IF EXISTS public.resumo_propostas;
DO $$
DECLARE
  p_exists BOOLEAN;
  c_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'propostas'
  ) INTO p_exists;
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'contratos'
  ) INTO c_exists;

  IF p_exists AND c_exists THEN
    EXECUTE 'CREATE VIEW public.resumo_propostas AS
      SELECT 
        pc.id,
        pc.nome_cliente,
        pc.empresa_cliente,
        pc.email_cliente,
        pc.telefone_cliente,
        pc.cpf_cnpj,
        pc.endereco_cliente,
        pc.representante_cliente,
        pc.servico_social_midia,
        pc.servico_trafego_pago,
        pc.valor_social_midia,
        pc.valor_trafego_pago,
        pc.tem_comissao_vendas,
        pc.percentual_comissao,
        pc.valor_fixo_trafego,
        pc.tipo_comissao_hibrido,
        pc.valor_comissao_fixa,
        pc.investimento_midia,
        pc.valor_mensal,
        pc.valor_total,
        pc.desconto_aplicado,
        pc.recorrencia,
        pc.forma_pagamento,
        pc.status,
        pc.responsavel_proposta,
        pc.dias_validade,
        pc.observacoes,
        pc.criada_em,
        pc.expira_em,
        pc.aceita_em,
        p.id AS proposta_aceita_id,
        p.recorrencia AS recorrencia_assinada,
        p.forma_pagamento AS forma_pagamento_assinada,
        c.pdf_url AS contrato_pdf_url,
        CASE 
          WHEN pc.status = ''aceita'' THEN ''Aceita''
          WHEN pc.status = ''recusada'' THEN ''Recusada''
          WHEN pc.expira_em < NOW() THEN ''Expirada''
          ELSE ''Pendente''
        END AS status_display,
        CASE 
          WHEN pc.expira_em < NOW() AND pc.status = ''pendente'' THEN true 
          ELSE false 
        END AS expirada
      FROM public.propostas_criadas pc
      LEFT JOIN public.propostas p ON pc.id = p.proposta_criada_id
      LEFT JOIN public.contratos c ON p.id = c.proposta_id
      ORDER BY pc.criada_em DESC';

  ELSIF p_exists THEN
    EXECUTE 'CREATE VIEW public.resumo_propostas AS
      SELECT 
        pc.id,
        pc.nome_cliente,
        pc.empresa_cliente,
        pc.email_cliente,
        pc.telefone_cliente,
        pc.cpf_cnpj,
        pc.endereco_cliente,
        pc.representante_cliente,
        pc.servico_social_midia,
        pc.servico_trafego_pago,
        pc.valor_social_midia,
        pc.valor_trafego_pago,
        pc.tem_comissao_vendas,
        pc.percentual_comissao,
        pc.valor_fixo_trafego,
        pc.tipo_comissao_hibrido,
        pc.valor_comissao_fixa,
        pc.investimento_midia,
        pc.valor_mensal,
        pc.valor_total,
        pc.desconto_aplicado,
        pc.recorrencia,
        pc.forma_pagamento,
        pc.status,
        pc.responsavel_proposta,
        pc.dias_validade,
        pc.observacoes,
        pc.criada_em,
        pc.expira_em,
        pc.aceita_em,
        p.id AS proposta_aceita_id,
        p.recorrencia AS recorrencia_assinada,
        p.forma_pagamento AS forma_pagamento_assinada,
        NULL::text AS contrato_pdf_url,
        CASE 
          WHEN pc.status = ''aceita'' THEN ''Aceita''
          WHEN pc.status = ''recusada'' THEN ''Recusada''
          WHEN pc.expira_em < NOW() THEN ''Expirada''
          ELSE ''Pendente''
        END AS status_display,
        CASE 
          WHEN pc.expira_em < NOW() AND pc.status = ''pendente'' THEN true 
          ELSE false 
        END AS expirada
      FROM public.propostas_criadas pc
      LEFT JOIN public.propostas p ON pc.id = p.proposta_criada_id
      ORDER BY pc.criada_em DESC';

  ELSE
    EXECUTE 'CREATE VIEW public.resumo_propostas AS
      SELECT 
        pc.id,
        pc.nome_cliente,
        pc.empresa_cliente,
        pc.email_cliente,
        pc.telefone_cliente,
        pc.cpf_cnpj,
        pc.endereco_cliente,
        pc.representante_cliente,
        pc.servico_social_midia,
        pc.servico_trafego_pago,
        pc.valor_social_midia,
        pc.valor_trafego_pago,
        pc.tem_comissao_vendas,
        pc.percentual_comissao,
        pc.valor_fixo_trafego,
        pc.tipo_comissao_hibrido,
        pc.valor_comissao_fixa,
        pc.investimento_midia,
        pc.valor_mensal,
        pc.valor_total,
        pc.desconto_aplicado,
        pc.recorrencia,
        pc.forma_pagamento,
        pc.status,
        pc.responsavel_proposta,
        pc.dias_validade,
        pc.observacoes,
        pc.criada_em,
        pc.expira_em,
        pc.aceita_em,
        NULL::uuid AS proposta_aceita_id,
        NULL::text AS recorrencia_assinada,
        NULL::text AS forma_pagamento_assinada,
        NULL::text AS contrato_pdf_url,
        CASE 
          WHEN pc.status = ''aceita'' THEN ''Aceita''
          WHEN pc.status = ''recusada'' THEN ''Recusada''
          WHEN pc.expira_em < NOW() THEN ''Expirada''
          ELSE ''Pendente''
        END AS status_display,
        CASE 
          WHEN pc.expira_em < NOW() AND pc.status = ''pendente'' THEN true 
          ELSE false 
        END AS expirada
      FROM public.propostas_criadas pc
      ORDER BY pc.criada_em DESC';
  END IF;
END $$ LANGUAGE plpgsql;

-- 6) Comentários (documentação básica)
COMMENT ON TABLE public.propostas_criadas IS 'Armazena propostas geradas antes da assinatura (link público).';
COMMENT ON COLUMN public.propostas_criadas.metadata IS 'Metadados flexíveis (ex.: catalogo).';

-- 7) Opcional: criar referência em public.propostas caso exista
DO $$
DECLARE
  t_exists BOOLEAN;
  col_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'propostas'
  ) INTO t_exists;

  IF t_exists THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'propostas' AND column_name = 'proposta_criada_id'
    ) INTO col_exists;

    IF NOT col_exists THEN
      ALTER TABLE public.propostas ADD COLUMN proposta_criada_id UUID REFERENCES public.propostas_criadas(id);
      CREATE INDEX IF NOT EXISTS idx_propostas_proposta_criada_id ON public.propostas(proposta_criada_id);
    END IF;
  END IF;
END $$ LANGUAGE plpgsql;

-- ============================================
-- FIM DO SCRIPT CONSOLIDADO
-- ============================================