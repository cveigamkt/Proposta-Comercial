-- Adiciona coluna de IP da assinatura em proposta_contratos (compatível com fluxo público)
-- Executar no SQL Editor do Supabase

-- Adicionar coluna ip_assinatura (tipo INET) se não existir
ALTER TABLE public.proposta_contratos
  ADD COLUMN IF NOT EXISTS ip_assinatura inet NULL;

COMMENT ON COLUMN public.proposta_contratos.ip_assinatura IS 'IP de origem da assinatura do contrato (registro público)';

-- Opcional: backfill de ips a partir de tabela antiga 'contratos' se existir
-- UPDATE public.proposta_contratos pc
--   SET ip_assinatura = c.ip_assinatura::inet
-- FROM public.contratos c
-- JOIN public.propostas p ON p.proposta_criada_id = pc.proposta_criada_id
-- WHERE c.proposta_id = p.id
--   AND pc.ip_assinatura IS NULL;