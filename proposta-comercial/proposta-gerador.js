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
                'Configuração inicial de BM + Tags (Meta/Google)',
                'Landing Page de alta conversão',
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
    
    // Somar apenas o plano selecionado do Catálogo
    const planoSelect = document.getElementById('catalogoPlanoSelect');
    const optPlano = planoSelect?.selectedOptions?.[0] || null;
    if (optPlano) {
        const valor = parseFloat(optPlano.dataset?.valor || '0');
        if (!Number.isNaN(valor) && valor > 0) {
            total += valor;
        }
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

// Wrapper para eventos que esperam atualizarValores
function atualizarValores() {
    try {
        calcularValores();
    } catch (e) {
        console.error('Erro ao atualizar valores:', e);
    }
}

// Atualizar simulador de períodos
function atualizarSimulador(valorBase, descontoCustomizado = 0) {
    const periodos = [1, 3, 6, 12];
    
    periodos.forEach(meses => {
        const descontoRecorrencia = valorBase * obterDescontoRecorrencia(meses);
        const totalAposRecorrencia = valorBase - descontoRecorrencia;
        // Não incluir 5% condicional na simulação (apenas recorrência + eventual customizado)
        const valorFinalMensal = totalAposRecorrencia; 
        const valorTotalPeriodo = valorFinalMensal * meses;
        
        // Economia total: desconto customizado + recorrência (sem adicional condicional)
        const economiaTotal = (descontoCustomizado + descontoRecorrencia) * meses;
        
        document.getElementById(`sim${meses}Mensal`).textContent = formatarMoeda(valorFinalMensal) + '/mês';
        document.getElementById(`sim${meses}Total`).textContent = 'Total: ' + formatarMoeda(valorTotalPeriodo);
        document.getElementById(`sim${meses}Economia`).textContent = 'Economia: ' + formatarMoeda(economiaTotal);
    });
}

// Formatar valores em moeda brasileira
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Garantir acesso somente com login
async function ensureLoggedIn() {
    if (!window.supabaseConfig) {
        throw new Error('supabase-config.js não foi carregado.');
    }
    const client = await window.supabaseConfig.initSupabase();
    const { data: { session } } = await client.auth.getSession();
    if (!session || !session.user) {
        const redirect = 'proposta-gerador.html' + (window.location.search || '');
        window.location.href = window.location.origin + '/login.html?redirect=' + encodeURIComponent(redirect);
        return null;
    }
    window.supabaseClient = client;
    return client;
}

// Obter papel do usuário logado
async function getUserRole(client) {
    try {
        const { data: { session } } = await client.auth.getSession();
        let papel = 'viewer';
        if (session?.user?.email) {
            const { data: rows, error } = await client
                .from('usuarios')
                .select('papel,email,nome,user_id')
                .eq('email', session.user.email)
                .limit(1);
            if (!error && rows && rows.length) {
                papel = rows[0]?.papel || papel;
            }
        }
        papel = papel || (session?.user?.user_metadata?.papel) || 'viewer';
        window.usuarioPapel = papel;
        return papel;
    } catch (e) {
        console.warn('Falha ao obter papel do usuário:', e);
        window.usuarioPapel = 'viewer';
        return 'viewer';
    }
}

// Garantir que somente admin/editor possam usar o gerador
async function ensureEditorOrAdmin() {
    const client = await ensureLoggedIn();
    if (!client) return null; // já redirecionado
    const papel = await getUserRole(client);
    if (papel !== 'admin' && papel !== 'editor') {
        alert('Apenas usuários com papel admin ou editor podem usar o gerador.');
        window.location.href = window.location.origin + '/admin.html';
        return null;
    }
    return client;
}

// Definir responsável da proposta como usuário logado
async function popularResponsavelDropdown() {
    const selectEl = document.getElementById('responsavelProposta');
    if (!selectEl) return;
    selectEl.innerHTML = '<option value="">Definindo usuário…</option>';

    try {
        if (!window.supabaseConfig) throw new Error('supabase-config.js não foi carregado.');
        const client = await window.supabaseConfig.initSupabase();
        const { data: { session } } = await client.auth.getSession();
        const email = session?.user?.email || '';
        let nomeFinal = email;

        if (email) {
            const { data: rows, error } = await client
                .from('usuarios')
                .select('nome,email')
                .eq('email', email)
                .limit(1);
            if (!error && rows && rows.length) {
                const nomeDB = (rows[0]?.nome || '').trim();
                nomeFinal = nomeDB || email;
            }
        }

        selectEl.innerHTML = '';
        const opt = document.createElement('option');
        opt.value = nomeFinal;
        opt.textContent = nomeFinal;
        selectEl.appendChild(opt);
        selectEl.value = nomeFinal;
        selectEl.disabled = true; // fixar responsável
    } catch (e) {
        console.error('Erro ao definir responsável:', e);
        selectEl.innerHTML = '<option value="">Usuário não identificado</option>';
        selectEl.disabled = true;
    }
}

// Carregar clientes cadastrados para o dropdown e permitir auto-preenchimento
async function popularClientesDropdown() {
    const selectEl = document.getElementById('clienteSelecionado');
    if (!selectEl) return;
    selectEl.innerHTML = '<option value="">Carregando clientes…</option>';
    try {
        if (!window.supabaseConfig) throw new Error('supabase-config.js não foi carregado.');
        const client = await window.supabaseConfig.initSupabase();
        const { data, error } = await client
            .from('clientes')
            .select('id, tipo_documento, documento, nome, empresa, endereco, email, telefone')
            .order('created_at', { ascending: false });
        if (error) throw error;
        const opts = (data || []).map(c => {
            const doc = (c.documento || '').replace(/\D/g, '');
            const labelBase = c.tipo_documento === 'cpf' ? (c.nome || 'Cliente') : (c.empresa || 'Empresa');
            const tipo = c.tipo_documento?.toUpperCase() || 'DOC';
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = `${labelBase} · ${tipo}: ${doc}`;
            opt.dataset.tipo = c.tipo_documento;
            opt.dataset.documento = doc;
            opt.dataset.nome = c.nome || '';
            opt.dataset.empresa = c.empresa || '';
            opt.dataset.endereco = c.endereco || '';
            opt.dataset.email = c.email || '';
            opt.dataset.telefone = c.telefone || '';
            return opt;
        });
        selectEl.innerHTML = '<option value="">Selecione um cliente</option>';
        opts.forEach(o => selectEl.appendChild(o));
        selectEl.onchange = function(){
            const opt = selectEl.selectedOptions[0];
            if (!opt || !opt.value) return;
            const tipo = opt.dataset.tipo;
            const doc = opt.dataset.documento;
            const nome = opt.dataset.nome;
            const empresa = opt.dataset.empresa;
            const endereco = opt.dataset.endereco;
            const cpfCnpjEl = document.getElementById('cpfCnpjCliente');
            const empresaEl = document.getElementById('empresaCliente');
            const enderecoEl = document.getElementById('enderecoCliente');
            // Guardar email/telefone em campos ocultos/data attributes, se desejado
            // (neste fluxo, usaremos os datasets ao salvar)
            // Preencher documento formatado
            if (cpfCnpjEl) {
                let fmt = doc;
                if (window.validacaoCPFCNPJ) {
                    if (tipo === 'cpf' && window.validacaoCPFCNPJ.formatarCPF) {
                        fmt = window.validacaoCPFCNPJ.formatarCPF(doc);
                    } else if (window.validacaoCPFCNPJ.formatarCNPJ) {
                        fmt = window.validacaoCPFCNPJ.formatarCNPJ(doc);
                    }
                }
                cpfCnpjEl.value = fmt;
            }
            // Nome/Empresa: para CPF usar nome, para CNPJ usar empresa
            if (empresaEl) empresaEl.value = (tipo === 'cpf' ? (nome || empresa) : (empresa || nome)) || '';
            if (enderecoEl) enderecoEl.value = endereco || '';
        };
        // Se já houver um cliente selecionado (edição), disparar preenchimento
        const sel = selectEl.selectedOptions?.[0];
        if (sel && sel.value) {
            try { selectEl.onchange(); } catch (_) { /* ignore */ }
        }
    } catch (e) {
        console.error('Erro ao carregar clientes:', e);
        selectEl.innerHTML = '<option value="">Não foi possível carregar clientes</option>';
    }
}

// ==================== INICIALIZAÇÃO ====================
// Aguardar DOM carregar antes de adicionar event listeners
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM carregado - Inicializando event listeners');
    // Permitir que qualquer usuário logado carregue os serviços (catálogo)
    const client = await ensureLoggedIn();
    if (!client) return; // redirecionado para login
    const papel = await getUserRole(client);
    // Atualizar UI de sessão e habilitar Sair
    try {
        const { data: { session } } = await client.auth.getSession();
        const authEl = document.getElementById('authStatusGerador');
        const btnLogout = document.getElementById('btnLogoutGerador');
        if (authEl) authEl.textContent = `${(session?.user?.email) || 'Usuário'} · ${papel}`;
        if (btnLogout) {
            btnLogout.style.display = '';
            btnLogout.onclick = async () => {
                try {
                    await client.auth.signOut();
                } catch (e) {
                    console.warn('Falha no signOut, limpando sessão local', e);
                }
                // Limpeza defensiva das chaves de sessão supabase (sb-*) para garantir logout cruzado
                try {
                    Object.keys(localStorage).forEach(k => { if (k.startsWith('sb-')) localStorage.removeItem(k); });
                } catch (_) { /* ignora */ }
                const redirect = 'proposta-gerador.html' + (window.location.search || '');
                window.location.href = window.location.origin + '/login.html?redirect=' + encodeURIComponent(redirect);
            };
        }
    } catch (_) { /* ignore */ }
    // Popular dropdown de responsáveis e clientes somente para admin/editor
    if (papel === 'admin' || papel === 'editor') {
        await popularResponsavelDropdown();
        await popularClientesDropdown();
    } else {
        // Em viewers, esconder/neutralizar campos sensíveis
        const respEl = document.getElementById('responsavelProposta');
        if (respEl) { respEl.innerHTML = '<option value="">—</option>'; respEl.disabled = true; }
        const clienteEl = document.getElementById('clienteSelecionado');
        if (clienteEl) { clienteEl.innerHTML = '<option value="">Disponível para admin/editor</option>'; clienteEl.disabled = true; }
    }

    // Popular serviços cadastrados a partir do Supabase
    try { await popularServicosCadastrados(); } catch (e) { console.warn('Falha ao carregar serviços do banco:', e); }
    try { inicializarCatalogoServicos(); } catch (e) { console.warn('Falha ao inicializar catálogo de serviços:', e); }

    // Modal: cadastro rápido de cliente
    try {
        const abrirBtn = document.getElementById('btnNovoCliente');
        const modal = document.getElementById('modalNovoCliente');
        const fecharBtn = document.getElementById('fecharModalNovoCliente');
        const salvarBtn = document.getElementById('btnSalvarNovoCliente');
        if (abrirBtn && modal && fecharBtn && salvarBtn) {
            abrirBtn.onclick = () => { modal.style.display = 'block'; };
            fecharBtn.onclick = () => { modal.style.display = 'none'; };
            window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
            salvarBtn.onclick = async () => { await salvarNovoCliente(); };
        }
    } catch (e) {
        console.warn('Falha ao iniciar modal de cliente:', e);
    }
    
    // Verificar se está em modo de edição
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    if (editId) {
        carregarPropostaParaEdicao(editId);
    }
    
    // Atualizar entregáveis de Social Media
    const servicoSocialMidia = document.getElementById('servicoSocialMidia');
    if (servicoSocialMidia) {
        servicoSocialMidia.addEventListener('change', function() {
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
    }

// Atualizar entregáveis de Tráfego Pago
const servicoTrafegoPago = document.getElementById('servicoTrafegoPago');
if (servicoTrafegoPago) {
    servicoTrafegoPago.addEventListener('change', function() {
    const plano = this.value;
    const container = document.getElementById('entregaveisTrafegoPago');
    const info = document.getElementById('infoTrafegoPago');
    const investimentoContainer = document.getElementById('investimentoMidiaContainer');
    const limiteTexto = document.getElementById('limiteInvestimento');
    const toggleBtn = document.getElementById('toggleTrafegoPago');
    const modeloContainer = document.getElementById('modeloCobrancaContainer');
    const badgeWrapper = document.getElementById('badgeComissaoWrapper');
    
    if (plano === 'nao-se-aplica') {
        container.style.display = 'none';
        investimentoContainer.style.display = 'none';
        toggleBtn.style.display = 'none';
        modeloContainer.style.display = 'none';
        if (badgeWrapper) badgeWrapper.style.display = 'none';
    } else {
        toggleBtn.style.display = 'block';
        modeloContainer.style.display = 'block';
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
                const isLP = /LP de alta conversão/i.test(item);
                const itemTexto = isLP ? `${item} (exclusivo para plano de 12 meses de recorrência)` : item;
                html += `<li style="font-size: 0.85rem; margin-bottom: 3px;">✅ ${itemTexto}</li>`;
            });
            html += '</ul>';
        });
        html += '</div>';
        info.innerHTML = html;
    }
    
    atualizarValores();
    // Inserir destaque discreto no card de 12 meses do simulador
    const bonusEl = document.getElementById('bonus12');
    if (!bonusEl) {
        const total12 = document.getElementById('sim12Total');
        if (total12) {
            const div = document.createElement('div');
            div.id = 'bonus12';
            div.className = 'bonus-12m';
            div.textContent = '🎁 Bônus 12 meses: Você ganha 1 site (LP de alta conversão)';
            total12.insertAdjacentElement('afterend', div);
        }
    }
    atualizarBadgeComissao();
});

}

// ==================== CARREGAR SERVIÇOS (PRODUTOS/PLANOS) DO SUPABASE ====================
function normalizarTexto(s) {
    return (s || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function mapPlanoKeyFromNome(produtoNome, planoNome) {
    const p = normalizarTexto(produtoNome);
    const n = normalizarTexto(planoNome);
    if (p.includes('trafego') && p.includes('pago')) {
        if (n.startsWith('foco')) return 'foco';
        if (n.startsWith('aceleracao')) return 'aceleracao';
        if (n.startsWith('destaque') || n.startsWith('heat')) return 'heat';
    }
    if (p.includes('social') && p.includes('media')) {
        if (n.startsWith('start')) return 'start';
        if (n.startsWith('scale')) return 'scale';
        if (n.startsWith('heat') || n.startsWith('destaque')) return 'heat';
    }
    return null;
}

async function popularServicosCadastrados() {
    if (!window.supabaseConfig) throw new Error('supabase-config.js não foi carregado.');
    const client = await window.supabaseConfig.initSupabase();

    const selSocial = document.getElementById('servicoSocialMidia');
    const selTrafego = document.getElementById('servicoTrafegoPago');
    if (selSocial) { selSocial.disabled = true; }
    if (selTrafego) { selTrafego.disabled = true; }

    try {
        const { data, error } = await client
            .from('produtos')
            .select('id, nome, tipo, produto_planos(id, nome, valor, info, sessoes, addons)')
            .order('nome', { ascending: true });
        if (error) throw error;
        const produtos = data || [];
        // Disponibilizar no escopo global para o card de catálogo
        window.produtosCatalogo = produtos;

        const getByNome = (alvo) => produtos.find(p => normalizarTexto(p.nome) === normalizarTexto(alvo));
        const produtoSocial = produtos.find(p => normalizarTexto(p.nome).includes('social') && normalizarTexto(p.nome).includes('media')) || getByNome('Social Media');
        const produtoTrafego = produtos.find(p => normalizarTexto(p.nome).includes('trafego') && normalizarTexto(p.nome).includes('pago')) || getByNome('Tráfego Pago');

        function fillOptions(selectEl, produto, fallbackOpts) {
            if (!selectEl) return;
            const preserveFirst = selectEl.querySelector('option[value="nao-se-aplica"]');
            selectEl.innerHTML = '';
            const baseOpt = document.createElement('option');
            baseOpt.value = 'nao-se-aplica';
            baseOpt.textContent = 'Não se aplica';
            selectEl.appendChild(baseOpt);
            const planos = produto?.produto_planos || [];
            if (planos.length) {
                planos.forEach(pl => {
                    const key = mapPlanoKeyFromNome(produto.nome, pl.nome);
                    if (!key) return;
                    const opt = document.createElement('option');
                    opt.value = key;
                    opt.textContent = `${(pl.nome || '').toUpperCase()} - ${formatarMoeda(parseFloat(pl.valor) || 0)}`;
                    selectEl.appendChild(opt);
                });
            } else {
                (fallbackOpts || []).forEach(o => {
                    const opt = document.createElement('option');
                    opt.value = o.value;
                    opt.textContent = `${o.label} - ${formatarMoeda(o.valor)}`;
                    selectEl.appendChild(opt);
                });
            }
        }

        // Sincronizar valores nos objetos locais (para cálculos e exibição de entregáveis)
        if (produtoTrafego && Array.isArray(produtoTrafego.produto_planos)) {
            produtoTrafego.produto_planos.forEach(pl => {
                const key = mapPlanoKeyFromNome(produtoTrafego.nome, pl.nome);
                if (key && planosTrafegoPago[key]) {
                    const v = parseFloat(pl.valor);
                    if (!Number.isNaN(v)) planosTrafegoPago[key].valor = v;
                }
            });
        }
        if (produtoSocial && Array.isArray(produtoSocial.produto_planos)) {
            produtoSocial.produto_planos.forEach(pl => {
                const key = mapPlanoKeyFromNome(produtoSocial.nome, pl.nome);
                if (key && planosSocialMedia[key]) {
                    const v = parseFloat(pl.valor);
                    if (!Number.isNaN(v)) planosSocialMedia[key].valor = v;
                }
            });
        }

        // Popular selects com dados do banco ou fallback
        fillOptions(selTrafego, produtoTrafego, [
            { value: 'foco', label: 'FOCO', valor: planosTrafegoPago['foco'].valor },
            { value: 'aceleracao', label: 'ACELERAÇÃO', valor: planosTrafegoPago['aceleracao'].valor },
            { value: 'heat', label: 'DESTAQUE', valor: planosTrafegoPago['heat'].valor }
        ]);
        fillOptions(selSocial, produtoSocial, [
            { value: 'start', label: 'START', valor: planosSocialMedia['start'].valor },
            { value: 'scale', label: 'SCALE', valor: planosSocialMedia['scale'].valor },
            { value: 'heat', label: 'HEAT', valor: planosSocialMedia['heat'].valor }
        ]);

    } catch (e) {
        console.warn('Supabase: erro ao carregar produtos/planos para o gerador.', e);
        // Fallback mínimo caso falhe totalmente
        if (selTrafego && selTrafego.options.length <= 1) {
            ['foco','aceleracao','heat'].forEach(k => {
                const opt = document.createElement('option');
                const label = planosTrafegoPago[k].nome;
                opt.value = k;
                opt.textContent = `${label} - ${formatarMoeda(planosTrafegoPago[k].valor)}`;
                selTrafego.appendChild(opt);
            });
        }
        if (selSocial && selSocial.options.length <= 1) {
            ['start','scale','heat'].forEach(k => {
                const opt = document.createElement('option');
                const label = planosSocialMedia[k].nome;
                opt.value = k;
                opt.textContent = `${label} - ${formatarMoeda(planosSocialMedia[k].valor)}`;
                selSocial.appendChild(opt);
            });
        }
    } finally {
        if (selSocial) { selSocial.disabled = false; }
        if (selTrafego) { selTrafego.disabled = false; }
    }
}

// Catálogo genérico de serviços: produtos e planos
function inicializarCatalogoServicos() {
    const produtoSelect = document.getElementById('catalogoProdutoSelect');
    const planoWrapper = document.getElementById('catalogoPlanoWrapper');
    const planoSelect = document.getElementById('catalogoPlanoSelect');
    const toggleBtn = document.getElementById('toggleCatalogo');
    const infoContainer = document.getElementById('infoCatalogo');
    const entregaveisContainer = document.getElementById('entregaveisCatalogo');

    if (!produtoSelect) return; // Card não existe

    const produtos = Array.isArray(window.produtosCatalogo) ? window.produtosCatalogo : [];

    // Popular lista de produtos
    produtoSelect.innerHTML = '';
    const optBase = document.createElement('option');
    optBase.value = '';
    optBase.textContent = produtos.length ? 'Selecione um serviço' : 'Nenhum serviço cadastrado';
    produtoSelect.appendChild(optBase);
    produtos.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.nome;
        produtoSelect.appendChild(opt);
    });

    // Reset UI auxiliar
    planoWrapper.style.display = 'none';
    toggleBtn.style.display = 'none';
    entregaveisContainer.style.display = 'none';
    infoContainer.innerHTML = '';

    produtoSelect.onchange = function() {
        const produtoId = this.value;
        infoContainer.innerHTML = '';
        entregaveisContainer.style.display = 'none';
        toggleBtn.style.display = 'none';

        planoSelect.innerHTML = '';
        const optPlano = document.createElement('option');
        optPlano.value = '';
        optPlano.textContent = 'Selecione um plano';
        planoSelect.appendChild(optPlano);
        planoWrapper.style.display = 'none';

        if (!produtoId) return;
        const produto = produtos.find(p => p.id === produtoId);
        const planos = produto?.produto_planos || [];

        if (Array.isArray(planos) && planos.length) {
            planoWrapper.style.display = '';
            planos.forEach(pl => {
                const opt = document.createElement('option');
                opt.value = pl.id;
                const vNum = pl.valor != null ? parseFloat(pl.valor) : NaN;
                const vTxt = Number.isFinite(vNum) ? formatarMoeda(vNum) : '—';
                opt.textContent = `${(pl.nome || '').toString()} - ${vTxt}`;
                opt.dataset.valor = Number.isFinite(vNum) ? vNum : '';
                opt.dataset.info = pl.info || '';
                try { opt.dataset.sessoes = pl.sessoes ? JSON.stringify(pl.sessoes) : ''; } catch(_) { opt.dataset.sessoes = ''; }
                try { opt.dataset.addons = pl.addons ? JSON.stringify(pl.addons) : ''; } catch(_) { opt.dataset.addons = ''; }
                planoSelect.appendChild(opt);
            });
            toggleBtn.style.display = '';
        } else {
            // Sem planos: exibir apenas entregáveis/descrição se houver
            planoWrapper.style.display = 'none';
            const html = renderInfoSessoes(produto?.info, produto?.sessoes, null);
            if (html) {
                infoContainer.innerHTML = html;
                entregaveisContainer.style.display = 'block';
                toggleBtn.style.display = '';
            }
        }
    };

    planoSelect.onchange = function() {
        const opt = this.selectedOptions?.[0];
        if (!opt) { infoContainer.innerHTML = ''; entregaveisContainer.style.display = 'none'; return; }
        const valor = opt.dataset.valor;
        const info = opt.dataset.info || '';
        let sessoes = null;
        try { sessoes = opt.dataset.sessoes ? JSON.parse(opt.dataset.sessoes) : null; } catch(_) { sessoes = null; }
        let addons = null;
        try { addons = opt.dataset.addons ? JSON.parse(opt.dataset.addons) : null; } catch(_) { addons = null; }
        infoContainer.innerHTML = renderInfoSessoes(info, sessoes, valor, addons);
        entregaveisContainer.style.display = 'block';
        toggleBtn.style.display = '';
        try { calcularValores(); } catch(_) {}
    };
}

function renderInfoSessoes(info, sessoes, valorNum, addons) {
    let html = '';
    if (valorNum !== undefined && valorNum !== null && valorNum !== '' && !Number.isNaN(Number(valorNum))) {
        try { html += `<p><strong>Preço do plano:</strong> ${formatarMoeda(Number(valorNum))}</p>`; } catch(_) { /* ignore */ }
    }
    if (info) html += `<p>${info}</p>`;
    if (sessoes && typeof sessoes === 'object') {
        try {
            Object.entries(sessoes).forEach(([sec, itens]) => {
                const lista = Array.isArray(itens) ? itens : [];
                const toText = (i) => {
                    if (typeof i === 'string') return i;
                    if (i && typeof i === 'object') {
                        const base = i.nome || i.titulo || i.label || i.descricao || i.texto || i.item || '';
                        return base || (() => { try { return JSON.stringify(i); } catch(_) { return String(i); } })();
                    }
                    return String(i ?? '');
                };
                html += `<div class="entregaveis-section"><strong>${sec}</strong><ul>${lista.map(i => `<li>${toText(i)}</li>`).join('')}</ul></div>`;
            });
        } catch(_) { /* ignore */ }
    }
    // Se houver add-ons selecionados no produto (fluxo composição), listar
    if (Array.isArray(addons) && addons.length) {
        const selecionados = addons.filter(a => a && a.selecionado);
        if (selecionados.length) {
            const itens = selecionados.map(a => {
                const label = (a.nome || '').toString();
                const desc = (a.descricao || '').toString();
                return desc ? `${label} — ${desc}` : label;
            });
            html += `<div class="entregaveis-section"><strong>Add-ons</strong><ul>${itens.map(i => `<li>${i}</li>`).join('')}</ul></div>`;
        }
    }
    return html || '<p>Nenhuma informação de entregáveis disponível.</p>';
}

// Inserir novo cliente via modal e selecionar no dropdown
async function salvarNovoCliente() {
    try {
        if (!window.supabaseConfig) throw new Error('supabase-config.js não foi carregado.');
        const client = await ensureLoggedIn();
        if (!client) return;

        const tipo = (document.getElementById('novoTipoDocumento')?.value || 'cnpj').toLowerCase();
        let doc = (document.getElementById('novoDocumento')?.value || '').replace(/\D/g, '');
        const nome = (document.getElementById('novoNome')?.value || '').trim();
        const empresa = (document.getElementById('novaEmpresa')?.value || '').trim();
        const endereco = (document.getElementById('novoEndereco')?.value || '').trim();
        const email = (document.getElementById('novoEmail')?.value || '').trim();
        const telefone = (document.getElementById('novoTelefone')?.value || '').trim();

        const feedbackEl = document.getElementById('novoClienteFeedback');
        const modal = document.getElementById('modalNovoCliente');

        // Validações básicas
        if (!doc) { alert('Informe o CPF/CNPJ.'); return; }
        if (tipo === 'cnpj' && !empresa) { alert('Informe o nome da empresa.'); return; }
        if (tipo === 'cpf' && !nome) { alert('Informe o nome do cliente.'); return; }

        const payload = {
            tipo_documento: tipo,
            documento: doc,
            nome: tipo === 'cpf' ? nome : null,
            empresa: tipo === 'cnpj' ? empresa : null,
            endereco: endereco || null,
            email: email || null,
            telefone: telefone || null
        };

        const { data, error } = await client
            .from('clientes')
            .insert(payload)
            .select('id,tipo_documento,documento,nome,empresa,endereco')
            .single();

        if (error) {
            console.error('Erro ao inserir cliente:', error);
            alert('Não foi possível cadastrar o cliente: ' + (error.message || 'erro desconhecido'));
            return;
        }

        // Atualiza dropdown e seleciona o novo cliente
        await popularClientesDropdown();
        const selectEl = document.getElementById('clienteSelecionado');
        if (selectEl && data?.id) {
            selectEl.value = data.id;
            selectEl.dispatchEvent(new Event('change'));
        }

        if (feedbackEl) {
            feedbackEl.style.display = '';
            feedbackEl.textContent = 'Cliente cadastrado com sucesso!';
        }
        if (modal) modal.style.display = 'none';

    } catch (e) {
        console.error('Falha no cadastro de cliente:', e);
        alert('Erro inesperado ao cadastrar cliente.');
    }
}

    // Event listener para modelo de cobrança
    const modeloCobranca = document.getElementById('modeloCobranca');
    if (modeloCobranca) {
        modeloCobranca.addEventListener('change', function() {
            const modelo = this.value;
            const percentualContainer = document.getElementById('percentualComissaoContainer');
            const valorFixoContainer = document.getElementById('valorFixoTrafegoContainer');
            const tipoComissaoHibridoContainer = document.getElementById('tipoComissaoHibridoContainer');
            const valorComissaoFixaContainer = document.getElementById('valorComissaoFixaContainer');
            
            if (modelo === 'fixo') {
                // Apenas valor fixo do plano
                percentualContainer.style.display = 'none';
                valorFixoContainer.style.display = 'none';
                tipoComissaoHibridoContainer.style.display = 'none';
                valorComissaoFixaContainer.style.display = 'none';
            } else if (modelo === 'comissao') {
                // Apenas comissão percentual
                percentualContainer.style.display = 'block';
                valorFixoContainer.style.display = 'none';
                tipoComissaoHibridoContainer.style.display = 'none';
                valorComissaoFixaContainer.style.display = 'none';
            } else if (modelo === 'hibrido') {
                // Fixo + Comissão (mostra seletor de tipo)
                valorFixoContainer.style.display = 'block';
                tipoComissaoHibridoContainer.style.display = 'block';
                // Aplica o tipo de comissão selecionado
                const tipoComissao = document.getElementById('tipoComissaoHibrido')?.value || 'percentual';
                if (tipoComissao === 'percentual') {
                    percentualContainer.style.display = 'block';
                    valorComissaoFixaContainer.style.display = 'none';
                } else {
                    percentualContainer.style.display = 'none';
                    valorComissaoFixaContainer.style.display = 'block';
                }
            }
            
            atualizarValores();
            atualizarBadgeComissao();
        });
    }

    // Event listener para tipo de comissão no híbrido
    const tipoComissaoHibrido = document.getElementById('tipoComissaoHibrido');
    if (tipoComissaoHibrido) {
        tipoComissaoHibrido.addEventListener('change', function() {
            const tipoComissao = this.value;
            const percentualContainer = document.getElementById('percentualComissaoContainer');
            const valorComissaoFixaContainer = document.getElementById('valorComissaoFixaContainer');
            
            if (tipoComissao === 'percentual') {
                percentualContainer.style.display = 'block';
                valorComissaoFixaContainer.style.display = 'none';
                const valorComissaoFixaEl = document.getElementById('valorComissaoFixa');
                if (valorComissaoFixaEl) valorComissaoFixaEl.value = ''; // Limpa o valor fixo
            } else {
                percentualContainer.style.display = 'none';
                valorComissaoFixaContainer.style.display = 'block';
                const percentualComissaoEl = document.getElementById('percentualComissao');
                if (percentualComissaoEl) percentualComissaoEl.value = ''; // Limpa o percentual
            }
            
            atualizarValores();
            atualizarBadgeComissao();
        });
    }

    // Event listeners para atualizar valores quando mudar comissão/fixo
    const percentualComissao = document.getElementById('percentualComissao');
    if (percentualComissao) {
        percentualComissao.addEventListener('input', function(){
            atualizarValores();
            atualizarBadgeComissao();
        });
    }

    const valorFixoTrafego = document.getElementById('valorFixoTrafego');
    if (valorFixoTrafego) {
        valorFixoTrafego.addEventListener('input', function(){
            atualizarValores();
            atualizarBadgeComissao();
        });
    }

    const valorComissaoFixa = document.getElementById('valorComissaoFixa');
    if (valorComissaoFixa) {
        valorComissaoFixa.addEventListener('input', function(){
            atualizarValores();
            atualizarBadgeComissao();
        });
    }

    // Listeners para desconto customizado
    const descontoDescricao = document.getElementById('descontoDescricao');
    if (descontoDescricao) {
        descontoDescricao.addEventListener('input', calcularValores);
    }

    const descontoTipo = document.getElementById('descontoTipo');
    if (descontoTipo) {
        descontoTipo.addEventListener('change', calcularValores);
    }

    const descontoValor = document.getElementById('descontoValor');
    if (descontoValor) {
        descontoValor.addEventListener('input', calcularValores);
    }

    // Resetar timestamp quando cliente ou serviços mudarem
    const empresaCliente = document.getElementById('empresaCliente');
    if (empresaCliente) {
        empresaCliente.addEventListener('input', resetarTimestamp);
    }
    
    // Garantir que UI reflita estado atual do Tráfego Pago
    try {
        const selectTrafego = document.getElementById('servicoTrafegoPago');
        if (selectTrafego) {
            selectTrafego.dispatchEvent(new Event('change'));
        }
    } catch (e) {
        console.warn('Não foi possível inicializar a visualização do Tráfego Pago:', e);
    }
    
    // Inicializa badge de comissão
    try { atualizarBadgeComissao(); } catch(e) { console.warn('Erro ao inicializar badge:', e); }
    
    // Inicializar valores
    try { calcularValores(); } catch(e) { console.warn('Erro ao calcular valores:', e); }
});

// Função para visualizar proposta (SEM salvar)
window.previewProposta = function() {
    try {
        const dadosVisualizacao = coletarDadosFormulario();
        if (!dadosVisualizacao) return;
        
        // Criar URL com parâmetros
        const params = new URLSearchParams(dadosVisualizacao);
        const urlVisualizacao = `proposta-visualizacao.html?${params.toString()}`;
        
        // Abrir diretamente (sem salvar)
        window.open(urlVisualizacao, '_blank');
    } catch (error) {
        console.error('Erro ao visualizar proposta:', error);
        alert('Erro ao visualizar proposta: ' + error.message);
    }
}

// Função para gerar link da proposta (COM salvar no Supabase)
window.gerarLinkProposta = async function() {
    try {
        const dadosVisualizacao = coletarDadosFormulario();
        if (!dadosVisualizacao) return;
        
        // Calcular valores usando somente o Catálogo
        const catalogoValorNum = parseFloat(dadosVisualizacao.catalogoValor || '0') || 0;
        let valorMensal = catalogoValorNum;
        // Zerar campos legados
        let valorSocialMidia = 0;
        let valorTrafegoPago = 0;
        let temComissaoVendas = false;
        let percentualComissao = 0;
        let valorFixoTrafego = 0;
        
        // Aplicar desconto customizado se houver
        const descontoDescricao = document.getElementById('descontoDescricao').value.trim();
        const descontoTipo = document.getElementById('descontoTipo').value;
        const descontoValorInput = document.getElementById('descontoValor').value.trim();
        
        let descontoCustomizado = 0;
        if (descontoDescricao && descontoValorInput) {
            const valorDesconto = parseFloat(descontoValorInput.replace(',', '.'));
            if (!isNaN(valorDesconto) && valorDesconto > 0) {
                if (descontoTipo === 'percentual') {
                    descontoCustomizado = valorMensal * (valorDesconto / 100);
                } else {
                    descontoCustomizado = valorDesconto;
                }
            }
        }
        
        const valorMensalFinal = valorMensal - descontoCustomizado;
        const valorTotal = valorMensalFinal; // Por enquanto sem recorrência
        
        // Inicializar Supabase
        if (!window.supabaseConfig) {
            throw new Error('supabase-config.js não foi carregado.');
        }
        
        const supabase = window.supabaseConfig.initSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        const responsavelUid = session?.user?.id || null;
        
        // Calcular data de expiração
        const dataExpiracao = new Date();
        dataExpiracao.setDate(dataExpiracao.getDate() + parseInt(dadosVisualizacao.diasValidade));
        
        // Preparar dados para inserção/atualização
        const socialKey = dadosVisualizacao.servicoSocialMidia || 'nao-se-aplica';
        const trafegoKey = dadosVisualizacao.servicoTrafegoPago || 'nao-se-aplica';

        const dadosInsercao = {
            cliente_id: dadosVisualizacao.clienteId || null,
            nome_cliente: dadosVisualizacao.nomeCliente,
            empresa_cliente: dadosVisualizacao.empresaCliente,
            email_cliente: dadosVisualizacao.emailCliente || 'sem-email@proposta.com',
            telefone_cliente: dadosVisualizacao.telefoneCliente || 'Não informado',
            cpf_cnpj: dadosVisualizacao.cpfCnpj || null,
            // Mapear nomes de plano com segurança usando as chaves do formulário
            servico_social_midia: (socialKey && socialKey !== 'nao-se-aplica' && planosSocialMedia[socialKey]) ? (planosSocialMedia[socialKey].nome || socialKey) : null,
            servico_trafego_pago: (trafegoKey && trafegoKey !== 'nao-se-aplica' && planosTrafegoPago[trafegoKey]) ? (planosTrafegoPago[trafegoKey].nome || trafegoKey) : null,
            valor_social_midia: valorSocialMidia,
            valor_trafego_pago: valorTrafegoPago,
            tem_comissao_vendas: temComissaoVendas,
            percentual_comissao: percentualComissao,
            valor_fixo_trafego: valorFixoTrafego,
            tipo_comissao_hibrido: dadosVisualizacao.tipoComissaoHibrido || 'percentual',
            valor_comissao_fixa: parseFloat(dadosVisualizacao.valorComissaoFixa) || 0,
            investimento_midia: dadosVisualizacao.investimentoMidia || null,
            endereco_cliente: dadosVisualizacao.enderecoCliente || null,
            representante_cliente: dadosVisualizacao.representanteLegalCliente || null,
            valor_mensal: valorMensalFinal,
            valor_total: valorTotal,
            desconto_aplicado: descontoCustomizado,
            recorrencia: null, // Será preenchido quando o cliente aceitar
            forma_pagamento: null, // Será preenchido quando o cliente aceitar
            responsavel_proposta: dadosVisualizacao.responsavelProposta,
            responsavel_user_id: responsavelUid,
            dias_validade: parseInt(dadosVisualizacao.diasValidade),
            expira_em: dataExpiracao.toISOString(),
            observacoes: descontoDescricao || null,
            status: 'pendente',
            // Persistir dados do Catálogo diretamente na proposta (metadata jsonb)
            metadata: (() => {
                const safeParse = (str) => {
                    try { return str ? JSON.parse(str) : null; } catch(_) { return null; }
                };
                const sessoes = safeParse(dadosVisualizacao.catalogoSessoes || '') || [];
                const addons = safeParse(dadosVisualizacao.catalogoAddons || '') || [];
                const valorCat = parseFloat(String(dadosVisualizacao.catalogoValor || '0').replace(',', '.')) || 0;
                const cat = {
                    origem: 'catalogo',
                    produto_id: dadosVisualizacao.catalogoProdutoId || null,
                    plano_id: dadosVisualizacao.catalogoPlanoId || null,
                    produto_nome: dadosVisualizacao.catalogoProdutoNome || null,
                    plano_nome: dadosVisualizacao.catalogoPlanoNome || null,
                    valor: valorCat || 0,
                    sessoes: Array.isArray(sessoes) ? sessoes : [],
                    addons: Array.isArray(addons) ? addons : []
                };
                return { catalogo: cat };
            })()
        };
        
        let propostaId;
        
        // Verificar se está em modo de edição
        if (window.propostaEmEdicao) {
            console.log('=== ATUALIZANDO PROPOSTA ===');
            console.log('ID:', window.propostaEmEdicao);
            console.table(dadosInsercao);
            
            let updateResp;
            try {
                updateResp = await supabase
                    .from('propostas_criadas')
                    .update(dadosInsercao)
                    .eq('id', window.propostaEmEdicao)
                    .select('id')
                    .single();
            } catch (e) {
                updateResp = { data: null, error: e };
            }

            if (updateResp.error) {
                console.error('=== ERRO AO ATUALIZAR ===');
                console.error(updateResp.error);
                // Fallback: se RLS/perm negada (401/42501), cria nova proposta
                const msg = (updateResp.error.message || '').toLowerCase();
                const code = updateResp.error.code || '';
                const isPermissao = code === '42501' || msg.includes('row-level security') || msg.includes('permission') || msg.includes('401');
                if (isPermissao) {
                    console.warn('Sem permissão para atualizar. Criando nova proposta como fallback...');
                    const insertResp = await supabase
                        .from('propostas_criadas')
                        .insert(dadosInsercao)
                        .select('id')
                        .single();
                    if (insertResp.error) {
                        console.error('Erro no fallback de inserção:', insertResp.error);
                        throw new Error('Erro ao atualizar proposta e falha ao criar nova: ' + insertResp.error.message);
                    }
                    propostaId = insertResp.data.id;
                    // Atualiza contexto para novo ID
                    window.propostaEmEdicao = propostaId;
                    alert('⚠️ Sem permissão para editar a proposta original. Uma nova proposta foi criada e o link foi atualizado.');
                } else {
                    throw new Error(`Erro ao atualizar proposta: ${updateResp.error.message}`);
                }
            } else {
                propostaId = updateResp.data.id;
                alert('✅ Proposta atualizada com sucesso!');
            }
            
        } else {
            console.log('=== INSERINDO NOVA PROPOSTA ===');
            console.table(dadosInsercao);
            
            const { data, error } = await supabase
                .from('propostas_criadas')
                .insert(dadosInsercao)
                .select('id')
                .single();
            
            if (error) {
                console.error('=== ERRO SUPABASE ===');
                console.error('Objeto de erro completo:', JSON.stringify(error, null, 2));
                console.error('Código:', error.code);
                console.error('Mensagem:', error.message);
                console.error('Detalhes:', error.details);
                console.error('Hint:', error.hint);
                throw new Error('Erro ao salvar proposta no banco de dados: ' + error.message);
            }
            
            propostaId = data.id;
        }

        // Persistir item de Catálogo imediatamente (para aparecer no Admin), se houver
        try {
            const nomeCat = (dadosInsercao.catalogoProdutoNome || '').trim();
            const planoCat = (dadosInsercao.catalogoPlanoNome || '').trim();
            const valorCat = parseFloat(String(dadosInsercao.catalogoValor || '0').replace(',', '.')) || 0;

            if (valorCat > 0 || (nomeCat && planoCat)) {
                const item = {
                    proposta_criada_id: propostaId,
                    nome_servico: nomeCat || 'Catálogo',
                    descricao: planoCat || null,
                    quantidade: 1,
                    preco_unitario: valorCat || 0,
                    desconto_percentual: 0,
                    total: valorCat || 0,
                    metadata: { origem: 'pre_geracao' }
                };
                const { error: itensErr } = await supabase
                    .from('proposta_itens')
                    .insert([item]);
                if (itensErr) {
                    console.warn('Falha ao inserir item de catálogo pré-geração:', itensErr);
                } else {
                    console.log('Item de catálogo pré-geração persistido para a proposta', propostaId);
                }
            }
        } catch (e) {
            console.warn('Erro ao persistir item de catálogo pré-geração:', e);
        }

        // Gerar link com UUID
        const baseUrl = (() => {
            const { origin, pathname } = window.location;
            const idx = pathname.lastIndexOf('/');
            const basePath = idx >= 0 ? pathname.slice(0, idx + 1) : '/';
            return origin + basePath;
        })();
        // Montar link apenas com o ID (resto será lido da metadata)
        const extraParams = new URLSearchParams({ id: String(propostaId) });
        const linkProposta = `${baseUrl}proposta-visualizacao.html?${extraParams.toString()}`;
        
        // Mostrar modal com o link
        document.getElementById('linkGerado').value = linkProposta;
        document.getElementById('modalLink').style.display = 'block';
        
        // Resetar timestamp para próxima proposta
        timestampPropostaAtual = null;
        
    } catch (error) {
        console.error('Erro completo:', error);
        alert('Erro ao gerar proposta: ' + error.message + '\n\nVerifique se:\n1. O SQL foi executado no Supabase\n2. As políticas RLS estão ativas\n3. Você tem conexão com a internet');
    }
}

// Variável global para armazenar timestamp da proposta
let timestampPropostaAtual = null;

// Função auxiliar para coletar dados do formulário
function coletarDadosFormulario() {
    // Coletar cliente selecionado (id, email, telefone) do dropdown
    const clienteSelect = document.getElementById('clienteSelecionado');
    const clienteOpt = clienteSelect?.selectedOptions?.[0] || null;
    const clienteId = clienteOpt?.value || null;
    const clienteEmail = clienteOpt?.dataset?.email || '';
    const clienteTelefone = clienteOpt?.dataset?.telefone || '';

    // Validar campos obrigatórios
    const empresaClienteEl = document.getElementById('empresaCliente');
    const responsavelPropostaEl = document.getElementById('responsavelProposta');
    const enderecoClienteEl = document.getElementById('enderecoCliente');
    const diasValidadeEl = document.getElementById('diasValidade');
    
    if (!empresaClienteEl || !responsavelPropostaEl || !enderecoClienteEl || !diasValidadeEl) {
        alert('Erro: Formulário incompleto. Recarregue a página.');
        return null;
    }
    
    // Valores atuais dos inputs
    let empresaCliente = (empresaClienteEl.value || '').trim();
    let responsavelProposta = (responsavelPropostaEl.value || '').trim();
    let enderecoCliente = (enderecoClienteEl.value || '').trim();

    // Fallback defensivo: preencher a partir do cliente selecionado e sessão
    // Empresa/Nome
    if (!empresaCliente && clienteOpt) {
        const tipo = clienteOpt.dataset?.tipo;
        const nome = (clienteOpt.dataset?.nome || '').trim();
        const empresaDs = (clienteOpt.dataset?.empresa || '').trim();
        empresaCliente = (tipo === 'cpf' ? (nome || empresaDs) : (empresaDs || nome)) || '';
        if (empresaClienteEl) empresaClienteEl.value = empresaCliente;
    }
    // Endereço
    if (!enderecoCliente && clienteOpt) {
        enderecoCliente = (clienteOpt.dataset?.endereco || '').trim();
        if (enderecoClienteEl) enderecoClienteEl.value = enderecoCliente;
    }
    // Responsável: se ainda vazio, buscar sessão atual
    // (popularResponsavelDropdown já tenta isso, mas garantimos aqui)
    if (!responsavelProposta) {
        // Fallback rápido: usar texto do authStatusGerador
        const authText = (document.getElementById('authStatusGerador')?.textContent || '').trim();
        const authEmailGuess = authText ? authText.split(' · ')[0] : '';
        if (authEmailGuess && authEmailGuess.includes('@')) {
            responsavelProposta = authEmailGuess;
            if (responsavelPropostaEl) {
                responsavelPropostaEl.innerHTML = '';
                const opt = document.createElement('option');
                opt.value = authEmailGuess;
                opt.textContent = authEmailGuess;
                responsavelPropostaEl.appendChild(opt);
                responsavelPropostaEl.value = authEmailGuess;
                responsavelPropostaEl.disabled = true;
            }
        }
        if (window.supabaseConfig && typeof window.supabaseConfig.initSupabase === 'function') {
            // Nota: chamada não bloqueia se falhar; apenas tenta obter email
            const clientTmp = window.supabaseConfig.initSupabase?.();
            if (clientTmp && typeof clientTmp.then === 'function') {
                // Se for Promise, aguardamos rapidamente
                // (coletarDadosFormulario é síncrona por design, então não await total)
            }
        }
        try {
            if (window.supabaseConfig && typeof window.supabaseConfig.initSupabase === 'function') {
                // Executa de forma síncrona com await em IIFE
                // eslint-disable-next-line no-new-func
                const obterEmail = new Function('return (async () => { const c = await window.supabaseConfig.initSupabase(); const { data: { session } } = await c.auth.getSession(); return session?.user?.email || ""; })()');
                // Tentativa rápida
                // eslint-disable-next-line no-undef
                obterEmail().then(email => {
                    if (!responsavelProposta && email) {
                        responsavelProposta = email;
                        if (responsavelPropostaEl) {
                            responsavelPropostaEl.innerHTML = '';
                            const opt = document.createElement('option');
                            opt.value = email;
                            opt.textContent = email;
                            responsavelPropostaEl.appendChild(opt);
                            responsavelPropostaEl.value = email;
                            responsavelPropostaEl.disabled = true;
                        }
                    }
                }).catch(() => {});
            }
        } catch (_) { /* ignora */ }
    }
    const diasValidade = diasValidadeEl.value;
    
    if (!empresaCliente || !responsavelProposta || !enderecoCliente) {
        alert('Por favor, selecione um cliente para preencher Empresa e Endereço e garanta que está logado para definir o Responsável.');
        return null;
    }
    
    // Validar CPF/CNPJ
    const cpfCnpjClienteEl = document.getElementById('cpfCnpjCliente');
    if (!cpfCnpjClienteEl) {
        alert('Erro: Campo CPF/CNPJ não encontrado.');
        return null;
    }
    
    let cpfCnpjCliente = (cpfCnpjClienteEl.value || '').trim();
    if (!cpfCnpjCliente && clienteOpt) {
        // Preencher a partir do dataset do cliente
        let doc = (clienteOpt.dataset?.documento || '').trim();
        if (window.validacaoCPFCNPJ) {
            const tipo = clienteOpt.dataset?.tipo;
            if (tipo === 'cpf' && window.validacaoCPFCNPJ.formatarCPF) {
                doc = window.validacaoCPFCNPJ.formatarCPF(doc);
            } else if (window.validacaoCPFCNPJ.formatarCNPJ) {
                doc = window.validacaoCPFCNPJ.formatarCNPJ(doc);
            }
        }
        cpfCnpjCliente = doc;
        cpfCnpjClienteEl.value = cpfCnpjCliente;
    }
    if (!cpfCnpjCliente) {
        alert('Por favor, preencha o CPF/CNPJ do cliente.');
        return null;
    }
    
    if (window.validacaoCPFCNPJ) {
        const resultadoValidacao = window.validacaoCPFCNPJ.validarCPFouCNPJ(cpfCnpjCliente);
        if (!resultadoValidacao.valido) {
            alert(`Por favor, digite um ${resultadoValidacao.tipo} válido.`);
            return null;
        }
    }
    
    // Exigir apenas seleção do Catálogo
    const catalogoProdutoEl = document.getElementById('catalogoProdutoSelect');
    const catalogoPlanoEl = document.getElementById('catalogoPlanoSelect');
    const produtoIdSel = catalogoProdutoEl?.value || '';
    const produtoOptSel = catalogoProdutoEl?.selectedOptions?.[0] || null;
    const planoOptSel = catalogoPlanoEl?.selectedOptions?.[0] || null;
    if (!produtoIdSel) {
        alert('Por favor, selecione o serviço do Catálogo.');
        return null;
    }
    // Quando existir wrapper de plano e houver opções, exigir plano
    const planoWrapper = document.getElementById('catalogoPlanoWrapper');
    const precisaPlano = !!planoWrapper && planoWrapper.style.display !== 'none' && (catalogoPlanoEl?.options?.length || 0) > 1;
    if (precisaPlano && !planoOptSel) {
        alert('Por favor, selecione o plano do serviço do Catálogo.');
        return null;
    }
    
    // Criar timestamp apenas uma vez por sessão de proposta
    if (!timestampPropostaAtual) {
        const agora = new Date();
        timestampPropostaAtual = agora.toLocaleDateString('pt-BR') + ' ' + agora.toLocaleTimeString('pt-BR');
    }
    
        return {
        clienteId: clienteId,
        nomeCliente: empresaCliente, // Usar empresa como nome do cliente
        empresaCliente: empresaCliente,
        emailCliente: clienteEmail || 'sem-email@proposta.com',
        cpfCnpj: cpfCnpjCliente,
        telefoneCliente: clienteTelefone || 'Não informado',
        enderecoCliente: enderecoCliente,
        representanteLegalCliente: '', // Será capturado no aceite
        responsavelProposta: responsavelProposta,
        diasValidade: diasValidade,
        // Forçar serviços antigos como não aplicáveis
        servicoSocialMidia: 'nao-se-aplica',
        servicoTrafegoPago: 'nao-se-aplica',
        modeloCobranca: document.getElementById('modeloCobranca')?.value || 'fixo',
        percentualComissao: document.getElementById('percentualComissao')?.value || '0',
        valorFixoTrafego: document.getElementById('valorFixoTrafego')?.value || '0',
        tipoComissaoHibrido: document.getElementById('tipoComissaoHibrido')?.value || 'percentual',
        valorComissaoFixa: document.getElementById('valorComissaoFixa')?.value || '0',
        investimentoMidia: (document.getElementById('investimentoMidia')?.value || '').trim(),
        // Parâmetros do Catálogo no preview
        catalogoProdutoId: produtoIdSel || '',
        catalogoProdutoNome: produtoOptSel?.textContent || '',
        catalogoPlanoId: planoOptSel?.value || '',
        catalogoPlanoNome: planoOptSel?.textContent || '',
        catalogoValor: planoOptSel?.dataset?.valor || '',
        catalogoSessoes: planoOptSel?.dataset?.sessoes || '',
        catalogoAddons: planoOptSel?.dataset?.addons || '',
        timestampCriacao: timestampPropostaAtual
    };
}

// Função para resetar timestamp quando dados importantes mudarem
function resetarTimestamp() {
    timestampPropostaAtual = null;
}

// Atualiza a badge '+ X% sobre vendas' no gerador
function atualizarBadgeComissao() {
    const badgeWrapper = document.getElementById('badgeComissaoWrapper');
    const badge = document.getElementById('badgeComissaoGenerator');
    const planoTrafego = document.getElementById('servicoTrafegoPago')?.value || 'nao-se-aplica';
    if (!badgeWrapper || !badge || planoTrafego === 'nao-se-aplica') {
        if (badgeWrapper) badgeWrapper.style.display = 'none';
        return;
    }
    const modelo = document.getElementById('modeloCobranca')?.value || 'fixo';
    const pct = parseFloat(document.getElementById('percentualComissao')?.value || '0') || 0;
    const valorComissaoFixa = parseFloat(document.getElementById('valorComissaoFixa')?.value || '0') || 0;
    const tipoComissaoHibrido = document.getElementById('tipoComissaoHibrido')?.value || 'percentual';
    
    if (modelo === 'comissao' && pct > 0) {
        badge.textContent = `+ ${pct}% sobre vendas`;
        badgeWrapper.style.display = 'block';
    } else if (modelo === 'hibrido') {
        if (tipoComissaoHibrido === 'percentual' && pct > 0) {
            badge.textContent = `+ ${pct}% sobre vendas`;
            badgeWrapper.style.display = 'block';
                } else if (tipoComissaoHibrido === 'fixo' && valorComissaoFixa > 0) {
            badge.textContent = `+ R$ ${valorComissaoFixa.toFixed(2)} por venda`;
            badgeWrapper.style.display = 'block';
        } else {
            badgeWrapper.style.display = 'none';
        }
    } else {
        badgeWrapper.style.display = 'none';
    }
}

// Função para carregar proposta existente para edição
async function carregarPropostaParaEdicao(propostaId) {
    try {
        console.log('Carregando proposta para edição:', propostaId);
        
        // Inicializar Supabase
        const client = window.supabaseConfig.initSupabase();
        
        // Buscar proposta
        const { data: proposta, error } = await client
            .from('propostas_criadas')
            .select('*')
            .eq('id', propostaId)
            .single();
        
        if (error || !proposta) {
            console.error('Erro ao carregar proposta:', error);
            alert('❌ Não foi possível carregar a proposta para edição.');
            return;
        }
        
        // Verificar se a proposta já foi assinada
        if (proposta.status === 'aceita' || proposta.assinado_em) {
            alert('❌ Não é possível editar propostas que já foram assinadas.');
            // Redirecionar de volta para o admin
            window.location.href = 'admin.html';
            return;
        }
        
        if (error || !proposta) {
            console.error('Erro ao carregar proposta:', error);
            alert('❌ Não foi possível carregar a proposta para edição.');
            return;
        }
        
        console.log('Proposta carregada:', proposta);

        // Helper para setar valores com segurança
        const setIfExists = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.value = value ?? '';
        };

        // Preencher campos do formulário (somente os que existem no gerador)
        setIfExists('empresaCliente', proposta.empresa_cliente || '');
        setIfExists('enderecoCliente', proposta.endereco_cliente || '');
        setIfExists('responsavelProposta', proposta.responsavel_proposta || '');
        // Garantir que o valor salvo exista como opção no select
        const respSelect = document.getElementById('responsavelProposta');
        if (respSelect && proposta.responsavel_proposta) {
            const atual = String(proposta.responsavel_proposta);
            const existe = Array.from(respSelect.options).some(o => o.value === atual);
            if (!existe) {
                const opt = document.createElement('option');
                opt.value = atual;
                opt.textContent = `${atual} · registro antigo`;
                respSelect.appendChild(opt);
            }
            respSelect.value = atual;
        }
        setIfExists('diasValidade', proposta.dias_validade || 7);
        // IDs que podem não existir no gerador atual
        setIfExists('emailCliente', proposta.email_cliente || '');
        setIfExists('telefoneCliente', proposta.telefone_cliente || '');
        setIfExists('representanteCliente', proposta.representante_cliente || '');
        // CPF/CNPJ: alinhar com ID correto do HTML
        setIfExists('cpfCnpjCliente', proposta.cpf_cnpj || '');

        // Mapear nomes salvos no banco para os valores dos selects
        const mapSocial = { 'START': 'start', 'SCALE': 'scale', 'HEAT': 'heat' };
        const mapTrafego = { 'FOCO': 'foco', 'ACELERAÇÃO': 'aceleracao', 'DESTAQUE': 'heat' };
        const socialKey = proposta.servico_social_midia ? (mapSocial[proposta.servico_social_midia] || 'nao-se-aplica') : 'nao-se-aplica';
        const trafegoKey = proposta.servico_trafego_pago ? (mapTrafego[proposta.servico_trafego_pago] || 'nao-se-aplica') : 'nao-se-aplica';
        setIfExists('servicoSocialMidia', socialKey);
        setIfExists('servicoTrafegoPago', trafegoKey);

        // Investimento em mídia
        if (proposta.investimento_midia) {
            setIfExists('investimentoMidia', proposta.investimento_midia);
        }

        // Modelo de cobrança (inferir se não existir no registro)
        let modelo = proposta.modelo_cobranca || null;
        if (!modelo) {
            if (proposta.tem_comissao_vendas) {
                modelo = (proposta.valor_fixo_trafego && proposta.valor_fixo_trafego > 0) ? 'hibrido' : 'comissao';
            } else {
                modelo = 'fixo';
            }
        }
        setIfExists('modeloCobranca', modelo);
        if (proposta.percentual_comissao != null) setIfExists('percentualComissao', proposta.percentual_comissao);
        if (proposta.tipo_comissao_hibrido) setIfExists('tipoComissaoHibrido', proposta.tipo_comissao_hibrido);
        if (proposta.valor_comissao_fixa != null) setIfExists('valorComissaoFixa', proposta.valor_comissao_fixa);
        if (proposta.valor_fixo_trafego != null) setIfExists('valorFixoTrafego', proposta.valor_fixo_trafego);

        // Disparar eventos para atualizar UI somente se os elementos existirem
        const elSocial = document.getElementById('servicoSocialMidia');
        if (elSocial) elSocial.dispatchEvent(new Event('change'));
        const elTrafego = document.getElementById('servicoTrafegoPago');
        if (elTrafego) elTrafego.dispatchEvent(new Event('change'));
        const elModelo = document.getElementById('modeloCobranca');
        if (elModelo) elModelo.dispatchEvent(new Event('change'));

        // Calcular valores (com try/catch pra não quebrar)
        try { calcularValores(); } catch (e) { console.warn('Falha ao recalcular valores no modo edição:', e); }

        // Armazenar ID para atualizar ao invés de criar
        window.propostaEmEdicao = propostaId;

        // Mudar texto do botão (compatível com o HTML atual)
        const btnGerar = document.querySelector('.btn-generate');
        if (btnGerar) btnGerar.textContent = '💾 Atualizar Proposta';

        alert('📝 Proposta carregada para edição!');
        
    } catch (error) {
        console.error('Erro ao carregar proposta:', error);
        alert('❌ Erro ao carregar proposta: ' + error.message);
    }
}
    const clienteSelect = document.getElementById('clienteSelecionado');
    const clienteOpt = clienteSelect?.selectedOptions?.[0] || null;
    const clienteId = clienteOpt?.value || null;
    const clienteEmail = clienteOpt?.dataset?.email || '';
    const clienteTelefone = clienteOpt?.dataset?.telefone || '';
