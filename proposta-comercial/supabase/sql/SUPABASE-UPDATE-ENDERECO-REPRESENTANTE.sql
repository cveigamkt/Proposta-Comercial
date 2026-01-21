-- Atualização para adicionar endereço e representante legal do cliente
-- Execute este script no painel SQL do Supabase

ALTER TABLE propostas_criadas ADD COLUMN IF NOT EXISTS endereco_cliente text;
ALTER TABLE propostas_criadas ADD COLUMN IF NOT EXISTS representante_cliente text;

ALTER TABLE propostas ADD COLUMN IF NOT EXISTS endereco_cliente text;
ALTER TABLE propostas ADD COLUMN IF NOT EXISTS representante_cliente text;

-- Opcional: atualizar view resumo_propostas se existir
DO $$
DECLARE
  view_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_schema = 'public' AND table_name = 'resumo_propostas'
  ) INTO view_exists;
  IF view_exists THEN
    DROP VIEW public.resumo_propostas;
    CREATE VIEW public.resumo_propostas AS
      SELECT p.id,
             p.nome_cliente,
             p.empresa_cliente,
             p.cpf_cnpj,
             p.endereco_cliente,
             p.representante_cliente,
             p.servico_social_midia,
             p.servico_trafego_pago,
             p.valor_mensal,
             p.valor_total,
             p.recorrencia,
             p.forma_pagamento,
             p.status,
             p.aceita_em
      FROM propostas p;
  END IF;
END $$;
