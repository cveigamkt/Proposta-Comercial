// Versão limpa de overrides: resumo, aceite e exportação
// Esta versão substitui conteúdo corrompido e expõe funções estáveis.

(function () {
  'use strict';

  function obterDados() { return (typeof obterParametro === 'function') ? obterParametro() : {}; }
  function formatarDataHoje() { return new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }); }

  function aceitarProposta() {
    const dados = obterDados();
    const forma = document.querySelector('input[name="formaPagamento"]:checked');
    if (!forma) { alert('Por favor, selecione uma forma de pagamento antes de aceitar a proposta.'); return; }

    let valorBase = 0; let blocos = '';
    if (dados.servicoSocialMidia && dados.servicoSocialMidia !== 'nao-se-aplica' && typeof planoSocialMidia !== 'undefined') {
      const p = planoSocialMidia[dados.servicoSocialMidia]; if (p) { valorBase += (p.valor || 0); blocos += `<div class="resumo-servico"><strong>Social Mídia (${p.nome}):</strong><ul>` + (p.entregaveis||[]).map(i=>`<li>${i}</li>`).join('') + `</ul></div>`; }
    }
    if (dados.servicoTrafegoPago && dados.servicoTrafegoPago !== 'nao-se-aplica' && typeof planoTrafegoPago !== 'undefined') {
      const p = planoTrafegoPago[dados.servicoTrafegoPago]; if (p) { valorBase += (p.valor || 0); blocos += `<div class="resumo-servico"><strong>Tráfego Pago (${p.nome}):</strong><ul>` + (p.entregaveis||[]).map(i=>`<li>${i}</li>`).join('') + `</ul></div>`; }
    }
    if (!blocos) blocos = '<p><em>Nenhum serviço contratado.</em></p>';

    const recSel = document.querySelector('input[name="recorrencia"]:checked');
    const recorrencia = recSel ? parseInt(recSel.value) : 6;
    const pctRec = (typeof obterDescontoRecorrencia === 'function') ? obterDescontoRecorrencia(recorrencia) : 0;
    const descRec = valorBase * pctRec; let totalApos = valorBase - descRec;
    if (dados.descontoValor && String(dados.descontoValor).trim()) {
      const v = parseFloat(String(dados.descontoValor).replace(',','.'));
      if (!isNaN(v) && v>0) { totalApos -= (dados.descontoTipo === 'percentual' ? totalApos*(v/100) : v); }
    }
    const descAdic = totalApos * 0.05; const finalMensal = totalApos - descAdic; const totalPeriodo = finalMensal * recorrencia;

    const lbl = forma.nextElementSibling || forma.parentElement; const formaTxt = lbl ? (lbl.querySelector('strong') ? lbl.querySelector('strong').textContent : lbl.textContent.trim()) : '';

    const investimentoHtml = dados.investimentoMidia ? `<p><strong>Investimento em Mídia:</strong> ${dados.investimentoMidia}</p>` : '';

    const alvo = document.getElementById('resumoProposta'); const modal = document.getElementById('modalResumoAceite');
    const fmt = v => (typeof formatarMoeda === 'function') ? formatarMoeda(v) : v;
    let resumo = `<div style="text-align:left;line-height:1.4">`;
    resumo += `<h3>Dados do Cliente</h3>`;
    resumo += `<p><strong>Cliente:</strong> ${dados.nomeCliente||'-'}</p>`;
    resumo += `<p><strong>Empresa:</strong> ${dados.empresaCliente||'-'}</p>`;
    resumo += `<p><strong>Data:</strong> ${formatarDataHoje()}</p>`;
    resumo += `<h3>Serviços Contratados</h3>` + blocos;
    resumo += `<h3>Valores</h3>`;
    resumo += `<p><strong>Valor Mensal dos Serviços:</strong> ${fmt(valorBase)}</p>`;
    if (pctRec>0) resumo += `<p><strong>Desconto por Recorrência:</strong> - ${fmt(descRec)} (${(pctRec*100).toFixed(0)}%)</p>`;
    resumo += (finalMensal!==undefined) ? `<p><strong>Valor Final Mensal:</strong> ${fmt(finalMensal)}</p>` : '';
    resumo += `<p><strong>Total do Período:</strong> ${fmt(totalPeriodo)} (${recorrencia} ${recorrencia===1?'mês':'meses'})</p>`;
    resumo += investimentoHtml;
    resumo += `<h3>Condições</h3><p><strong>Forma de Pagamento:</strong> ${formaTxt}</p>`;
    if (dados.observacoes) resumo += `<p><strong>Observações:</strong> ${dados.observacoes}</p>`;
    resumo += `</div>`;
    if (alvo) alvo.innerHTML = resumo; if (modal) modal.style.display = 'block';
  }

  function preencherResumoProposta(){
    const sect = document.getElementById('resumoPropostaSection'); if (!sect) return; const dados = obterDados();
    const nome = document.getElementById('resumoNomeCliente'); if (nome) nome.textContent = dados.nomeCliente||'';
    const emp = document.getElementById('resumoEmpresaCliente'); if (emp) emp.textContent = dados.empresaCliente||'';
    const data = document.getElementById('resumoDataProposta'); if (data) data.textContent = formatarDataHoje();
    let servicosHtml=''; let valorMensal=0;
    if (dados.servicoSocialMidia && dados.servicoSocialMidia!=='nao-se-aplica' && typeof planoSocialMidia!=='undefined'){ const p=planoSocialMidia[dados.servicoSocialMidia]; if(p){ valorMensal += (p.valor||0); servicosHtml += `<div class='resumo-servico'><strong>Social Mídia (${p.nome}):</strong><ul>` + (p.entregaveis||[]).map(i=>`<li>${i}</li>`).join('') + `</ul></div>`; } }
    if (dados.servicoTrafegoPago && dados.servicoTrafegoPago!=='nao-se-aplica' && typeof planoTrafegoPago!=='undefined'){ const p=planoTrafegoPago[dados.servicoTrafegoPago]; if(p){ valorMensal += (p.valor||0); servicosHtml += `<div class='resumo-servico'><strong>Tráfego Pago (${p.nome}):</strong><ul>` + (p.entregaveis||[]).map(i=>`<li>${i}</li>`).join('') + `</ul></div>`; } }
    const servDiv = document.getElementById('resumoServicos'); if (servDiv) servDiv.innerHTML = servicosHtml || '<p><em>Nenhum serviço contratado.</em></p>';
    const valSpan = document.getElementById('resumoValorMensal'); if (valSpan) valSpan.textContent = (typeof formatarMoeda==='function')?formatarMoeda(valorMensal):String(valorMensal);
  }

  function atualizarResumoFinanceiroEConteudo(){
    const sect = document.getElementById('resumoPropostaSection'); if (!sect) return; const dados = obterDados();
    let valorMensal=0; if (dados.servicoSocialMidia && dados.servicoSocialMidia!=='nao-se-aplica' && typeof planoSocialMidia!=='undefined'){ const p=planoSocialMidia[dados.servicoSocialMidia]; if(p&&p.valor) valorMensal+=p.valor; }
    if (dados.servicoTrafegoPago && dados.servicoTrafegoPago!=='nao-se-aplica' && typeof planoTrafegoPago!=='undefined'){ const p=planoTrafegoPago[dados.servicoTrafegoPago]; if(p&&p.valor) valorMensal+=p.valor; }
    const recSel = document.querySelector('input[name="recorrencia"]:checked'); const recorrencia = recSel?parseInt(recSel.value):6;
    const pctRec = (typeof obterDescontoRecorrencia==='function')?obterDescontoRecorrencia(recorrencia):0; const descRec = valorMensal * pctRec; let totalApos = valorMensal - descRec;
    if (dados.descontoValor && String(dados.descontoValor).trim()){ const v=parseFloat(String(dados.descontoValor).replace(',','.')); if(!isNaN(v)&&v>0){ totalApos -= (dados.descontoTipo==='percentual')? totalApos*(v/100): v; } }
    const descAdic = totalApos*0.05; const finalMensal = totalApos - descAdic; const formaRadio = document.querySelector('input[name="formaPagamento"]:checked');
    let formaTxt=''; if(formaRadio){ const lbl = formaRadio.nextElementSibling||formaRadio.parentElement; if(lbl){ const s=lbl.querySelector('strong'); formaTxt = s? s.textContent : (lbl.textContent||'').trim(); } }
    const content = sect.querySelector('.resumo-proposta-content')||sect; let bloco = document.getElementById('resumoFinanceiro'); if(!bloco){ bloco=document.createElement('div'); bloco.id='resumoFinanceiro'; bloco.className='resumo-financeiro'; content.appendChild(bloco); }
    const fmt = v => (typeof formatarMoeda==='function')?formatarMoeda(v):v;
    bloco.innerHTML = '<h4>Resumo Financeiro</h4>' + `<div class="linha"><span class="label">Valor Mensal dos Serviços (base):</span><span class="valor">${fmt(valorMensal)}</span></div>` + (pctRec>0?`<div class="linha"><span class="label">Desconto por Recorrência (${(pctRec*100).toFixed(0)}%):</span><span class="valor">- ${fmt(descRec)}</span></div>`:'') + `<div class="linha"><span class="label">Desconto Adicional (5%):</span><span class="valor">- ${fmt(descAdic)}</span></div>` + `<div class="linha"><span class="label">Valor Final Mensal:</span><span class="valor">${fmt(finalMensal)}</span></div>` + `<div class="linha"><span class="label">Total do Período:</span><span class="valor">${fmt(finalMensal*recorrencia)} (${recorrencia} ${recorrencia===1?'mês':'meses'})</span></div>` + (formaTxt?`<div class="linha"><span class="label">Forma de Pagamento:</span><span class="valor">${formaTxt}</span></div>`:'');
  }

  function exportarPDFResumoModal(nomeArquivo){
    const container = document.getElementById('resumoProposta'); if(!container) return Promise.reject(new Error('Conteúdo não encontrado'));
    if (typeof exportarPDFViaPdfMake === 'function') { try { exportarPDFViaPdfMake(nomeArquivo||'Resumo_Proposta.pdf'); return Promise.resolve(); } catch(e){ return Promise.reject(e); } }
    return new Promise((resolve)=>{ const w=window.open('','_blank'); if(!w){ window.print(); resolve(); return; } w.document.write('<html><head><title>'+(nomeArquivo||'Resumo')+'</title><meta charset="utf-8"/></head><body>'); w.document.write(container.innerHTML); w.document.write('</body></html>'); w.document.close(); setTimeout(function(){ try{ w.print(); }catch(e){} w.close(); resolve(); },350); });
  }

  function normalizarTextosMojibake(){ try{ const trocas=[[/Ã¡/g,'á'],[/Ã£/g,'ã'],[/Ãª/g,'ê'],[/Ã©/g,'é'],[/Ã­/g,'í'],[/Ã³/g,'ó'],[/Ã§/g,'ç']]; const walker=document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false); const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode); nodes.forEach(n=>{ if(!n.nodeValue) return; let t=n.nodeValue; trocas.forEach(([re,to])=>{ t=t.replace(re,to); }); n.nodeValue=t; }); }catch(e){} }

  document.addEventListener('DOMContentLoaded', function(){ normalizarTextosMojibake(); preencherResumoProposta(); atualizarResumoFinanceiroEConteudo(); document.querySelectorAll('input[name="recorrencia"], input[name="formaPagamento"]').forEach(el=>el.addEventListener('change', atualizarResumoFinanceiroEConteudo)); const btnAceitar = document.querySelector('.btn-aceitar-proposta'); if(btnAceitar) btnAceitar.addEventListener('click', aceitarProposta); document.querySelectorAll('.btn-export-pdf').forEach(b=>b.addEventListener('click', function(){ exportarPDFResumoModal(); })); const btnConfirmar = document.getElementById('btnConfirmarAceite'); if (btnConfirmar) btnConfirmar.addEventListener('click', function(){ document.getElementById('modalResumoAceite')?.style && (document.getElementById('modalResumoAceite').style.display='none'); document.getElementById('modalAceite')?.style && (document.getElementById('modalAceite').style.display='block'); }); });

  window.aceitarProposta = aceitarProposta;
  window.preencherResumoProposta = preencherResumoProposta;
  window.atualizarResumoFinanceiroEConteudo = atualizarResumoFinanceiroEConteudo;
  window.exportarPDFResumoModal = exportarPDFResumoModal;

})();
