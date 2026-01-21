-- ============================================
-- ATUALIZAÇÃO: Sistema de Comissão por Vendas
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Adicionar colunas em propostas_criadas
ALTER TABLE public.propostas_criadas 
ADD COLUMN IF NOT EXISTS tem_comissao_vendas BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS percentual_comissao DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS valor_fixo_trafego DECIMAL(10,2) DEFAULT 0;

-- 2. Adicionar mesmas colunas em propostas
ALTER TABLE public.propostas 
ADD COLUMN IF NOT EXISTS tem_comissao_vendas BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS percentual_comissao DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS valor_fixo_trafego DECIMAL(10,2) DEFAULT 0;

-- 3. Comentários para documentação
COMMENT ON COLUMN public.propostas_criadas.tem_comissao_vendas IS 'Se true, inclui comissão por vendas no modelo de cobrança';
COMMENT ON COLUMN public.propostas_criadas.percentual_comissao IS 'Percentual de comissão sobre vendas (ex: 5.00 = 5%)';
COMMENT ON COLUMN public.propostas_criadas.valor_fixo_trafego IS 'Valor fixo mensal de tráfego pago (pode ser 0 se for só comissão)';
COMMENT ON COLUMN public.propostas.tem_comissao_vendas IS 'Se true, inclui comissão por vendas no modelo de cobrança';
COMMENT ON COLUMN public.propostas.percentual_comissao IS 'Percentual de comissão sobre vendas (ex: 5.00 = 5%)';
COMMENT ON COLUMN public.propostas.valor_fixo_trafego IS 'Valor fixo mensal de tráfego pago (pode ser 0 se for só comissão)';

-- 4. Dropar e recriar view resumo_propostas
DROP VIEW IF EXISTS public.resumo_propostas;
CREATE VIEW public.resumo_propostas AS
SELECT 
  pc.id,
  pc.nome_cliente,
  pc.empresa_cliente,
  pc.email_cliente,
  pc.telefone_cliente,
  pc.cpf_cnpj,
  pc.servico_social_midia,
  pc.servico_trafego_pago,
  pc.valor_social_midia,
  pc.valor_trafego_pago,
  pc.tem_comissao_vendas,
  pc.percentual_comissao,
  pc.valor_fixo_trafego,
  pc.investimento_midia,
  pc.valor_mensal,
  pc.valor_total,
  pc.recorrencia,
  pc.forma_pagamento,
  pc.status,
  pc.responsavel_proposta,
  pc.criada_em,
  pc.expira_em,
  pc.aceita_em,
  p.id AS proposta_aceita_id,
  p.recorrencia AS recorrencia_assinada,
  p.forma_pagamento AS forma_pagamento_assinada,
  c.pdf_url AS contrato_pdf_url,
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
LEFT JOIN public.propostas p ON pc.id = p.proposta_criada_id
LEFT JOIN public.contratos c ON p.id = c.proposta_id
ORDER BY pc.criada_em DESC;

-- ============================================
-- FIM DO SCRIPT
-- ============================================

-- Modelos de cobrança possíveis:
-- 1. FIXO: valor_fixo_trafego > 0, tem_comissao_vendas = false
-- 2. COMISSÃO: valor_fixo_trafego = 0, tem_comissao_vendas = true
-- 3. HÍBRIDO: valor_fixo_trafego > 0, tem_comissao_vendas = true
