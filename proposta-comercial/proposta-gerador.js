// Dados dos Planos de Social Media
const planosSocialMedia = {
    'start': {
        nome: 'START',
        valor: 1500.00,
        entregaveis: [
            '3 posts semanais',
            'Manual de comunicação',
            '8 artes/mês',
            'Copywriting',
            'Organização via Notion',
            'Análise de concorrentes'
        ]
    },
    'scale': {
        nome: 'SCALE',
        valor: 2200.00,
        entregaveis: [
            '5 posts semanais',
            'Manual de comunicação',
            '12 artes/mês',
            'Copywriting',
            'Relatório mensal',
            'Organização via Notion',
            'Análise de concorrentes'
        ]
    },
    'heat': {
        nome: 'HEAT',
        valor: 3200.00,
        entregaveis: [
            '7 posts semanais',
            'Linha editorial premium',
            '16 artes/mês',
            'Copywriting estratégico',
            'Relatório completo',
            'Monitoramento de tendências',
            'Suporte em tempo real'
        ]
    }
};

// Dados dos Planos de Tráfego Pago
const planosTrafegoPago = {
    'foco': {
        nome: 'FOCO',
        valor: 2400.00,
        investimentoMin: 0,
        investimentoMax: 5000,
        secoes: {
            'Execução': [
                '3 criativos estáticos (imagem) por mês',
                '1 reunião mensal'
            ],
            'Gestão e Acompanhamento': [
                'Planejamento de campanhas',
                'Rastreamento de leads',
                'Relatórios semanais de performance',
                'Dashboard de resultados'
            ],
            'Estratégia e Configuração': [
                'Script de vendas',
                'Análise de concorrência',
                'Definição de ICP (público ideal)',
                'Landing Page de alta conversão',
                'Configuração inicial de BM + Tags (Meta/Google)'
            ],
            'Suporte': [
                'Suporte direto (grupo de acompanhamento)'
            ]
        }
    },
    'aceleracao': {
        nome: 'ACELERAÇÃO',
        valor: 2800.00,
        investimentoMin: 5001,
        investimentoMax: 10000,
        secoes: {
            'Execução': [
                '5 criativos estáticos (imagem) por mês',
                '2 reuniões mensais'
            ],
            'Gestão e Acompanhamento': [
                'Planejamento de campanhas',
                'Rastreamento de leads',
                'Relatórios semanais de performance',
                'Dashboard de resultados'
            ],
            'Estratégia e Configuração': [
                'Script de vendas',
                'Análise de concorrência',
                'Definição de ICP (público ideal)',
                'Landing Page de alta conversão',
                'Configuração inicial de BM + Tags (Meta/Google)'
            ],
            'Suporte': [
                'Suporte direto (grupo de acompanhamento)'
            ]
        }
    },
    'heat': {
        nome: 'DESTAQUE',
        valor: 3500.00,
        investimentoMin: 10001,
        investimentoMax: null,
        secoes: {
            'Execução': [
                '8 criativos estáticos (imagem) por mês',
                '4 reuniões mensais'
            ],
            'Gestão e Acompanhamento': [
                'Planejamento de campanhas',
                'Rastreamento de leads',
                'Relatórios semanais de performance',
                'Dashboard de resultados'
            ],
            'Estratégia e Configuração': [
                'Script de vendas',
                'Análise de concorrência',
                'Definição de ICP (público ideal)',
                'Landing Page de alta conversão',
                'Configuração inicial de BM + Tags (Meta/Google)',
                'Consultoria estratégica de crescimento',
                'Ajustes contínuos de LP e otimização de conversão (CRO)'
            ],
            'Suporte': [
                'Suporte direto (grupo de acompanhamento)',
                'Suporte prioritário via WhatsApp'
            ]
        }
    }
};

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

// Calcular valores totais
function calcularValores() {
    let total = 0;
    
    const socialMedia = document.getElementById('servicoSocialMidia').value;
    const trafegoPago = document.getElementById('servicoTrafegoPago').value;
    
    if (socialMedia !== 'nao-se-aplica') {
        total += planosSocialMedia[socialMedia].valor;
    }
    
    if (trafegoPago !== 'nao-se-aplica') {
        total += planosTrafegoPago[trafegoPago].valor;
    }
    
    // Desconto customizado (opcional)
    const descontoDescricao = document.getElementById('descontoDescricao').value.trim();
    const descontoTipo = document.getElementById('descontoTipo').value;
    const descontoValorInput = document.getElementById('descontoValor').value.trim();
    
    let descontoCustomizado = 0;
    let totalAposDesconto = total;
    
    if (descontoDescricao && descontoValorInput) {
        const valorDesconto = parseFloat(descontoValorInput.replace(',', '.'));
        
        if (!isNaN(valorDesconto) && valorDesconto > 0) {
            if (descontoTipo === 'percentual') {
                descontoCustomizado = total * (valorDesconto / 100);
            } else {
                descontoCustomizado = valorDesconto;
            }
            
            totalAposDesconto = total - descontoCustomizado;
        }
    }
    
    // Atualizar simulador de períodos
    atualizarSimulador(totalAposDesconto, descontoCustomizado);
}

// Atualizar simulador de períodos
function atualizarSimulador(valorBase, descontoCustomizado = 0) {
    const periodos = [1, 3, 6, 12];
    
    periodos.forEach(meses => {
        const descontoRecorrencia = valorBase * obterDescontoRecorrencia(meses);
        const totalAposRecorrencia = valorBase - descontoRecorrencia;
        const descontoAdicional = totalAposRecorrencia * 0.05;
        const valorFinalMensal = totalAposRecorrencia - descontoAdicional;
        const valorTotalPeriodo = valorFinalMensal * meses;
        
        // Calcular economia total (desconto customizado + recorrência + adicional) por período
        const economiaTotal = (descontoCustomizado + descontoRecorrencia + descontoAdicional) * meses;
        
        document.getElementById(`sim${meses}Mensal`).textContent = formatarMoeda(valorFinalMensal) + '/mês';
        document.getElementById(`sim${meses}Total`).textContent = 'Total: ' + formatarMoeda(valorTotalPeriodo);
        document.getElementById(`sim${meses}Economia`).textContent = 'Economia: ' + formatarMoeda(economiaTotal);
    });
}

// Formatar valores em moeda brasileira
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Atualizar entregáveis de Social Media
document.getElementById('servicoSocialMidia').addEventListener('change', function() {
    const plano = this.value;
    const container = document.getElementById('entregaveisSocialMedia');
    const info = document.getElementById('infoSocialMedia');
    const toggleBtn = document.getElementById('toggleSocialMedia');
    
    if (plano === 'nao-se-aplica') {
        container.style.display = 'none';
        toggleBtn.style.display = 'none';
    } else {
        toggleBtn.style.display = 'block';
        container.style.display = 'none'; // Começa oculto
        toggleBtn.textContent = '📋 Ver Entregáveis';
        toggleBtn.classList.remove('active');
        
        const dados = planosSocialMedia[plano];
        let html = `<h4>${dados.nome} - ${formatarMoeda(dados.valor)}/mês</h4><ul>`;
        dados.entregaveis.forEach(item => {
            html += `<li>✅ ${item}</li>`;
        });
        html += '</ul>';
        info.innerHTML = html;
    }
    calcularValores();
});

// Atualizar entregáveis de Tráfego Pago
document.getElementById('servicoTrafegoPago').addEventListener('change', function() {
    const plano = this.value;
    const container = document.getElementById('entregaveisTrafegoPago');
    const info = document.getElementById('infoTrafegoPago');
    const investimentoContainer = document.getElementById('investimentoMidiaContainer');
    const limiteTexto = document.getElementById('limiteInvestimento');
    const toggleBtn = document.getElementById('toggleTrafegoPago');
    
    if (plano === 'nao-se-aplica') {
        container.style.display = 'none';
        investimentoContainer.style.display = 'none';
        toggleBtn.style.display = 'none';
    } else {
        toggleBtn.style.display = 'block';
        container.style.display = 'none'; // Começa oculto
        toggleBtn.textContent = '📋 Ver Entregáveis';
        toggleBtn.classList.remove('active');
        investimentoContainer.style.display = 'block';
        const dados = planosTrafegoPago[plano];
        
        // Atualizar texto do limite
        if (dados.investimentoMax) {
            limiteTexto.innerHTML = `<strong>⚠️ Importante:</strong> Valor que o cliente investirá em anúncios (não inclui nossa gestão).<br><strong>Limite deste plano:</strong> ${formatarMoeda(dados.investimentoMin)} - ${formatarMoeda(dados.investimentoMax)}`;
        } else {
            limiteTexto.innerHTML = `<strong>⚠️ Importante:</strong> Valor que o cliente investirá em anúncios (não inclui nossa gestão).<br><strong>Limite deste plano:</strong> Acima de ${formatarMoeda(dados.investimentoMin)}`;
        }
        
        let valorTexto = dados.valor ? formatarMoeda(dados.valor) + '/mês' : 'Negociação';
        let html = `<h4>${dados.nome} - ${valorTexto}</h4>`;
        
        if (dados.investimentoMax) {
            html += `<p><strong>Mídia:</strong> ${formatarMoeda(dados.investimentoMin)} - ${formatarMoeda(dados.investimentoMax)}</p>`;
        } else {
            html += `<p><strong>Mídia:</strong> Acima de ${formatarMoeda(dados.investimentoMin)}</p>`;
        }
        
        // Mostrar todas as seções organizadas
        const secoes = Object.keys(dados.secoes);
        
        html += '<div style="margin-top: 15px;">';
        secoes.forEach(secaoNome => {
            html += `<div style="margin-bottom: 8px;"><strong style="color: #1E5942; font-size: 0.9rem;">${secaoNome}:</strong></div>`;
            html += '<ul style="margin-left: 15px; margin-bottom: 8px;">';
            dados.secoes[secaoNome].forEach(item => {
                html += `<li style="font-size: 0.85rem; margin-bottom: 3px;">✅ ${item}</li>`;
            });
            html += '</ul>';
        });
        html += '</div>';
        info.innerHTML = html;
    }
    calcularValores();
});

// Listeners para desconto customizado
document.getElementById('descontoDescricao').addEventListener('input', calcularValores);
document.getElementById('descontoTipo').addEventListener('change', calcularValores);
document.getElementById('descontoValor').addEventListener('input', calcularValores);

// Função para visualizar proposta (SEM salvar)
function previewProposta() {
    const dadosVisualizacao = coletarDadosFormulario();
    if (!dadosVisualizacao) return;
    
    // Criar URL com parâmetros
    const params = new URLSearchParams(dadosVisualizacao);
    const urlVisualizacao = `proposta-visualizacao.html?${params.toString()}`;
    
    // Abrir diretamente (sem salvar)
    window.open(urlVisualizacao, '_blank');
}

// Função para gerar link da proposta (COM salvar)
async function gerarLinkProposta() {
    const dadosVisualizacao = coletarDadosFormulario();
    if (!dadosVisualizacao) return;
    
    // Calcular valores para o script
    let valorTotal = 0;
    const socialMedia = dadosVisualizacao.servicoSocialMidia;
    const trafegoPago = dadosVisualizacao.servicoTrafegoPago;
    
    if (socialMedia !== 'nao-se-aplica') valorTotal += planosSocialMedia[socialMedia].valor;
    if (trafegoPago !== 'nao-se-aplica') valorTotal += planosTrafegoPago[trafegoPago].valor;
    
    // Dados para enviar ao Google Apps Script
    const dadosScript = {
        action: 'criar',
        nomeCliente: dadosVisualizacao.nomeCliente,
        empresaCliente: dadosVisualizacao.empresaCliente,
        emailCliente: dadosVisualizacao.emailCliente,
        socialMedia: socialMedia !== 'nao-se-aplica' ? planosSocialMedia[socialMedia].nome : '',
        trafegoPago: trafegoPago !== 'nao-se-aplica' ? planosTrafegoPago[trafegoPago].nome : '',
        valorMensal: `R$ ${valorTotal.toLocaleString('pt-BR')},00`,
        valorTotal: `R$ ${valorTotal.toLocaleString('pt-BR')},00`,
        descontosTotais: 'R$ 0,00',
        recorrencia: '6',
        formaPagamento: 'À Vista',
        responsavelProposta: dadosVisualizacao.responsavelProposta,
        validadeProposta: dadosVisualizacao.diasValidade,
        timestampCriacao: dadosVisualizacao.timestampCriacao
    };
    
    // Enviar para Google Apps Script
    try {
        const formData = new FormData();
        Object.keys(dadosScript).forEach(key => {
            formData.append(key, dadosScript[key]);
        });
        
        await fetch('https://script.google.com/macros/s/AKfycbx49YFpXzfhzVWYI6OWDzgnYtQz9r17Hskfa_ve2ncbm-NPMQNyU-l2j5L_W5H9In8k/exec', {
            method: 'POST',
            body: formData
        });
    } catch (error) {
        console.log('Erro ao salvar proposta:', error);
    }
    
    // Criar URL com parâmetros
    const params = new URLSearchParams(dadosVisualizacao);
    const urlVisualizacao = `proposta-visualizacao.html?${params.toString()}`;
    
    // Mostrar modal com o link
    document.getElementById('linkGerado').value = window.location.origin + window.location.pathname.replace('proposta-gerador.html', '') + urlVisualizacao;
    document.getElementById('modalLink').style.display = 'block';
}

// Variável global para armazenar timestamp da proposta
let timestampPropostaAtual = null;

// Função auxiliar para coletar dados do formulário
function coletarDadosFormulario() {
    // Validar campos obrigatórios
    const nomeCliente = document.getElementById('nomeCliente').value.trim();
    const empresaCliente = document.getElementById('empresaCliente').value.trim();
    const responsavelProposta = document.getElementById('responsavelProposta').value.trim();
    const diasValidade = document.getElementById('diasValidade').value;
    
    if (!nomeCliente || !empresaCliente || !responsavelProposta) {
        alert('Por favor, preencha todos os campos obrigatórios (Nome do Cliente, Empresa e Responsável).');
        return null;
    }
    
    // Verificar se pelo menos um serviço foi selecionado
    const socialMedia = document.getElementById('servicoSocialMidia').value;
    const trafegoPago = document.getElementById('servicoTrafegoPago').value;
    
    if (socialMedia === 'nao-se-aplica' && trafegoPago === 'nao-se-aplica') {
        alert('Por favor, selecione pelo menos um serviço (Social Media ou Tráfego Pago).');
        return null;
    }
    
    // Criar timestamp apenas uma vez por sessão de proposta
    if (!timestampPropostaAtual) {
        const agora = new Date();
        timestampPropostaAtual = agora.toLocaleDateString('pt-BR') + ' ' + agora.toLocaleTimeString('pt-BR');
    }
    
    return {
        nomeCliente: nomeCliente,
        empresaCliente: empresaCliente,
        emailCliente: document.getElementById('emailCliente').value.trim(),
        responsavelProposta: responsavelProposta,
        diasValidade: diasValidade,
        servicoSocialMidia: socialMedia,
        servicoTrafegoPago: trafegoPago,
        timestampCriacao: timestampPropostaAtual
    };
}

// Função para resetar timestamp quando dados importantes mudarem
function resetarTimestamp() {
    timestampPropostaAtual = null;
}

// Listeners para resetar timestamp quando dados importantes mudarem
document.addEventListener('DOMContentLoaded', function() {
    // Resetar timestamp quando cliente ou serviços mudarem
    document.getElementById('nomeCliente').addEventListener('input', resetarTimestamp);
    document.getElementById('empresaCliente').addEventListener('input', resetarTimestamp);
    document.getElementById('servicoSocialMidia').addEventListener('change', resetarTimestamp);
    document.getElementById('servicoTrafegoPago').addEventListener('change', resetarTimestamp);
});

// Inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', calcularValores);
} else {
    calcularValores();
}