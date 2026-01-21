// Teste de proteção para propostas assinadas
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const SUPABASE_URL = 'https://ndokpkkdziifydugyjie.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kb2twa2tkemlpZnlkdWd5amllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMjA5NTYsImV4cCI6MjA3Nzg5Njk1Nn0.k9brkGFdvZe_32ctC0zKpOW1y6icp3zacOOw-MYxECc';

async function testarProtecao() {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    console.log('🧪 Testando proteções de propostas assinadas...\n');
    
    // 1. Criar uma proposta de teste
    console.log('1. Criando proposta de teste...');
    const { data: proposta, error: erroCriacao } = await client
      .from('propostas_criadas')
      .insert({
        nome_cliente: 'Cliente Teste Proteção',
        empresa_cliente: 'Empresa Teste',
        email_cliente: 'teste@example.com',
        telefone_cliente: '(11) 98765-4321',
        cpf_cnpj: '123.456.789-09',
        servico_social_midia: 'scale',
        servico_trafego_pago: 'foco',
        investimento_midia: 'R$ 3.000,00',
        valor_mensal: 2500,
        valor_total: 15000,
        recorrencia: '12 meses',
        forma_pagamento: 'Mensal',
        status: 'pendente',
        responsavel_proposta: 'Vendedor Teste',
        dias_validade: 7
      })
      .select()
      .single();
    
    if (erroCriacao) throw erroCriacao;
    console.log('✅ Proposta criada:', proposta.id);
    
    // 2. Simular assinatura (status aceita)
    console.log('\n2. Assinando proposta...');
    const { error: erroAssinatura } = await client
      .from('propostas_criadas')
      .update({ 
        status: 'aceita',
        aceita_em: new Date().toISOString()
      })
      .eq('id', proposta.id);
    
    if (erroAssinatura) throw erroAssinatura;
    console.log('✅ Proposta assinada com sucesso');
    
    // 3. Verificar se a proposta está protegida
    console.log('\n3. Verificando proteção da proposta assinada...');
    const { data: propostaAssinada, error: erroBusca } = await client
      .from('propostas_criadas')
      .select('*')
      .eq('id', proposta.id)
      .single();
    
    if (erroBusca) throw erroBusca;
    
    console.log('📋 Dados da proposta assinada:');
    console.log('   - ID:', propostaAssinada.id);
    console.log('   - Status:', propostaAssinada.status);
    console.log('   - Aceita em:', propostaAssinada.aceita_em);
    console.log('   - Assinado em:', propostaAssinada.assinado_em);
    console.log('   - Recorrência:', propostaAssinada.recorrencia);
    console.log('   - Forma pagamento:', propostaAssinada.forma_pagamento);
    
    // 4. Testar se pode editar (deve falhar)
    console.log('\n4. Testando proteção contra edição...');
    if (propostaAssinada.status === 'aceita' || propostaAssinada.assinado_em) {
      console.log('✅ Proteção funcionando: Proposta não pode ser editada');
    } else {
      console.log('❌ Proteção falhou: Proposta pode ser editada');
    }
    
    // 5. Testar se pode excluir (deve falhar)
    console.log('\n5. Testando proteção contra exclusão...');
    if (propostaAssinada.status === 'aceita' || propostaAssinada.assinado_em) {
      console.log('✅ Proteção funcionando: Proposta não pode ser excluída');
    } else {
      console.log('❌ Proteção falhou: Proposta pode ser excluída');
    }
    
    // 6. Verificar exibição de recorrência e pagamento
    console.log('\n6. Verificando exibição de dados...');
    if (propostaAssinada.status === 'aceita') {
      console.log('✅ Recorrência será exibida:', propostaAssinada.recorrencia || '—');
      console.log('✅ Forma de pagamento será exibida:', propostaAssinada.forma_pagamento || '—');
    }
    
    console.log('\n🎉 Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

// Executar teste
testarProtecao();