// Página Produtos: renderiza tabela de produtos e expande planos

(function(){
  const $ = (sel) => document.querySelector(sel);
  const tbody = $('#produtosTbody');
  let supabaseClient = null;
  const statusEl = $('#supabaseStatus');
  const statusDot = $('#supabaseStatusDot');
  const statusText = $('#supabaseStatusText');
  const actionEl = $('#actionStatus');
  const actionDot = $('#actionStatusDot');
  const actionText = $('#actionStatusText');

  function showAction(kind, message, autohideMs = 3000) {
    if (!actionEl || !actionDot || !actionText) return;
    const colors = {
      info: '#3498db',
      success: '#2ecc71',
      error: '#ff5252',
    };
    actionDot.style.background = colors[kind] || '#888';
    actionText.textContent = message || '';
    actionEl.style.display = 'inline-flex';
    if (autohideMs > 0) {
      clearTimeout(actionEl.__hideTimer);
      actionEl.__hideTimer = setTimeout(() => {
        actionEl.style.display = 'none';
      }, autohideMs);
    }
  }

  function setStatus(connected, from, counts) {
    if (!statusEl) return;
    statusDot.style.background = connected ? '#2ecc71' : '#ff5252';
    const cnt = counts !== undefined ? ` (${counts} item${counts===1?'':'s'})` : '';
    statusText.textContent = connected ? `Conectado ao Supabase${cnt}` : `Supabase indisponível`;
  }

  async function loadProdutosSupabase() {
    try {
      // Inicializa client via supabase-config
      const getClient = () => {
        try {
          if (window.supabaseConfig && typeof window.supabaseConfig.initSupabase === 'function') {
            return window.supabaseConfig.initSupabase();
          }
          if (typeof window.initSupabase === 'function') return window.initSupabase();
          if (window.supabase && typeof window.supabase.from === 'function') return window.supabase;
          return null;
        } catch(e){ return null; }
      };
      supabaseClient = getClient();
      if (!supabaseClient) return null;
      const { data, error } = await supabaseClient
        .from('produtos')
        .select('id, nome, produto_planos(id, nome, valor)');
      if (error) {
        console.warn('Supabase: erro ao listar produtos.', error);
        setStatus(false, 'supabase');
        return null;
      }
      const produtos = (data || []).map(p => ({
        id: p.id,
        nome: p.nome,
        planos: (p.produto_planos || []).map(pl => ({ id: pl.id, nome: pl.nome, valor: pl.valor }))
      }));
      setStatus(true, 'supabase', produtos.length);
      return produtos;
    } catch (e) {
      console.warn('Supabase: exceção ao carregar produtos.', e);
      setStatus(false, 'supabase');
      return null;
    }
  }

  function renderTabela(produtos) {
    tbody.innerHTML = '';
    produtos.forEach((p, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.nome}</td>
        <td>${(p.planos||[]).length}</td>
        <td>
          <button class="btn small btn-expand" data-index="${idx}" aria-expanded="false" aria-controls="prod-details-${idx}">+</button>
          <button class="btn secondary small btn-edit" data-id="${p.id || ''}" ${p.id?'':'disabled'} aria-label="Editar" title="Editar">✏️</button>
          <button class="btn secondary small btn-delete" data-id="${p.id || ''}" ${p.id?'':'disabled'}>Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);

      const detailTr = document.createElement('tr');
      detailTr.className = 'details';
      detailTr.id = `prod-details-${idx}`;
      detailTr.style.display = 'none';
      const planosRows = (p.planos||[]).map(pl => `<tr><td>${pl.nome}</td><td style="text-align:right;">R$ ${pl.valor}</td></tr>`).join('');
      detailTr.innerHTML = `
        <td colspan="3">
          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr>
                <th style="text-align:left; padding:6px 8px; color:#cfcfcf; border-bottom:1px solid #222;">Nome do Plano</th>
                <th style="text-align:right; padding:6px 8px; color:#cfcfcf; border-bottom:1px solid #222;">Valor (R$)</th>
              </tr>
            </thead>
            <tbody>${planosRows || '<tr><td colspan="2" style="padding:6px 8px; color:#888;">Sem planos cadastrados.</td></tr>'}</tbody>
          </table>
        </td>
      `;
      tbody.appendChild(detailTr);
    });

    tbody.querySelectorAll('.btn-expand').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        const detail = $('#prod-details-' + idx);
        const isOpen = detail.style.display !== 'none';
        detail.style.display = isOpen ? 'none' : 'table-row';
        btn.textContent = isOpen ? '+' : '–';
        btn.setAttribute('aria-expanded', (!isOpen).toString());
      });
    });

    tbody.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (!id) { alert('Produto sem ID do Supabase.'); return; }
        window.location.href = 'produto-cadastro.html?id=' + encodeURIComponent(id);
      });
    });

    tbody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id || null;
        openDeleteModal(id);
      });
    });
  }

  // Navegação
  const btnCadastrar = $('#btnCadastrar');
  if (btnCadastrar) {
    btnCadastrar.addEventListener('click', () => {
      window.location.href = 'produto-cadastro.html';
    });
  }

  // Persistência e exclusão
  function saveProdutos(list) {
    try { localStorage.setItem('produtos', JSON.stringify(list)); } catch(e) { console.warn('Falha ao salvar produtos.', e); }
  }

  const modal = document.querySelector('#deleteModal');
  const btnDeleteConfirm = document.querySelector('#btnDeleteConfirm');
  const btnDeleteCancel = document.querySelector('#btnDeleteCancel');
  let deleteId = null;

  function openDeleteModal(id) {
    deleteId = id || null;
    modal && modal.classList.add('show');
  }
  function closeDeleteModal() {
    deleteId = null;
    modal && modal.classList.remove('show');
  }

  if (btnDeleteCancel) {
    btnDeleteCancel.addEventListener('click', () => closeDeleteModal());
  }
  if (btnDeleteConfirm) {
    btnDeleteConfirm.addEventListener('click', async () => {
      if (!deleteId || !supabaseClient) {
        showAction('error', 'Supabase indisponível ou ID ausente.');
        closeDeleteModal();
        return;
      }
      try {
        showAction('info', 'Iniciada exclusão');
        closeDeleteModal();
        await supabaseClient.from('produto_planos').delete().eq('produto_id', deleteId);
        await supabaseClient.from('produtos').delete().eq('id', deleteId);
        const produtosSb = await loadProdutosSupabase();
        if (Array.isArray(produtosSb)) {
          renderTabela(produtosSb);
        }
        showAction('success', 'Excluído');
      } catch (e) {
        console.warn('Supabase: falha ao excluir produto.', e);
        showAction('error', 'Falha ao excluir no Supabase.');
      }
    });
  }

  // Inicialização
  (async () => {
    const sbData = await loadProdutosSupabase();
    if (Array.isArray(sbData)) {
      renderTabela(sbData);
      if (sbData.length === 0) {
        const hint = document.createElement('p');
        hint.className = 'hint';
        hint.textContent = 'Supabase conectado, porém nenhum produto cadastrado. Cadastre um produto.';
        tbody.parentElement.appendChild(hint);
      }
    } else {
      renderTabela([]);
      const hint = document.createElement('p');
      hint.className = 'hint';
      hint.textContent = 'Erro ao conectar ao Supabase. Os dados locais foram removidos.';
      tbody.parentElement.appendChild(hint);
    }
  })();
})();