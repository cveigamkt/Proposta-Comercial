-- ============================================
-- SCHEMA: Tabelas de Produtos e Planos
-- Execute este script no SQL Editor do Supabase
-- ============================================

CREATE TABLE IF NOT EXISTS public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  -- Tipo do produto: 'fixo' (planos) ou 'composicao' (base + add-ons)
  tipo TEXT CHECK (tipo IN ('fixo','composicao')) DEFAULT 'fixo',
  recorrencia BOOLEAN NOT NULL DEFAULT false,
  desconto_recorrencia BOOLEAN NOT NULL DEFAULT false,
  desconto_pagamento BOOLEAN NOT NULL DEFAULT false,
  desconto_condicional BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.produto_planos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  valor NUMERIC(10,2),
  info TEXT,
  sessoes JSONB,
  -- Lista de add-ons (quando tipo = 'composicao'), formato: [{nome, valor, descricao, selecionado}]
  addons JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_produto_planos_produto ON public.produto_planos(produto_id);
CREATE INDEX IF NOT EXISTS idx_produtos_nome ON public.produtos(nome);

-- Habilitar RLS
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produto_planos ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajuste conforme seu fluxo de auth)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'produtos' AND policyname = 'Permitir inserção de produtos'
  ) THEN
    CREATE POLICY "Permitir inserção de produtos" ON public.produtos FOR INSERT TO public WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'produtos' AND policyname = 'Permitir leitura de produtos'
  ) THEN
    CREATE POLICY "Permitir leitura de produtos" ON public.produtos FOR SELECT TO public USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'produtos' AND policyname = 'Permitir deleção de produtos (public)'
  ) THEN
    CREATE POLICY "Permitir deleção de produtos (public)" ON public.produtos FOR DELETE TO public USING (true);
  END IF;
END $$;

DO $$ BEGIN
  -- UPDATE em produtos (permitir editar nome e flags)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'produtos' AND policyname = 'Permitir atualização de produtos'
  ) THEN
    CREATE POLICY "Permitir atualização de produtos" ON public.produtos
      FOR UPDATE TO public
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'produto_planos' AND policyname = 'Permitir inserção de planos'
  ) THEN
    CREATE POLICY "Permitir inserção de planos" ON public.produto_planos FOR INSERT TO public WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'produto_planos' AND policyname = 'Permitir leitura de planos'
  ) THEN
    CREATE POLICY "Permitir leitura de planos" ON public.produto_planos FOR SELECT TO public USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'produto_planos' AND policyname = 'Permitir deleção de planos (public)'
  ) THEN
    CREATE POLICY "Permitir deleção de planos (public)" ON public.produto_planos FOR DELETE TO public USING (true);
  END IF;
  -- UPDATE em planos (permitir editar valores e textos)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'produto_planos' AND policyname = 'Permitir atualização de planos'
  ) THEN
    CREATE POLICY "Permitir atualização de planos" ON public.produto_planos
      FOR UPDATE TO public
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

COMMENT ON TABLE public.produtos IS 'Cadastro de produtos/serviços com flags de descontos e recorrência';
COMMENT ON TABLE public.produto_planos IS 'Planos associados a produtos, com preço e entregáveis (JSON)';

-- Ajustes para ambientes já provisionados
ALTER TABLE IF EXISTS public.produtos
  ADD COLUMN IF NOT EXISTS tipo TEXT CHECK (tipo IN ('fixo','composicao')) DEFAULT 'fixo';
ALTER TABLE IF EXISTS public.produto_planos
  ADD COLUMN IF NOT EXISTS addons JSONB;

-- ============================================
-- FIM DO SCRIPT
-- ============================================