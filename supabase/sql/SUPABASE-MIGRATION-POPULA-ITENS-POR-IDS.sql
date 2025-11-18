-- MIGRAÇÃO dirigida: popular public.proposta_itens para propostas específicas
-- Objetivo: preencher itens de catálogo a partir dos valores legados
-- IDs alvo: fornecidos pelo usuário (3 propostas)

BEGIN;

WITH base AS (
  SELECT id,
         servico_social_midia,
         valor_social_midia,
         servico_trafego_pago,
         valor_trafego_pago,
         valor_total,
         valor_mensal
  FROM public.propostas_criadas
  WHERE id IN (
    'fa2bf71f-1635-475a-bc35-bc9d4d5d3168',
    '39530c08-eff2-446b-9b93-58a61707a7e4',
    '221d2fa2-ab05-40a2-9a9a-1e1f3e6c0054'
  )
)
INSERT INTO public.proposta_itens
  (proposta_criada_id, nome_servico, descricao, quantidade, preco_unitario, desconto_percentual, total, metadata)
-- Social Mídia, quando houver valor
SELECT
  id,
  COALESCE(servico_social_midia, 'Social Mídia'),
  NULL,
  1,
  valor_social_midia,
  0,
  valor_social_midia,
  jsonb_build_object('origem','migracao','fonte','propostas_criadas')
FROM base
WHERE COALESCE(valor_social_midia, 0) > 0

UNION ALL
-- Tráfego Pago, quando houver valor
SELECT
  id,
  COALESCE(servico_trafego_pago, 'Tráfego Pago'),
  NULL,
  1,
  valor_trafego_pago,
  0,
  valor_trafego_pago,
  jsonb_build_object('origem','migracao','fonte','propostas_criadas')
FROM base
WHERE COALESCE(valor_trafego_pago, 0) > 0

UNION ALL
-- Fallback único: usa total/mensal quando ambos os legados são zero
SELECT
  id,
  'Serviço/Plano',
  NULL,
  1,
  COALESCE(valor_total, valor_mensal, 0),
  0,
  COALESCE(valor_total, valor_mensal, 0),
  jsonb_build_object('origem','migracao','fonte','propostas_criadas','fallback',true)
FROM base
WHERE COALESCE(valor_social_midia, 0) = 0
  AND COALESCE(valor_trafego_pago, 0) = 0
  AND COALESCE(valor_total, valor_mensal, 0) > 0;

COMMIT;

-- Validação sugerida:
-- SELECT * FROM public.proposta_itens WHERE proposta_criada_id IN (
--   'fa2bf71f-1635-475a-bc35-bc9d4d5d3168',
--   '39530c08-eff2-446b-9b93-58a61707a7e4',
--   '221d2fa2-ab05-40a2-9a9a-1e1f3e6c0054'
-- );
-- SELECT id, total_catalogo, itens_catalogo
--   FROM public.resumo_propostas_catalogo
--  WHERE id IN (
--   'fa2bf71f-1635-475a-bc35-bc9d4d5d3168',
--   '39530c08-eff2-446b-9b93-58a61707a7e4',
--   '221d2fa2-ab05-40a2-9a9a-1e1f3e6c0054'
-- );