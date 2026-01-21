-- ============================================
-- SCHEMA: Tabela de Clientes
-- Execute este script no SQL Editor do Supabase
-- ============================================

CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_documento VARCHAR(4) NOT NULL CHECK (tipo_documento IN ('cpf','cnpj')),
  documento TEXT NOT NULL,
  nome TEXT,
  empresa TEXT,
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evitar duplicidade por documento
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'uniq_clientes_documento'
  ) THEN
    CREATE UNIQUE INDEX uniq_clientes_documento ON public.clientes(documento);
  END IF;
END $$;

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_clientes_email ON public.clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_tipo_doc ON public.clientes(tipo_documento);

COMMENT ON TABLE public.clientes IS 'Cadastro de clientes para vincular propostas (CPF/CNPJ).';
COMMENT ON COLUMN public.clientes.tipo_documento IS 'cpf ou cnpj';
COMMENT ON COLUMN public.clientes.documento IS 'Apenas dígitos, sem máscara';

-- Observação: Habilite RLS e políticas conforme seu projeto
-- Exemplo:
-- ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
-- GRANT USAGE, SELECT, INSERT, UPDATE, DELETE ON TABLE public.clientes TO authenticated;
-- Crie políticas para permitir leitura/gravação por usuários com papel 'admin' ou 'editor'.