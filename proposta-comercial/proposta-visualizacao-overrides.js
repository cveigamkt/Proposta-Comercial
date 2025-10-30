// Overrides para resumo e aceite da proposta
// - Gera um resumo completo no modal apÃ³s clicar em "Aceitar Proposta"
// - Evita erros caso a seÃ§Ã£o de resumo estÃ¡tica nÃ£o exista

function aceitarProposta() {
  const dados = (typeof obterParametros === 'function') ? obterParametros() : {};
  const formaPagamentoSelecionada = document.querySelector('input[name="formaPagamento"]:checked');
  if (!formaPagamentoSelecionada) {
    alert('ðŸ›‘ Por favor, selecione uma forma de pagamento antes de aceitar a proposta.');
    return;
  }

  const hoje = new Date();
  const dataFormatada = hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  let valorTotalBase = 0;
  let blocosServicos = '';

  // Social Media
  if (dados.servicoSocialMedia && dados.servicoSocialMedia !== 'nao-se-aplica' && typeof planosSocialMedia !== 'undefined') {
    const planoSM = planosSocialMedia[dados.servicoSocialMedia];
    if (planoSM) {
      valorTotalBase += (planoSM.valor || 0);
      blocosServicos += `<div class='resumo-servico'><strong>Social Media (${planoSM.nome}):</strong><ul>` +
        (planoSM.entregaveis || []).map(i => `<li>${i}</li>`).join('') + `</ul></div>`;
    }
  }

  // TrÃ¡fego Pago
  if (dados.servicoTrafegoPago && dados.servicoTrafegoPago !== 'nao-se-aplica' && typeof planosTrafegoPago !== 'undefined') {
    const planoTP = planosTrafegoPago[dados.servicoTrafegoPago];
    if (planoTP) {
      valorTotalBase += (planoTP.valor || 0);
      blocosServicos += `<div class='resumo-servico'><strong>TrÃ¡fego Pago (${planoTP.nome}):</strong><ul>` +
        (planoTP.entregaveis || []).map(i => `<li>${i}</li>`).join('') + `</ul></div>`;
    }
  }

  if (!blocosServicos) {
    blocosServicos = '<p><em>Nenhum serviÃ§o contratado.</em></p>';
  }

  // RecorrÃªncia/Descontos
  const recorrenciaSelecionada = document.querySelector('input[name="recorrencia"]:checked');
  const recorrencia = recorrenciaSelecionada ? parseInt(recorrenciaSelecionada.value) : 6;
  const percentualRecorrencia = (typeof obterDescontoRecorrencia === 'function') ? obterDescontoRecorrencia(recorrencia) : 0;
  const descontoRecorrencia = valorTotalBase * percentualRecorrencia;
  let totalAposDescontos = valorTotalBase - descontoRecorrencia;

  let descontoCustomizado = 0;
  let descricaoCustomizada = '';
  if (dados.descontoDescricao && (dados.descontoDescricao + '').trim() && dados.descontoValor && (dados.descontoValor + '').trim()) {
    const valorDesc = parseFloat((dados.descontoValor + '').replace(',', '.'));
    if (!isNaN(valorDesc) && valorDesc > 0) {
      if (dados.descontoTipo === 'percentual') {
        descontoCustomizado = totalAposDescontos * (valorDesc / 100);
        descricaoCustomizada = `${dados.descontoDescricao} (${valorDesc}%)`;
      } else {
        descontoCustomizado = valorDesc;
        descricaoCustomizada = `${dados.descontoDescricao}`;
      }
      totalAposDescontos -= descontoCustomizado;
    }
  }

  const descontoAdicional = totalAposDescontos * 0.05;
  const valorFinalMensal = totalAposDescontos - descontoAdicional;
  const valorTotalPeriodo = valorFinalMensal * recorrencia;

  // Investimento em mÃ­dia
  let investimentoHtml = '';
  if (dados.servicoTrafegoPago && dados.servicoTrafegoPago !== 'nao-se-aplica') {
    investimentoHtml = `<p><strong>Investimento em mÃ­dia:</strong> ${dados.investimentoMidia ? dados.investimentoMidia : 'NÃ£o informado'}<br>` +
      `<span style='color:#FFA500'><em>O valor de investimento em mÃ­dia Ã© pago diretamente Ã s plataformas e nÃ£o estÃ¡ incluso no valor mensal dos serviÃ§os.</em></span></p>`;
  }

  const formaPagamentoTexto = formaPagamentoSelecionada.nextElementSibling.querySelector('strong').textContent;

  function fmtMoeda(v) { return (typeof formatarMoeda === 'function') ? formatarMoeda(v) : v; }

  let resumo = `<div style='text-align:left; line-height:1.5'>`;
  resumo += `<h3 style='margin-top:0'>Dados do Cliente</h3>`;
  resumo += `<p><strong>Cliente:</strong> ${dados.nomeCliente || '-'}</p>`;
  resumo += `<p><strong>Empresa:</strong> ${dados.empresaCliente || '-'}</p>`;
  resumo += `<p><strong>Data:</strong> ${dataFormatada}</p>`;

  resumo += `<h3 style='margin-top:20px'>ServiÃ§os Contratados</h3>`;
  resumo += blocosServicos;

  resumo += `<h3 style='margin-top:20px'>Valores</h3>`;
  resumo += `<p><strong>Valor Mensal dos ServiÃ§os:</strong> ${fmtMoeda(valorTotalBase)}</p>`;
  if (percentualRecorrencia > 0) resumo += `<p><strong>Desconto por RecorrÃªncia:</strong> - ${fmtMoeda(descontoRecorrencia)} (${(percentualRecorrencia*100).toFixed(0)}%)</p>`;
  if (descontoCustomizado > 0) resumo += `<p><strong>Desconto:</strong> - ${fmtMoeda(descontoCustomizado)}${descricaoCustomizada ? ` (${descricaoCustomizada})` : ''}</p>`;
  resumo += `<p><strong>Desconto Adicional (5%):</strong> - ${fmtMoeda(descontoAdicional)}</p>`;
  resumo += `<p><strong>Valor Final Mensal:</strong> ${fmtMoeda(valorFinalMensal)}</p>`;
  resumo += `<p><strong>Total do PerÃ­odo:</strong> ${fmtMoeda(valorTotalPeriodo)} (${recorrencia} ${recorrencia === 1 ? 'mÃªs' : 'meses'})</p>`;

  resumo += investimentoHtml;

  resumo += `<h3 style='margin-top:20px'>CondiÃ§Ãµes</h3>`;
  resumo += `<p><strong>Forma de Pagamento:</strong> ${formaPagamentoTexto}</p>`;
  if (dados.observacoes && (dados.observacoes + '').trim()) resumo += `<p><strong>ObservaÃ§Ãµes:</strong> ${dados.observacoes}</p>`;
  resumo += `</div>`;

  const alvo = document.getElementById('resumoProposta');
  const modal = document.getElementById('modalResumoAceite');
  if (alvo && modal) {
    alvo.innerHTML = resumo;
    modal.style.display = 'block';
  }
}

function preencherResumoProposta() {
  // Preenche a seÃ§Ã£o de resumo estÃ¡tica com todos os dados
  const sect = document.getElementById('resumoPropostaSection');
  if (!sect) return;
  const dados = (typeof obterParametros === 'function') ? obterParametros() : {};

  const nomeSpan = document.getElementById('resumoNomeCliente');
  if (nomeSpan) nomeSpan.textContent = dados.nomeCliente || '';
  const empSpan = document.getElementById('resumoEmpresaCliente');
  if (empSpan) empSpan.textContent = dados.empresaCliente || '';
  const dataSpan = document.getElementById('resumoDataProposta');
  if (dataSpan) {
    const hoje = new Date();
    dataSpan.textContent = hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  let servicosHtml = '';
  let valorMensal = 0;

  if (dados.servicoSocialMedia && dados.servicoSocialMedia !== 'nao-se-aplica' && typeof planosSocialMedia !== 'undefined') {
    const plano = planosSocialMedia[dados.servicoSocialMedia];
    if (plano) {
      servicosHtml += `<div class='resumo-servico'><strong>Social Media (${plano.nome}):</strong><ul>`;
      (plano.entregaveis || []).forEach(item => { servicosHtml += `<li>${item}</li>`; });
      servicosHtml += `</ul></div>`;
      valorMensal += (plano.valor || 0);
    }
  }

  if (dados.servicoTrafegoPago && dados.servicoTrafegoPago !== 'nao-se-aplica' && typeof planosTrafegoPago !== 'undefined') {
    const plano = planosTrafegoPago[dados.servicoTrafegoPago];
    if (plano) {
      servicosHtml += `<div class='resumo-servico'><strong>TrÃ¡fego Pago (${plano.nome}):</strong><ul>`;
      (plano.entregaveis || []).forEach(item => { servicosHtml += `<li>${item}</li>`; });
      servicosHtml += `</ul></div>`;
      valorMensal += (plano.valor || 0);
    }
  }

  if (!servicosHtml) servicosHtml = '<p><em>Nenhum serviÃ§o contratado.</em></p>';
  const servicosDiv = document.getElementById('resumoServicos');
  if (servicosDiv) servicosDiv.innerHTML = servicosHtml;

  const valorMensalSpan = document.getElementById('resumoValorMensal');
  if (valorMensalSpan) {
    // Esconde a linha de "Valor Mensal dos Serviços" para evitar duplicidade com o Resumo Financeiro
    var vmParent = valorMensalSpan.closest ? valorMensalSpan.closest('p') : valorMensalSpan.parentElement;
    if (vmParent) vmParent.style.display = 'none';
  }

  // Investimento em mÃ­dia
  let investimentoHtml = '';
  if (dados.servicoTrafegoPago && dados.servicoTrafegoPago !== 'nao-se-aplica') {
    investimentoHtml = `<strong>Investimento em mÃ­dia:</strong> ${dados.investimentoMidia ? dados.investimentoMidia : 'NÃ£o informado'} <br>` +
      `<span style='color:#FFA500'><em>O valor de investimento em mÃ­dia Ã© pago diretamente Ã s plataformas e nÃ£o estÃ¡ incluso no valor mensal dos serviÃ§os.</em></span>`;
  }
  const investimentoP = document.getElementById('resumoInvestimentoMidia');
  if (investimentoP) investimentoP.innerHTML = investimentoHtml;
}

// Remover resumos duplicados e manter apenas o primeiro antes da CTA
document.addEventListener('DOMContentLoaded', function () {
  const resumos = document.querySelectorAll('.resumo-proposta-section');
  if (resumos && resumos.length > 1) {
    for (let i = 1; i < resumos.length; i++) {
      resumos[i].parentNode && resumos[i].parentNode.removeChild(resumos[i]);
    }
  }
});
// Ajustes de UX: PDF único, âncora CTA e resumo financeiro dinâmico
(function(){
  document.addEventListener('DOMContentLoaded', function(){
    // PDF único
    var pdfWrappers = document.querySelectorAll('.footer-actions.footer-actions-central');
    if (pdfWrappers && pdfWrappers.length > 1) {
      for (var i=1;i<pdfWrappers.length;i++){ if (pdfWrappers[i].parentNode) pdfWrappers[i].parentNode.removeChild(pdfWrappers[i]); }
    }
    // Garantir ID na CTA e aria-label no botão
    var cta = document.querySelector('.cta-section');
    if (cta && !cta.id) cta.id = 'ctaAceite';
    var btn = document.querySelector('.btn-aceitar-proposta');
    if (btn) btn.setAttribute('aria-label','Aceitar esta proposta e ver resumo para confirmação');
    // Listeners
    Array.prototype.forEach.call(document.querySelectorAll('input[name="recorrencia"]'), function(el){ el.addEventListener('change', atualizarResumoFinanceiroEConteudo); });
    Array.prototype.forEach.call(document.querySelectorAll('input[name="formaPagamento"]'), function(el){ el.addEventListener('change', atualizarResumoFinanceiroEConteudo); });
    // Primeira atualização
    atualizarResumoFinanceiroEConteudo();
  });

  window.atualizarResumoFinanceiroEConteudo = function(){
    var sect = document.getElementById('resumoPropostaSection');
    if (!sect) return;
    var dados = (typeof obterParametros === 'function') ? obterParametros() : {};
    var servicosHtml = '';
    var valorMensal = 0;
    if (dados.servicoSocialMedia && dados.servicoSocialMedia !== 'nao-se-aplica' && typeof planosSocialMedia !== 'undefined'){
      var sm = planosSocialMedia[dados.servicoSocialMedia];
      if (sm){
        valorMensal += (sm.valor||0);
        servicosHtml += "<div class='resumo-servico'><details open><summary>Social Media ("+sm.nome+")</summary><ul>" + (sm.entregaveis||[]).map(function(i){return '<li>'+i+'</li>';}).join('') + "</ul></details></div>";
      }
    }
    if (dados.servicoTrafegoPago && dados.servicoTrafegoPago !== 'nao-se-aplica' && typeof planosTrafegoPago !== 'undefined'){
      var tp = planosTrafegoPago[dados.servicoTrafegoPago];
      if (tp){
        valorMensal += (tp.valor||0);
        servicosHtml += "<div class='resumo-servico'><details open><summary>Tráfego Pago ("+tp.nome+")</summary><ul>" + (tp.entregaveis||[]).map(function(i){return '<li>'+i+'</li>';}).join('') + "</ul></details></div>";
      }
    }
    var servDiv = document.getElementById('resumoServicos');
    if (servDiv) servDiv.innerHTML = servicosHtml || '<p><em>Nenhum serviço contratado.</em></p>';
    var vmSpan = document.getElementById('resumoValorMensal');
    if (vmSpan) {
      var vmP = vmSpan.closest ? vmSpan.closest('p') : vmSpan.parentElement;
      if (vmP) vmP.style.display = 'none';
    }

    // Financeiro
    var recSel = document.querySelector('input[name="recorrencia"]:checked');
    var recorrencia = recSel ? parseInt(recSel.value) : 6;
    var pctRec = (typeof obterDescontoRecorrencia==='function') ? obterDescontoRecorrencia(recorrencia) : 0;
    var descRec = valorMensal * pctRec;
    var totalApos = valorMensal - descRec;
    var descCustom = 0, rotulo = '';
    if (dados.descontoDescricao && (String(dados.descontoDescricao).trim()) && dados.descontoValor && (String(dados.descontoValor).trim())){
      var v = parseFloat(String(dados.descontoValor).replace(',','.'));
      if(!isNaN(v) && v>0){
        if (dados.descontoTipo==='percentual'){ descCustom = totalApos*(v/100); rotulo = dados.descontoDescricao+ ' ('+v+'%)'; }
        else { descCustom = v; rotulo = dados.descontoDescricao; }
        totalApos -= descCustom;
      }
    }
    var descAdic = totalApos * 0.05;
    var finalMensal = totalApos - descAdic;
    var totalPeriodo = finalMensal * recorrencia;
    var formaRadio = document.querySelector('input[name="formaPagamento"]:checked');
    var formaPag = '';
    if (formaRadio && formaRadio.nextElementSibling){
      var strong = formaRadio.nextElementSibling.querySelector('strong');
      formaPag = strong ? strong.textContent : '';
    }
    var fmt = function(v){ return (typeof formatarMoeda==='function') ? formatarMoeda(v) : v; };

    var content = sect.querySelector('.resumo-proposta-content');
    if (content){
      var bloco = document.getElementById('resumoFinanceiro');
      if (!bloco){ bloco = document.createElement('div'); bloco.id='resumoFinanceiro'; bloco.className='resumo-financeiro'; content.appendChild(bloco); }
      bloco.innerHTML = ''
        + '<h4 style="margin:10px 0 8px 0">Resumo Financeiro</h4>'
        + '<div class="linha"><span class="label">Valor Mensal dos Serviços (base):</span><span class="valor">'+fmt(valorMensal)+'</span></div>'
        + (pctRec>0 ? '<div class="linha"><span class="label">Desconto por Recorrência ('+(pctRec*100).toFixed(0)+'%):</span><span class="valor">- '+fmt(descRec)+'</span></div>' : '')
        + (descCustom>0 ? '<div class="linha"><span class="label">Desconto '+(rotulo? '('+rotulo+')' : '')+':</span><span class="valor">- '+fmt(descCustom)+'</span></div>' : '')
        + '<div class="linha"><span class="label">Desconto Adicional (5%):</span><span class="valor">- '+fmt(descAdic)+'</span></div>'
        + '<div class="linha"><span class="label">Valor Final Mensal:</span><span class="valor">'+fmt(finalMensal)+'</span></div>'
        + '<div class="linha"><span class="label">Total do Período:</span><span class="valor">'+fmt(totalPeriodo)+' ('+recorrencia+' '+(recorrencia===1?'mês':'meses')+')</span></div>'
        + (formaPag ? '<div class="linha"><span class="label">Forma de Pagamento:</span><span class="valor">'+formaPag+'</span></div>' : '');
      // Remover qualquer botão de aceitar no resumo (queremos apenas o da CTA final)
      Array.prototype.forEach.call(content.querySelectorAll('.btn-aceitar-resumo'), function(el){ el.parentNode && el.parentNode.removeChild(el); });
    }
  };
})();

// Sobrescreve aceitarProposta para usar o mesmo conteúdo do resumo da página
window.aceitarProposta = function(){
  var forma = document.querySelector('input[name="formaPagamento"]:checked');
  if (!forma){
    alert('🛑 Por favor, selecione uma forma de pagamento antes de aceitar a proposta.');
    return;
  }
  if (typeof atualizarResumoFinanceiroEConteudo==='function') atualizarResumoFinanceiroEConteudo();
  if (typeof preencherResumoProposta==='function') preencherResumoProposta();

  var origem = document.querySelector('#resumoPropostaSection .resumo-proposta-content');
  var alvo = document.getElementById('resumoProposta');
  var modal = document.getElementById('modalResumoAceite');
  if (origem && alvo && modal){
    var clone = origem.cloneNode(true);
    // Remove o botão de aceitar interno do card para não conflitar com os botões do modal
    Array.prototype.forEach.call(clone.querySelectorAll('.btn-aceitar-resumo'), function(el){ el.parentNode && el.parentNode.removeChild(el); });
    alvo.innerHTML='';
    alvo.appendChild(clone);
    modal.style.display='block';
  }
};

// Exportar PDF a partir do conteúdo do modal (clone do resumo)
window.exportarPDFResumoModal = function(){
  var container = document.getElementById('resumoProposta');
  if (!container) return;
  var empresa = '';
  var empresaEl = container.querySelector('#resumoEmpresaCliente');
  if (empresaEl) empresa = (empresaEl.textContent||'').trim();
  if (!empresa) empresa = 'Empresa';
  var nomeArquivo = 'Resumo_Proposta_Heat_'+empresa.replace(/\s+/g,'_')+'.pdf';
  exportarPDFDeElemento(container, nomeArquivo);
};

// Export robusto que clona o conteúdo em um wrapper visível e imprime sem telas em branco
function exportarPDFDeElemento(elemento, nomeArquivo){
  try {
    var btns = document.querySelectorAll('.btn-export-pdf');
    btns.forEach(function(b){ b.style.display='none'; });
    // Aguarda fontes para evitar PDF em branco
    var fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    fontsReady.then(function(){
      // Wrapper temporário fora da tela
      var wrapper = document.createElement('div');
      wrapper.style.position = 'absolute';
      wrapper.style.left = '-10000px';
      wrapper.style.top = '0';
      // Largura A4 aproximada em px para 96dpi: ~794px
      wrapper.style.width = '794px';
      wrapper.style.background = '#ffffff';
      wrapper.style.color = '#000000';
      wrapper.style.padding = '16px';
      wrapper.style.boxSizing = 'border-box';
      var clone = elemento.cloneNode(true);
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      var opt = {
        margin: [10,10,10,10],
        filename: nomeArquivo,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3, useCORS: true, backgroundColor: '#ffffff', logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all'] }
      };
      html2pdf().set(opt).from(wrapper).save().then(function(){
        document.body.removeChild(wrapper);
        btns.forEach(function(b){ b.style.display=''; });
      }).catch(function(){
        document.body.removeChild(wrapper);
        btns.forEach(function(b){ b.style.display=''; });
      });
    });
  } catch(e) {
    console.error('Falha ao exportar PDF:', e);
  }
}

// Sobrescreve exportarPDF padrão para usar o método robusto
window.exportarPDF = function(){
  var alvo = document.getElementById('resumoPropostaSection');
  if (!alvo) return;
  var empresa = (document.getElementById('resumoEmpresaCliente')?.textContent || 'Empresa').trim() || 'Empresa';
  var nome = 'Resumo_Proposta_Heat_'+empresa.replace(/\s+/g,'_')+'.pdf';
  exportarPDFDeElemento(alvo, nome);
};
