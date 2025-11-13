-- ============================================
-- MIGRAÇÃO: Campos adicionais do cliente em propostas_criadas
-- Objetivo: armazenar melhor dia de pagamento diretamente em propostas_criadas
-- e refletir no painel via view resumo_propostas
-- ============================================

-- 1) Adicionar coluna melhor_dia_pagamento (1-31)
ALTER TABLE public.propostas_criadas 
ADD COLUMN IF NOT EXISTS melhor_dia_pagamento INTEGER;

-- Constraint simples para faixa válida
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ck_propostas_criadas_melhor_dia_pagamento_range'
  ) THEN
    ALTER TABLE public.propostas_criadas
    ADD CONSTRAINT ck_propostas_criadas_melhor_dia_pagamento_range
    CHECK (melhor_dia_pagamento IS NULL OR (melhor_dia_pagamento >= 1 AND melhor_dia_pagamento <= 31));
  END IF;
END $$;

COMMENT ON COLUMN public.propostas_criadas.melhor_dia_pagamento IS 'Melhor dia do mês para cobrança informado pelo cliente (1-31)';

-- 2) Recriar a view resumo_propostas incluindo melhor_dia_pagamento
DROP VIEW IF EXISTS public.resumo_propostas;
CREATE VIEW public.resumo_propostas AS
SELECT 
  pc.id,
  pc.nome_cliente,
  pc.empresa_cliente,
  pc.email_cliente,
  pc.telefone_cliente,
  pc.cpf_cnpj,
  pc.endereco_cliente,
  pc.representante_cliente,
  pc.melhor_dia_pagamento,
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
  pc.responsavel_proposta,
  pc.dias_validade,
  pc.observacoes,
  pc.criada_em,
  pc.expira_em,
  pc.aceita_em,
  NULL::uuid AS proposta_aceita_id,
  NULL::text AS recorrencia_assinada,
  NULL::text AS forma_pagamento_assinada,
  c.contrato_url AS contrato_pdf_url,
  CASE 
    WHEN pc.status = 'aceita' THEN 'Aceita'
    WHEN pc.status = 'recusada' THEN 'Recusada'
    WHEN pc.expira_em < NOW() THEN 'Expirada'
    ELSE 'Pendente'
  END AS status_display,
  CASE 
    WHEN pc.expira_em < NOW() AND pc.status = 'pendente' THEN true 
    ELSE false 
  END AS expirada
FROM public.propostas_criadas pc
LEFT JOIN public.proposta_contratos c ON c.proposta_criada_id = pc.id
ORDER BY pc.criada_em DESC;

-- ============================================
-- FIM DA MIGRAÇÃO
-- ============================================