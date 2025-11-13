// Clientes: CRUD básico e vinculação às propostas por CPF/CNPJ
(function(){
  let supabase;
  let listaClientes = [];
  let mapaPropostas = {};
  let lastAddedId = null;
  let searchDebounce = null;
  async function init() {
    if (!window.supabaseConfig) {
      alert('supabase-config.js não foi carregado.');
      return;
    }
    supabase = window.supabaseConfig.initSupabase();
    // Verificar autenticação
    let user = null;
    try {
      const { data } = await supabase.auth.getUser();
      user = data?.user || null;
    } catch (e) {
      console.warn('Falha ao obter usuário autenticado:', e);
    }

    wireForm();
    if (!user) {
      const tbody = document.getElementById('clientesTabela');
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="7" class="muted">É necessário estar logado para listar clientes. <a href="login.html?redirect=clientes.html">Fazer login</a></td></tr>';
      }
      return;
    }
    listarClientes();
  }

  function wireForm() {
    const docInput = document.getElementById('docCliente');
    const tipoRadios = Array.from(document.querySelectorAll('input[name="tipoDocumento"]'));
    const feedback = document.getElementById('feedbackDoc');
    const nomeGroup = document.getElementById('nomeGroup');
    const empresaGroup = document.getElementById('empresaGroup');
    const cnpjActions = document.getElementById('cnpjActions');
    const btnBuscar = document.getElementById('btnBuscarCNPJCliente');
    const btnSalvar = document.getElementById('btnSalvarCliente');
    const btnLimpar = document.getElementById('btnLimparCliente');
    const buscaInput = document.getElementById('clientesBusca');

    tipoRadios.forEach(r => r.addEventListener('change', () => {
      const tipo = getTipo();
      if (tipo === 'cnpj') {
        nomeGroup.style.display = 'none';
        if (empresaGroup) empresaGroup.style.display = '';
        cnpjActions.style.display = 'block';
      } else {
        nomeGroup.style.display = '';
        if (empresaGroup) empresaGroup.style.display = 'none';
        cnpjActions.style.display = 'none';
      }
      docInput.value = '';
      feedback.textContent = '';
      if (docInput) {
        docInput.placeholder = tipo === 'cnpj' ? '00.000.000/0000-00' : '000.000.000-00';
        docInput.maxLength = tipo === 'cnpj' ? 18 : 14;
      }
    }));

    // Estado inicial
    if (empresaGroup) empresaGroup.style.display = getTipo() === 'cnpj' ? '' : 'none';
    if (docInput) {
      const tipoInit = getTipo();
      docInput.placeholder = tipoInit === 'cnpj' ? '00.000.000/0000-00' : '000.000.000-00';
      docInput.maxLength = tipoInit === 'cnpj' ? 18 : 14;
    }

    if (docInput) {
      docInput.addEventListener('input', function(){
        if (window.validacaoCPFCNPJ) window.validacaoCPFCNPJ.aplicarMascaraCPFouCNPJ(this);
      });
      docInput.addEventListener('blur', function(){
        if (window.validacaoCPFCNPJ) window.validacaoCPFCNPJ.validarCPFouCNPJComFeedback(this, feedback);
        // auto buscar se for CNPJ
        const digits = this.value.replace(/\D/g,'');
        if (digits.length === 14 && getTipo() === 'cnpj') buscarCNPJCliente();
      });
    }

    if (btnBuscar) btnBuscar.addEventListener('click', buscarCNPJCliente);
    if (btnSalvar) btnSalvar.addEventListener('click', salvarCliente);
    if (btnLimpar) btnLimpar.addEventListener('click', limparForm);

    // Busca com debounce
    if (buscaInput) {
      buscaInput.addEventListener('input', function(){
        const termo = this.value || '';
        if (searchDebounce) clearTimeout(searchDebounce);
        searchDebounce = setTimeout(() => renderClientes(termo), 300);
      });
    }
  }

  function getTipo() {
    const el = document.querySelector('input[name="tipoDocumento"]:checked');
    return el ? el.value : 'cpf';
  }

  async function buscarCNPJCliente() {
    const raw = document.getElementById('docCliente')?.value || '';
    const digits = raw.replace(/\D/g, '');
    if (digits.length !== 14) { alert('Informe um CNPJ válido (14 dígitos) para buscar.'); return; }
    const loadingEl = document.getElementById('cnpjLoadingCliente');
    const resultBox = document.getElementById('cnpjResultadoCliente');
    const empresaInput = document.getElementById('empresaClienteCadastro');
    const endInput = document.getElementById('enderecoClienteCadastro');
    const telefoneInput = document.getElementById('telefoneClienteCadastro');
    const emailInput = document.getElementById('emailClienteCadastro');
    loadingEl.style.display = 'inline';
    resultBox.style.display = 'none';
    try {
      const resp = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`, { cache: 'no-store' });
      if (!resp.ok) throw new Error('CNPJ não encontrado');
      const d = await resp.json();
      const razao = d.razao_social || d.nome || '';
      const fantasia = d.nome_fantasia || '';
      const endereco = [d.logradouro, d.numero, d.complemento, d.bairro, d.municipio, d.uf, d.cep ? `CEP ${d.cep}` : ''].filter(Boolean).join(', ');
      const telefone = d.ddd_telefone_1 || d.telefone || '';
      const email = d.email || '';
      empresaInput.value = fantasia || razao || '';
      endInput.value = endereco || '';
      telefoneInput.value = telefone;
      emailInput.value = email;
      resultBox.textContent = `${razao || '—'} • ${fantasia || '—'} • ${endereco || '—'}`;
      resultBox.style.display = 'block';
      const fb = document.getElementById('feedbackDoc');
      if (fb) { fb.textContent = 'CNPJ válido — dados preenchidos automaticamente'; fb.classList.remove('small-error'); fb.classList.add('small-success'); }
    } catch (e) {
      alert('Não foi possível buscar o CNPJ. Verifique o número e tente novamente.');
      resultBox.style.display = 'none';
    } finally {
      loadingEl.style.display = 'none';
    }
  }

  function showToast(msg, tipo='info') {
    const el = document.getElementById('toast');
    if (!el) { console.log(msg); return; }
    el.textContent = msg;
    el.style.borderColor = tipo === 'error' ? '#7a2b2b' : '#333';
    el.style.display = 'block';
    setTimeout(()=>{ el.style.display = 'none'; }, 2800);
  }

  async function salvarCliente() {
    try {
      const tipo = getTipo();
      const documentoRaw = document.getElementById('docCliente').value.trim();
      const documento = documentoRaw.replace(/\D/g, '');
      const nome = document.getElementById('nomeCliente').value.trim();
      const empresa = document.getElementById('empresaClienteCadastro').value.trim();
      const endereco = document.getElementById('enderecoClienteCadastro').value.trim();
      const email = document.getElementById('emailClienteCadastro').value.trim();
      const telefone = document.getElementById('telefoneClienteCadastro').value.trim();

      const docEl = document.getElementById('docCliente');
      const nomeEl = document.getElementById('nomeCliente');
      if (!documento) { if (docEl){ docEl.classList.add('input-error'); } showToast('Documento obrigatório. Informe CPF/CNPJ.', 'error'); return; }
      if (tipo === 'cpf' && !nome) { if (nomeEl){ nomeEl.classList.add('input-error'); } showToast('Nome é obrigatório para CPF.', 'error'); return; }

      const payload = {
        tipo_documento: tipo,
        documento: documento,
        nome: nome || null,
        empresa: empresa || null,
        endereco: endereco || null,
        email: email || null,
        telefone: telefone || null
      };

      const btnSalvar = document.getElementById('btnSalvarCliente');
      const originalText = btnSalvar ? btnSalvar.textContent : '';
      if (btnSalvar) { btnSalvar.disabled = true; btnSalvar.textContent = 'Salvando…'; }

      // upsert por documento
      const { data, error } = await supabase
        .from('clientes')
        .upsert(payload, { onConflict: 'documento' })
        .select('id')
        .single();
      if (error) throw error;

      lastAddedId = data?.id || null;
      showToast('🎉 Cliente cadastrado com sucesso e pronto para uso no gerador!');
      limparForm();
      listarClientes();
      if (btnSalvar) { btnSalvar.disabled = false; btnSalvar.textContent = originalText; }
    } catch (e) {
      console.error(e);
      showToast('❌ Erro ao salvar cliente: ' + (e.message || e), 'error');
      const btnSalvar = document.getElementById('btnSalvarCliente');
      if (btnSalvar) { btnSalvar.disabled = false; btnSalvar.textContent = 'Salvar Cliente'; }
    }
  }

  function limparForm() {
    ['docCliente','nomeCliente','empresaClienteCadastro','enderecoClienteCadastro','emailClienteCadastro','telefoneClienteCadastro'].forEach(id => {
      const el = document.getElementById(id); if (el) el.value = '';
    });
    const box = document.getElementById('cnpjResultadoCliente');
    if (box) box.style.display = 'none';
  }

  async function listarClientes() {
    const tbody = document.getElementById('clientesTabela');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7" class="muted">Carregando clientes…</td></tr>';
    try {
      const { data: clientes, error } = await supabase
        .from('clientes')
        .select('id, tipo_documento, documento, nome, empresa, email, telefone, endereco, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Buscar propostas e agregar contagens por cpf_cnpj e status em JS
      const { data: propostas, error: errProps } = await supabase
        .from('propostas_criadas')
        .select('cpf_cnpj, status');
      if (errProps) console.warn('Falha ao obter propostas para contagem:', errProps);

      mapaPropostas = {};
      (propostas || []).forEach(p => {
        const k = (p.cpf_cnpj || '').replace(/\D/g, '');
        if (!k) return;
        const s = p.status || 'pendente';
        mapaPropostas[k] = mapaPropostas[k] || {};
        mapaPropostas[k][s] = (mapaPropostas[k][s] || 0) + 1;
      });
      listaClientes = clientes || [];
      renderClientes(document.getElementById('clientesBusca')?.value || '');
      const resumoEl = document.getElementById('clientesResumo');
      if (resumoEl) resumoEl.textContent = `${listaClientes.length} clientes ativos`;
    } catch (e) {
      console.error(e);
      tbody.innerHTML = '<tr><td colspan="7" class="muted">Erro ao carregar clientes.</td></tr>';
    }
  }

  function renderClientes(termo) {
    const tbody = document.getElementById('clientesTabela');
    if (!tbody) return;
    const t = (termo || '').toLowerCase();
    const filtrados = listaClientes.filter(c => {
      const doc = (c.documento || '').toLowerCase();
      const nome = (c.nome || '').toLowerCase();
      const emp = (c.empresa || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      return !t || doc.includes(t) || nome.includes(t) || emp.includes(t) || email.includes(t);
    });
    const rows = filtrados.map(c => {
      const docFmt = formatarDocumento(c.documento, c.tipo_documento);
      const nomeOuEmpresa = c.tipo_documento === 'cpf' ? (c.nome || '—') : (c.empresa || '—');
      const props = mapaPropostas[c.documento] || {};
      const total = Object.values(props).reduce((a,b)=>a+b,0) || 0;
      const statusResumo = Object.keys(props).map(s => `<span class="pill pill-status-${s}">${s} 📄 ${props[s]}</span>`).join(' ');
      const highlight = (lastAddedId && c.id === lastAddedId) ? ' class="row-highlight"' : '';
      return `<tr${highlight}>
        <td>${nomeOuEmpresa}</td>
        <td>${docFmt}</td>
        <td>${c.empresa || '—'}</td>
        <td>${c.email || '—'}</td>
        <td>${c.telefone || '—'}</td>
        <td><strong>${total}</strong><div class="status">${statusResumo || '—'}</div></td>
        <td><a href="proposta-gerador.html" class="btn btn-action" title="Importar dados deste cliente para o Gerador de Propostas" style="padding:6px 10px; display:inline-block;">⚡ Usar no Gerador</a></td>
      </tr>`;
    }).join('');
    tbody.innerHTML = rows || '<tr><td colspan="7" class="muted">Nenhum cliente encontrado.</td></tr>';
  }

  function formatarDocumento(doc, tipo) {
    const digits = (doc || '').replace(/\D/g, '');
    if (tipo === 'cnpj' && digits.length === 14) {
      return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    if (tipo === 'cpf' && digits.length === 11) {
      return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return doc || '—';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();