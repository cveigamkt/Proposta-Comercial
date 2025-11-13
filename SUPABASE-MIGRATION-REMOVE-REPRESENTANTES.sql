-- ============================================
-- MIGRAÇÃO: Backfill de representante e remoção da tabela legada
-- Execute no SQL Editor do Supabase em seu projeto
-- ============================================

-- 1) Garantir coluna de destino
ALTER TABLE public.propostas_criadas
ADD COLUMN IF NOT EXISTS representante_cliente TEXT;

-- 2) Backfill: copiar nome completo do representante para a proposta criada
-- Observação: migra todos os registros existentes; se só houver um, migra apenas o informado
UPDATE public.propostas_criadas pc
SET representante_cliente = rp.nome_completo
FROM public.representantes_proposta rp
WHERE rp.proposta_criada_id = pc.id
  AND (pc.representante_cliente IS NULL OR pc.representante_cliente <> rp.nome_completo);

-- 3) (Opcional) Conferência rápida
-- SELECT pc.id, pc.representante_cliente FROM public.propostas_criadas pc
-- WHERE pc.id IN (SELECT proposta_criada_id FROM public.representantes_proposta);

-- 4) Remoção segura da tabela legada
DROP TABLE IF EXISTS public.representantes_proposta;

-- ============================================
-- FIM
-- ============================================