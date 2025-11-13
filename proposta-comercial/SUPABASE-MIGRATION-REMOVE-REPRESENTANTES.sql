-- Remoção segura de representantes_proposta e dependências
-- Objetivo: resolver erro 2BP01 ao dropar a tabela, removendo antes a view dependente
-- Uso: execute este script no seu banco Supabase (SQL editor)

BEGIN;

-- 1) Remover view dependente se existir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.views
    WHERE table_schema = 'public' AND table_name = 'propostas_geradas'
  ) THEN
    RAISE NOTICE 'Dropando view public.propostas_geradas (dependente de representantes_proposta)';
    EXECUTE 'DROP VIEW public.propostas_geradas';
  ELSE
    RAISE NOTICE 'View public.propostas_geradas não existe; seguindo adiante.';
  END IF;
END $$;

-- 2) Dropar a tabela representantes_proposta
-- Tentativa sem CASCADE para proteger objetos não listados; se falhar, use a linha com CASCADE abaixo.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'representantes_proposta'
  ) THEN
    RAISE NOTICE 'Dropando tabela public.representantes_proposta';
    EXECUTE 'DROP TABLE public.representantes_proposta';
  ELSE
    RAISE NOTICE 'Tabela public.representantes_proposta já não existe; nada a dropar.';
  END IF;
END $$;

-- Caso ainda haja dependências inesperadas, descomente a linha abaixo e reexecute:
-- DROP TABLE IF EXISTS public.representantes_proposta CASCADE;

COMMIT;

-- Observações:
-- - O painel admin já utiliza public.resumo_propostas, então a remoção de propostas_geradas não afeta a UI.
-- - Se precisar manter uma view semelhante, crie-a baseada em public.propostas_criadas e joins com proposta_itens / proposta_contratos.