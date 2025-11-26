// Configuração do Supabase
// Substitua com suas credenciais do Supabase após criar o projeto
const SUPABASE_URL = 'https://ndokpkkdziifydugyjie.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kb2twa2tkemlpZnlkdWd5amllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMjA5NTYsImV4cCI6MjA3Nzg5Njk1Nn0.k9brkGFdvZe_32ctC0zKpOW1y6icp3zacOOw-MYxECc';
// Inicializar cliente Supabase (será carregado via CDN no HTML)
let supabase = null;
function initSupabase() {
    if (!window.supabase) {
        const err = new Error('Biblioteca supabase-js não carregada.');
        console.error('❌ initSupabase:', err);
        throw err;
    }
    if (typeof supabase === 'undefined' || supabase === null) {
        // Decidir persistência de sessão conforme a página atual
        const path = (window.location && window.location.pathname || '').toLowerCase();
        const isAuthPage = (
            path.endsWith('/admin') || path.endsWith('/admin.html') ||
            path.endsWith('/login') || path.endsWith('/login.html') ||
            path.endsWith('/proposta-gerador') || path.endsWith('/proposta-gerador.html') ||
            path.endsWith('/clientes') || path.endsWith('/clientes.html') ||
            path.endsWith('/produtos') || path.endsWith('/produtos.html') ||
            path.endsWith('/produto-cadastro') || path.endsWith('/produto-cadastro.html') ||
            path.endsWith('/proposta-rapida') || path.endsWith('/proposta-rapida.html') ||
            path.endsWith('/index') || path.endsWith('/index.html')
        );
        const authOptions = { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false };

        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: authOptions });
        // Expor o CLIENTE globalmente (o projeto usa window.supabase como client)
        window.supabase = supabase;
        console.log('✅ DB conectado (Supabase)');
    }
    return supabase;
}
// Expor namespace para outros módulos (ex.: auth-guard)
window.supabaseConfig = window.supabaseConfig || {};
window.supabaseConfig.initSupabase = initSupabase;
// Função para salvar proposta aceita no Supabase
async function salvarPropostaAceita(dadosProposta) {
    try {
        const supabase = initSupabase();
        const urlParamsSafe = (function(){ try { return new URLSearchParams(window.location.search); } catch(e) { return null; } })();
        const propostaCriadaId = (dadosProposta && dadosProposta.propostaCriadaId) || (urlParamsSafe && urlParamsSafe.get('id')) || null;

        // Obter IP do cliente (via API pública)
        let ip = '0.0.0.0';
        try {
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            if (ipResponse.ok) {
                const ipData = await ipResponse.json();
                ip = ipData.ip;
            }
        } catch (e) {
            console.warn('Não foi possível obter IP público. Prosseguindo sem IP.', e);
        }

        // Atualiza somente a origem: a proposta criada vira "aceita"
        if (propostaCriadaId) {
            const { data: updData, error: updError } = await supabase
              .from('propostas_criadas')
              .update({
                status: 'aceita',
                aceita_em: new Date().toISOString(),
                recorrencia: dadosProposta.recorrencia,
                forma_pagamento: dadosProposta.formaPagamento,
                email_cliente: dadosProposta.emailCliente || null,
                telefone_cliente: dadosProposta.telefoneCliente || null,
                melhor_dia_pagamento: dadosProposta.melhorDiaPagamento || null,
                representante_cliente: dadosProposta.representanteLegalCliente || '',
                endereco_cliente: dadosProposta.enderecoCliente || '',
                ip_criacao: ip,
                user_agent: navigator.userAgent
              })
              .eq('id', propostaCriadaId)
              .select('id, status, recorrencia, forma_pagamento, melhor_dia_pagamento')
              .maybeSingle();
            if (updError) {
                console.error('❌ Aceite: falha ao atualizar propostas_criadas', updError);
                throw updError;
            }
            console.log('✅ Aceite salvo', { id: updData?.id });
        }

        // Inserir itens selecioandos (se houver) e registrar status 'itens_preenchidos'
        try {
            const servicos = Array.isArray(dadosProposta?.servicosContratados)
              ? dadosProposta.servicosContratados
              : (Array.isArray(window.servicosContratados) ? window.servicosContratados : []);
            if (propostaCriadaId && servicos.length > 0) {
                const descontoPorForma = (forma) => {
                    const f = (forma || '').toLowerCase();
                    if (f.includes('vista')) return 10; // À Vista
                    if (f.includes('parcel')) return 5; // Parcelado
                    return 0; // Mensal / outros
                };
                const descontoPct = descontoPorForma(dadosProposta.formaPagamento || '');
                const itensDetalhados = servicos.map((s) => {
                    const preco = typeof s.valor === 'number'
                      ? s.valor
                      : parseFloat(String(s.valor).replace(/[^\d.,-]/g, '').replace('.', '').replace(',', '.')) || 0;
                    const total = +(preco * (1 - (descontoPct/100))).toFixed(2);
                    const planoKey = s.tipo === 'Social Mídia'
                      ? (window.propostaCarregada?.servico_social_midia_key || 'nao-se-aplica')
                      : (window.propostaCarregada?.servico_trafego_pago_key || 'nao-se-aplica');
                    return {
                        proposta_criada_id: propostaCriadaId,
                        nome_servico: s.tipo,
                        descricao: s.plano || null,
                        quantidade: 1,
                        preco_unitario: preco,
                        desconto_percentual: descontoPct,
                        total: total,
                        metadata: {
                            plano_key: planoKey,
                            recorrencia: dadosProposta.recorrencia || null,
                            origem: 'cliente'
                        }
                    };
                });
                const { error: itensError } = await supabase
                  .from('proposta_itens')
                  .insert(itensDetalhados);
                if (itensError) {
                    console.error('❌ Itens: falha ao inserir seleção do cliente', itensError);
                } else {
                    const { error: statusItensError } = await supabase
                      .from('proposta_status_history')
                      .insert({
                        proposta_criada_id: propostaCriadaId,
                        status: 'itens_preenchidos',
                        observacao: `Cliente selecionou ${itensDetalhados.length} item(ns).`,
                        created_by: null
                      });
                    if (statusItensError) {
                        console.error('❌ Histórico: falha ao registrar itens_preenchidos', statusItensError);
                    }
                }
            }
        } catch (e) {
            console.error('❌ Itens: erro ao persistir seleção', e);
        }

        // Registra no histórico
        if (propostaCriadaId) {
            const { error: histError } = await supabase
              .from('proposta_status_history')
              .insert({
                proposta_criada_id: propostaCriadaId,
                status: 'aceita',
                observacao: 'Aceite registrado via fluxo público.',
                created_by: null
              });
            if (histError) {
                console.error('❌ Histórico: falha ao registrar aceite', histError);
            }
        }

        // Retorna o id da proposta criada para ser usado como chave única
        console.log('✅ Aceite concluído');
        return { id: propostaCriadaId };
    } catch (error) {
        console.error('❌ Erro ao salvar proposta:', error);
        throw error;
    }
}
// Função para gerar e armazenar contrato em PDF no Supabase Storage
async function gerarEArmazenarContrato(propostaCriadaId, dadosContrato) {
    try {
        // Inicializar cliente para garantir acesso a storage e DB
        const client = initSupabase();
        
        // Gerar PDF do contrato
        const pdfBlob = await gerarPDFContrato(dadosContrato);
        
        // Nome único para o arquivo
        const nomeArquivo = `contrato-${propostaCriadaId}-${Date.now()}.pdf`;
        
        // Upload para Supabase Storage
        const { data: uploadData, error: uploadError } = await client.storage
            .from('contratos')
            .upload(nomeArquivo, pdfBlob, {
                contentType: 'application/pdf',
                cacheControl: '3600',
                upsert: false
            });
        
        if (uploadError) {
            console.error('❌ Contrato: falha no upload PDF', uploadError);
            throw uploadError;
        }
        
        // Obter URL pública do PDF
        const { data: urlData } = client.storage
            .from('contratos')
            .getPublicUrl(nomeArquivo);
        
        // Salvar registro do contrato na tabela
        const { data: contratoData, error: contratoError } = await client
            .from('proposta_contratos')
            .insert({
                proposta_criada_id: propostaCriadaId,
                contrato_url: urlData.publicUrl,
                contrato_sha256: gerarHashAssinatura(dadosContrato),
                ip_assinatura: dadosContrato.ipAssinatura,
                // 'created_at' é preenchido automaticamente pelo banco; não definir manualmente
            })
            .select();
        
        if (contratoError) {
            console.error('❌ Contrato: falha ao salvar registro', contratoError);
            throw contratoError;
        }
        
        console.log('✅ Contrato gerado', { url: urlData.publicUrl });
        return {
            contratoId: contratoData[0].id,
            pdfUrl: urlData.publicUrl
        };
    } catch (error) {
        console.error('❌ Contrato: erro geral', error);
        throw error;
    }
}
// Gerar hash da assinatura digital
function gerarHashAssinatura(dadosContrato) {
    const dataString = JSON.stringify({
        nome: dadosContrato.nomeCliente,
        cpfCnpj: dadosContrato.cpfCnpj,
        timestamp: dadosContrato.timestamp
    });
    
    // Usar CryptoJS se disponível, senão usar btoa simples
    if (typeof CryptoJS !== 'undefined') {
        return CryptoJS.SHA256(dataString).toString();
    } else {
        return btoa(dataString);
    }
}
// Função para gerar PDF do contrato
async function gerarPDFContrato(dadosContrato) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        const err = new Error('Biblioteca jsPDF não carregada.');
        console.error('❌ gerarPDFContrato:', err);
        throw err;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    // Utilitários
    const margemEsq = 20;
    const margemDir = 190;
    const larguraUtil = margemDir - margemEsq;
    let y = 20;
    // Renderiza um parágrafo quebrando linhas
    const paragrafo = (texto, opcoes = {}) => {
        const { negrito = false, tamanho = 11 } = opcoes;
        
        if (negrito) {
            doc.setFont('helvetica', 'bold');
        } else {
            doc.setFont('helvetica', 'normal');
        }
        doc.setFontSize(tamanho);
        
        const linhas = doc.splitTextToSize(texto, larguraUtil);
        if (y + (linhas.length * 6) > 280) { doc.addPage(); y = 20; }
        doc.text(linhas, margemEsq, y, { align: 'justify', maxWidth: larguraUtil });
        y += (linhas.length * 6);
        
        doc.setFont('helvetica', 'normal');
    };
    // Helper: tentar carregar fonte Unicode local (se existir)
    const carregarFonteUnicode = async () => {
        try {
            const caminhosFonte = [
                'fonts/Roboto-Regular.ttf',
                './fonts/Roboto-Regular.ttf',
                '/proposta-comercial/fonts/Roboto-Regular.ttf',
                'proposta-comercial/fonts/Roboto-Regular.ttf'
            ];
            let buffer = null;
            for (const c of caminhosFonte) {
                try {
                    const resp = await fetch(c);
                    if (resp.ok) { buffer = await resp.arrayBuffer(); break; }
                } catch (_) { /* tenta próxima */ }
            }
            if (!buffer) return false;
            const base64 = btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
            doc.addFileToVFS('Roboto-Regular.ttf', base64);
            doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
            doc.setFont('Roboto', 'normal');
            return true;
        } catch (e) {
            console.warn('Não foi possível carregar fonte Unicode local:', e);
            return false;
        }
    };
    // Tenta carregar template externo (contrato-template.md) primeiro
    let usouTemplate = false;
    let textoTemplate = '';
    try {
        const caminhos = [
            'contrato-template.md',
            './contrato-template.md',
            '/proposta-comercial/contrato-template.md',
            'proposta-comercial/contrato-template.md'
        ];
        for (const caminho of caminhos) {
            try {
                const resp = await fetch(caminho);
                if (resp.ok) {
                    textoTemplate = await resp.text();
                    break;
                }
            } catch (_) { /* tenta próximo caminho */ }
        }
        if (textoTemplate) {
            // Fonte Unicode (se disponível) para acentuação correta
            await carregarFonteUnicode();
            // Definir entregáveis por plano de Social Media
            const entregaveisSocialMedia = {
                'start': `SOCIAL MEDIA - PLANO START:
- 3 posts semanais
- Manual de comunicação
- 8 artes/mês
- Copywriting
- Organização via Notion
- Análise de concorrentes`,
                'scale': `SOCIAL MEDIA - PLANO SCALE:
- 5 posts semanais
- Manual de comunicação
- 12 artes/mês
- Copywriting
- Relatório mensal
- Organização via Notion
- Análise de concorrentes`,
                'heat': `SOCIAL MEDIA - PLANO HEAT:
- 7 posts semanais
- Linha editorial premium
- 16 artes/mês
- Copywriting estratégico
- Relatório completo
- Monitoramento de tendências
- Suporte em tempo real`
            };
            // Definir entregáveis por plano de Tráfego Pago
            const entregaveisTrafegoPago = {
                'foco': `TRÁFEGO PAGO - PLANO FOCO:
Execução:
- 3 criativos estáticos (imagem) por mês
- 1 reunião mensal
Gestão e Acompanhamento:
- Planejamento de campanhas
- Rastreamento de leads
- Relatórios semanais de performance
- Dashboard de resultados
Estratégia e Configuração:
- Script de vendas
- Análise de concorrência
- Definição de ICP (público ideal)
- Landing Page de alta conversão
- Configuração inicial de BM + Tags (Meta/Google)
Suporte:
- Suporte direto (grupo de acompanhamento)`,
                'aceleracao': `TRÁFEGO PAGO - PLANO ACELERAÇÃO:
Execução:
- 5 criativos estáticos (imagem) por mês
- 2 reuniões mensais
Gestão e Acompanhamento:
- Planejamento de campanhas
- Rastreamento de leads
- Relatórios semanais de performance
- Dashboard de resultados
Estratégia e Configuração:
- Script de vendas
- Análise de concorrência
- Definição de ICP (público ideal)
- Landing Page de alta conversão
- Configuração inicial de BM + Tags (Meta/Google)
Suporte:
- Suporte direto (grupo de acompanhamento)`,
                'heat': `TRÁFEGO PAGO - PLANO DESTAQUE:
Execução:
- 8 criativos estáticos (imagem) por mês
- 4 reuniões mensais
Gestão e Acompanhamento:
- Planejamento de campanhas
- Rastreamento de leads
- Relatórios semanais de performance
- Dashboard de resultados
Estratégia e Configuração:
- Script de vendas
- Análise de concorrência
- Definição de ICP (público ideal)
- Landing Page de alta conversão
- Configuração inicial de BM + Tags (Meta/Google)
- Consultoria estratégica de crescimento
- Ajustes contínuos de LP e otimização de conversão (CRO)
Suporte:
- Suporte direto (grupo de acompanhamento)
- Suporte prioritário via WhatsApp`
            };
            // Montar textos dos entregáveis com base nos serviços contratados
            let textoEntregaveisSocial = '';
            let textoEntregaveisTrafego = '';
            const servicoSocial = (dadosContrato.servicoSocialMidia || '').toLowerCase();
            const servicoTrafego = (dadosContrato.servicoTrafegoPago || '').toLowerCase();
            if (servicoSocial && servicoSocial !== 'nao-se-aplica' && entregaveisSocialMedia[servicoSocial]) {
                textoEntregaveisSocial = entregaveisSocialMedia[servicoSocial];
            }
            if (servicoTrafego && servicoTrafego !== 'nao-se-aplica' && entregaveisTrafegoPago[servicoTrafego]) {
                textoEntregaveisTrafego = entregaveisTrafegoPago[servicoTrafego];
            }
            // Regra de exclusividade da Landing Page: somente em contratos com recorrência de 12 meses
            const recorrenciaTexto = (dadosContrato.recorrencia || '').toLowerCase();
            const planoDozeMeses = recorrenciaTexto.includes('12');
            if (textoEntregaveisTrafego) {
                if (!planoDozeMeses) {
                    // Remover linhas relacionadas à Landing Page e LP quando não é 12 meses
                    textoEntregaveisTrafego = textoEntregaveisTrafego
                        .split('\n')
                        .filter(l => !/landing\s*page/i.test(l) && !/\bLP\b/i.test(l))
                        .join('\n');
                    textoEntregaveisTrafego += '\nObservação: A Landing Page de alta conversão é exclusiva para contratos com recorrência de 12 meses.';
                } else {
                    // Tornar explícito no texto que a LP é exclusiva para 12 meses
                    textoEntregaveisTrafego = textoEntregaveisTrafego.replace(/(Landing\s*Page[^\n]*)/i, '$1 (exclusivo para 12 meses)');
                }
            }
            // Detalhes de pagamento e formatação condicional
            const formaPag = (dadosContrato.formaPagamento || '').toLowerCase();
            const valorMensalNum = parseFloat(dadosContrato.valorMensal || '0') || 0;
            const valorTotalNum = parseFloat(dadosContrato.valorTotal || '0') || 0;
            const assinaturaDate = new Date(dadosContrato.timestamp);
            function formatBR(v) { return v.toLocaleString('pt-BR', { minimumFractionDigits: 2 }); }
            function addDays(d, days) { const nd = new Date(d); nd.setDate(nd.getDate() + days); return nd; }
            function fmtDate(d) { return d.toLocaleDateString('pt-BR'); }

            const valorMensalFmt = (formaPag.includes('vista') || formaPag.includes('50'))
                ? 'Não se aplica'
                : formatBR(valorMensalNum);

            const detalhePagamento = (() => {
                if (formaPag.includes('50')) {
                    const primeira = (valorTotalNum / 2);
                    const segunda = (valorTotalNum - primeira);
                    const venc1 = fmtDate(addDays(assinaturaDate, 2));
                    const venc2 = fmtDate(addDays(assinaturaDate, 30));
                    return `1ª parcela: R$ ${formatBR(primeira)} (vencimento em ${venc1}) | 2ª parcela: R$ ${formatBR(segunda)} (vencimento em ${venc2}).`;
                }
                if (formaPag.includes('vista')) {
                    return `Pagamento único de R$ ${formatBR(valorTotalNum)}.`;
                }
                // Recorrentes: mantém valor mensal como referência
                return `Mensalidade de R$ ${formatBR(valorMensalNum)} totalizando R$ ${formatBR(valorTotalNum)} no período.`;
            })();

            const mapa = {
                '{{NOME_CLIENTE}}': dadosContrato.nomeCliente || '',
                '{{EMPRESA_CLIENTE}}': dadosContrato.empresaCliente || '',
                '{{CPF_CNPJ}}': dadosContrato.cpfCnpj || '',
                '{{EMAIL_CLIENTE}}': dadosContrato.emailCliente || '',
                '{{TELEFONE_CLIENTE}}': dadosContrato.telefoneCliente || '',
                '{{BLOCO_CONTRATANTE}}': (() => {
                    const nomeOuRazao = (dadosContrato.empresaCliente || dadosContrato.nomeCliente || '').trim();
                    const doc = (dadosContrato.cpfCnpj || '').trim();
                    const end = (dadosContrato.enderecoCliente || '').trim();
                    const representante = (dadosContrato.representanteCliente || dadosContrato.nomeCliente || '').trim();
                    const repCpf = (dadosContrato.cpfRepresentante || '').trim();
                    return `${nomeOuRazao}, pessoa jurídica de direito privado, inscrita sob o CNPJ/CPF nº ${doc}, com sede na ${end}, neste ato por seu representante legal ${representante}${repCpf ? ", CPF nº " + repCpf : ''}.`;
                })(),
                '{{SERVICO_SOCIAL_MIDIA}}': (dadosContrato.servicoSocialMidia || '').toUpperCase(),
                '{{SERVICO_TRAFEGO_PAGO}}': (dadosContrato.servicoTrafegoPago || '').toUpperCase(),
                '{{INVESTIMENTO_MIDIA}}': dadosContrato.investimentoMidia || '',
                '{{RECORRENCIA}}': dadosContrato.recorrencia || '',
                '{{FORMA_PAGAMENTO}}': dadosContrato.formaPagamento || '',
                '{{VALOR_MENSAL}}': valorMensalFmt,
                '{{VALOR_TOTAL}}': parseFloat(dadosContrato.valorTotal || '0').toLocaleString('pt-BR', {minimumFractionDigits: 2}),
                '{{DATA_ASSINATURA}}': new Date(dadosContrato.timestamp).toLocaleString('pt-BR'),
                '{{HASH_ASSINATURA}}': dadosContrato.hashAssinatura || '',
                '{{IP_ASSINATURA}}': dadosContrato.ipAssinatura || '',
                '{{ENTREGAVEIS_SOCIAL_MIDIA}}': textoEntregaveisSocial,
                '{{ENTREGAVEIS_TRAFEGO_PAGO}}': textoEntregaveisTrafego,
                '{{COBRANCA_TRAFEGO_DESCRICAO}}': (() => {
                    // Descrição amigável do modelo de cobrança de tráfego
                    const pct = parseFloat(dadosContrato.percentualComissao || 0) || 0;
                    const fixo = parseFloat(dadosContrato.valorFixoTrafego || 0) || 0;
                    const temComissao = !!dadosContrato.temComissaoVendas;
                    if (!dadosContrato.servicoTrafegoPago || dadosContrato.servicoTrafegoPago === 'nao-se-aplica') return '';
                    if (temComissao && pct > 0 && fixo > 0) return `Híbrido: R$ ${fixo.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês + ${pct}% sobre vendas`;
                    if (temComissao && pct > 0) return `Comissão: ${pct}% sobre vendas`;
                    // Fixo
                    const fixoResumo = parseFloat(dadosContrato.valorTrafegoPago || 0) || fixo;
                    return fixoResumo ? `Fixo: R$ ${fixoResumo.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês` : '';
                })(),
                '{{CLAUSULA_COMISSAO}}': (() => {
                    const pct = parseFloat(dadosContrato.percentualComissao || 0) || 0;
                    const fixo = parseFloat(dadosContrato.valorFixoTrafego || 0) || 0;
                    const temComissao = !!dadosContrato.temComissaoVendas;
                    if (!temComissao || pct <= 0) return '';
                    return `Para o serviço de Tráfego Pago, as partes acordam a remuneração adicional de ${pct}% (por cento) sobre as vendas líquidas atribuídas às campanhas e esforços de mídia geridos pela CONTRATADA. Consideram-se vendas líquidas aquelas efetivamente faturadas, deduzidos cancelamentos, devoluções, estornos e tributos incidentes. O repasse da comissão ocorrerá até o dia 05 (cinco) do mês subsequente ao de competência, mediante relatório de vendas enviado pela CONTRATANTE e conferência da CONTRATADA. A CONTRATADA poderá solicitar evidências razoáveis para auditoria dos números reportados, respeitando-se a confidencialidade dos dados e o acesso limitado às informações estritamente necessárias. ${fixo > 0 ? `Esta comissão é devida cumulativamente ao valor fixo mensal de R$ ${fixo.toLocaleString('pt-BR', {minimumFractionDigits: 2})}.` : ''}`;
                })(),
                '{{MELHOR_DIA_PAGAMENTO}}': (formaPag.includes('50') ? '' : (dadosContrato.melhorDiaPagamento || '').toString()),
                '{{DETALHE_PAGAMENTO}}': detalhePagamento
            };
            let texto = textoTemplate;
            Object.keys(mapa).forEach(k => { texto = texto.replaceAll(k, mapa[k]); });
            // Compatibilidade: substituir marcador textual do IP caso não exista placeholder dedicado
            texto = texto.replace('[será inserido automaticamente]', dadosContrato.ipAssinatura || '');
            // Renderiza o template linha a linha para preservar quebras
            doc.setFontSize(11);
            const linhas = texto.split('\n');
            linhas.forEach(l => {
                const t = l.replace(/\r/g, '');
                if (t.trim() === '') { y += 2; return; }
                
                // Detectar se é um título/cabeçalho (começa com maiúsculas ou CLÁUSULA)
                const ehTitulo = t.match(/^[A-ZÁÉÍÓÚÂÊÔÃÕ\s]{5,}:?$/) || t.match(/^CLÁUSULA/);
                const ehSubtitulo = t.match(/^(CONTRATANTE|CONTRATADO|ASSINATURA ELETRÔNICA|ANEXO):/);
                
                if (ehTitulo || ehSubtitulo) {
                    paragrafo(t, { negrito: true, tamanho: ehTitulo ? 12 : 11 });
                } else {
                    paragrafo(t);
                }
            });
                // Seção de Add-ons selecionados (quando existirem)
                try {
                    const servicosPDF = Array.isArray(window.servicosContratados) ? window.servicosContratados : [];
                    const addonsSel = [];
                    servicosPDF.forEach(s => {
                        const arr = Array.isArray(s.addOnsContratados) ? s.addOnsContratados : [];
                        arr.forEach(a => {
                            const qtd = Math.max(1, a.qtdSelecionada || 1);
                            const unit = a.tipoPreco === 'unitario';
                            const hasPreco = (a.valorUnitario != null) || (a.valor != null);
                            const precoUnit = hasPreco ? (unit ? (parseFloat(a.valorUnitario || 0) || 0) : (parseFloat(a.valor || 0) || 0)) : null;
                            const total = hasPreco ? (unit ? (precoUnit * qtd) : precoUnit) : null;
                            addonsSel.push({ nome: a.nome, qtd, precoUnit, total, descricao: a.descricao || '' });
                        });
                    });
                    if (addonsSel.length) {
                        doc.setFontSize(12); doc.setFont('helvetica','bold');
                        if (y > 250) { doc.addPage(); y = 20; }
                        doc.text('ANEXO — ADD-ONS SELECIONADOS', margemEsq, y); y += 8;
                        doc.setFont('helvetica','normal'); doc.setFontSize(10);
                        addonsSel.forEach(a => {
                            if (a.precoUnit != null && a.total != null) {
                                paragrafo(`• ${a.nome} — ${a.qtd}x R$ ${formatBR(a.precoUnit)} (Total R$ ${formatBR(a.total)})`);
                            } else {
                                paragrafo(`• ${a.nome}${a.descricao ? ' — ' + a.descricao : ''}${a.qtd ? ' (' + a.qtd + 'x)' : ''}`);
                            }
                        });
                    }
                } catch (_) { /* silencioso */ }
            usouTemplate = true;
        }
    } catch (e) {
        console.warn('Não foi possível carregar contrato-template.md, usando fallback. Erro:', e);
    }
    // Inserir seção de Catálogo quando existir (mesmo com template)
    try {
        // Preferir dados vindos do contrato (evita depender de window)
        let catalogo = null;
        const fromDados = dadosContrato && (dadosContrato.catalogoSessoes || dadosContrato.catalogoEntregaveis || dadosContrato.catalogoPlanoNome || dadosContrato.catalogoProdutoNome);
        if (fromDados) {
            catalogo = {
                plano: dadosContrato.catalogoPlanoNome || 'Plano',
                secoes: dadosContrato.catalogoSessoes || null,
                entregaveis: dadosContrato.catalogoEntregaveis || null,
                addOnsContratados: Array.isArray(dadosContrato.catalogoAddons) ? dadosContrato.catalogoAddons : []
            };
        } else {
            const servicosPDF = Array.isArray(window.servicosContratados) ? window.servicosContratados : [];
            catalogo = servicosPDF.find(s => (s?.tipo || '').toLowerCase() === 'catálogo');
        }
        if (catalogo) {
            const titulo = `SERVIÇO DO CATÁLOGO — ${String(catalogo.plano || catalogo.produto || 'Plano').toUpperCase()}`;
            const montarLista = () => {
                let linhas = [];
                if (catalogo.secoes) {
                    if (Array.isArray(catalogo.secoes)) {
                        catalogo.secoes.forEach(sec => {
                            const nome = (sec && (sec.titulo || sec.nome || 'Seção'));
                            const itens = Array.isArray(sec?.itens) ? sec.itens : [];
                            linhas.push(`${nome}:`);
                            itens.forEach(i => { linhas.push(`• ${typeof i === 'string' ? i : (i?.nome || i?.titulo || i?.label || i?.descricao || i?.texto || String(i||''))}`); });
                        });
                    } else if (typeof catalogo.secoes === 'object') {
                        Object.keys(catalogo.secoes).forEach(nome => {
                            const lista = catalogo.secoes[nome];
                            const itens = Array.isArray(lista) ? lista : (Array.isArray(lista?.itens) ? lista.itens : []);
                            linhas.push(`${nome}:`);
                            itens.forEach(i => { linhas.push(`• ${typeof i === 'string' ? i : (i?.nome || i?.titulo || i?.label || i?.descricao || i?.texto || String(i||''))}`); });
                        });
                    }
                } else {
                    const base = Array.isArray(catalogo.entregaveis) ? catalogo.entregaveis : [];
                    base.forEach(i => { linhas.push(`• ${typeof i === 'string' ? i : (i?.nome || i?.titulo || i?.label || i?.descricao || i?.texto || String(i||''))}`); });
                }
                return linhas;
            };
            const linhas = montarLista();
            if (linhas.length) {
                doc.setFontSize(12); doc.setFont('helvetica','bold');
                if (y > 250) { doc.addPage(); y = 20; }
                doc.text(titulo, margemEsq, y); y += 8;
                // Modelo de cobrança
                try {
                    const pctNum = parseFloat(dadosContrato.percentualComissao || dadosContrato.percentual_comissao || 0) || 0;
                    const valorFixo = parseFloat(dadosContrato.valorFixoTrafego || dadosContrato.valor_fixo_trafego || dadosContrato.valorMensal || 0) || 0;
                    const modeloTxt = (function(){
                        const m = (dadosContrato.catalogoModelo || '').toLowerCase();
                        if (m === 'comissao' && pctNum > 0) return `Modelo de cobrança: Comissão ${pctNum}% sobre vendas`;
                        if (m === 'hibrido' && valorFixo > 0 && pctNum > 0) return `Modelo de cobrança: Híbrido — Fixo R$ ${valorFixo.toLocaleString('pt-BR', { minimumFractionDigits:2 })} + ${pctNum}%`;
                        if (m === 'alterado' && valorFixo > 0) return `Modelo de cobrança: Fixo R$ ${valorFixo.toLocaleString('pt-BR', { minimumFractionDigits:2 })}/mês`;
                        if (valorFixo > 0) return `Modelo de cobrança: Fixo R$ ${valorFixo.toLocaleString('pt-BR', { minimumFractionDigits:2 })}/mês`;
                        return '';
                    })();
                    if (modeloTxt) { doc.setFont('helvetica','normal'); doc.setFontSize(10); paragrafo(modeloTxt); }
                } catch(_) {}
                doc.setFont('helvetica','normal'); doc.setFontSize(10);
                linhas.forEach(l => { paragrafo(l); });
                // Add-ons selecionados
                try {
                    const addons = Array.isArray(catalogo.addOnsContratados)
                      ? catalogo.addOnsContratados.filter(a => a && (a.selecionado === undefined || !!a.selecionado))
                      : [];
                    if (addons.length) {
                        doc.setFontSize(11); doc.setFont('helvetica','bold');
                        if (y > 250) { doc.addPage(); y = 20; }
                        doc.text('ADD-ONS SELECIONADOS', margemEsq, y); y += 6;
                        doc.setFont('helvetica','normal'); doc.setFontSize(10);
                        addons.forEach(a => {
                            const unit = (a.tipoPreco === 'unitario');
                            const qtd = Math.max(1, a.qtdSelecionada || 1);
                            const hasPreco = (a.valorUnitario != null) || (a.valor != null);
                            if (hasPreco) {
                                const precoUnit = unit ? (parseFloat(a.valorUnitario || 0) || 0) : (parseFloat(a.valor || 0) || 0);
                                const total = unit ? (precoUnit * qtd) : precoUnit;
                                paragrafo(`• ${a.nome} — ${unit ? `${qtd}× R$ ${precoUnit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : `R$ ${precoUnit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} (Total R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`);
                            } else {
                                paragrafo(`• ${a.nome}${a.descricao ? ' — ' + a.descricao : ''}${qtd ? ' (' + qtd + 'x)' : ''}`);
                            }
                        });
                    }
                } catch(_) {}
            }
        }
    } catch(_) { /* silencioso */ }
    if (!usouTemplate) {
        // Fallback: renderiza cabeçalho, partes e cláusulas resumidas
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', margemEsq, y); y += 10;
        doc.setFontSize(16);
        doc.text('HEAT DIGITAL', margemEsq, y); y += 15;
        // Dados das partes
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('CONTRATANTE:', margemEsq, y); y += 7;
        doc.setFont('helvetica', 'normal');
        paragrafo(`Nome/Razão Social: ${dadosContrato.nomeCliente}`);
        paragrafo(`Empresa: ${dadosContrato.empresaCliente}`);
        paragrafo(`CPF/CNPJ: ${dadosContrato.cpfCnpj}`);
        paragrafo(`E-mail: ${dadosContrato.emailCliente}`);
        if (dadosContrato.telefoneCliente) paragrafo(`Telefone: ${dadosContrato.telefoneCliente}`);
        y += 4;
        doc.setFont('helvetica', 'bold');
        doc.text('CONTRATADA:', margemEsq, y); y += 7;
        doc.setFont('helvetica', 'normal');
        paragrafo('Heat Digital - Marketing e Publicidade');
        paragrafo('CNPJ: XX.XXX.XXX/XXXX-XX');
        y += 4;
        // Texto padrão
        doc.setFont('helvetica', 'bold');
        doc.text('OBJETO DO CONTRATO:', margemEsq, y); y += 7;
        doc.setFont('helvetica', 'normal');
        paragrafo('Prestação de serviços de marketing digital, incluindo gestão de redes sociais e/ou tráfego pago, conforme especificações detalhadas abaixo.');
        doc.setFont('helvetica', 'bold');
        doc.text('SERVIÇOS CONTRATADOS:', margemEsq, y); y += 7;
        doc.setFont('helvetica', 'normal');
        if (dadosContrato.servicoSocialMidia && dadosContrato.servicoSocialMidia !== 'nao-se-aplica') paragrafo(`• Social Media - Plano: ${dadosContrato.servicoSocialMidia.toUpperCase()}`);
        if (dadosContrato.servicoTrafegoPago && dadosContrato.servicoTrafegoPago !== 'nao-se-aplica') {
            paragrafo(`• Tráfego Pago - Plano: ${dadosContrato.servicoTrafegoPago.toUpperCase()}`);
            if (dadosContrato.investimentoMidia) paragrafo(`  Investimento em Mídia: ${dadosContrato.investimentoMidia}`);
        }
        doc.setFont('helvetica', 'bold');
        doc.text('VALORES E CONDIÇÕES:', margemEsq, y); y += 7;
        doc.setFont('helvetica', 'normal');
        paragrafo(`Valor Mensal: R$ ${parseFloat(dadosContrato.valorMensal).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
        paragrafo(`Recorrência: ${dadosContrato.recorrencia}`);
        paragrafo(`Forma de Pagamento: ${dadosContrato.formaPagamento}`);
        paragrafo(`Valor Total do Período: R$ ${parseFloat(dadosContrato.valorTotal).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
        doc.setFont('helvetica', 'bold');
        doc.text('CLÁUSULAS CONTRATUAIS:', margemEsq, y); y += 7;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
        const clausulas = [
            '1. VIGÊNCIA: O presente contrato terá vigência conforme recorrência escolhida, renovável automaticamente.',
            '2. PAGAMENTO: Os pagamentos deverão ser realizados conforme forma escolhida, com vencimento até o dia 05 de cada mês.',
            '3. RESCISÃO: Qualquer das partes poderá rescindir o contrato mediante aviso prévio de 30 dias.',
            '4. CONFIDENCIALIDADE: Ambas as partes se comprometem a manter sigilo sobre informações confidenciais.',
            '5. PROPRIEDADE INTELECTUAL: Todo material criado permanecerá como propriedade do contratante após quitação.'
        ];
        clausulas.forEach(c => paragrafo(c));
    }
    // Assinatura digital: apenas quando usando fallback (o template já contém esta seção)
    if (!usouTemplate) {
        doc.setFont('helvetica','bold'); doc.setFontSize(12);
        if (y > 250) { doc.addPage(); y = 20; }
        doc.text('ASSINATURA DIGITAL:', margemEsq, y); y += 7;
        doc.setFont('helvetica','normal'); doc.setFontSize(10);
        paragrafo(`Data e hora: ${new Date(dadosContrato.timestamp).toLocaleString('pt-BR')}`);
        paragrafo(`IP de origem: ${dadosContrato.ipAssinatura}`);
        paragrafo(`Aceite confirmado por: ${dadosContrato.nomeCliente}`);
        paragrafo(`CPF/CNPJ: ${dadosContrato.cpfCnpj}`);
        paragrafo(`Hash de verificação: ${dadosContrato.hashAssinatura}`);
        doc.setFontSize(9); doc.setTextColor(100);
        paragrafo('Este documento possui validade jurídica por meio de assinatura eletrônica, conforme MP 2.200-2/2001 e Lei 14.063/2020.');
        doc.setTextColor(0);
    }
    // Anexo/Resumo: só adicionar no fallback; o template já contém seção de anexo contratual
    if (!usouTemplate) {
        doc.setTextColor(0); doc.setFontSize(12); doc.setFont('helvetica','bold');
        if (y > 250) { doc.addPage(); y = 20; }
        doc.text('ANEXO I — RESUMO DA PROPOSTA', margemEsq, y); y += 8;
        doc.setFont('helvetica','normal');
        if (dadosContrato.servicoSocialMidia && dadosContrato.servicoSocialMidia !== 'nao-se-aplica') paragrafo(`• Social Media — Plano ${dadosContrato.servicoSocialMidia.toUpperCase()}`);
        if (dadosContrato.servicoTrafegoPago && dadosContrato.servicoTrafegoPago !== 'nao-se-aplica') paragrafo(`• Tráfego Pago — Plano ${dadosContrato.servicoTrafegoPago.toUpperCase()}`);
        paragrafo(`Recorrência: ${dadosContrato.recorrencia} | Pagamento: ${dadosContrato.formaPagamento}`);
        paragrafo(`Valores: Mensal ${parseFloat(dadosContrato.valorMensal).toLocaleString('pt-BR', {minimumFractionDigits: 2})} | Total ${parseFloat(dadosContrato.valorTotal).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`);
        // Listar Add-ons selecionados
        try {
            const servicosPDF = Array.isArray(window.servicosContratados) ? window.servicosContratados : [];
            const addonsSel = [];
            servicosPDF.forEach(s => {
                const arr = Array.isArray(s.addOnsContratados) ? s.addOnsContratados : [];
                arr.forEach(a => {
                    const qtd = Math.max(1, a.qtdSelecionada || 1);
                    const unit = a.tipoPreco === 'unitario';
                    const precoUnit = unit ? (parseFloat(a.valorUnitario || 0) || 0) : (parseFloat(a.valor || 0) || 0);
                    const total = unit ? (precoUnit * qtd) : precoUnit;
                    addonsSel.push({ nome: a.nome, qtd, precoUnit, total });
                });
            });
            if (addonsSel.length) {
                doc.setFont('helvetica','bold'); doc.setFontSize(12);
                if (y > 250) { doc.addPage(); y = 20; }
                doc.text('ADD-ONS SELECIONADOS:', margemEsq, y); y += 7;
                doc.setFont('helvetica','normal'); doc.setFontSize(10);
                addonsSel.forEach(a => {
                    paragrafo(`• ${a.nome} — ${a.qtd}x R$ ${formatBR(a.precoUnit)} (Total R$ ${formatBR(a.total)})`);
                });
            }
        } catch (_) { /* silencioso */ }
    }
    return doc.output('blob');
}
// Salvar dados do representante diretamente em propostas_criadas.representante_cliente
async function salvarDadosRepresentante(dados) {
    const client = initSupabase();
    let propostaCriadaId = dados.propostaCriadaId || null;
    try {
        if (!propostaCriadaId && typeof window !== 'undefined' && window.location) {
            const params = new URLSearchParams(window.location.search);
            propostaCriadaId = params.get('id') || null;
        }
    } catch (_) { /* ignora parse de URL */ }
    if (!propostaCriadaId) {
        const err = new Error('ID da proposta criada ausente. Abra a visualização com ?id=<proposta_criada_id> ou forneça propostaCriadaId.');
        console.error('Erro ao salvar representante:', err);
        throw err;
    }

    const nome = (dados.nome || '').trim();
    const sobrenome = (dados.sobrenome || '').trim();
    const nomeCompleto = [nome, sobrenome].filter(Boolean).join(' ').trim();

    const { data, error } = await client
        .from('propostas_criadas')
        .update({ representante_cliente: nomeCompleto || null })
        .eq('id', propostaCriadaId)
        .select('id, representante_cliente')
        .maybeSingle();

    if (error) {
        console.error('Erro ao salvar representante em propostas_criadas:', error);
        throw error;
    }
    console.log('✅ Representante atualizado em propostas_criadas:', data);
    return { ok: true, id: data?.id, representante: data?.representante_cliente || null };
}

// Checa se a proposta já foi assinada para bloquear reassinatura
async function checarBloqueioReassinatura(propostaCriadaId) {
    const client = initSupabase();
    // Fallback: tentar obter o ID da URL se não foi passado
    if (!propostaCriadaId) {
        try {
            const params = new URLSearchParams(window.location.search);
            propostaCriadaId = params.get('id') || propostaCriadaId;
        } catch (_) {
            // Ignorar erros de URLSearchParams
        }
    }

    // Se ainda não houver ID, não é possível bloquear com segurança
    if (!propostaCriadaId) {
        return { bloqueada: false, status: 'desconhecido' };
    }

    // Checar status em propostas_criadas
    const { data, error } = await client
        .from('propostas_criadas')
        .select('id,status,aceita_em')
        .eq('id', propostaCriadaId)
        .limit(1)
        .maybeSingle();
    if (error) throw error;
    const status = data?.status || 'pendente';
    const aceitaEm = data?.aceita_em || null;
    if (status === 'aceita' || !!aceitaEm) {
        return { bloqueada: true, status };
    }

    // Verificação adicional: contrato já gerado?
    // Se houver qualquer registro em `proposta_contratos` com `proposta_criada_id`, bloquear reassinatura.
    const { count, error: countError } = await client
        .from('proposta_contratos')
        .select('id', { count: 'exact', head: true })
        .eq('proposta_criada_id', propostaCriadaId);
    if ((count || 0) > 0 && !countError) {
        return { bloqueada: true, status: 'aceita' };
    }

    return { bloqueada: false, status };
}
// Exportar funções
window.supabaseConfig = {
    initSupabase,
    salvarPropostaAceita,
    gerarEArmazenarContrato,
    gerarHashAssinatura,
    gerarPDFContrato,
    salvarDadosRepresentante,
    checarBloqueioReassinatura
};
