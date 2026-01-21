-- ============================================
-- MIGRAÇÃO FASE 2: Deprecações e Segurança
-- Objetivo:
-- 1) Restringir acesso à view pública
-- 2) Orientar migração de dados das tabelas legadas
-- 3) Preparar (comentado) DROP seguro após backfill
-- ============================================

SET search_path TO public;

-- 1) Restringir privilégios da view pública (marcada como Unrestricted)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_views 
    WHERE schemaname = 'public' AND viewname = 'resumo_propostas'
  ) THEN
    -- Revogar acesso amplo
    BEGIN
      EXECUTE 'REVOKE ALL PRIVILEGES ON VIEW public.resumo_propostas FROM PUBLIC';
    EXCEPTION WHEN OTHERS THEN NULL; END;

    -- Conceder acesso somente a usuários autenticados
    BEGIN
      EXECUTE 'GRANT SELECT ON VIEW public.resumo_propostas TO authenticated';
    EXCEPTION WHEN OTHERS THEN NULL; END;

    BEGIN
      EXECUTE 'REVOKE SELECT ON VIEW public.resumo_propostas FROM anon';
    EXCEPTION WHEN OTHERS THEN NULL; END;
  END IF;
END $$;

COMMENT ON VIEW public.resumo_propostas IS 'View restrita a usuários autenticados. Considerar migrar para usar joins com proposta_itens / proposta_contratos.';

-- 2) Backfill sugerido (AJUSTE nomes de colunas conforme seu schema)
-- 2.1) Migrar contratos antigos para public.proposta_contratos
-- OBS: contratos.proposta_id -> propostas.id -> propostas.proposta_criada_id
-- DESCOMENTE após validar os nomes existentes nas tabelas
--
-- INSERT INTO public.proposta_contratos (proposta_criada_id, contrato_url, contrato_sha256, status, created_by, created_at)
-- SELECT p.proposta_criada_id, c.pdf_url, c.sha256, COALESCE(c.status,'gerado'), NULL, COALESCE(c.created_at, now())
-- FROM public.contratos c
-- JOIN public.propostas p ON p.id = c.proposta_id
-- WHERE NOT EXISTS (
--   SELECT 1 FROM public.proposta_contratos pc
--   WHERE pc.proposta_criada_id = p.proposta_criada_id
--     AND pc.contrato_url = c.pdf_url
-- );

-- 2.1.A) Backfill CORRIGIDO (usando colunas reais de propostas_criadas)
-- Pronto para execução após revisar: usa pc.* (propostas_criadas) para datas
-- e metadados; evita referenciar colunas inexistentes em public.propostas.
--
-- INSERT INTO public.proposta_contratos (
--   proposta_criada_id,
--   contrato_url,
--   contrato_sha256,
--   status,
--   created_at
-- )
-- SELECT
--   p.proposta_criada_id,
--   c.pdf_url,
--   COALESCE(c.hash_verificacao, c.assinatura_digital),
--   'assinado',
 --   COALESCE(c.timestamp_assinatura, pc.aceita_em, pc.criada_em)
-- FROM public.contratos c
-- JOIN public.propostas p ON p.id = c.proposta_id
-- JOIN public.propostas_criadas pc ON pc.id = p.proposta_criada_id
-- LEFT JOIN public.proposta_contratos pc2
--   ON pc2.proposta_criada_id = p.proposta_criada_id
--  AND pc2.contrato_url = c.pdf_url
-- WHERE pc2.id IS NULL;

-- 2.2) Registrar status aceitos/assinados no histórico
-- DESCOMENTE e ajuste campos (ex.: p.assinada_em) conforme seu schema
--
-- INSERT INTO public.proposta_status_history (proposta_criada_id, status, observacao, created_by, created_at)
-- SELECT p.proposta_criada_id, 'aceita', NULL, p.responsavel_user_id, COALESCE(p.assinada_em, p.created_at)
-- FROM public.propostas p
-- WHERE NOT EXISTS (
--   SELECT 1 FROM public.proposta_status_history sh
--   WHERE sh.proposta_criada_id = p.proposta_criada_id
--     AND sh.status = 'aceita'
-- );

-- 2.2.A) Backfill CORRIGIDO para histórico (datas vindas de propostas_criadas)
--
-- INSERT INTO public.proposta_status_history (
--   proposta_criada_id,
--   status,
--   observacao,
--   created_at
-- )
-- SELECT
--   p.proposta_criada_id,
--   'aceita',
--   'Backfill: aceite via legado',
 --   COALESCE(c.timestamp_assinatura, pc.aceita_em, pc.criada_em)
-- FROM public.propostas p
-- LEFT JOIN public.contratos c ON c.proposta_id = p.id
-- JOIN public.propostas_criadas pc ON pc.id = p.proposta_criada_id
-- LEFT JOIN public.proposta_status_history sh
--   ON sh.proposta_criada_id = p.proposta_criada_id
--  AND sh.status = 'aceita'
-- WHERE sh.id IS NULL;

-- 3) Preparar remoção segura de tabelas legadas (APÓS backfill e validação)
-- Somente descomente quando confirmar que não há dependências na aplicação
--
-- DROP TABLE IF EXISTS public.contratos;
-- DROP TABLE IF EXISTS public.propostas;
--
-- Tabela auxiliares legadas:
-- Caso não utilize mais public.representantes_proposta (informação já em propostas_criadas.representante_cliente),
-- você pode removê-la após migrar os dados:
--
-- DROP TABLE IF EXISTS public.representantes_proposta;

-- 4) (Opcional) Restringir leitura das novas tabelas para autenticados
-- Hoje as policies de SELECT estão amplas (USING true). Para restringir:
--
-- DROP POLICY IF EXISTS proposta_itens_select_all ON public.proposta_itens;
-- CREATE POLICY proposta_itens_select_auth ON public.proposta_itens
--   FOR SELECT TO authenticated USING (true);
--
-- DROP POLICY IF EXISTS proposta_status_select_all ON public.proposta_status_history;
-- CREATE POLICY proposta_status_select_auth ON public.proposta_status_history
--   FOR SELECT TO authenticated USING (true);
--
-- DROP POLICY IF EXISTS proposta_contratos_select_all ON public.proposta_contratos;
-- CREATE POLICY proposta_contratos_select_auth ON public.proposta_contratos
--   FOR SELECT TO authenticated USING (true);

-- ============================================
-- FIM
-- ============================================