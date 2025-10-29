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
        investimentoMax: null, // Sem limite
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
    
    const socialMedia = document.getElementById('servicoSocialMedia').value;
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
            
            // Mostrar desconto customizado
            const itemDesconto = document.getElementById('descontoCustomizadoItem');
            const labelDesconto = document.getElementById('descontoCustomizadoLabel');
            const valorDescontoDisplay = document.getElementById('descontoCustomizadoDisplay');
            
            itemDesconto.style.display = 'flex';
            labelDesconto.textContent = `Desconto (${descontoDescricao}):`;
            
            if (descontoTipo === 'percentual') {
                valorDescontoDisplay.textContent = `- ${formatarMoeda(descontoCustomizado)} (${valorDesconto}%)`;
            } else {
                valorDescontoDisplay.textContent = `- ${formatarMoeda(descontoCustomizado)}`;
            }
        } else {
            document.getElementById('descontoCustomizadoItem').style.display = 'none';
        }
    } else {
        document.getElementById('descontoCustomizadoItem').style.display = 'none';
    }
    
    // Desconto adicional (satisfação + pagamento em dia)
    const descontoAdicional = totalAposDesconto * 0.05;
    const valorFinalMensal = totalAposDesconto - descontoAdicional;
    
    document.getElementById('valorTotalDisplay').textContent = formatarMoeda(total);
    document.getElementById('descontoDisplay').textContent = '- ' + formatarMoeda(descontoAdicional);
    document.getElementById('valorFinalDisplay').textContent = formatarMoeda(valorFinalMensal);
    
    // Atualizar simulador de períodos
    atualizarSimulador(totalAposDesconto);
}

// Atualizar simulador de períodos
function atualizarSimulador(valorBase) {
    const periodos = [1, 3, 6, 12];
    
    periodos.forEach(meses => {
        const descontoRecorrencia = valorBase * obterDescontoRecorrencia(meses);
        const totalAposRecorrencia = valorBase - descontoRecorrencia;
        const descontoAdicional = totalAposRecorrencia * 0.05;
        const valorFinalMensal = totalAposRecorrencia - descontoAdicional;
        const valorTotalPeriodo = valorFinalMensal * meses;
        
        document.getElementById(`sim${meses}Mensal`).textContent = formatarMoeda(valorFinalMensal) + '/mês';
        document.getElementById(`sim${meses}Total`).textContent = 'Total: ' + formatarMoeda(valorTotalPeriodo);
    });
}

// Formatar valores em moeda brasileira
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Atualizar entregáveis de Social Media
document.getElementById('servicoSocialMedia').addEventListener('change', function() {
    const plano = this.value;
    const container = document.getElementById('entregaveisSocialMedia');
    const info = document.getElementById('infoSocialMedia');
    
    if (plano === 'nao-se-aplica') {
        container.style.display = 'none';
    } else {
        container.style.display = 'block';
        const dados = planosSocialMedia[plano];
        let html = `<h4>Plano ${dados.nome} - ${formatarMoeda(dados.valor)}/mês</h4><ul>`;
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
    
    if (plano === 'nao-se-aplica') {
        container.style.display = 'none';
        investimentoContainer.style.display = 'none';
    } else {
        container.style.display = 'block';
        investimentoContainer.style.display = 'block';
        const dados = planosTrafegoPago[plano];
        
        // Atualizar texto do limite
        if (dados.investimentoMax) {
            limiteTexto.textContent = `Limite: ${formatarMoeda(dados.investimentoMin)} - ${formatarMoeda(dados.investimentoMax)}`;
        } else {
            limiteTexto.textContent = `Limite: Acima de ${formatarMoeda(dados.investimentoMin)}`;
        }
        
        let valorTexto = dados.valor ? formatarMoeda(dados.valor) + '/mês' : 'Negociação';
        let html = `<h4>Plano ${dados.nome} - ${valorTexto}</h4>`;
        
        if (dados.investimentoMax) {
            html += `<p><strong>Investimento em Mídia:</strong> ${formatarMoeda(dados.investimentoMin)} - ${formatarMoeda(dados.investimentoMax)}</p>`;
        } else {
            html += `<p><strong>Investimento em Mídia:</strong> Acima de ${formatarMoeda(dados.investimentoMin)}</p>`;
        }
        
        html += '<ul>';
        dados.entregaveis.forEach(item => {
            html += `<li>✅ ${item}</li>`;
        });
        html += '</ul>';
        info.innerHTML = html;
    }
    calcularValores();
});

// Validar e ajustar investimento em mídia automaticamente
function validarEAjustarInvestimento() {
    const planoAtual = document.getElementById('servicoTrafegoPago').value;
    const investimentoInput = document.getElementById('investimentoMidia').value;
    const erroDiv = document.getElementById('erroInvestimento');
    const avisoDiv = document.getElementById('avisoPlanoAlterado');
    
    if (planoAtual === 'nao-se-aplica' || !investimentoInput) {
        erroDiv.style.display = 'none';
        avisoDiv.style.display = 'none';
        return true;
    }
    
    // Converter valor para número
    const valor = parseFloat(investimentoInput.replace(/[^\d,]/g, '').replace(',', '.'));
    
    // Determinar plano ideal baseado no investimento
    let planoIdeal = planoAtual;
    
    if (valor <= 5000) {
        planoIdeal = 'foco';
    } else if (valor <= 10000) {
        planoIdeal = 'aceleracao';
    } else {
        planoIdeal = 'heat';
    }
    
    // Se o plano precisa mudar
    if (planoIdeal !== planoAtual) {
        const nomePlanoIdeal = planosTrafegoPago[planoIdeal].nome;
        avisoDiv.innerHTML = `✅ Plano alterado automaticamente para <strong>${nomePlanoIdeal}</strong> com base no investimento em mídia!`;
        avisoDiv.style.display = 'block';
        erroDiv.style.display = 'none';
        
        // Trocar o plano automaticamente
        document.getElementById('servicoTrafegoPago').value = planoIdeal;
        
        // Atualizar entregáveis
        const container = document.getElementById('entregaveisTrafegoPago');
        const info = document.getElementById('infoTrafegoPago');
        const limiteTexto = document.getElementById('limiteInvestimento');
        
        container.style.display = 'block';
        const dados = planosTrafegoPago[planoIdeal];
        
        // Atualizar texto do limite
        if (dados.investimentoMax) {
            limiteTexto.innerHTML = `<strong>ℹ️ Importante:</strong> Este é o valor que o cliente investirá mensalmente em anúncios (Meta Ads, Google Ads, etc.). Este valor NÃO inclui nosso fee de gestão.<br><strong>Limite deste plano:</strong> ${formatarMoeda(dados.investimentoMin)} - ${formatarMoeda(dados.investimentoMax)}`;
        } else {
            limiteTexto.innerHTML = `<strong>ℹ️ Importante:</strong> Este é o valor que o cliente investirá mensalmente em anúncios (Meta Ads, Google Ads, etc.). Este valor NÃO inclui nosso fee de gestão.<br><strong>Limite deste plano:</strong> Acima de ${formatarMoeda(dados.investimentoMin)}`;
        }
        
        let valorTexto = dados.valor ? formatarMoeda(dados.valor) + '/mês' : 'Negociação';
        let html = `<h4>Plano ${dados.nome} - ${valorTexto}</h4>`;
        
        if (dados.investimentoMax) {
            html += `<p><strong>Investimento em Mídia:</strong> ${formatarMoeda(dados.investimentoMin)} - ${formatarMoeda(dados.investimentoMax)}</p>`;
        } else {
            html += `<p><strong>Investimento em Mídia:</strong> Acima de ${formatarMoeda(dados.investimentoMin)}</p>`;
        }
        
        html += '<ul>';
        dados.entregaveis.forEach(item => {
            html += `<li>✅ ${item}</li>`;
        });
        html += '</ul>';
        info.innerHTML = html;
        
        // Recalcular valores
        calcularValores();
        
        return true;
    }
    
    avisoDiv.style.display = 'none';
    erroDiv.style.display = 'none';
    return true;
}

// Adicionar validação ao campo de investimento
document.getElementById('investimentoMidia').addEventListener('blur', validarEAjustarInvestimento);
document.getElementById('investimentoMidia').addEventListener('input', function() {
    // Delay para dar tempo de digitar
    clearTimeout(window.investimentoTimeout);
    window.investimentoTimeout = setTimeout(validarEAjustarInvestimento, 800);
});

// Gerar link da proposta
document.getElementById('propostaForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validar se pelo menos um serviço foi selecionado
    const socialMedia = document.getElementById('servicoSocialMedia').value;
    const trafegoPago = document.getElementById('servicoTrafegoPago').value;
    
    if (socialMedia === 'nao-se-aplica' && trafegoPago === 'nao-se-aplica') {
        alert('Por favor, selecione pelo menos um serviço para o cliente.');
        return;
    }
    
    // Validar investimento se tráfego pago estiver selecionado
    if (trafegoPago !== 'nao-se-aplica') {
        const investimentoInput = document.getElementById('investimentoMidia').value;
        if (!investimentoInput || investimentoInput.trim() === '') {
            alert('⚠️ Por favor, informe o investimento em mídia do cliente.');
            document.getElementById('investimentoMidia').focus();
            return;
        }
        
        if (!validarEAjustarInvestimento()) {
            alert('⚠️ Por favor, corrija o valor do investimento em mídia antes de continuar.');
            document.getElementById('investimentoMidia').focus();
            return;
        }
    }
    
    // Coletar dados do formulário
    const dados = {
        nomeCliente: document.getElementById('nomeCliente').value,
        empresaCliente: document.getElementById('empresaCliente').value,
        emailCliente: document.getElementById('emailCliente').value,
        servicoSocialMedia: socialMedia,
        servicoTrafegoPago: trafegoPago,
        investimentoMidia: document.getElementById('investimentoMidia').value,
        descontoDescricao: document.getElementById('descontoDescricao').value,
        descontoTipo: document.getElementById('descontoTipo').value,
        descontoValor: document.getElementById('descontoValor').value,
        observacoes: document.getElementById('observacoes').value
    };
    
    // Criar URL com parâmetros
    const params = new URLSearchParams(dados);
    const urlVisualizacao = gerarURLVisualizacao();
    const linkCompleto = `${urlVisualizacao}?${params.toString()}`;
    
    // Debug para Netlify
    console.log('=== DEBUG GERAÇÃO DE LINK ===');
    console.log('Dados coletados:', dados);
    console.log('Parâmetros URL:', params.toString());
    console.log('URL de visualização:', urlVisualizacao);
    console.log('Link completo:', linkCompleto);
    console.log('===============================');
    
    // Mostrar modal com o link
    document.getElementById('linkGerado').value = linkCompleto;
    document.getElementById('modalLink').style.display = 'block';
});

// Copiar link para área de transferência
function copiarLink() {
    const linkInput = document.getElementById('linkGerado');
    linkInput.select();
    linkInput.setSelectionRange(0, 99999); // Para mobile
    
    navigator.clipboard.writeText(linkInput.value).then(function() {
        alert('✅ Link copiado com sucesso!');
    }, function() {
        alert('❌ Erro ao copiar o link. Por favor, copie manualmente.');
    });
}

// Fechar modal
function closeModal() {
    document.getElementById('modalLink').style.display = 'none';
}

// Fechar modal ao clicar fora dele
window.onclick = function(event) {
    const modal = document.getElementById('modalLink');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Preview da proposta (abre em nova aba)
function previewProposta() {
    const socialMedia = document.getElementById('servicoSocialMedia').value;
    const trafegoPago = document.getElementById('servicoTrafegoPago').value;
    
    if (socialMedia === 'nao-se-aplica' && trafegoPago === 'nao-se-aplica') {
        alert('Por favor, selecione pelo menos um serviço para visualizar a proposta.');
        return;
    }
    
    const dados = {
        nomeCliente: document.getElementById('nomeCliente').value || 'Cliente Exemplo',
        empresaCliente: document.getElementById('empresaCliente').value || 'Empresa Exemplo',
        emailCliente: document.getElementById('emailCliente').value,
        servicoSocialMedia: socialMedia,
        servicoTrafegoPago: trafegoPago,
        investimentoMidia: document.getElementById('investimentoMidia').value,
        descontoDescricao: document.getElementById('descontoDescricao').value,
        descontoTipo: document.getElementById('descontoTipo').value,
        descontoValor: document.getElementById('descontoValor').value,
        observacoes: document.getElementById('observacoes').value
    };
    
    const params = new URLSearchParams(dados);
    const urlVisualizacao = gerarURLVisualizacao();
    const linkCompleto = `${urlVisualizacao}?${params.toString()}`;
    
    // Debug para Netlify
    console.log('=== DEBUG PREVIEW ===');
    console.log('Dados preview:', dados);
    console.log('URL preview:', linkCompleto);
    console.log('==================');
    
    window.open(linkCompleto, '_blank');
}

// Máscara para o campo de investimento
document.getElementById('investimentoMidia').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = (value / 100).toFixed(2);
    e.target.value = 'R$ ' + value.replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
});

// Listeners para desconto customizado
document.getElementById('descontoDescricao').addEventListener('input', calcularValores);
document.getElementById('descontoTipo').addEventListener('change', calcularValores);
document.getElementById('descontoValor').addEventListener('input', calcularValores);

// Função utilitária para gerar URL de visualização (otimizada para Netlify)
function gerarURLVisualizacao() {
    const origem = window.location.origin;
    const caminhoAtual = window.location.pathname;
    
    console.log('Gerando URL de visualização...');
    console.log('Origem:', origem);
    console.log('Caminho atual:', caminhoAtual);
    
    let urlVisualizacao;
    
    // Primeiro, tentar a abordagem mais simples para o Netlify
    if (origem.includes('netlify.app') || origem.includes('netlify.com')) {
        // No Netlify, usar sempre a URL direta
        urlVisualizacao = origem + '/proposta-visualizacao.html';
        console.log('Detectado Netlify, usando URL direta:', urlVisualizacao);
    } else {
        // Local: lidar com diferentes formatos de caminho
        if (caminhoAtual.includes('proposta-gerador.html')) {
            // Formato: /proposta-gerador.html
            urlVisualizacao = origem + caminhoAtual.replace('proposta-gerador.html', 'proposta-visualizacao.html');
        } else if (caminhoAtual.endsWith('/gerador')) {
            // Formato: /gerador (via redirect do Netlify)
            urlVisualizacao = origem + caminhoAtual.replace('/gerador', '/proposta-visualizacao.html');
        } else if (caminhoAtual.endsWith('/proposta-gerador')) {
            // Formato: /proposta-gerador (sem extensão)
            urlVisualizacao = origem + caminhoAtual.replace('/proposta-gerador', '/proposta-visualizacao.html');
        } else if (caminhoAtual === '/' || caminhoAtual.endsWith('/')) {
            // Formato: raiz ou diretório
            urlVisualizacao = origem + caminhoAtual + 'proposta-visualizacao.html';
        } else {
            // Fallback: assumir que estamos no diretório correto
            const diretorio = caminhoAtual.substring(0, caminhoAtual.lastIndexOf('/') + 1);
            urlVisualizacao = origem + diretorio + 'proposta-visualizacao.html';
        }
        console.log('Local/Outro servidor, URL gerada:', urlVisualizacao);
    }
    
    return urlVisualizacao;
}

// Carregar parâmetros da URL se existirem
function carregarParametrosDaURL() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        console.log('Parâmetros encontrados:', urlParams.toString());
        
        // Se há parâmetros na URL, preencher os campos
        if (urlParams.toString()) {
            console.log('Preenchendo campos com parâmetros da URL...');
            
            // Campos de texto
            const campos = [
                'nomeCliente', 'empresaCliente', 'emailCliente', 
                'investimentoMidia', 'descontoDescricao', 'descontoValor', 
                'observacoes'
            ];
            
            campos.forEach(campo => {
                const valor = urlParams.get(campo);
                const elemento = document.getElementById(campo);
                if (valor && elemento) {
                    elemento.value = decodeURIComponent(valor);
                    console.log(`Campo ${campo} preenchido com: ${valor}`);
                }
            });
            
            // Campos select
            const camposSelect = [
                'servicoSocialMedia', 'servicoTrafegoPago', 'descontoTipo'
            ];
            
            camposSelect.forEach(campo => {
                const valor = urlParams.get(campo);
                const elemento = document.getElementById(campo);
                if (valor && elemento) {
                    elemento.value = valor;
                    console.log(`Select ${campo} definido para: ${valor}`);
                    
                    // Disparar evento change para atualizar a interface
                    const changeEvent = new Event('change', { bubbles: true });
                    elemento.dispatchEvent(changeEvent);
                    
                    // Trigger personalizado para campos específicos
                    if (campo === 'servicoSocialMedia') {
                        mostrarEntregaveisSocialMedia();
                    } else if (campo === 'servicoTrafegoPago') {
                        mostrarEntregaveisTrafegoPago();
                    }
                }
            });
            
            // Aguardar um pouco e recalcular valores
            setTimeout(() => {
                calcularValores();
                console.log('Valores recalculados após carregar parâmetros');
            }, 100);
        } else {
            console.log('Nenhum parâmetro encontrado na URL');
        }
    } catch (error) {
        console.error('Erro ao carregar parâmetros da URL:', error);
    }
}

// Função de inicialização que funciona tanto local quanto no Netlify
function inicializarSistema() {
    console.log('Inicializando sistema...');
    console.log('URL atual:', window.location.href);
    console.log('Parâmetros da URL:', window.location.search);
    
    carregarParametrosDaURL();
    calcularValores();
    
    console.log('Sistema inicializado!');
}

// Múltiplas formas de garantir que a inicialização aconteça
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarSistema);
} else {
    // DOM já carregado
    inicializarSistema();
}

// Fallback adicional para Netlify
window.addEventListener('load', function() {
    // Se ainda não foi inicializado, inicializar novamente
    setTimeout(inicializarSistema, 100);
});
