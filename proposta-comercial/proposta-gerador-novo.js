// Dados dos Planos de Social Media
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

// Dados dos Planos de Tráfego Pago
const planosTrafegoPago = {
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
        investimentoMax: null,
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
        dados.entregaveis.slice(0, 4).forEach(item => {
            html += `<li>✅ ${item}</li>`;
        });
        if (dados.entregaveis.length > 4) {
            html += `<li style="color: #888; font-style: italic;">+ ${dados.entregaveis.length - 4} outros entregáveis</li>`;
        }
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
        
        html += '<ul>';
        dados.entregaveis.slice(0, 4).forEach(item => {
            html += `<li>✅ ${item}</li>`;
        });
        if (dados.entregaveis.length > 4) {
            html += `<li style="color: #888; font-style: italic;">+ ${dados.entregaveis.length - 4} outros entregáveis</li>`;
        }
        html += '</ul>';
        info.innerHTML = html;
    }
    calcularValores();
});

// Listeners para desconto customizado
document.getElementById('descontoDescricao').addEventListener('input', calcularValores);
document.getElementById('descontoTipo').addEventListener('change', calcularValores);
document.getElementById('descontoValor').addEventListener('input', calcularValores);

// Inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', calcularValores);
} else {
    calcularValores();
}