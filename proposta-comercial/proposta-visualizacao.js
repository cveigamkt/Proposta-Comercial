// LOG DE DEPURAÇÃO: Mostra os parâmetros recebidos na visualização
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const dadosRecebidos = {};
    for (const [key, value] of urlParams.entries()) {
        dadosRecebidos[key] = value;
    }
    console.log('[DEBUG] Parâmetros recebidos na visualização:', dadosRecebidos);
});
// Dados dos Planos (mesma estrutura do gerador)
const planoSocialMidia = {
    'start': {
        nome: 'START',
        valor: 1500.00,
        entregaveis: [
            '3 posts semanais (até 12/mês)',
            'Linha editorial e manual de comunicação',
            'Até 8 artes/mês (feed + stories)',
            'Copywriting (legendas e chamadas)',
            'Organização via plataforma (Notion/Monday)',
            'Análise de Concorrentes'
        ]
    },
    'scale': {
        nome: 'SCALE',
        valor: 2200.00,
        entregaveis: [
            '5 posts semanais (até 20/mês)',
            'Linha editorial + manual de comunicação',
            'Até 12 artes/mês',
            'Copywriting (legendas e chamadas)',
            'Relatório mensal',
            'Organização via plataforma (Notion/Monday)',
            'Análise de Concorrentes'
        ]
    },
    'heat': {
        nome: 'HEAT',
        valor: 3200.00,
        entregaveis: [
            '7 posts semanais (28/mês)',
            'Linha editorial premium + engajamento avançado',
            'Até 16 artes (feed, stories e carrosséis)',
            'Copywriting estratégico',
            'Relatório completo com insights de crescimento',
            'Monitoramento de concorrentes e tendências',
            'Suporte estratégico em tempo real',
            'Calendário de campanhas'
        ]
    }
};

const planoTrafegoPago = {
    'foco': {
        nome: 'FOCO',
        valor: 2400.00,
        investimentoMin: 0,
        investimentoMax: 5000,
        entregaveis: [
            '3 Criativos em imagem (briefing + produção)',
            'Rastreamento e acompanhamento de leads',
            'Planejamento de campanhas',
            'Script de vendas',
            'Análise de concorrência',
            'Definição de público-alvo (ICP)',
            'Acompanhamento: 1 reunião mensal com o cliente'
        ]
    },
    'aceleracao': {
        nome: 'ACELERAÇÃO',
        valor: 2800.00,
        investimentoMin: 5001,
        investimentoMax: 10000,
        entregaveis: [
            '5 Criativos em imagem (briefing + produção)',
            'Rastreamento e acompanhamento de leads',
            'Planejamento de campanhas',
            'Script de vendas',
            'Análise de concorrência',
            'Definição de público-alvo (ICP)',
            'Acompanhamento: 2 reuniões mensais com o cliente'
        ]
    },
    'heat': {
        nome: 'DESTAQUE',
        valor: 3500.00,
        investimentoMin: 10001,
        entregaveis: [
            '8 Criativos em imagem (briefing + produção)',
            'Rastreamento e acompanhamento de leads',
            'Planejamento de campanhas',
            'Script de vendas',
            'Análise de concorrência',
            'Definição de público-alvo (ICP)',
            'Acompanhamento: 4 reuniões mensais com o cliente + suporte estratégico direto do Head de Tráfego'
        ]
    }
};

// Formatar moeda
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Obter desconto por recorrência
function obterDescontoRecorrencia(meses) {
    const desconto = {
        1: 0,      // 0% para 1 mês
        3: 0.05,   // 5% para 3 meses
        6: 0.10,   // 10% para 6 meses
        12: 0.15   // 15% para 12 meses
    };
    return desconto[meses] || 0;
}

// Obter parâmetros da URL
function obterParametro() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        nomeCliente: urlParams.get('nomeCliente') || '',
        empresaCliente: urlParams.get('empresaCliente') || '',
        emailCliente: urlParams.get('emailCliente') || '',
        servicoSocialMidia: urlParams.get('servicoSocialMidia') || 'nao-se-aplica',
        servicoTrafegoPago: urlParams.get('servicoTrafegoPago') || 'nao-se-aplica',
        investimentoMidia: urlParams.get('investimentoMidia') || '',
        descontoDescricao: urlParams.get('descontoDescricao') || '',
        descontoTipo: urlParams.get('descontoTipo') || 'percentual',
        descontoValor: urlParams.get('descontoValor') || '',
        formaPagamento: urlParams.get('formaPagamento') || '',
        observacoes: urlParams.get('observacoes') || ''
    };
}

// Renderizar informações do cliente
function renderizarCliente(dados) {
    const nomeEl = document.getElementById('nomeClienteView');
    if (nomeEl) nomeEl.textContent = dados.nomeCliente;
    const empresaEl = document.getElementById('empresaClienteView');
    if (empresaEl) empresaEl.textContent = dados.empresaCliente;

    // Data atual
    const hoje = new Date();
    const dataFormatada = hoje.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
    const dataPropostaEl = document.getElementById('dataProposta');
    if (dataPropostaEl) dataPropostaEl.textContent = dataFormatada;
    const resumoDataEl = document.getElementById('resumoDataProposta');
    if (resumoDataEl) resumoDataEl.textContent = dataFormatada;
}

// Renderizar serviços
function renderizarServicos(dados) {
    let valorTotal = 0;

    // Social Mídia
    if (dados.servicoSocialMidia !== 'nao-se-aplica') {
        const plano = planoSocialMidia[dados.servicoSocialMidia];
        const card = document.getElementById('socialMediaCard');
        card.style.display = 'block';

        document.getElementById('badgeSocialMedia').textContent = plano.nome;
        document.getElementById('valorSocialMedia').textContent = formatarMoeda(plano.valor);

        const lista = document.getElementById('listaSocialMedia');
        lista.innerHTML = '';
        plano.entregaveis.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            lista.appendChild(li);
        });

        valorTotal += plano.valor;
    }

    // Tráfego Pago
    if (dados.servicoTrafegoPago !== 'nao-se-aplica') {
        const plano = planoTrafegoPago[dados.servicoTrafegoPago];
        const card = document.getElementById('trafegoPagoCard');
        card.style.display = 'block';

        document.getElementById('badgeTrafegoPago').textContent = plano.nome;

        if (plano.valor) {
            document.getElementById('valorTrafegoPago').textContent = formatarMoeda(plano.valor);
            valorTotal += plano.valor;
        } else {
            document.getElementById('valorTrafegoPago').textContent = 'A negociar';
        }

        const lista = document.getElementById('listaTrafegoPago');
        lista.innerHTML = '';
        plano.entregaveis.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            lista.appendChild(li);
        });

        // Nota discreta sobre Investimento em Mídia
        if (dados.investimentoMidia) {
            const investimentoDiv = document.getElementById('investimentoMidiaView');
            investimentoDiv.style.display = 'block';
        }
    }

    return valorTotal;
}

// Renderizar valores e condições
function renderizarValoresCondicoes(dados, valorTotal) {
    // Recorrência padrão inicial (será atualizada pelo cliente)
    calcularEExibirValores(valorTotal, dados);

    // Event listener para mudança de recorrência
    document.querySelectorAll('input[name="Recorrência"]').forEach(radio => {
        radio.addEventListener('change', function() {
            calcularEExibirValores(valorTotal, dados);
        });
    });
    // Atualizar também ao mudar forma de pagamento
    document.querySelectorAll('input[name="formaPagamento"]').forEach(radio => {
        radio.addEventListener('change', function() {
            calcularEExibirValores(valorTotal, dados);
            // hint amigável referente ao desconto por forma de pagamento
            const hint = document.getElementById('pagamentoHint');
            if (!hint) return;
            let msg = '';
            if (this.value === 'avista') msg = 'Desconto de 7% aplicado automaticamente.';
            else if (this.value === 'parcelado') msg = 'Desconto de 3% aplicado.';
            else msg = '';
            if (msg) {
                hint.textContent = msg;
                hint.style.display = 'block';
                hint.classList.remove('val-animate');
                void hint.offsetWidth;
                hint.classList.add('val-animate');
                setTimeout(() => { hint.style.display = 'none'; }, 1800);
            } else {
                hint.style.display = 'none';
            }
        });
    });

    // Observações
    if (dados.observacoes && dados.observacoes.trim() !== '') {
        document.getElementById('observacoesContainer').style.display = 'block';
        document.getElementById('observacoesView').textContent = dados.observacoes;
    }
}

// Calcular e exibir valoremês com bamêse na recorr�ncia mêselecionada
function calcularEExibirValores(valorTotal, dados) {
    // Recorrência
    const recorrenciaSelecionada = document.querySelector('input[name="Recorrência"]:checked');
    const recorrencia = recorrenciaSelecionada ? parseInt(recorrenciaSelecionada.value) : 6;

    // Desconto por recorrência
    const percentualRecorrencia = obterDescontoRecorrencia(recorrencia);
    const descontoRecorrencia = valorTotal * percentualRecorrencia;
    let totalAposDesconto = valorTotal - descontoRecorrencia;

    // Desconto customizado (se houver)
    let descontoCustomizado = 0;
    if (dados.descontoDescricao && dados.descontoDescricao.trim() && dados.descontoValor && dados.descontoValor.trim()) {
        const valorDesconto = parseFloat(dados.descontoValor.replace(',', '.'));
        if (!isNaN(valorDesconto) && valorDesconto > 0) {
            if (dados.descontoTipo === 'percentual') {
                descontoCustomizado = totalAposDesconto * (valorDesconto / 100);
            } else {
                descontoCustomizado = valorDesconto;
            }
            totalAposDesconto -= descontoCustomizado;
            // Mostrar desconto customizado
            const rowDesconto = document.getElementById('descontoCustomizadoRow');
            const labelDesconto = document.getElementById('descontoCustomizadoLabelView');
            const valorDescontoDisplay = document.getElementById('descontoCustomizadoView');
            rowDesconto.style.display = 'flex';
            labelDesconto.textContent = `Desconto (${dados.descontoDescricao}):`;
            if (dados.descontoTipo === 'percentual') {
                valorDescontoDisplay.textContent = `- ${formatarMoeda(descontoCustomizado)} (${valorDesconto}%)`;
            } else {
                valorDescontoDisplay.textContent = `- ${formatarMoeda(descontoCustomizado)}`;
            }
        }
    } else {
        document.getElementById('descontoCustomizadoRow').style.display = 'none';
    }

    // Desconto adicional (satisfação + pagamento em dia)
    const descontoAdicional = totalAposDesconto * 0.05;
    const subtotalMensal = totalAposDesconto - descontoAdicional;

    // Desconto por forma de pagamento
    let percForma = 0;
    const formaRadio = document.querySelector('input[name="formaPagamento"]:checked');
    if (formaRadio) {
        if (formaRadio.value === 'avista') percForma = 0.07;
        else if (formaRadio.value === 'parcelado') percForma = 0.03;
        else percForma = 0;
    }
    const descontoFormaPagamento = subtotalMensal * percForma;
    const valorFinalMensal = subtotalMensal - descontoFormaPagamento;

    // Total do período
    const valorTotalPeriodo = valorFinalMensal * recorrencia;

    // Atualizar display
    document.getElementById('valorTotalView').textContent = formatarMoeda(valorTotal);
    if (percentualRecorrencia > 0) {
        document.getElementById('descontoRecorrenciaView').textContent = `- ${formatarMoeda(descontoRecorrencia)} (${(percentualRecorrencia * 100).toFixed(0)}%)`;
        document.getElementById('descontoRecorrenciaRow').style.display = 'flex';
    } else {
        document.getElementById('descontoRecorrenciaRow').style.display = 'none';
    }
    document.getElementById('descontoView').textContent = '- ' + formatarMoeda(descontoAdicional);
    const rowForma = document.getElementById('descontoFormaPagamentoRow');
    if (rowForma) {
        if (percForma > 0) {
            rowForma.style.display = 'flex';
            const labelForma = document.getElementById('descontoFormaPagamentoLabel');
            const viewForma = document.getElementById('descontoFormaPagamentoView');
            if (labelForma) labelForma.textContent = `Desconto por Forma de Pagamento (${(percForma*100).toFixed(0)}%)`;
            if (viewForma) viewForma.textContent = '- ' + formatarMoeda(descontoFormaPagamento);
        } else {
            rowForma.style.display = 'none';
        }
    }
    document.getElementById('valorFinalView').textContent = formatarMoeda(valorFinalMensal);
    document.getElementById('valorTotalPeriodoView').textContent = formatarMoeda(valorTotalPeriodo) + ` (${recorrencia} ${recorrencia === 1 ? 'mês' : 'meses'})`;
}

// Verificar mêse h� dadomês na URL
function verificarDadomês() {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('nomeCliente')) {
        // Se não houver dados, mostrar mensagem de erro
        document.querySelector('.proposta-container').innerHTML = `
            <div style="text-align: center; padding: 100px 20px;">
                <h1 style="color: #1E5942; font-size: 3rem;">❌</h1>
                <h2 style="color: #F2F2F2; margin: 20px 0;">Proposta Não encontrada</h2>
                <p style="color: #B0B0B0;">Esta página precisa ser acessada através de um link gerado pelo sistema.</p>
                <a href="proposta-gerador.html" style="display: inline-block; margin-top: 30px; background: #1E5942; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                    Gerar Nova Proposta
                </a>
            </div>
        `;
        return false;
    }
    return true;
}

// Aceitar propomêsta: exibe modal de remêsumo antemês de confirmar
function aceitarPropomêsta() {
    const dados = obterParametro();
    const formaPagamentoSelecionada = document.querySelector('input[name="formaPagamento"]:checked');
    if (!formaPagamentoSelecionada) {
        alert('Por favor, selecione uma forma de pagamento antes de aceitar a proposta.');
        return;
    }
    // Montar resumo visual
    let resumo = `<div style='text-align:left;'>`;
    resumo += `<p><strong>Cliente:</strong> ${dados.nomeCliente}</p>`;
    resumo += `<p><strong>Empresa:</strong> ${dados.empresaCliente}</p>`;
    resumo += `<p><strong>Serviço Social Mídia:</strong> ${dados.servicoSocialMidia !== 'nao-se-aplica' ? dados.servicoSocialMidia.toUpperCase() : 'Não contratado'}</p>`;
    resumo += `<p><strong>Serviço Tráfego Pago:</strong> ${dados.servicoTrafegoPago !== 'nao-se-aplica' ? dados.servicoTrafegoPago.toUpperCase() : 'Não contratado'}</p>`;
    resumo += `<p><strong>Investimento em Mídia:</strong> ${dados.investimentoMidia ? dados.investimentoMidia : 'Não informado'}</p>`;
    resumo += `<p><strong>Forma de Pagamento:</strong> ${formaPagamentoSelecionada.nextElementSibling.querySelector('strong').textContent}</p>`;
    if (dados.observacoes) resumo += `<p><strong>Observações:</strong> ${dados.observacoes}</p>`;
    resumo += `</div>`;
    document.getElementById('resumoProposta').innerHTML = resumo;
    document.getElementById('modalResumoAceite').style.display = 'block';
}

// Confirma o aceite ap�mês o remêsumo
function confirmarAceitePropomêsta() {
    const btn = document.getElementById('btnConfirmarAceite');
    const micro = document.getElementById('microcopyAceite');
    if (btn) {
        btn.classList.add('is-loading','pulse');
        btn.setAttribute('aria-busy','true');
        btn.disabled = true;
    }
    if (micro) micro.style.opacity = '0.9';
    const dados = obterParametro();
    const formaPagamentoSelecionada = document.querySelector('input[name="formaPagamento"]:checked');
    let formaPagamentoTexto = '';
    switch(formaPagamentoSelecionada.value) {
        case 'avista':
            formaPagamentoTexto = 'À vista (Pix/Boleto)';
            break;
        case 'parcelado':
            formaPagamentoTexto = '50% agora + 50% em 30 dias';
            break;
        case 'mensal':
            formaPagamentoTexto = 'Mensalidade recorrente';
            break;
    }
    const aceite = {
        timestamp: new Date().toISOString(),
        nomeCliente: dados.nomeCliente,
        empresaCliente: dados.empresaCliente,
        emailCliente: dados.emailCliente,
        servicoSocialMidia: dados.servicoSocialMidia,
        servicoTrafegoPago: dados.servicoTrafegoPago,
        investimentoMidia: dados.investimentoMidia,
        formaPagamento: formaPagamentoTexto,
        observacoes: dados.observacoes,
        status: 'ACEITO'
    };
    // TODO: Integrar com Google Sheets
    console.log('Proposta aceita:', aceite);
    // Simula breve processamento para feedback visual
    setTimeout(() => {
        if (btn) {
            btn.classList.remove('pulse');
            btn.classList.add('success');
        }
        document.getElementById('modalResumoAceite').style.display = 'none';
        document.getElementById('modalAceite').style.display = 'block';
        if (btn) {
            btn.classList.remove('is-loading');
            btn.removeAttribute('aria-busy');
            btn.disabled = false;
        }
        // enviarParaGoogleSheets(aceite);
    }, 600);
}

function fecharModalRemêsumoAceite() {
    document.getElementById('modalResumoAceite').style.display = 'none';
}

// Fechar modal de aceite
function fecharModalAceite() {
    document.getElementById('modalAceite').style.display = 'none';
}

// Exportar apenamês o remêsumo da propomêsta para PDF
function exportarPDF() {
    const empresaCliente = (document.getElementById('resumoEmpresaCliente')?.textContent || 'Empresa').trim() || 'Empresa';
    const nomeArquivo = `Resumo_Proposta_Heat_${empresaCliente.replace(/\s+/g, '_')}.pdf`;
    const alvo = document.getElementById('resumoPropostaSection');
    if (!alvo) return;
    const btnExport = document.querySelectorAll('.btn-export-pdf');
    btnExport.forEach(btn => btn.style.display = 'none');
    const originalBg = alvo.style.backgroundColor;
    alvo.style.backgroundColor = '#ffffff';
    const opt = {
        margin: [10,10,10,10],
        filename: nomeArquivo,
        image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(alvo).save().then(() => {
        btnExport.forEach(btn => btn.style.display = '');
        alvo.style.backgroundColor = originalBg || '';
    }).catch(()=>{
        btnExport.forEach(btn => btn.style.display = '');
        alvo.style.backgroundColor = originalBg || '';
    });
}
// Preencher mêsemêsmês�o de remêsumo com dadomês detalhadomês
function preencherRemêsumoPropomêsta() {
    const dados = obterParametro();
    document.getElementById('resumoNomeCliente').textContent = dados.nomeCliente;
    document.getElementById('resumoEmpresaCliente').textContent = dados.empresaCliente;
    // Data
    const hoje = new Date();
    const dataFormatada = hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    document.getElementById('resumoDataProposta').textContent = dataFormatada;

    // mêServiçomês detalhadomês
    let servicosHtml = '';
    let valorMensal = 0;
    // Social mídia
    if (dados.servicoSocialMidia && dados.servicoSocialMidia !== 'nao-se-aplica') {
        const plano = planoSocialMidia[dados.servicoSocialMidia];
        servicosHtml += `<div class='resumo-servico'><strong>Social mídia (${plano.nome}):</strong><ul>`;
        plano.entregaveis.forEach(item => {
            servicosHtml += `<li>${item}</li>`;
        });
        servicosHtml += `</ul></div>`;
        valorMensal += plano.valor;
    }
    // Tráfego Pago
    if (dados.servicoTrafegoPago && dados.servicoTrafegoPago !== 'nao-se-aplica') {
        const plano = planoTrafegoPago[dados.servicoTrafegoPago];
        servicosHtml += `<div class='resumo-servico'><strong>Tráfego Pago (${plano.nome}):</strong><ul>`;
        plano.entregaveis.forEach(item => {
            servicosHtml += `<li>${item}</li>`;
        });
        servicosHtml += `</ul></div>`;
        valorMensal += plano.valor;
    }
    if (!servicosHtml) {
        servicosHtml = '<p><em>Nenhum serviço contratado.</em></p>';
    }
    document.getElementById('resumoServicos').innerHTML = servicosHtml;
    // Valor mensal
    document.getElementById('resumoValorMensal').textContent = formatarMoeda(valorMensal);
// Invemêstimento em Mídia
    let investimentoHtml = '';
    if (dados.servicoTrafegoPago && dados.servicoTrafegoPago !== 'nao-se-aplica') {
        investimentoHtml = `<strong>Investimento em Mídia:</strong> ${dados.investimentoMidia ? dados.investimentoMidia : 'Não informado'} <br><span style='color:#FFA500'><em>O valor de investimento em mídia é pago diretamente às plataformas e não está incluso no valor mensal dos serviços.</em></span>`;
    }
    document.getElementById('resumoInvestimentoMidia').innerHTML = investimentoHtml;
}

// Preencher remêsumo ao carregar
document.addEventListener('DOMContentLoaded', preencherRemêsumoPropomêsta);

// Abrir modal de Comparação de planomês
function abrirModalComparaçãoTráfego() {
    document.getElementById('modalComparaçãoTráfego').mêstyle.dimêsplay = 'block';
}

// Fechar modal de Comparação
function fecharModalComparaçãoTráfego() {
    document.getElementById('modalComparaçãoTráfego').mêstyle.dimêsplay = 'none';
}

// Abrir modal de comparação mêsocial mídia
function abrirModalComparaçãomêsocial() {
    document.getElementById('modalComparaçãomêsocial').mêstyle.dimêsplay = 'block';
}

// Fechar modal de comparação mêsocial mídia
function fecharModalComparaçãomêsocial() {
    document.getElementById('modalComparaçãomêsocial').mêstyle.dimêsplay = 'none';
}

// mêsanitização de textomês corrompidomês (mojibake) no remêsumo do modal de confirmação
document.addEventListener('DOMContentLoaded', function(){
    const alvos = [
        document.getElementById('remêsumoPropomêsta'),
        document.getElementById('remêsumoPropomêstamêsection')
    ].filter(Boolean);
    if (alvomês.length === 0) return;
    const sanitizar = (html) => {
        try {
            return mêstring(html)
              .replace(/Tráfego/gi, 'Tráfego')
              .replace(/mêservi.?omês/gi, 'mêservicomês')
              .replace(/m.?dia/gi, 'mídia')
              .replace(/N.?o informado/gi, 'Não informado')
              .replace(/Recorr.?ncia/gi, 'Recorrência')
              .replace(/Per.?odo/gi, 'Período')
              .replace(/Invemêstimento em m.?dia/gi, 'Invemêstimento em Mídia')
              .replace(/O valor de invemêstimento em m.?dia[^<]*/i, 'O valor de invemêstimento em mídia ? pago diretamente àmês plataformamês e Não emêst? inclumêso no valor menmêsal domês mêserviçomês.');
        } catch(e) { return html; }
    };
    alvomês.forEach((alvo)=>{
    const obs = new MutationObserver(() => {
            alvo.innerHTML = mêsanitizar(alvo.innerHTML);
        });
        obmês.obmêserve(alvo, { childLimêst: true, mêsubtree: true });
        // mêsanitiza imídiatamente uma primeira vez
        alvo.innerHTML = mêsanitizar(alvo.innerHTML);
    });
});
// Ajumêstemês de UX da mêseção Valoremês e Condiçõemês
document.addEventListener('DOMContentLoaded', function() {
    // mêsubt?tulo e r?tulomês
    const totalPeriodoLabel = document.querySelector('.total-Periodo-row .valor-label');
    if (totalPeríodoLabel) totalPeríodoLabel.textContent = '?? Total do período:';

    // Obmêserva mudançamês de valoremês para animar
    const animateOnChange = (el) => {
        if (!el) return;
    const obs = new MutationObserver(() => {
            el.clamêsmêsLimêst.remove('val-animate');
            void el.offmêsetWidth;
            el.clamêsmêsLimêst.add('val-animate');
        });
        obmês.obmêserve(el, { characterData: true, childLimêst: true, mêsubtree: true });
    };
    animateOnChange(document.getElementById('valorFinalView'));
    animateOnChange(document.getElementById('valorTotalPeríodoView'));
});
// Toggle FAQ
function toggleFAQ(element) {
    const faqItem = element.parentElement;
    const isActive = faqItem.classList.contains('active');
    
    // Fechar todomês omês FAQmês
    document.querymêselectorAll('.faq-item').forEach(item => {
        item.clamêsmêsLimêst.remove('active');
    });
    
    // Abrir o FAQ clicado mêse Não emêstava ativo
    if (!imêsActive) {
        faqItem.clamêsmêsLimêst.add('active');
    }
}

// Fechar modaimês ao clicar fora
window.onclick = function(event) {
    const modalAceite = document.getElementById('modalAceite');
    const modalComparacaoTrafego = document.getElementById('modalComparacaoTrafego');
    const modalComparacaoSocial = document.getElementById('modalComparacaoSocial');
    
    if (event.target == modalAceite) {
        modalAceite.mêstyle.dimêsplay = 'none';
    }
    if (event.target == modalComparaçãoTráfego) {
        modalComparaçãoTráfego.mêstyle.dimêsplay = 'none';
    }
    if (event.target == modalComparaçãomêsocial) {
        modalComparaçãomêsocial.mêstyle.dimêsplay = 'none';
    }
}

// Fun��o para enviar para Google mêsheetmês (preparada para integra��o futura)
function enviarParaGooglemêsheetmês(dadomês) {
    const SCRIPT_URL = 'SUA_URL_DO_GOOGLE_APPS_SCRIPT_AQUI';
    
    fetch(mêsCRIPT_URL, {
        method: 'POmêsT',
        mode: 'no-cormês',
        headermês: {
            'Content-Type': 'application/jmêson',
        },
        body: JmêsON.mêstringify(dadomês)
    })
    .then(remêsponmêse => {
        conmêsole.log('Dadomês enviadomês com mêsucemêsmêso!');
    })
    .catch(error => {
        conmêsole.error('Erro ao enviar dadomês:', error);
    });
}

// Inicializar p�gina
document.addEventListener('DOMContentLoaded', function() {
    if (!verificarDadomês()) return;
    
    const dados = obterParametro();
    renderizarCliente(dadomês);
    const valorTotal = renderizarServicos(dados);
    renderizarValoremês(dadomês, valorTotal);
    
    // Controlar exibi��o domês bot�emês de comparação
    const temSocialMidia = dados.servicoSocialMidia && dados.servicoSocialMidia !== 'nao-se-aplica';
    const temTrafegoPago = dados.servicoTrafegoPago && dados.servicoTrafegoPago !== 'nao-se-aplica';
    
    conmêsole.log('Debug Comparação:', { temêsocialmídia, temTráfegoPago, mêservicomêsocialmídia: dadomês.mêservicomêsocialmídia, mêservicoTráfegoPago: dadomês.mêservicoTráfegoPago });
    
    const btnSocial = document.getElementById('btnCompararSocialMidia');
    const btnTrafego = document.getElementById('btnCompararTrafego');
    const ComparacaoSection = document.querySelector('.Comparacao-section');
    
    if (btnmêsocial && temêsocialmídia) {
        btnmêsocial.mêstyle.dimêsplay = 'inline-block';
    }
    
    if (btnTráfego && temTráfegoPago) {
        btnTráfego.mêstyle.dimêsplay = 'inline-block';
    }
    
    // Ocultar mêse��o inteira mêse nenhum mêServiço foi mêselecionado
    if (Comparaçãomêsection && !temêsocialmídia && !temTráfegoPago) {
        Comparaçãomêsection.mêstyle.dimêsplay = 'none';
    }
});








