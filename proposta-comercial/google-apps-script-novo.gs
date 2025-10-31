// Google Apps Script - Heat Digital
// Sistema com 2 abas: Propostas Enviadas e Propostas Aceitas

function doPost(e) {
  try {
    const SHEET_ID = '1u4xTp_cBQ9M8PYe6M5bzYph_Ox4aWWfFb6sBEt2dgu8';
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    
    // Criar ou obter as abas
    let sheetEnviadas = spreadsheet.getSheetByName('Propostas Enviadas');
    let sheetAceitas = spreadsheet.getSheetByName('Propostas Aceitas');
    
    if (!sheetEnviadas) {
      sheetEnviadas = spreadsheet.insertSheet('Propostas Enviadas');
      sheetEnviadas.getRange(1, 1, 1, 11).setValues([[
        'Data/Hora Criação', 'Nome Cliente', 'Empresa', 'Email', 'Social Media', 
        'Tráfego Pago', 'Valor Mensal', 'Valor Total', 'Descontos Totais', 'Recorrência (Mês)', 'Forma Pagamento'
      ]]);
    }
    
    if (!sheetAceitas) {
      sheetAceitas = spreadsheet.insertSheet('Propostas Aceitas');
      sheetAceitas.getRange(1, 1, 1, 12).setValues([[
        'Data/Hora Aceite', 'Nome Cliente', 'Empresa', 'Email', 'Social Media', 
        'Tráfego Pago', 'Valor Mensal', 'Valor Total', 'Descontos Totais', 'Recorrência (Mês)', 'Forma Pagamento', 'Data Criação Original'
      ]]);
    }
    
    const formData = e.parameter;
    const action = formData.action || 'criar';
    
    if (action === 'criar') {
      return criarProposta(sheetEnviadas, formData);
    } else if (action === 'aceitar') {
      return aceitarProposta(sheetAceitas, formData);
    }
    
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
  }
}

function doGet(e) {
  try {
    return ContentService
      .createTextOutput(JSON.stringify({status: 'OK', message: 'Sistema com 2 abas funcionando!'}))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
  }
}

function criarProposta(sheet, formData) {
  // Usar timestamp do frontend se disponível, senão gerar novo
  const timestampCriacao = formData.timestampCriacao || new Date().toLocaleString('pt-BR');
  
  sheet.appendRow([
    timestampCriacao,
    formData.nomeCliente || '',
    formData.empresaCliente || '',
    formData.emailCliente || '',
    formData.socialMedia || '',
    formData.trafegoPago || '',
    formData.valorMensal || '',
    formData.valorTotal || '',
    formData.descontosTotais || '',
    formData.recorrencia || '',
    formData.formaPagamento || ''
  ]);
  
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Proposta criada com sucesso!',
      timestamp: timestampCriacao
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

function aceitarProposta(sheet, formData) {
  const timestampAceite = new Date().toLocaleString('pt-BR');
  
  // Usar o timestamp de criação original se disponível, senão usar o atual
  const timestampCriacaoOriginal = formData.timestampCriacao || timestampAceite;
  
  console.log('=== DEBUG ACEITE ===');
  console.log('Timestamp Aceite:', timestampAceite);
  console.log('Timestamp Criação Original:', timestampCriacaoOriginal);
  console.log('==================');
  
  // Adicionar diretamente na aba de aceitas
  sheet.appendRow([
    timestampAceite,
    formData.nomeCliente || '',
    formData.empresaCliente || '',
    formData.emailCliente || '',
    formData.socialMedia || '',
    formData.trafegoPago || '',
    formData.valorMensal || '',
    formData.valorTotal || '',
    formData.descontosTotais || '',
    formData.recorrencia || '',
    formData.formaPagamento || '',
    timestampCriacaoOriginal
  ]);
  
  console.log('Linha adicionada na planilha com sucesso!');
  
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Proposta aceita com sucesso!'
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}