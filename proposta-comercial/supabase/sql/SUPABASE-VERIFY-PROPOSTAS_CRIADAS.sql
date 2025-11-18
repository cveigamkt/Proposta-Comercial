-- ============================================
-- VERIFICAÇÃO/ATUALIZAÇÃO: Tabela public.propostas_criadas
-- Objetivo: garantir que TODOS os campos esperados existam
-- Execute este script no SQL Editor do Supabase
-- É idempotente: só adiciona colunas que faltarem
-- ============================================

-- 0) Metadados flexíveis da proposta
ALTER TABLE public.propostas_criadas 
ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.propostas_criadas.metadata IS 'Metadados flexíveis (ex.: catalogo, flags de desconto).';

-- 1) Campos de valores separados
ALTER TABLE public.propostas_criadas 
ADD COLUMN IF NOT EXISTS valor_social_midia DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS valor_trafego_pago DECIMAL(10,2) DEFAULT 0;

COMMENT ON COLUMN public.propostas_criadas.valor_social_midia IS 'Valor mensal do serviço de Social Media';
COMMENT ON COLUMN public.propostas_criadas.valor_trafego_pago IS 'Valor mensal do serviço de Tráfego Pago (sem investimento em mídia)';

-- 2) Comissão por vendas e modelos híbridos
ALTER TABLE public.propostas_criadas 
ADD COLUMN IF NOT EXISTS tem_comissao_vendas BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS percentual_comissao DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS valor_fixo_trafego DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tipo_comissao_hibrido VARCHAR(20) DEFAULT 'percentual',
ADD COLUMN IF NOT EXISTS valor_comissao_fixa DECIMAL(10,2) DEFAULT 0;

COMMENT ON COLUMN public.propostas_criadas.tem_comissao_vendas IS 'Se true, inclui comissão por vendas no modelo de cobrança';
COMMENT ON COLUMN public.propostas_criadas.percentual_comissao IS 'Percentual de comissão sobre vendas (ex: 5.00 = 5%)';
COMMENT ON COLUMN public.propostas_criadas.valor_fixo_trafego IS 'Valor fixo mensal de tráfego pago (pode ser 0 se for só comissão)';
COMMENT ON COLUMN public.propostas_criadas.tipo_comissao_hibrido IS 'Tipo de comissão no modelo híbrido: "percentual" ou "fixo"';
COMMENT ON COLUMN public.propostas_criadas.valor_comissao_fixa IS 'Valor fixo cobrado por venda no modelo híbrido (quando tipo_comissao_hibrido = "fixo")';

-- 3) Endereço e representante do cliente
ALTER TABLE public.propostas_criadas 
ADD COLUMN IF NOT EXISTS endereco_cliente TEXT,
ADD COLUMN IF NOT EXISTS representante_cliente TEXT;

COMMENT ON COLUMN public.propostas_criadas.endereco_cliente IS 'Endereço completo do cliente';
COMMENT ON COLUMN public.propostas_criadas.representante_cliente IS 'Nome do representante legal do cliente';

-- 4) Recriar a view resumo_propostas para refletir TODOS os campos
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
    EXECUTE $$
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
    $$;
  ELSIF p_exists THEN
    EXECUTE $$
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
      ORDER BY pc.criada_em DESC;
    $$;
  ELSE
    EXECUTE $$
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
      ORDER BY pc.criada_em DESC;
    $$;
  END IF;
END $$;

-- ============================================
-- FIM DO SCRIPT DE VERIFICAÇÃO
-- ============================================