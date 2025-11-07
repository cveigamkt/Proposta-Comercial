-- ============================================
-- ATUALIZAÇÃO: Separar valores e adicionar campos de pagamento
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Adicionar colunas de valores separados em propostas_criadas
ALTER TABLE public.propostas_criadas 
ADD COLUMN IF NOT EXISTS valor_social_midia DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS valor_trafego_pago DECIMAL(10,2) DEFAULT 0;

-- 2. Adicionar mesmas colunas em propostas (tabela de propostas aceitas)
ALTER TABLE public.propostas 
ADD COLUMN IF NOT EXISTS valor_social_midia DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS valor_trafego_pago DECIMAL(10,2) DEFAULT 0;

-- 3. Comentários para documentação
COMMENT ON COLUMN public.propostas_criadas.valor_social_midia IS 'Valor mensal do serviço de Social Media';
COMMENT ON COLUMN public.propostas_criadas.valor_trafego_pago IS 'Valor mensal do serviço de Tráfego Pago (sem investimento em mídia)';
COMMENT ON COLUMN public.propostas.valor_social_midia IS 'Valor mensal do serviço de Social Media';
COMMENT ON COLUMN public.propostas.valor_trafego_pago IS 'Valor mensal do serviço de Tráfego Pago (sem investimento em mídia)';

-- 4. Dropar e recriar view resumo_propostas para incluir novos campos
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
-- FIM DO SCRIPT DE ATUALIZAÇÃO
-- ============================================

-- Para executar:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em SQL Editor
-- 3. Cole este script completo
-- 4. Execute (Run)
-- 5. Verifique se as colunas foram adicionadas em "Table Editor"
