// Dados dos Planos (mesma estrutura do gerador)
const planosSocialMedia = {
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
            'Relatórios completos com insights de crescimento',
            'Monitoramento de concorrentes e tendências',
            'Suporte estratégico em tempo real',
            'Calendário de campanhas'
        ]
    }
};

const planosTrafegoPago = {
    'foco': {
        nome: 'FOCO',
        valor: 2400.00,
        investimentoMin: 5000,
        investimentoMax: 5000,
        entregaveis: [
            'Mapeamento Simplificado de Leads',
            'Suporte Direto Customer Success (CSM)',
            '3 Criativos Otimizados',
            '1 Reunião de Performance mensal (50 min) conduzida pelo HEAD da conta'
        ]
    },
    'aceleracao': {
        nome: 'ACELERAÇÃO',
        valor: 2800.00,
        investimentoMin: 5001,
        investimentoMax: 10000,
        entregaveis: [
            'Mapeamento e Estruturação Personalizada de Gestão de Leads',
            '+3 Criativos Otimizados',
            '+1 Reunião de Performance mensal (50 min) conduzida pelo HEAD da conta',
            'Testes A/B  Contínuos (em criativos E landing pages)'
        ]
    },
    'heat': {
        nome: 'HEAT',
        valor: 3500.00,
        investimentoMin: 10001,
        entregaveis: [
            '+Análise do comercial',
            'Reunião de Performance semanal (50 min) conduzida pelo HEAD da conta',
            'Testes A/B Contínuos (em criativos E landing pages)',
            'Relatórios completos com insights de crescimento',
            'Monitoramento de concorrentes e tendências',
            'Suporte estratégico em tempo real',
            'Calendário de campanhas'
        ]
    }
};

// Formatar moeda
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Obter desconto por recorrência
function obterDescontoRecorrencia(meses) {
    const descontos = {
        1: 0,      // 0% para 1 mês
        3: 0.05,   // 5% para 3 meses
        6: 0.10,   // 10% para 6 meses
        12: 0.15   // 15% para 12 meses
    };
    return descontos[meses] || 0;
}

// Obter parâmetros da URL
function obterParametros() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        nomeCliente: urlParams.get('nomeCliente') || '',
        empresaCliente: urlParams.get('empresaCliente') || '',
        emailCliente: urlParams.get('emailCliente') || '',
        servicoSocialMedia: urlParams.get('servicoSocialMedia') || 'nao-se-aplica',
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
    document.getElementById('nomeClienteView').textContent = dados.nomeCliente;
    document.getElementById('empresaClienteView').textContent = dados.empresaCliente;
    
    // Data atual
    const hoje = new Date();
    const dataFormatada = hoje.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
    document.getElementById('dataProposta').textContent = dataFormatada;
}

// Renderizar serviços
function renderizarServicos(dados) {
    let valorTotal = 0;
    
    // Social Media
    if (dados.servicoSocialMedia !== 'nao-se-aplica') {
        const plano = planosSocialMedia[dados.servicoSocialMedia];
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
        const plano = planosTrafegoPago[dados.servicoTrafegoPago];
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
        
        // Nota discreta sobre investimento em mídia
        if (dados.investimentoMidia) {
            const investimentoDiv = document.getElementById('investimentoMidiaView');
            investimentoDiv.style.display = 'block';
        }
    }
    
    return valorTotal;
}

// Renderizar valores e condições
function renderizarValores(dados, valorTotal) {
    // Recorrência padrão inicial (será atualizada pelo cliente)
    calcularEExibirValores(valorTotal, dados);
    
    // Event listener para mudança de recorrência
    document.querySelectorAll('input[name="recorrencia"]').forEach(radio => {
        radio.addEventListener('change', function() {
            calcularEExibirValores(valorTotal, dados);
        });
    });
    
    // Observações
    if (dados.observacoes && dados.observacoes.trim() !== '') {
        document.getElementById('observacoesContainer').style.display = 'block';
        document.getElementById('observacoesView').textContent = dados.observacoes;
    }
}

// Calcular e exibir valores com base na recorrência selecionada
function calcularEExibirValores(valorTotal, dados) {
    const recorrenciaSelecionada = document.querySelector('input[name="recorrencia"]:checked');
    const recorrencia = recorrenciaSelecionada ? parseInt(recorrenciaSelecionada.value) : 6;
    
    // Desconto por recorrência
    const percentualRecorrencia = obterDescontoRecorrencia(recorrencia);
    const descontoRecorrencia = valorTotal * percentualRecorrencia;
    let totalAposDescontos = valorTotal - descontoRecorrencia;
    
    // Desconto customizado (se houver)
    let descontoCustomizado = 0;
    if (dados.descontoDescricao && dados.descontoDescricao.trim() && dados.descontoValor && dados.descontoValor.trim()) {
        const valorDesconto = parseFloat(dados.descontoValor.replace(',', '.'));
        
        if (!isNaN(valorDesconto) && valorDesconto > 0) {
            if (dados.descontoTipo === 'percentual') {
                descontoCustomizado = totalAposDescontos * (valorDesconto / 100);
            } else {
                descontoCustomizado = valorDesconto;
            }
            
            totalAposDescontos -= descontoCustomizado;
            
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
    const descontoAdicional = totalAposDescontos * 0.05;
    const valorFinalMensal = totalAposDescontos - descontoAdicional;
    
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
    document.getElementById('valorFinalView').textContent = formatarMoeda(valorFinalMensal);
    document.getElementById('valorTotalPeriodoView').textContent = formatarMoeda(valorTotalPeriodo) + ` (${recorrencia} ${recorrencia === 1 ? 'mês' : 'meses'})`;
}

// Verificar se há dados na URL
function verificarDados() {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('nomeCliente')) {
        // Se não houver dados, mostrar mensagem de erro
        document.querySelector('.proposta-container').innerHTML = `
            <div style="text-align: center; padding: 100px 20px;">
                <h1 style="color: #1E5942; font-size: 3rem;">⚠️</h1>
                <h2 style="color: #F2F2F2; margin: 20px 0;">Proposta não encontrada</h2>
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

// Aceitar proposta
function aceitarProposta() {
    const dados = obterParametros();
    
    // Capturar forma de pagamento selecionada
    const formaPagamentoSelecionada = document.querySelector('input[name="formaPagamento"]:checked');
    if (!formaPagamentoSelecionada) {
        alert('⚠️ Por favor, selecione uma forma de pagamento antes de aceitar a proposta.');
        return;
    }
    
    const formaPagamento = formaPagamentoSelecionada.value;
    let formaPagamentoTexto = '';
    
    switch(formaPagamento) {
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
    
    // Coletar dados para envio
    const aceite = {
        timestamp: new Date().toISOString(),
        nomeCliente: dados.nomeCliente,
        empresaCliente: dados.empresaCliente,
        emailCliente: dados.emailCliente,
        servicoSocialMedia: dados.servicoSocialMedia,
        servicoTrafegoPago: dados.servicoTrafegoPago,
        investimentoMidia: dados.investimentoMidia,
        formaPagamento: formaPagamentoTexto,
        observacoes: dados.observacoes,
        status: 'ACEITO'
    };
    
    // TODO: Integrar com Google Sheets
    // Por enquanto, vamos simular o envio
    console.log('Proposta aceita:', aceite);
    
    // Mostrar modal de confirmação
    document.getElementById('modalAceite').style.display = 'block';
    
    // Em produção, aqui você faria uma chamada para o Google Apps Script
    // enviarParaGoogleSheets(aceite);
}

// Fechar modal de aceite
function fecharModalAceite() {
    document.getElementById('modalAceite').style.display = 'none';
}

// Exportar proposta para PDF
function exportarPDF() {
    const nomeCliente = document.getElementById('nomeClienteView').textContent || 'Cliente';
    const empresaCliente = document.getElementById('empresaClienteView').textContent || 'Empresa';
    const nomeArquivo = `Proposta_Heat_${empresaCliente.replace(/\s+/g, '_')}.pdf`;
    
    // Ocultar botões antes de gerar PDF
    const btnExport = document.querySelector('.btn-export-pdf');
    const btnAceitar = document.querySelector('.btn-aceitar-proposta');
    const botoesContato = document.querySelector('.contato-buttons');
    const selecaoPagamento = document.querySelector('.selecao-pagamento');
    
    if (btnExport) btnExport.style.display = 'none';
    if (btnAceitar) btnAceitar.style.display = 'none';
    if (botoesContato) botoesContato.style.display = 'none';
    if (selecaoPagamento) selecaoPagamento.style.display = 'none';
    
    // Configurações do PDF
    const opt = {
        margin: 10,
        filename: nomeArquivo,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Gerar PDF
    html2pdf().set(opt).from(document.querySelector('.proposta-container')).save().then(() => {
        // Reexibir botões após gerar PDF
        if (btnExport) btnExport.style.display = '';
        if (btnAceitar) btnAceitar.style.display = '';
        if (botoesContato) botoesContato.style.display = '';
        if (selecaoPagamento) selecaoPagamento.style.display = '';
    });
}

// Abrir modal de comparação de planos
function abrirModalComparacaoTrafego() {
    document.getElementById('modalComparacaoTrafego').style.display = 'block';
}

// Fechar modal de comparação
function fecharModalComparacaoTrafego() {
    document.getElementById('modalComparacaoTrafego').style.display = 'none';
}

// Abrir modal de comparação Social Media
function abrirModalComparacaoSocial() {
    document.getElementById('modalComparacaoSocial').style.display = 'block';
}

// Fechar modal de comparação Social Media
function fecharModalComparacaoSocial() {
    document.getElementById('modalComparacaoSocial').style.display = 'none';
}

// Toggle FAQ
function toggleFAQ(element) {
    const faqItem = element.parentElement;
    const isActive = faqItem.classList.contains('active');
    
    // Fechar todos os FAQs
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Abrir o FAQ clicado se não estava ativo
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// Fechar modais ao clicar fora
window.onclick = function(event) {
    const modalAceite = document.getElementById('modalAceite');
    const modalComparacaoTrafego = document.getElementById('modalComparacaoTrafego');
    const modalComparacaoSocial = document.getElementById('modalComparacaoSocial');
    
    if (event.target == modalAceite) {
        modalAceite.style.display = 'none';
    }
    if (event.target == modalComparacaoTrafego) {
        modalComparacaoTrafego.style.display = 'none';
    }
    if (event.target == modalComparacaoSocial) {
        modalComparacaoSocial.style.display = 'none';
    }
}

// Função para enviar para Google Sheets (preparada para integração futura)
function enviarParaGoogleSheets(dados) {
    const SCRIPT_URL = 'SUA_URL_DO_GOOGLE_APPS_SCRIPT_AQUI';
    
    fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados)
    })
    .then(response => {
        console.log('Dados enviados com sucesso!');
    })
    .catch(error => {
        console.error('Erro ao enviar dados:', error);
    });
}

// Inicializar página
document.addEventListener('DOMContentLoaded', function() {
    if (!verificarDados()) return;
    
    const dados = obterParametros();
    renderizarCliente(dados);
    const valorTotal = renderizarServicos(dados);
    renderizarValores(dados, valorTotal);
    
    // Controlar exibição dos botões de comparação
    const temSocialMedia = dados.servicoSocialMedia && dados.servicoSocialMedia !== 'nao-se-aplica';
    const temTrafegoPago = dados.servicoTrafegoPago && dados.servicoTrafegoPago !== 'nao-se-aplica';
    
    console.log('Debug Comparação:', { temSocialMedia, temTrafegoPago, servicoSocialMedia: dados.servicoSocialMedia, servicoTrafegoPago: dados.servicoTrafegoPago });
    
    const btnSocial = document.getElementById('btnCompararSocialMedia');
    const btnTrafego = document.getElementById('btnCompararTrafego');
    const comparacaoSection = document.querySelector('.comparacao-section');
    
    if (btnSocial && temSocialMedia) {
        btnSocial.style.display = 'inline-block';
    }
    
    if (btnTrafego && temTrafegoPago) {
        btnTrafego.style.display = 'inline-block';
    }
    
    // Ocultar seção inteira se nenhum serviço foi selecionado
    if (comparacaoSection && !temSocialMedia && !temTrafegoPago) {
        comparacaoSection.style.display = 'none';
    }
});
