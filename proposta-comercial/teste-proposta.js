const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ndokpkkdziifydugyjie.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kb2twa2tkemlpZnlkdWd5amllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMjA5NTYsImV4cCI6MjA3Nzg5Njk1Nn0.k9brkGFdvZe_32ctC0zKpOW1y6icp3zacOOw-MYxECc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function criarPropostaTeste() {
  console.log('Criando proposta de teste...');
  
  const propostaTeste = {
    nome_cliente: 'Cliente Teste Recorrência',
    empresa_cliente: 'Empresa Teste',
    email_cliente: 'teste@example.com',
    telefone_cliente: '(11) 98765-4321',
    cpf_cnpj: '123.456.789-09',
    servico_social_midia: 'scale',
    servico_trafego_pago: 'foco',
    investimento_midia: 'R$ 3.000,00',
    recorrencia: '6 meses',
    forma_pagamento: '50% + 50%',
    valor_mensal: 2500.00,
    valor_total: 15000.00,
    desconto_aplicado: 0,
    observacoes: 'Proposta de teste para verificar recorrência e forma de pagamento',
    status: 'aceita',
    aceita_em: new Date().toISOString(),
    responsavel_proposta: 'Vendedor Teste'
  };
  
  const { data, error } = await supabase
    .from('propostas_criadas')
    .insert([propostaTeste])
    .select();
    
  if (error) {
    console.error('Erro ao inserir proposta:', error);
    return;
  }
  
  console.log('Proposta criada com sucesso:', data);
  console.log('ID da proposta:', data[0].id);
  console.log('Recorrência:', data[0].recorrencia);
  console.log('Forma de pagamento:', data[0].forma_pagamento);
}

criarPropostaTeste().catch(console.error);