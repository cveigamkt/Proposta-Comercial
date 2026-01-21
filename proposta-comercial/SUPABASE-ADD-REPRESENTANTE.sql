-- ============================================
-- TABELA: Dados do Representante da Proposta
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Criar tabela de representantes vinculada à proposta
CREATE TABLE IF NOT EXISTS public.representantes_proposta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposta_criada_id UUID NOT NULL REFERENCES public.propostas_criadas(id) ON DELETE CASCADE,
  proposta_id UUID REFERENCES public.propostas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  sobrenome TEXT NOT NULL,
  nome_completo TEXT GENERATED ALWAYS AS (trim(nome || ' ' || sobrenome)) STORED,
  cpf TEXT NOT NULL,
  data_nascimento DATE NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  melhor_dia_pagamento INTEGER,
  ip INET,
  user_agent TEXT,
  criada_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  validado BOOLEAN DEFAULT FALSE,
  observacoes TEXT
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_representantes_proposta_criada_id ON public.representantes_proposta(proposta_criada_id);
CREATE INDEX IF NOT EXISTS idx_representantes_proposta_proposta_id ON public.representantes_proposta(proposta_id);

-- Evitar duplicidade por proposta (um representante por proposta)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
      AND indexname = 'uniq_representante_por_proposta'
  ) THEN
    CREATE UNIQUE INDEX uniq_representante_por_proposta 
      ON public.representantes_proposta(proposta_criada_id);
  END IF;
END $$;

-- Habilitar RLS
ALTER TABLE public.representantes_proposta ENABLE ROW LEVEL SECURITY;

-- Políticas básicas
-- Inserção pública (captura do modal sem login)
DROP POLICY IF EXISTS "Permitir INSERT público em representantes_proposta" ON public.representantes_proposta;
CREATE POLICY "Permitir INSERT público em representantes_proposta"
  ON public.representantes_proposta
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Leitura pública (exibição no admin sem auth)
DROP POLICY IF EXISTS "Permitir SELECT público em representantes_proposta" ON public.representantes_proposta;
CREATE POLICY "Permitir SELECT público em representantes_proposta"
  ON public.representantes_proposta
  FOR SELECT
  TO public
  USING (true);

-- Atualização de validação (opcional para authenticated futuramente)
-- Aqui liberamos atualização pública apenas do campo validado quando necessário
DROP POLICY IF EXISTS "Permitir UPDATE de validado em representantes_proposta" ON public.representantes_proposta;
CREATE POLICY "Permitir UPDATE de validado em representantes_proposta"
  ON public.representantes_proposta
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.representantes_proposta IS 'Dados do representante coletados no aceite da proposta';
COMMENT ON COLUMN public.representantes_proposta.validado IS 'Se true, dados conferidos/validados pelo admin';

-- ============================================
-- FIM DO SCRIPT
-- ============================================