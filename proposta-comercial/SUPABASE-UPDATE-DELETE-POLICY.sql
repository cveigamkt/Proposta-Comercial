-- ============================================
-- ATUALIZAÇÃO: Política de DELETE em propostas_criadas
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Garantir que RLS está habilitado
ALTER TABLE public.propostas_criadas ENABLE ROW LEVEL SECURITY;

-- Remover política de DELETE existente (se houver)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'propostas_criadas' 
      AND policyname = 'Permitir DELETE público em propostas_criadas não aceitas'
  ) THEN
    DROP POLICY "Permitir DELETE público em propostas_criadas não aceitas" ON public.propostas_criadas;
  END IF;
END $$;

-- Política: Permitir DELETE para propostas que NÃO estão aceitas
-- Justificativa: permitir limpeza de propostas pendentes, recusadas ou expiradas
CREATE POLICY "Permitir DELETE público em propostas_criadas não aceitas"
  ON public.propostas_criadas
  FOR DELETE
  TO public
  USING (status <> 'aceita');

-- Comentário da política
COMMENT ON POLICY "Permitir DELETE público em propostas_criadas não aceitas" ON public.propostas_criadas IS 
  'Permite excluir propostas pendentes, recusadas ou expiradas; propostas aceitas permanecem protegidas.';

-- Observação: Se existir referência em outras tabelas sem ON DELETE CASCADE,
-- a exclusão poderá falhar por restrição de FK. O admin já bloqueia exclusão
-- de propostas aceitas. Para pendentes/recusadas/expiradas, não devem existir 
-- registros relacionados em "propostas" ou "contratos".

-- ============================================
-- FIM DO SCRIPT
-- ============================================