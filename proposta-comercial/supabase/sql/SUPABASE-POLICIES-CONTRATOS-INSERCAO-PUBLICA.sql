-- Política RLS: permitir INSERT público em public.proposta_contratos
-- Compatível com fluxo de aceite sem login (via link)

ALTER TABLE public.proposta_contratos ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas conflitantes
DROP POLICY IF EXISTS proposta_contratos_insert_public ON public.proposta_contratos;

-- Permitir INSERT para público quando houver proposta_criada relacionada
CREATE POLICY proposta_contratos_insert_public ON public.proposta_contratos
  FOR INSERT TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.propostas_criadas pc
      WHERE pc.id = proposta_contratos.proposta_criada_id
        AND pc.status IN ('aceita','pendente')
    )
  );

-- Garantir leitura pública (se ainda não existir)
DROP POLICY IF EXISTS proposta_contratos_select_all ON public.proposta_contratos;
CREATE POLICY proposta_contratos_select_all ON public.proposta_contratos
  FOR SELECT TO public
  USING (true);

COMMENT ON POLICY proposta_contratos_insert_public ON public.proposta_contratos IS
  'Permite inserir contratos vinculados a propostas pendentes/aceitas via link público.';