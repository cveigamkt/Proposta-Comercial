// Teste: Recorrência e Forma de Pagamento somente no aceite
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ndokpkkdziifydugyjie.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kb2twa2tkemlpZnlkdWd5amllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMjA5NTYsImV4cCI6MjA3Nzg5Njk1Nn0.k9brkGFdvZe_32ctC0zKpOW1y6icp3zacOOw-MYxECc';

async function testarRecorrenciaPagamentoSomenteNoAceite() {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  console.log('🧪 Teste: Recorrência/Pagamento somente no aceite');

  // 1) Criar proposta com recorrencia e forma_pagamento = NULL
  console.log('\n1) Inserindo proposta com campos NULL...');
  const insertResp = await client
    .from('propostas_criadas')
    .insert({
      nome_cliente: 'Cliente Teste Fluxo Aceite',
      email_cliente: 'fluxo_aceite@example.com',
      telefone_cliente: '(11) 90000-0000',
      empresa_cliente: 'Empresa Fluxo',
      cpf_cnpj: '123.456.789-09',
      servico_social_midia: 'scale',
      servico_trafego_pago: 'foco',
      investimento_midia: 'R$ 2.000,00',
      valor_mensal: 2000,
      valor_total: 12000,
      desconto_aplicado: 0,
      recorrencia: null, // deve aceitar NULL após aplicar SQL
      forma_pagamento: null, // deve aceitar NULL após aplicar SQL
      status: 'pendente',
      responsavel_proposta: 'Tester',
      dias_validade: 7
    })
    .select('*')
    .single();

  if (insertResp.error) {
    console.error('❌ Erro ao inserir proposta:', insertResp.error);
    const msg = (insertResp.error.message || '').toLowerCase();
    if (msg.includes('not-null') || msg.includes('null value') || msg.includes('violates not-null')) {
      console.error('\n⚠️ Parece que as colunas ainda estão com NOT NULL.');
      console.error('   Execute o script SQL: proposta-comercial/ALTERAR-RECORRENCIA-PAGAMENTO-NULL.sql no Supabase.');
      return;
    }
    return;
  }

  const proposta = insertResp.data;
  console.log('✅ Proposta criada:', proposta.id);
  console.log('   - recorrencia:', proposta.recorrencia);
  console.log('   - forma_pagamento:', proposta.forma_pagamento);

  if (proposta.recorrencia !== null || proposta.forma_pagamento !== null) {
    console.warn('⚠️ Esperado NULL na criação, mas valores foram preenchidos. Verifique gerador/SQL.');
  } else {
    console.log('✅ Campos estão NULL na criação como esperado.');
  }

  // 2) Aceitar proposta definindo recorrencia e forma_pagamento
  console.log('\n2) Atualizando no aceite com valores escolhidos...');
  const updateResp = await client
    .from('propostas_criadas')
    .update({
      status: 'aceita',
      aceita_em: new Date().toISOString(),
      recorrencia: '6 meses',
      forma_pagamento: 'À Vista'
    })
    .eq('id', proposta.id)
    .select('*')
    .single();

  if (updateResp.error) {
    console.error('❌ Erro ao atualizar para aceite:', updateResp.error);
    return;
  }

  const propostaAceita = updateResp.data;
  console.log('✅ Proposta aceita:', propostaAceita.id);
  console.log('   - status:', propostaAceita.status);
  console.log('   - recorrencia:', propostaAceita.recorrencia);
  console.log('   - forma_pagamento:', propostaAceita.forma_pagamento);

  if (propostaAceita.recorrencia && propostaAceita.forma_pagamento) {
    console.log('\n🎉 Sucesso: Recorrência e pagamento registrados somente no aceite.');
  } else {
    console.error('\n❌ Falha: Valores não registrados no aceite.');
  }
}

testarRecorrenciaPagamentoSomenteNoAceite().catch(err => {
  console.error('❌ Erro inesperado no teste:', err);
});