-- MIGRAÇÃO: Transição do modelo fixo (Social/Tráfego) para Catálogo (serviços cadastrados)
-- Objetivo: Centralizar itens de proposta em public.proposta_itens e reduzir dependência
--            dos campos fixos em public.propostas_criadas.

-- 1) Manter compatibilidade: não removemos colunas antigas, apenas documentamos como obsoletas.
COMMENT ON COLUMN public.propostas_criadas.servico_social_midia IS 'OBSOLETA: preferir itens em proposta_itens';
COMMENT ON COLUMN public.propostas_criadas.servico_trafego_pago IS 'OBSOLETA: preferir itens em proposta_itens';
COMMENT ON COLUMN public.propostas_criadas.valor_social_midia IS 'OBSOLETA: preferir soma de proposta_itens.total';
COMMENT ON COLUMN public.propostas_criadas.valor_trafego_pago IS 'OBSOLETA: preferir soma de proposta_itens.total';

-- 2) View de resumo baseada em Catálogo
DROP VIEW IF EXISTS public.resumo_propostas_catalogo;
CREATE OR REPLACE VIEW public.resumo_propostas_catalogo AS
SELECT
  pc.id,
  pc.status,
  pc.cpf_cnpj,
  pc.nome_cliente,
  pc.empresa_cliente,
  pc.criada_em,
  COALESCE(SUM(pi.total), 0) AS total_catalogo,
  COALESCE(JSON_AGG(
    JSON_BUILD_OBJECT(
      'nome_servico', pi.nome_servico,
      'descricao', pi.descricao,
      'quantidade', pi.quantidade,
      'preco_unitario', pi.preco_unitario,
      'desconto_percentual', pi.desconto_percentual,
      'total', pi.total
    )
  ) FILTER (WHERE pi.proposta_criada_id IS NOT NULL), '[]'::json) AS itens_catalogo
FROM public.propostas_criadas pc
LEFT JOIN public.proposta_itens pi ON pi.proposta_criada_id = pc.id
GROUP BY pc.id;

COMMENT ON VIEW public.resumo_propostas_catalogo IS 'Resumo de propostas baseado em itens do catálogo (proposta_itens).';

-- 3) Políticas: a view herda RLS das tabelas base. Garanta RLS em proposta_itens conforme SUPABASE-MIGRATION-NORMALIZACAO.sql
--    Se quiser restringir o acesso à view apenas para usuários autenticados:
--    (Observação: Supabase aplica RLS nas tabelas; a view não possui RLS própria.)

-- 4) Recomendações de dados existentes:
--    - Propostas antigas com apenas campos fixos continuarão visíveis; porém recomenda-se
--      migrar para itens em proposta_itens para relatórios e UI de clientes.
--    Exemplo de migração (opcional, ajuste conforme necessidade):
--    INSERT INTO public.proposta_itens (proposta_criada_id, nome_servico, descricao, quantidade, preco_unitario, desconto_percentual, total, metadata)
--    SELECT pc.id,
--           COALESCE(pc.servico_social_midia, pc.servico_trafego_pago, 'Serviço'),
--           NULL,
--           1,
--           COALESCE(pc.valor_social_midia, pc.valor_trafego_pago, 0),
--           0,
--           COALESCE(pc.valor_social_midia, pc.valor_trafego_pago, 0),
--           jsonb_build_object('origem','migracao')
--    FROM public.propostas_criadas pc
--    WHERE (COALESCE(pc.valor_social_midia,0) + COALESCE(pc.valor_trafego_pago,0)) > 0
--      AND NOT EXISTS (
--        SELECT 1 FROM public.proposta_itens pi WHERE pi.proposta_criada_id = pc.id
--      );