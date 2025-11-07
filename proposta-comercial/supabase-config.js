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
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.supabase = supabase; // Expor globalmente também
        console.log('✅ Supabase inicializado');
    }
    return supabase;
}

// Função para salvar proposta aceita no Supabase
async function salvarPropostaAceita(dadosProposta) {
    try {
        const supabase = initSupabase();
        
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
        
        const { data, error } = await supabase
            .from('propostas')
            .insert({
                nome_cliente: dadosProposta.nomeCliente,
                empresa_cliente: dadosProposta.empresaCliente,
                email_cliente: dadosProposta.emailCliente,
                telefone_cliente: dadosProposta.telefoneCliente || '',
                cpf_cnpj: dadosProposta.cpfCnpj,
                servico_social_midia: dadosProposta.servicoSocialMidia,
                servico_trafego_pago: dadosProposta.servicoTrafegoPago,
                valor_social_midia: parseFloat(dadosProposta.valorSocialMidia || 0),
                valor_trafego_pago: parseFloat(dadosProposta.valorTrafegoPago || 0),
                tem_comissao_vendas: !!dadosProposta.temComissaoVendas,
                percentual_comissao: parseFloat(dadosProposta.percentualComissao || 0),
                valor_fixo_trafego: parseFloat(dadosProposta.valorFixoTrafego || 0),
                investimento_midia: dadosProposta.investimentoMidia || '',
                recorrencia: dadosProposta.recorrencia,
                forma_pagamento: dadosProposta.formaPagamento,
                valor_mensal: parseFloat(dadosProposta.valorMensal),
                valor_total: parseFloat(dadosProposta.valorTotal),
                desconto_aplicado: parseFloat(dadosProposta.descontoAplicado || 0),
                observacoes: dadosProposta.observacoes || '',
                status: 'aceita',
                aceita_em: new Date().toISOString(),
                ip_cliente: ip,
                user_agent: navigator.userAgent,
                proposta_criada_id: dadosProposta.propostaCriadaId || null,
                endereco_cliente: dadosProposta.enderecoCliente || '',
                representante_cliente: dadosProposta.representanteLegalCliente || ''
            })
            // Seleciona apenas o id para minimizar necessidade de SELECT amplo
            .select('id')
            .single();
        
        if (error) {
            console.error('❌ Erro ao salvar proposta:', error);
            throw error;
        }
        
    console.log('✅ Proposta salva com sucesso:', data);
    return data; // já é single()
    } catch (error) {
        console.error('❌ Erro ao salvar proposta:', error);
        throw error;
    }
}

// Função para gerar e armazenar contrato em PDF no Supabase Storage
async function gerarEArmazenarContrato(propostaId, dadosContrato) {
    try {
        const supabase = initSupabase();
        
        // Gerar PDF do contrato
        const pdfBlob = await gerarPDFContrato(dadosContrato);
        
        // Nome único para o arquivo
        const nomeArquivo = `contrato-${propostaId}-${Date.now()}.pdf`;
        
        // Upload para Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('contratos')
            .upload(nomeArquivo, pdfBlob, {
                contentType: 'application/pdf',
                cacheControl: '3600',
                upsert: false
            });
        
        if (uploadError) {
            console.error('❌ Erro ao fazer upload do PDF:', uploadError);
            throw uploadError;
        }
        
        // Obter URL pública do PDF
        const { data: urlData } = supabase.storage
            .from('contratos')
            .getPublicUrl(nomeArquivo);
        
        // Salvar registro do contrato na tabela
        const { data: contratoData, error: contratoError } = await supabase
            .from('contratos')
            .insert({
                proposta_id: propostaId,
                pdf_url: urlData.publicUrl,
                assinatura_digital: gerarHashAssinatura(dadosContrato),
                ip_assinatura: dadosContrato.ipAssinatura,
                timestamp_assinatura: new Date().toISOString()
            })
            .select();
        
        if (contratoError) {
            console.error('❌ Erro ao salvar contrato:', contratoError);
            throw contratoError;
        }
        
        console.log('✅ Contrato gerado e armazenado:', contratoData);
        return {
            contratoId: contratoData[0].id,
            pdfUrl: urlData.publicUrl
        };
    } catch (error) {
        console.error('❌ Erro ao gerar e armazenar contrato:', error);
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
                    return `${nomeOuRazao}, pessoa jurídica de direito privado, inscrita sob o CNPJ/CPF nº ${doc}, com sede na ${end}, neste ato por seu representante legal ${representante}.`;
                })(),
                '{{SERVICO_SOCIAL_MIDIA}}': (dadosContrato.servicoSocialMidia || '').toUpperCase(),
                '{{SERVICO_TRAFEGO_PAGO}}': (dadosContrato.servicoTrafegoPago || '').toUpperCase(),
                '{{INVESTIMENTO_MIDIA}}': dadosContrato.investimentoMidia || '',
                '{{RECORRENCIA}}': dadosContrato.recorrencia || '',
                '{{FORMA_PAGAMENTO}}': dadosContrato.formaPagamento || '',
                '{{VALOR_MENSAL}}': parseFloat(dadosContrato.valorMensal || '0').toLocaleString('pt-BR', {minimumFractionDigits: 2}),
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
                })()
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
            usouTemplate = true;
        }
    } catch (e) {
        console.warn('Não foi possível carregar contrato-template.md, usando fallback. Erro:', e);
    }

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
    }

    return doc.output('blob');
}

// Exportar funções
window.supabaseConfig = {
    initSupabase,
    salvarPropostaAceita,
    gerarEArmazenarContrato,
    gerarHashAssinatura,
    gerarPDFContrato
};
