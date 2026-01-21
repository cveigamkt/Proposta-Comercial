-- ============================================
-- ALTERAR TABELA: Permitir NULL em recorrencia e forma_pagamento
-- ============================================

-- Alterar coluna recorrencia para aceitar NULL
ALTER TABLE public.propostas_criadas 
ALTER COLUMN recorrencia DROP NOT NULL;

-- Alterar coluna forma_pagamento para aceitar NULL  
ALTER TABLE public.propostas_criadas 
ALTER COLUMN forma_pagamento DROP NOT NULL;

-- ============================================
-- COMENTÁRIOS ATUALIZADOS
-- ============================================

COMMENT ON COLUMN public.propostas_criadas.recorrencia IS 'Recorrência da proposta - preenchido apenas quando cliente aceita';
COMMENT ON COLUMN public.propostas_criadas.forma_pagamento IS 'Forma de pagamento - preenchido apenas quando cliente aceita';

-- ============================================
-- FIM DO SCRIPT
-- ============================================

-- Para executar:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em SQL Editor
-- 3. Cole este script completo
-- 4. Execute (Run)