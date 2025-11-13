-- ============================================
-- MIGRAÇÃO: Otimizações de esquema e RLS
-- ============================================

-- 1) Adicionar referência opcional ao cliente em propostas_criadas
ALTER TABLE IF EXISTS public.propostas_criadas
ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES public.clientes(id);

-- 2) Índices úteis para performance
CREATE INDEX IF NOT EXISTS idx_propostas_criadas_expira_em ON public.propostas_criadas(expira_em DESC);
CREATE INDEX IF NOT EXISTS idx_propostas_criadas_cliente_id ON public.propostas_criadas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_propostas_criadas_responsavel ON public.propostas_criadas(responsavel_proposta);

-- 3) Constraint de validade (sanidade)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'propostas_criadas'
      AND c.conname = 'chk_propostas_criadas_dias_validade'
  ) THEN
    ALTER TABLE public.propostas_criadas
      ADD CONSTRAINT chk_propostas_criadas_dias_validade
      CHECK (dias_validade IS NULL OR (dias_validade >= 0 AND dias_validade <= 365));
  END IF;
END
$$;

-- 4) Função helper: editor ou admin
CREATE OR REPLACE FUNCTION public.is_editor_or_admin(u UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.usuarios x WHERE x.user_id = u AND x.papel IN ('admin','editor')
  );
$$;

-- 5) Políticas RLS para propostas_criadas
ALTER TABLE public.propostas_criadas ENABLE ROW LEVEL SECURITY;

-- Remover políticas abertas (se existirem)
DROP POLICY IF EXISTS "Permitir INSERT público em propostas_criadas" ON public.propostas_criadas;

-- Inserir: apenas autenticados com papel editor/admin
DROP POLICY IF EXISTS "propostas_criadas_insert_auth" ON public.propostas_criadas;
CREATE POLICY "propostas_criadas_insert_auth"
ON public.propostas_criadas FOR INSERT
TO authenticated
WITH CHECK (public.is_editor_or_admin(auth.uid()));

-- Update: apenas quem criou (por responsavel_proposta = email) OU admin
-- Nota: este critério assume que a aplicação grava o e-mail no campo responsavel_proposta
DROP POLICY IF EXISTS "Permitir UPDATE de status para aceita" ON public.propostas_criadas;
DROP POLICY IF EXISTS "propostas_criadas_update_auth" ON public.propostas_criadas;
CREATE POLICY "propostas_criadas_update_auth"
ON public.propostas_criadas FOR UPDATE
TO authenticated
USING (
  responsavel_proposta IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.usuarios u WHERE u.user_id = auth.uid() AND u.email = responsavel_proposta
  )
  OR public.is_admin(auth.uid())
)
WITH CHECK (
  responsavel_proposta IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.usuarios u WHERE u.user_id = auth.uid() AND u.email = responsavel_proposta
  )
  OR public.is_admin(auth.uid())
);

-- Select: manter leitura pública (visualização por link), mas é recomendável expor via view controlada
-- Se desejar restringir, substitua TO public por TO authenticated e filtre por criador/responsável
DROP POLICY IF EXISTS "Permitir SELECT público em propostas_criadas por ID" ON public.propostas_criadas;
DROP POLICY IF EXISTS "propostas_criadas_select_public" ON public.propostas_criadas;
CREATE POLICY "propostas_criadas_select_public"
ON public.propostas_criadas FOR SELECT
TO public
USING (true);

COMMENT ON FUNCTION public.is_editor_or_admin IS 'Retorna true se UID tiver papel editor/admin na tabela usuarios';

-- 6) Observações:
-- - A aplicação já define o responsável pelo e-mail do usuário logado.
-- - Com cliente_id presente, futuras migrações podem descontinuar colunas snapshot duplicadas.

-- ============================================
-- FIM
-- ============================================