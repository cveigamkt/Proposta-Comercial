-- ============================================
-- ATUALIZAÇÃO: Campos para controle de assinatura
-- Adiciona campos para rastreamento de assinaturas
-- ============================================

-- Adicionar campos de assinatura e controle de atualização
ALTER TABLE public.propostas_criadas 
ADD COLUMN IF NOT EXISTS assinado_em TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS atualizada_em TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS assinado_por TEXT,
ADD COLUMN IF NOT EXISTS hash_assinatura TEXT;

-- Adicionar índice para melhorar performance de busca por data de assinatura
CREATE INDEX IF NOT EXISTS idx_propostas_criadas_assinado_em ON public.propostas_criadas(assinado_em);
CREATE INDEX IF NOT EXISTS idx_propostas_criadas_atualizada_em ON public.propostas_criadas(atualizada_em);

-- Atualizar a view resumo_propostas para incluir os novos campos
CREATE OR REPLACE VIEW public.resumo_propostas AS
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
  pc.atualizada_em,
  pc.expira_em,
  pc.aceita_em,
  pc.assinado_em,
  pc.assinado_por,
  pc.hash_assinatura,
  p.id AS proposta_aceita_id,
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

-- Criar tabela de notificações para registro de eventos
CREATE TABLE IF NOT EXISTS public.notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL, -- 'assinatura', 'status_change', 'expiracao'
  proposta_id UUID REFERENCES public.propostas_criadas(id) ON DELETE CASCADE,
  mensagem TEXT NOT NULL,
  dados_adicionais JSONB,
  criada_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  lida BOOLEAN DEFAULT FALSE
);

-- Índices para notificações
CREATE INDEX IF NOT EXISTS idx_notificacoes_proposta_id ON public.notificacoes(proposta_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_tipo ON public.notificacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_notificacoes_criada_em ON public.notificacoes(criada_em DESC);

-- Função para registrar notificações automaticamente
CREATE OR REPLACE FUNCTION registrar_notificacao(
  p_tipo TEXT,
  p_proposta_id UUID,
  p_mensagem TEXT,
  p_dados_adicionais JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  notificacao_id UUID;
BEGIN
  INSERT INTO public.notificacoes (tipo, proposta_id, mensagem, dados_adicionais)
  VALUES (p_tipo, p_proposta_id, p_mensagem, p_dados_adicionais)
  RETURNING id INTO notificacao_id;
  
  RETURN notificacao_id;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizada_em := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar timestamp automaticamente
DROP TRIGGER IF EXISTS trigger_atualizar_timestamp ON public.propostas_criadas;
CREATE TRIGGER trigger_atualizar_timestamp
  BEFORE UPDATE ON public.propostas_criadas
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp();

-- Função para processar assinatura de proposta
CREATE OR REPLACE FUNCTION processar_assinatura_proposta(
  p_proposta_id UUID,
  p_assinado_por TEXT DEFAULT NULL,
  p_hash_assinatura TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  proposta_record RECORD;
  resultado BOOLEAN := FALSE;
BEGIN
  -- Verificar se a proposta existe e está pendente
  SELECT * INTO proposta_record
  FROM public.propostas_criadas
  WHERE id = p_proposta_id AND status = 'pendente';
  
  IF FOUND THEN
    -- Atualizar status e dados de assinatura
    UPDATE public.propostas_criadas
    SET 
      status = 'aceita',
      assinado_em = NOW(),
      assinado_por = COALESCE(p_assinado_por, 'Sistema'),
      hash_assinatura = p_hash_assinatura,
      aceita_em = NOW()
    WHERE id = p_proposta_id;
    
    -- Registrar notificação
    PERFORM registrar_notificacao(
      'assinatura',
      p_proposta_id,
      'Proposta assinada com sucesso',
      jsonb_build_object(
        'assinado_por', COALESCE(p_assinado_por, 'Sistema'),
        'assinado_em', NOW(),
        'status_anterior', 'pendente',
        'status_novo', 'aceita'
      )
    );
    
    resultado := TRUE;
  END IF;
  
  RETURN resultado;
END;
$$ LANGUAGE plpgsql;

-- Comentários de documentação
COMMENT ON COLUMN public.propostas_criadas.assinado_em IS 'Data/hora em que a proposta foi assinada';
COMMENT ON COLUMN public.propostas_criadas.atualizada_em IS 'Data/hora da última atualização do registro';
COMMENT ON COLUMN public.propostas_criadas.assinado_por IS 'Nome ou identificação de quem assinou a proposta';
COMMENT ON COLUMN public.propostas_criadas.hash_assinatura IS 'Hash único da assinatura para validação';
COMMENT ON TABLE public.notificacoes IS 'Registro de eventos e notificações do sistema';
COMMENT ON FUNCTION processar_assinatura_proposta IS 'Processa a assinatura de uma proposta pendente';

-- ============================================
-- FIM DA ATUALIZAÇÃO
-- ============================================