-- ============================================
-- SCHEMA COMPLETO PARA SISTEMA DE PROPOSTAS
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Tabela: propostas_criadas
-- Armazena todas as propostas geradas (antes da assinatura)
CREATE TABLE IF NOT EXISTS public.propostas_criadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dados do cliente
  nome_cliente TEXT NOT NULL,
  empresa_cliente TEXT,
  email_cliente TEXT NOT NULL,
  telefone_cliente TEXT,
  cpf_cnpj TEXT,
  
  -- Serviços e valores
  servico_social_midia TEXT, -- 'start', 'scale', 'premium', 'nao-se-aplica'
  servico_trafego_pago TEXT, -- 'foco', 'expansao', 'dominio', 'nao-se-aplica'
  investimento_midia TEXT,
  valor_mensal DECIMAL(10,2) NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  desconto_aplicado DECIMAL(5,2) DEFAULT 0,
  
  -- Condições
  recorrencia TEXT NOT NULL, -- '3 meses', '6 meses', '12 meses'
  forma_pagamento TEXT NOT NULL, -- 'à vista', 'parcelado'
  
  -- Controle
  status TEXT DEFAULT 'pendente', -- 'pendente', 'aceita', 'recusada', 'expirada'
  responsavel_proposta TEXT, -- Quem criou a proposta (vendedor)
  dias_validade INTEGER DEFAULT 7,
  observacoes TEXT,
  
  -- Metadados flexíveis da proposta (armazenar catálogo, flags, etc.)
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Metadados
  criada_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expira_em TIMESTAMP WITH TIME ZONE,
  aceita_em TIMESTAMP WITH TIME ZONE,
  ip_criacao INET,
  user_agent TEXT,
  
  -- Índices para busca
  CONSTRAINT propostas_criadas_email_check CHECK (email_cliente ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_propostas_criadas_status ON public.propostas_criadas(status);
CREATE INDEX IF NOT EXISTS idx_propostas_criadas_email ON public.propostas_criadas(email_cliente);
CREATE INDEX IF NOT EXISTS idx_propostas_criadas_criada_em ON public.propostas_criadas(criada_em DESC);
CREATE INDEX IF NOT EXISTS idx_propostas_criadas_cpf_cnpj ON public.propostas_criadas(cpf_cnpj);

-- Função para calcular data de expiração automaticamente
CREATE OR REPLACE FUNCTION set_expiracao_proposta()
RETURNS TRIGGER AS $$
BEGIN
  NEW.expira_em := NEW.criada_em + (NEW.dias_validade || ' days')::INTERVAL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para definir expiração automaticamente
DROP TRIGGER IF EXISTS trigger_set_expiracao ON public.propostas_criadas;
CREATE TRIGGER trigger_set_expiracao
  BEFORE INSERT ON public.propostas_criadas
  FOR EACH ROW
  EXECUTE FUNCTION set_expiracao_proposta();

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS
ALTER TABLE public.propostas_criadas ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer pessoa pode INSERIR uma proposta (para geração sem login)
DROP POLICY IF EXISTS "Permitir INSERT público em propostas_criadas" ON public.propostas_criadas;
CREATE POLICY "Permitir INSERT público em propostas_criadas"
  ON public.propostas_criadas
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Política: Qualquer pessoa pode LER propostas por ID (via URL)
DROP POLICY IF EXISTS "Permitir SELECT público em propostas_criadas por ID" ON public.propostas_criadas;
CREATE POLICY "Permitir SELECT público em propostas_criadas por ID"
  ON public.propostas_criadas
  FOR SELECT
  TO public
  USING (true);

-- Política: Qualquer pessoa pode ATUALIZAR status para 'aceita' (quando assinar)
DROP POLICY IF EXISTS "Permitir UPDATE de status para aceita" ON public.propostas_criadas;
CREATE POLICY "Permitir UPDATE de status para aceita"
  ON public.propostas_criadas
  FOR UPDATE
  TO public
  USING (status = 'pendente')
  WITH CHECK (status IN ('aceita', 'recusada'));

-- ============================================
-- ATUALIZAR TABELA 'propostas' EXISTENTE
-- Adicionar referência à proposta_criada_id
-- ============================================

-- Adicionar coluna de referência (se não existir)
DO $$
DECLARE
  t_exists BOOLEAN;
  col_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'propostas'
  ) INTO t_exists;

  IF t_exists THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'propostas' AND column_name = 'proposta_criada_id'
    ) INTO col_exists;

    IF NOT col_exists THEN
      ALTER TABLE public.propostas ADD COLUMN proposta_criada_id UUID REFERENCES public.propostas_criadas(id);
      CREATE INDEX IF NOT EXISTS idx_propostas_proposta_criada_id ON public.propostas(proposta_criada_id);
    END IF;
  END IF;
END $$;

-- ============================================
-- VIEW: Resumo de propostas para painel admin
-- ============================================

CREATE OR REPLACE VIEW public.resumo_propostas AS
SELECT 
  pc.id,
  pc.nome_cliente,
  pc.empresa_cliente,
  pc.email_cliente,
  pc.telefone_cliente,
  pc.servico_social_midia,
  pc.servico_trafego_pago,
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
-- FUNÇÃO: Marcar propostas expiradas automaticamente
-- ============================================

CREATE OR REPLACE FUNCTION marcar_propostas_expiradas()
RETURNS void AS $$
BEGIN
  UPDATE public.propostas_criadas
  SET status = 'expirada'
  WHERE status = 'pendente' 
    AND expira_em < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMENTÁRIOS NAS TABELAS (documentação)
-- ============================================

COMMENT ON TABLE public.propostas_criadas IS 'Armazena todas as propostas geradas antes da assinatura';
COMMENT ON COLUMN public.propostas_criadas.id IS 'UUID único da proposta (usado no link)';
COMMENT ON COLUMN public.propostas_criadas.status IS 'Status: pendente, aceita, recusada, expirada';
COMMENT ON COLUMN public.propostas_criadas.expira_em IS 'Data/hora de expiração calculada automaticamente';
COMMENT ON VIEW public.resumo_propostas IS 'View consolidada para painel administrativo';

-- ============================================
-- DADOS DE EXEMPLO (opcional - remova em produção)
-- ============================================

-- Remova este bloco se não quiser dados de teste
/*
INSERT INTO public.propostas_criadas 
  (nome_cliente, email_cliente, telefone_cliente, cpf_cnpj, empresa_cliente,
   servico_social_midia, servico_trafego_pago, investimento_midia,
   valor_mensal, valor_total, recorrencia, forma_pagamento, responsavel_proposta, observacoes)
VALUES 
  ('João Silva', 'joao@exemplo.com', '11999999999', '123.456.789-00', 'Silva Comércio',
   'scale', 'foco', 'R$ 3.000,00', 3450.00, 20700.00, '6 meses', 'À Vista', 'Vendedor Teste', 'Cliente interessado em tráfego pago'),
  ('Maria Santos', 'maria@exemplo.com', '11988888888', '98.765.432/0001-00', 'Santos Digital',
   'premium', 'expansao', 'R$ 5.000,00', 5200.00, 31200.00, '6 meses', 'Parcelado', 'Vendedor Teste', 'Precisa de social media completo');
*/

-- ============================================
-- FIM DO SCRIPT
-- ============================================

-- Para executar:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em SQL Editor
-- 3. Cole este script completo
-- 4. Execute (Run)
-- 5. Verifique se todas as tabelas foram criadas em "Table Editor"
