-- POLÍTICA RLS: permitir aceite público da proposta
-- Use este script quando o fluxo de assinatura acontece sem login (via link da proposta).
-- Ele complementa políticas mais restritivas adicionando uma regra específica
-- para atualizar propostas pendentes para "aceita" ou "recusada".

-- Habilitar RLS (garantia)
ALTER TABLE public.propostas_criadas ENABLE ROW LEVEL SECURITY;

-- Remover política anterior de aceite público, se existir
DROP POLICY IF EXISTS "propostas_criadas_update_public_accept" ON public.propostas_criadas;

-- Criar política de UPDATE para público: apenas transição de status
CREATE POLICY "propostas_criadas_update_public_accept"
ON public.propostas_criadas FOR UPDATE
TO public
USING (status = 'pendente')
WITH CHECK (status IN ('aceita','recusada'));

-- Observações:
-- - Esta política é ADITIVA às políticas de UPDATE autenticadas (editor/admin).
-- - Mantém a leitura pública por ID (visualização via link) sem alterações.
-- - O aplicativo atualiza colunas relacionadas ao aceite (ex.: aceita_em, recorrencia,
--   forma_pagamento, ip_criacao, user_agent, representante_cliente, endereco_cliente).
--   A verificação limita os estados permitidos pós-update.

COMMENT ON POLICY "propostas_criadas_update_public_accept" ON public.propostas_criadas IS
'Permite que propostas pendentes sejam atualizadas para aceita/recusada sem login, via link público.';