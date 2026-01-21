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
      sheetEnviadas.getRange(1, 1, 1, 13).setValues([[
        'Data/Hora Criação', 'Nome Cliente', 'Empresa', 'Email', 'Social Media', 
        'Tráfego Pago', 'Valor Mensal', 'Valor Total', 'Descontos Totais', 'Recorrência (Mês)', 'Forma Pagamento', 'Responsável', 'Validade (Dias)'
      ]]);
    }
    
    if (!sheetAceitas) {
      sheetAceitas = spreadsheet.insertSheet('Propostas Aceitas');
      sheetAceitas.getRange(1, 1, 1, 14).setValues([[
        'Data/Hora Aceite', 'Nome Cliente', 'Empresa', 'Email', 'Social Media', 
        'Tráfego Pago', 'Valor Mensal', 'Valor Total', 'Descontos Totais', 'Recorrência (Mês)', 'Forma Pagamento', 'Data Criação Original', 'Responsável', 'Validade (Dias)'
      ]]);
    }
    
    const formData = e.parameter;
    const action = formData.action || 'criar';
    
    if (action === 'criar') {
      return criarProposta(sheetEnviadas, formData);
    } else if (action === 'aceitar') {
      return aceitarProposta(sheetAceitas, formData);
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa    } else if (action === 'enviar_email') {
      return enviarEmailAssinatura(formData);
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
    formData.formaPagamento || '',
    formData.responsavelProposta || '',
    formData.validadeProposta || ''
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
    timestampCriacaoOriginal,
    formData.responsavelProposta || '',
    formData.validadeProposta || ''
  ]);
  
  console.log('Linha adicionada na planilha com sucesso!');
  
  // Se vierem dados de e-mail e link do PDF, disparar envio automaticamente
  try {
    if ((formData.emailCliente || formData.emailFaturamento) && (formData.pdfUrl || formData.contratoUrl)) {
      enviarEmailAssinatura({
        to: (formData.emailCliente || '') + (formData.emailFaturamento ? ',' + formData.emailFaturamento : ''),
        subject: formData.emailSubject || 'Contrato assinado - Heat Digital',
        htmlBody: formData.emailBody || criarTemplateEmail(formData),
        pdfUrl: formData.pdfUrl || formData.contratoUrl,
        nomeCliente: formData.nomeCliente || '',
        empresaCliente: formData.empresaCliente || ''
      });
    }
  } catch (e) {
    // Logar erro mas não falhar aceite
    console.warn('Falha ao enviar e-mail automático:', e);
  }
  
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

// Action dedicada: enviar e-mail com contrato assinado
function enviarEmailAssinatura(params) {
  try {
    const to = params.to || params.emailCliente || '';
    if (!to) throw new Error('Destinatário de e-mail ausente.');
    const subject = params.subject || 'Contrato assinado - Heat Digital';
    const htmlBody = params.htmlBody || criarTemplateEmail(params);
    const pdfUrl = params.pdfUrl || params.contratoUrl || '';
    let attachments = [];
    
    // Tentar baixar e anexar o PDF do contrato
    if (pdfUrl) {
      try {
        const resp = UrlFetchApp.fetch(pdfUrl);
        const blob = resp.getBlob().setName('Contrato-Assinado.pdf');
        attachments = [blob];
      } catch (e) {
        // Se falhar, segue sem anexar mas mantém link no corpo
        console.warn('Não foi possível anexar PDF, enviando apenas link:', e);
      }
    }
    
    MailApp.sendEmail({
      to: to,
      subject: subject,
      htmlBody: htmlBody,
      attachments: attachments
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'E-mail enviado com sucesso!' }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
  }
}

// Template padrão do e-mail de confirmação
function criarTemplateEmail(data) {
  const nome = data.nomeCliente || 'Cliente';
  const empresa = data.empresaCliente || '';
  const pdfUrl = data.pdfUrl || data.contratoUrl || '';
  const saudacao = empresa ? `${nome} (${empresa})` : nome;
  
  return (
    `<div style="font-family:Arial,sans-serif;color:#222;">
      <p>Olá, ${saudacao}!</p>
      <p>Recebemos a assinatura da proposta e seu contrato foi gerado com sucesso.</p>
      ${pdfUrl ? `<p>Você pode baixar o contrato clicando neste link: <a href="${pdfUrl}" target="_blank">Contrato Assinado (PDF)</a></p>` : ''}
      <p>Qualquer dúvida, estamos à disposição.</p>
      <p>Abraços,<br>Equipe Heat Digital</p>
    </div>`
  );
}