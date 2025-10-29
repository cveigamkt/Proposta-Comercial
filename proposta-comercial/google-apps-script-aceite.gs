/**
 * GOOGLE APPS SCRIPT - ACEITE DE PROPOSTAS
 * 
 * Este arquivo deve ser colado no Google Apps Script conectado à sua planilha.
 * 
 * PASSOS PARA CONFIGURAR:
 * 
 * 1. Crie uma nova planilha no Google Sheets
 * 2. Vá em Extensões > Apps Script
 * 3. Cole este código
 * 4. Clique em "Implantar" > "Nova implantação"
 * 5. Tipo: "Aplicativo da web"
 * 6. Executar como: "Eu"
 * 7. Quem tem acesso: "Qualquer pessoa"
 * 8. Copie a URL gerada
 * 9. Cole a URL no arquivo proposta-visualizacao.js na variável SCRIPT_URL
 */

// Nome da planilha onde os dados serão salvos
const NOME_PLANILHA = 'Aceites de Propostas';

// Função principal que recebe os dados
function doPost(e) {
  try {
    // Parse dos dados recebidos
    const dados = JSON.parse(e.postData.contents);
    
    // Obter ou criar a planilha
    const planilha = obterOuCriarPlanilha();
    
    // Adicionar linha com os dados
    planilha.appendRow([
      new Date(),                    // Data/Hora do aceite
      dados.nomeCliente,             // Nome do cliente
      dados.empresaCliente,          // Empresa
      dados.emailCliente,            // E-mail
      dados.servicoSocialMedia,      // Serviço Social Media
      dados.servicoTrafegoPago,      // Serviço Tráfego Pago
      dados.investimentoMidia,       // Investimento em mídia
      dados.observacoes,             // Observações
      dados.status,                  // Status (ACEITO)
      obterLinkProposta(dados)       // Link da proposta
    ]);
    
    // Retornar sucesso
    return ContentService
      .createTextOutput(JSON.stringify({ 'resultado': 'sucesso' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (erro) {
    // Retornar erro
    return ContentService
      .createTextOutput(JSON.stringify({ 'resultado': 'erro', 'mensagem': erro.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Função para obter ou criar a planilha
function obterOuCriarPlanilha() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let planilha = ss.getSheetByName(NOME_PLANILHA);
  
  // Se a planilha não existe, criar
  if (!planilha) {
    planilha = ss.insertSheet(NOME_PLANILHA);
    
    // Criar cabeçalho
    const cabecalho = [
      'Data/Hora',
      'Nome do Cliente',
      'Empresa',
      'E-mail',
      'Social Media',
      'Tráfego Pago',
      'Investimento Mídia',
      'Observações',
      'Status',
      'Link da Proposta'
    ];
    
    planilha.appendRow(cabecalho);
    
    // Formatar cabeçalho
    const rangeHeader = planilha.getRange(1, 1, 1, cabecalho.length);
    rangeHeader.setBackground('#1E5942');
    rangeHeader.setFontColor('#FFFFFF');
    rangeHeader.setFontWeight('bold');
    rangeHeader.setHorizontalAlignment('center');
    
    // Ajustar largura das colunas
    planilha.setColumnWidth(1, 150);  // Data/Hora
    planilha.setColumnWidth(2, 200);  // Nome
    planilha.setColumnWidth(3, 200);  // Empresa
    planilha.setColumnWidth(4, 200);  // E-mail
    planilha.setColumnWidth(5, 150);  // Social Media
    planilha.setColumnWidth(6, 150);  // Tráfego Pago
    planilha.setColumnWidth(7, 150);  // Investimento
    planilha.setColumnWidth(8, 300);  // Observações
    planilha.setColumnWidth(9, 100);  // Status
    planilha.setColumnWidth(10, 400); // Link
  }
  
  return planilha;
}

// Função para gerar o link da proposta
function obterLinkProposta(dados) {
  // Aqui você pode construir o link da proposta se necessário
  // Por enquanto, retornamos uma string vazia
  return '';
}

// Função para testar (opcional)
function testarIntegracao() {
  const dadosTeste = {
    timestamp: new Date().toISOString(),
    nomeCliente: 'João Silva - TESTE',
    empresaCliente: 'Silva Comércio Ltda',
    emailCliente: 'joao@silva.com',
    servicoSocialMedia: 'start',
    servicoTrafegoPago: 'foco',
    investimentoMidia: 'R$ 5.000,00',
    observacoes: 'Teste de integração',
    status: 'ACEITO'
  };
  
  const planilha = obterOuCriarPlanilha();
  
  planilha.appendRow([
    new Date(),
    dadosTeste.nomeCliente,
    dadosTeste.empresaCliente,
    dadosTeste.emailCliente,
    dadosTeste.servicoSocialMedia,
    dadosTeste.servicoTrafegoPago,
    dadosTeste.investimentoMidia,
    dadosTeste.observacoes,
    dadosTeste.status,
    ''
  ]);
  
  Logger.log('Teste concluído com sucesso!');
}

/**
 * INSTRUÇÕES DE USO:
 * 
 * 1. Configure conforme instruções no início do arquivo
 * 2. Execute a função "testarIntegracao" para testar
 * 3. Verifique se uma linha foi adicionada na planilha
 * 4. Se funcionou, copie a URL da implantação
 * 5. Cole no arquivo proposta-visualizacao.js
 * 
 * FORMATO DA URL:
 * https://script.google.com/macros/s/SEU_ID_AQUI/exec
 */
