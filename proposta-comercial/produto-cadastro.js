// Cadastro de Produto - renderização dinâmica de planos e sessões
(function(){
  const $ = (sel) => document.querySelector(sel);
  const planosContainer = $('#planosContainer');
  const qtdeSel = $('#prodPlanosQtde');
  const tipoGroup = document.getElementById('prodTipo');
  const addonsSection = document.getElementById('addonsSection');
  const addonsContainer = document.getElementById('addonsContainer');
  const btnAddAddon = document.getElementById('btnAddAddon');
  const planosHeader = document.getElementById('planosHeader');
  const planosQtdeField = document.getElementById('planosQtdeField');
  let itemIdSeq = 0;
  const urlParams = (function(){ try { return new URLSearchParams(window.location.search); } catch(e) { return null; } })();
  const editingId = urlParams ? urlParams.get('id') : null; // Supabase ID
  // Removido suporte a índice local: tabela usa apenas Supabase

  function collectPlanData(card) {
    const nomePlano = card.querySelector('.plan-nome')?.value?.trim() || '';
    const valorPlano = card.querySelector('.valor-plano')?.value || '';
    const infoPlano = card.querySelector('.texto-plano')?.value?.trim() || '';
    const sessoes = Array.from(card.querySelectorAll('.sessao')).map(sessao => {
      const titulo = sessao.querySelector('.sessao-titulo')?.value?.trim() || '';
      const itens = Array.from(sessao.querySelectorAll('.item-row .item-text'))
        .map(inp => inp.value.trim())
        .filter(Boolean);
      return { titulo, itens };
    });
    return { nomePlano, valorPlano, infoPlano, sessoes };
  }

  // Função utilitária: atualiza UI conforme tipo
  function atualizarUIPorTipo(tipo) {
    const isComp = tipo === 'composicao';
    if (addonsSection) addonsSection.style.display = isComp ? 'block' : 'none';
    if (qtdeSel) {
      if (isComp) { qtdeSel.value = '1'; qtdeSel.setAttribute('disabled', 'disabled'); }
      else { qtdeSel.removeAttribute('disabled'); }
    }
    if (planosHeader) planosHeader.textContent = isComp ? 'Plano Base (obrigatório)' : 'Planos e Entregáveis';
    if (planosQtdeField) planosQtdeField.style.display = isComp ? 'none' : '';
  }

  // Add-ons: criação, ordenação e coleta
  function criarAddonRow(data) {
    const row = document.createElement('div');
    row.className = 'addon-row addon-card';
    const uid = `addon-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
    row.innerHTML = `
      <div class="addon-section">
        <div class="addon-section-title">📝 <span>Informações do Add-on</span></div>
        <div class="addon-name-row">
          <label>Nome do add-on</label>
          <div class="inline-actions">
            <button type="button" class="btn secondary btn-del-addon">Remover</button>
            <button type="button" class="btn secondary btn-move-addon-up" aria-label="Mover add-on para cima">↑</button>
            <button type="button" class="btn secondary btn-move-addon-down" aria-label="Mover add-on para baixo">↓</button>
          </div>
        </div>
        <input type="text" class="addon-nome addon-name-input" placeholder="Ex.: Blog, LP extra" />
        <div class="addon-desc-wrap">
          <label>Descrição (opcional)</label>
          <textarea class="addon-desc" rows="2" placeholder="Breve descrição (opcional)"></textarea>
        </div>
      </div>
      <div class="addon-section addon-pricing">
        <div class="addon-section-title">💰 <span>Precificação</span></div>
        <label style="font-weight:600;">Tipo de preço</label>
        <div class="pricing-type radio-group segmented">
          <label><input type="radio" class="addon-price-fixed" name="price-type-${uid}" value="fixo" checked /><span>Fixo</span></label>
          <label><input type="radio" class="addon-price-unit" name="price-type-${uid}" value="unitario" /><span>Unitário</span></label>
        </div>
        <div class="grid cols-3 fixed-fields" style="margin-top:6px;">
          <div>
            <label>Valor total</label>
            <input type="number" class="addon-valor" min="0" step="0.01" placeholder="Ex.: 600,00" />
          </div>
        </div>
        <div class="grid cols-3 unit-fields" style="margin-top:6px; display:none;">
          <div>
            <label>Valor unitário</label>
            <input type="number" class="addon-unit-price" min="0" step="0.01" placeholder="Ex.: 450,00" />
          </div>
          <div>
            <label>Texto exibido</label>
            <input type="text" class="addon-unit-label" placeholder="Ex.: por unidade" />
          </div>
        </div>
      </div>
      <div class="addon-section addon-behavior">
        <div class="addon-section-title">⚙️ <span>Comportamento</span></div>
        <label class="inline"><input type="checkbox" class="addon-selecionado" /> <span>Incluir automaticamente na proposta?</span></label>
      </div>
    `;
    // popular
    if (data) {
      row.querySelector('.addon-nome').value = data.nome || '';
      row.querySelector('.addon-desc').value = data.descricao || '';
      row.querySelector('.addon-selecionado').checked = !!data.selecionado;
      const fixedFields = row.querySelector('.fixed-fields');
      const unitFields = row.querySelector('.unit-fields');
      const fixedRadio = row.querySelector('.addon-price-fixed');
      const unitRadio = row.querySelector('.addon-price-unit');
      if (data.unitario) {
        unitRadio.checked = true; fixedRadio.checked = false;
        if (unitFields) unitFields.style.display = '';
        if (fixedFields) fixedFields.style.display = 'none';
        row.querySelector('.addon-unit-price').value = data.valor_unitario || '';
        row.querySelector('.addon-unit-label').value = data.texto_unidade || '';
      } else {
        fixedRadio.checked = true; unitRadio.checked = false;
        if (unitFields) unitFields.style.display = 'none';
        if (fixedFields) fixedFields.style.display = '';
        row.querySelector('.addon-valor').value = data.valor || '';
      }
    }
    // ordenação
    const move = (el, dir) => {
      const parent = el.parentElement;
      if (!parent) return;
      if (dir === 'up') {
        const prev = el.previousElementSibling;
        if (prev) parent.insertBefore(el, prev);
      } else {
        const next = el.nextElementSibling;
        if (next) parent.insertBefore(next, el);
      }
    };
    row.querySelector('.btn-move-addon-up').addEventListener('click', () => move(row, 'up'));
    row.querySelector('.btn-move-addon-down').addEventListener('click', () => move(row, 'down'));
    row.querySelector('.btn-del-addon').addEventListener('click', () => row.remove());
    // alternância tipo de preço
    const fixedFields = row.querySelector('.fixed-fields');
    const unitFields = row.querySelector('.unit-fields');
    const fixedRadio = row.querySelector('.addon-price-fixed');
    const unitRadio = row.querySelector('.addon-price-unit');
    const updatePriceType = () => {
      const isUnit = unitRadio.checked;
      unitFields.style.display = isUnit ? '' : 'none';
      fixedFields.style.display = isUnit ? 'none' : '';
    };
    fixedRadio.addEventListener('change', updatePriceType);
    unitRadio.addEventListener('change', updatePriceType);
    return row;
  }

  function collectAddons() {
    const rows = addonsContainer ? Array.from(addonsContainer.querySelectorAll('.addon-row')) : [];
    return rows.map(r => ({
      nome: r.querySelector('.addon-nome')?.value?.trim() || '',
      valor: r.querySelector('.addon-valor')?.value || '',
      descricao: r.querySelector('.addon-desc')?.value?.trim() || '',
      selecionado: !!r.querySelector('.addon-selecionado')?.checked,
      unitario: !!r.querySelector('.addon-price-unit')?.checked,
      valor_unitario: r.querySelector('.addon-unit-price')?.value || '',
      texto_unidade: r.querySelector('.addon-unit-label')?.value?.trim() || ''
    })).filter(a => a.nome);
  }

  function criarSessao(planIndex, sessaoIndex) {
    const wrap = document.createElement('div');
    wrap.className = 'sessao';
    wrap.dataset.planIndex = planIndex;
    wrap.dataset.sessaoIndex = sessaoIndex;
    wrap.innerHTML = `
      <div class="sessao-header">
        <div class="sessao-header-top">
          <label>Título da Sessão</label>
          <div class="inline">
            <button type="button" class="btn secondary btn-move-sessao-up" aria-label="Mover sessão para cima">↑</button>
            <button type="button" class="btn secondary btn-move-sessao-down" aria-label="Mover sessão para baixo">↓</button>
            <button type="button" class="btn secondary btn-del-sessao">Remover Sessão</button>
          </div>
        </div>
        <input type="text" class="sessao-titulo" placeholder="Ex.: Copy, Execução, Estratégia" />
      </div>
      <div class="items"></div>
      <div class="inline" style="margin-top:8px;">
        <button type="button" class="btn btn-add-item">+ Adicionar entregável</button>
      </div>
    `;
    const itemsEl = wrap.querySelector('.items');
    // adiciona primeira linha
    adicionarItem(itemsEl);
    wrap.querySelector('.btn-add-item').addEventListener('click', () => adicionarItem(itemsEl));
    wrap.querySelector('.btn-del-sessao').addEventListener('click', () => wrap.remove());
    // mover sessão
    const moveUp = wrap.querySelector('.btn-move-sessao-up');
    const moveDown = wrap.querySelector('.btn-move-sessao-down');
    const moveElement = (el, dir) => {
      const parent = el.parentElement;
      if (!parent) return;
      if (dir === 'up') {
        const prev = el.previousElementSibling;
        if (prev) parent.insertBefore(el, prev);
      } else if (dir === 'down') {
        const next = el.nextElementSibling;
        if (next) parent.insertBefore(next, el);
      }
    };
    moveUp.addEventListener('click', () => moveElement(wrap, 'up'));
    moveDown.addEventListener('click', () => moveElement(wrap, 'down'));
    return wrap;
  }

  function adicionarItem(itemsEl) {
    const row = document.createElement('div');
    row.className = 'item-row';
    const id = `item-${++itemIdSeq}`;
    row.innerHTML = `
      <span class="item-icon" aria-hidden="true">✔️</span>
      <input type="text" id="${id}" class="item-text" placeholder="Descreva o entregável" aria-label="Entregável" />
      <div class="inline">
        <button type="button" class="btn secondary btn-move-item-up" aria-label="Mover entregável para cima">↑</button>
        <button type="button" class="btn secondary btn-move-item-down" aria-label="Mover entregável para baixo">↓</button>
        <button type="button" class="btn secondary btn-del-item">Remover</button>
      </div>
    `;
    row.querySelector('.btn-del-item').addEventListener('click', () => row.remove());
    // mover item
    const moveItemUp = row.querySelector('.btn-move-item-up');
    const moveItemDown = row.querySelector('.btn-move-item-down');
    const moveItem = (el, dir) => {
      const parent = el.parentElement;
      if (!parent) return;
      if (dir === 'up') {
        const prev = el.previousElementSibling;
        if (prev) parent.insertBefore(el, prev);
      } else if (dir === 'down') {
        const next = el.nextElementSibling;
        if (next) parent.insertBefore(next, el);
      }
    };
    moveItemUp.addEventListener('click', () => moveItem(row, 'up'));
    moveItemDown.addEventListener('click', () => moveItem(row, 'down'));
    itemsEl.appendChild(row);
  }

  function criarPlano(index, data) {
    const card = document.createElement('div');
    card.className = 'plan-card';
    card.dataset.planIndex = index;
    card.innerHTML = `
      <div class="plan-header">
        <div class="plan-title">Entregáveis plano ${index}</div>
        <div class="inline">
          <button type="button" class="btn secondary btn-dup-plan">Duplicar plano</button>
          <button type="button" class="btn secondary btn-toggle-plan">Recolher</button>
        </div>
      </div>
      <div class="grid cols-2" style="margin-bottom:8px;">
        <div>
          <label>Nome do plano</label>
          <input type="text" class="plan-nome" placeholder="Ex.: Foco, Aceleração, Destaque" />
        </div>
        <div>
          <label>Valor do plano</label>
          <input type="number" class="valor-plano" placeholder="Ex.: 1500,00" min="0" step="0.01" />
        </div>
      </div>
      <div class="plan-body">
        <label style="display:block; margin-bottom:6px;">Informações do plano (opcional)</label>
        <textarea class="texto-plano" rows="4" placeholder="Descrição resumida do plano, diferenciais e observações"></textarea>
        <div class="sessoes"></div>
        <div class="inline" style="margin-top:10px;">
          <button type="button" class="btn secondary btn-add-sessao">+ Sessão</button>
          <button type="button" class="btn secondary btn-dup-sessao">Duplicar sessão</button>
        </div>
      </div>
    `;

    const sessoesEl = card.querySelector('.sessoes');
    // criar uma sessão inicial
    sessoesEl.appendChild(criarSessao(index, 1));

    // handlers
    card.querySelector('.btn-add-sessao').addEventListener('click', () => {
      const count = sessoesEl.querySelectorAll('.sessao').length;
      sessoesEl.appendChild(criarSessao(index, count + 1));
    });
    // duplicar última sessão
    card.querySelector('.btn-dup-sessao').addEventListener('click', () => {
      const list = sessoesEl.querySelectorAll('.sessao');
      const count = list.length;
      if (count === 0) {
        sessoesEl.appendChild(criarSessao(index, 1));
        return;
      }
      const last = list[count - 1];
      const titulo = last.querySelector('.sessao-titulo')?.value?.trim() || '';
      const itensNodes = last.querySelectorAll('.item-row .item-text');
      const itens = Array.from(itensNodes).map(inp => inp.value.trim()).filter(Boolean);
      const nova = criarSessao(index, count + 1);
      nova.querySelector('.sessao-titulo').value = titulo;
      const itemsEl = nova.querySelector('.items');
      itemsEl.innerHTML = '';
      if (itens.length) {
        itens.forEach(t => {
          const row = document.createElement('div');
          row.className = 'item-row';
          const id = `item-${++itemIdSeq}`;
          row.innerHTML = `
            <span class="item-icon" aria-hidden="true">✔️</span>
            <input type="text" id="${id}" class="item-text" placeholder="Descreva o entregável" aria-label="Entregável" />
            <div class="inline">
              <button type="button" class="btn secondary btn-move-item-up" aria-label="Mover entregável para cima">↑</button>
              <button type="button" class="btn secondary btn-move-item-down" aria-label="Mover entregável para baixo">↓</button>
              <button type="button" class="btn secondary btn-del-item">Remover</button>
            </div>
          `;
          row.querySelector('.item-text').value = t;
          // eventos do item
          row.querySelector('.btn-del-item').addEventListener('click', () => row.remove());
          const moveItemUp = row.querySelector('.btn-move-item-up');
          const moveItemDown = row.querySelector('.btn-move-item-down');
          const moveItem = (el, dir) => {
            const parent = el.parentElement;
            if (!parent) return;
            if (dir === 'up') {
              const prev = el.previousElementSibling;
              if (prev) parent.insertBefore(el, prev);
            } else if (dir === 'down') {
              const next = el.nextElementSibling;
              if (next) parent.insertBefore(next, el);
            }
          };
          moveItemUp.addEventListener('click', () => moveItem(row, 'up'));
          moveItemDown.addEventListener('click', () => moveItem(row, 'down'));
          itemsEl.appendChild(row);
        });
      } else {
        // sem itens, adiciona uma linha padrão
        adicionarItem(itemsEl);
      }
      sessoesEl.appendChild(nova);
    });
    card.querySelector('.btn-toggle-plan').addEventListener('click', (ev) => {
      const collapsed = card.classList.toggle('collapsed');
      ev.currentTarget.textContent = collapsed ? 'Expandir' : 'Recolher';
    });
    card.querySelector('.btn-dup-plan').addEventListener('click', () => {
      const total = planosContainer.querySelectorAll('.plan-card').length;
      const maxOpt = Array.from(qtdeSel.querySelectorAll('option')).map(o => parseInt(o.value)).reduce((a,b)=>Math.max(a,b), 1);
      if (total >= maxOpt) {
        alert('Limite de planos atingido.');
        return;
      }
      const data = collectPlanData(card);
      const newIndex = total + 1;
      const novo = criarPlano(newIndex, data);
      planosContainer.appendChild(novo);
      qtdeSel.value = String(newIndex);
    });
    // removido botão de gerar texto; textarea agora é apenas descritiva do plano

    // Se for fornecido um data para popular
    if (data) {
      card.querySelector('.plan-nome').value = data.nomePlano || '';
      card.querySelector('.valor-plano').value = data.valorPlano || '';
      card.querySelector('.texto-plano').value = data.infoPlano || '';
      // substituir sessões pela estrutura fornecida
      sessoesEl.innerHTML = '';
      const sessList = data.sessoes && data.sessoes.length ? data.sessoes : [{ titulo: '', itens: [] }];
      sessList.forEach((s, idx) => {
        const sEl = criarSessao(index, idx + 1);
        sEl.querySelector('.sessao-titulo').value = s.titulo || '';
        const itemsEl = sEl.querySelector('.items');
        itemsEl.innerHTML = '';
        if (s.itens && s.itens.length) {
          s.itens.forEach(t => {
            const row = document.createElement('div');
            row.className = 'item-row';
            const id = `item-${++itemIdSeq}`;
            row.innerHTML = `
              <span class="item-icon" aria-hidden="true">✔️</span>
              <input type="text" id="${id}" class="item-text" placeholder="Descreva o entregável" aria-label="Entregável" />
              <div class="inline">
                <button type="button" class="btn secondary btn-move-item-up" aria-label="Mover entregável para cima">↑</button>
                <button type="button" class="btn secondary btn-move-item-down" aria-label="Mover entregável para baixo">↓</button>
                <button type="button" class="btn secondary btn-del-item">Remover</button>
              </div>
            `;
            row.querySelector('.btn-del-item').addEventListener('click', () => row.remove());
            const moveItemUp = row.querySelector('.btn-move-item-up');
            const moveItemDown = row.querySelector('.btn-move-item-down');
            const moveItem = (el, dir) => {
              const parent = el.parentElement;
              if (!parent) return;
              if (dir === 'up') {
                const prev = el.previousElementSibling;
                if (prev) parent.insertBefore(el, prev);
              } else if (dir === 'down') {
                const next = el.nextElementSibling;
                if (next) parent.insertBefore(next, el);
              }
            };
            moveItemUp.addEventListener('click', () => moveItem(row, 'up'));
            moveItemDown.addEventListener('click', () => moveItem(row, 'down'));
            row.querySelector('.item-text').value = t;
            itemsEl.appendChild(row);
          });
        } else {
          adicionarItem(itemsEl);
        }
        sessoesEl.appendChild(sEl);
      });
    }

    return card;
  }

  function renderPlanosWithData(list) {
    const n = Array.isArray(list) ? list.length : 0;
    qtdeSel.value = String(n || 1);
    planosContainer.innerHTML = '';
    if (n > 0) {
      for (let i = 1; i <= n; i++) {
        planosContainer.appendChild(criarPlano(i, list[i-1]));
      }
    } else {
      planosContainer.appendChild(criarPlano(1));
    }
  }

  function gerarTextoDoPlano(card) {
    const out = [];
    const sessoes = card.querySelectorAll('.sessao');
    sessoes.forEach(sessao => {
      const titulo = sessao.querySelector('.sessao-titulo').value.trim();
      if (titulo) out.push(`Sessão: ${titulo}`);
      const itens = sessao.querySelectorAll('.item-row .item-text');
      itens.forEach(inp => {
        const t = inp.value.trim();
        if (t) out.push(t);
      });
      out.push('');
    });
    card.querySelector('.texto-plano').value = out.join('\n');
  }

  function renderPlanos() {
    const n = parseInt(qtdeSel.value || '1');
    planosContainer.innerHTML = '';
    for (let i = 1; i <= n; i++) {
      planosContainer.appendChild(criarPlano(i));
    }
  }

  qtdeSel.addEventListener('change', renderPlanos);
  // Tipo de produto: alterna UI e restrições
  if (tipoGroup) {
    tipoGroup.addEventListener('change', () => {
      const tipo = document.querySelector('#prodTipo input[name="tipo"]:checked')?.value || 'fixo';
      atualizarUIPorTipo(tipo);
      renderPlanos(); // atualiza a área de planos conforme a quantidade
    });
  }
  if (btnAddAddon && addonsContainer) {
    btnAddAddon.addEventListener('click', () => {
      addonsContainer.appendChild(criarAddonRow());
    });
  }
  const initialTipo = document.querySelector('#prodTipo input[name="tipo"]:checked')?.value || 'fixo';
  atualizarUIPorTipo(initialTipo);
  renderPlanos();

  async function prefillFromSupabase(id) {
    try {
      const client = (function getSupabaseClient(){
        try {
          if (window.supabaseConfig && typeof window.supabaseConfig.initSupabase === 'function') {
            return window.supabaseConfig.initSupabase();
          }
          if (typeof window.initSupabase === 'function') return window.initSupabase();
          if (window.supabase && typeof window.supabase.from === 'function') return window.supabase;
          return null;
        } catch(e){ return null; }
      })();
      if (!client) return false;

      // Busca do produto com tolerância a schema parcial
      let prod = null;
      try {
        const { data, error } = await client
          .from('produtos')
          .select('id, nome, tipo, recorrencia, desconto_recorrencia, desconto_pagamento, desconto_condicional')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) prod = data;
      } catch(e) {}
      if (!prod) {
        const { data, error } = await client
          .from('produtos')
          .select('id, nome, tipo, recorrencia')
          .eq('id', id)
          .maybeSingle();
        if (error || !data) return false;
        prod = data;
      }

      // Preenche campos do produto
      $('#prodNome').value = prod.nome || '';
      // Tipo
      const tipo = prod.tipo || 'fixo';
      const tipoEl = document.querySelector(`#prodTipo input[value="${tipo}"]`);
      if (tipoEl) tipoEl.checked = true;
      // Ajusta UI conforme tipo
      atualizarUIPorTipo(tipo);
      const rec = prod.recorrencia ? 'sim' : 'nao';
      const recEl = document.querySelector(`#prodRecorrencia input[value="${rec}"]`);
      if (recEl) recEl.checked = true;
      const descRec = prod.desconto_recorrencia ? 'sim' : 'nao';
      const descRecEl = document.querySelector(`#prodDescRec input[value="${descRec}"]`);
      if (descRecEl) descRecEl.checked = true;
      const descPag = prod.desconto_pagamento ? 'sim' : 'nao';
      const descPagEl = document.querySelector(`#prodDescPagamento input[value="${descPag}"]`);
      if (descPagEl) descPagEl.checked = true;
      const descCond = prod.desconto_condicional ? 'sim' : 'nao';
      const condEl = document.querySelector(`#prodDescCondicional input[value="${descCond}"]`);
      if (condEl) condEl.checked = true;

      // Busca planos separadamente para evitar erro de relacionamento
      let planosRows = [];
      try {
        const { data: plFull, error: plErr } = await client
          .from('produto_planos')
          .select('id, nome, valor, info, sessoes, addons')
          .eq('produto_id', id);
        if (!plErr && Array.isArray(plFull)) planosRows = plFull;
        else {
          const { data: plMin } = await client
            .from('produto_planos')
            .select('id, nome, valor')
            .eq('produto_id', id);
          planosRows = plMin || [];
        }
      } catch(e) {
        const { data: plMin } = await client
          .from('produto_planos')
          .select('id, nome, valor, addons')
          .eq('produto_id', id);
        planosRows = plMin || [];
      }

      const planos = (planosRows || []).map(pl => ({
        nomePlano: pl.nome || '',
        valorPlano: typeof pl.valor === 'number' ? pl.valor.toFixed(2) : (pl.valor || ''),
        infoPlano: pl.info || '',
        sessoes: Array.isArray(pl.sessoes) || typeof pl.sessoes === 'object' ? pl.sessoes : [],
        addons: Array.isArray(pl.addons) || typeof pl.addons === 'object' ? pl.addons : []
      }));
      renderPlanosWithData(planos);
      // Renderiza add-ons se existir e tipo for composição (assumir add-ons vinculados ao primeiro plano)
      const first = planos[0];
      if (first && first.addons && Array.isArray(first.addons) && tipo === 'composicao') {
        addonsContainer.innerHTML = '';
        first.addons.forEach(a => addonsContainer.appendChild(criarAddonRow(a)));
      }
      return true;
    } catch (e) {
      console.warn('Falha ao prefill Supabase:', e);
      return false;
    }
  }

  (async () => {
    if (editingId) {
      const ok = await prefillFromSupabase(editingId);
      if (ok) {
        const btn = document.querySelector('#btnSalvar'); if (btn) btn.textContent = 'Editar';
      }
    }
  })();

  // Preview visual com cards e carrossel quando houver mais de 3 planos
  $('#btnPreview').addEventListener('click', () => {
    const nome = $('#prodNome').value.trim();
    const rec = document.querySelector('input[name="rec"]:checked')?.value || 'sim';
    const descRec = document.querySelector('#prodDescRec input[name="descRec"]:checked')?.value || 'nao';
    const descPag = document.querySelector('#prodDescPagamento input[name="descPag"]:checked')?.value || 'nao';
    const descCond = document.querySelector('#prodDescCondicional input[name="descCond"]:checked')?.value || 'nao';
    const n = parseInt(qtdeSel.value || '1');

    const makeCardHtml = (i) => {
      const card = planosContainer.querySelector(`.plan-card[data-plan-index="${i}"]`);
      const nomePlano = card?.querySelector('.plan-nome')?.value?.trim() || '';
      const valorPlano = card?.querySelector('.valor-plano')?.value || '';
      const infoPlano = card?.querySelector('.texto-plano')?.value?.trim() || '';
      const sessoes = card?.querySelectorAll('.sessao') || [];
      const sections = [];
      sessoes.forEach(sessao => {
        const titulo = sessao.querySelector('.sessao-titulo').value.trim();
        const itens = Array.from(sessao.querySelectorAll('.item-row .item-text'))
          .map(inp => inp.value.trim())
          .filter(Boolean)
          .map(t => `<span class="check" aria-hidden="true">✔️</span><span>${t}</span>`)
          .map(html => `<li>${html}</li>`)
          .join('');
        const sectionHtml = `
          <div>
            ${titulo ? `<div class="section-title">${titulo}</div>` : ''}
            <ul>${itens}</ul>
          </div>
        `;
        sections.push(sectionHtml);
      });
      const highlight = (n <= 3 && i === 2) ? ' highlight' : '';
      return `
        <div class="plan-card-preview${highlight}">
          ${highlight ? `<div class="badge">Mais escolhido</div>` : ''}
          <div class="title">${nomePlano || (nome ? `${nome} — Plano ${i}` : `Plano ${i}`)}</div>
          ${valorPlano ? `<div class="value">Valor: R$ ${valorPlano}</div>` : ''}
          ${infoPlano ? `<div class="section-title">Sobre o plano</div><div style="margin-bottom:8px; color:#cfcfcf;">${infoPlano}</div>` : ''}
          ${sections.join('')}
        </div>
      `;
    };

    const cardsHtml = Array.from({ length: n }, (_, idx) => makeCardHtml(idx + 1));
    const containerHtml = (n > 3)
      ? `
        <div class="carousel">
          <button class="btn-nav btn-prev" aria-label="Anterior">‹</button>
          <div class="track">${cardsHtml.join('')}</div>
          <button class="btn-nav btn-next" aria-label="Próximo">›</button>
        </div>
      `
      : `<div class="compare-preview">${cardsHtml.join('')}</div>`;

    const headerHtml = `
      <div class="preview-header">
        Produto: ${nome || '—'} | Recorrência: ${rec === 'sim' ? 'Sim' : 'Não'} |
        Desc. recorrência: ${descRec === 'sim' && rec === 'sim' ? 'Sim' : 'Não'} |
        Desc. forma de pagamento: ${descPag === 'sim' ? 'Sim' : 'Não'}
      </div>
    `;
    const outEl = $('#previewOut');
    outEl.style.display = 'block';
    outEl.style.whiteSpace = 'normal';
    outEl.innerHTML = headerHtml + containerHtml;

    // Navegação do carrossel
    const track = outEl.querySelector('.carousel .track');
    const prev = outEl.querySelector('.carousel .btn-prev');
    const next = outEl.querySelector('.carousel .btn-next');
    if (track && prev && next) {
      const step = () => track.clientWidth;
      prev.addEventListener('click', () => { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
      next.addEventListener('click', () => { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    }
  });

  // Coleta do produto
  function collectProduto() {
    const nome = $('#prodNome').value.trim();
    const tipo = document.querySelector('#prodTipo input[name="tipo"]:checked')?.value || 'fixo';
    const rec = document.querySelector('input[name="rec"]:checked')?.value || 'sim';
    const descRec = document.querySelector('#prodDescRec input[name="descRec"]:checked')?.value || 'nao';
    const descPag = document.querySelector('#prodDescPagamento input[name="descPag"]:checked')?.value || 'nao';
    const descCond = document.querySelector('#prodDescCondicional input[name="descCond"]:checked')?.value || 'nao';
    const n = parseInt(qtdeSel.value || '1');
    const planos = [];
    for (let i = 1; i <= n; i++) {
      const card = planosContainer.querySelector(`.plan-card[data-plan-index="${i}"]`);
      if (!card) continue;
      planos.push(collectPlanData(card));
    }
    const addons = (tipo === 'composicao') ? collectAddons() : [];
    return { nome, tipo, recorrencia: rec, descontoRecorrencia: descRec, descontoPagamento: descPag, descontoCondicional: descCond, planos, addons };
  }

  // Toast simples para feedback
  function showToast(msg, tipo = 'info') {
    const el = document.getElementById('toast');
    if (!el) { console.log(msg); return; }
    el.textContent = msg;
    el.style.borderColor = tipo === 'error' ? '#7a2b2b' : '#333';
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 1800);
  }

  // Status Supabase
  function setSupabaseStatus(text, type = 'info') {
    const el = document.getElementById('supabaseStatus');
    if (!el) return;
    el.textContent = text;
    el.style.borderColor = type === 'error' ? '#7a2b2b' : (type === 'ok' ? '#2b7a4b' : '#333');
  }

  async function checkSupabaseStatus() {
    try {
      const client = (function getSupabaseClient(){
        try {
          if (window.supabaseConfig && typeof window.supabaseConfig.initSupabase === 'function') {
            return window.supabaseConfig.initSupabase();
          }
          if (typeof window.initSupabase === 'function') return window.initSupabase();
          if (window.supabase && typeof window.supabase.from === 'function') return window.supabase;
          return null;
        } catch(e){ return null; }
      })();
      if (!client) {
        setSupabaseStatus('Supabase não carregado.', 'error');
        return;
      }
      const { error } = await client.from('produtos').select('id').limit(1);
      if (error) {
        setSupabaseStatus('Offline – Supabase indisponível. (' + (error.message || 'erro de consulta') + ')', 'error');
      } else {
        setSupabaseStatus('Conectado ao Supabase', 'ok');
      }
    } catch (e) {
      setSupabaseStatus('Supabase indisponível: ' + (e.message || e), 'error');
    }
  }

  async function saveProdutoSupabase(produto) {
    try {
      // Garantir cliente Supabase
      const client = (function getSupabaseClient(){
        try {
          if (window.supabaseConfig && typeof window.supabaseConfig.initSupabase === 'function') {
            return window.supabaseConfig.initSupabase();
          }
          if (typeof window.initSupabase === 'function') return window.initSupabase();
          if (window.supabase && typeof window.supabase.from === 'function') return window.supabase;
          return null;
        } catch(e){ return null; }
      })();
      if (!client) return null;
      let produtoId = null;
      const { data: created, error } = await client
        .from('produtos')
        .insert([{ 
          nome: produto.nome,
          tipo: produto.tipo,
          recorrencia: produto.recorrencia === 'sim',
          desconto_recorrencia: produto.descontoRecorrencia === 'sim',
          desconto_pagamento: produto.descontoPagamento === 'sim',
          desconto_condicional: produto.descontoCondicional === 'sim'
        }])
        .select('id')
        .single();
      if (error) {
        console.warn('Supabase: erro ao criar produto', error);
        // Fallback: schema desatualizado sem colunas de desconto -> tenta inserir somente campos mínimos
        const mismatch = String(error.message || '').includes("Could not find the") || error.code === 'PGRST204';
        if (mismatch) {
          const { data: createdMin, error: errMin } = await client
            .from('produtos')
            .insert([{ nome: produto.nome, tipo: produto.tipo, recorrencia: produto.recorrencia === 'sim' }])
            .select('id')
            .single();
          if (errMin) {
            showToast('Erro Supabase (mínimo): ' + (errMin.message || 'falha ao criar produto'), 'error');
            return null;
          }
          // Prossegue com created a partir do minimal
          produtoId = createdMin?.id;
        } else {
          showToast('Erro Supabase: ' + (error.message || 'falha ao criar produto'), 'error');
          return null;
        }
      }
      produtoId = produtoId || (created?.id);
      if (!produtoId) return null;
      // Conversão segura de valores no formato brasileiro (ex.: 1.500,00)
      const toNumberBR = (val) => {
        if (val === null || typeof val === 'undefined') return null;
        const s = String(val).trim();
        if (!s) return null;
        // Remove quaisquer caracteres não numéricos exceto vírgula, ponto e sinal
        const clean = s.replace(/[^0-9,.-]/g, '');
        // Se possuir vírgula como decimal, remover pontos (milhares) e trocar vírgula por ponto
        const normalized = clean.includes(',') ? clean.replace(/\./g, '').replace(',', '.') : clean;
        const n = parseFloat(normalized);
        return isNaN(n) ? null : n;
      };

      const planosRowsFull = produto.planos.map((pl, idx) => ({
        produto_id: produtoId,
        nome: pl.nomePlano,
        valor: toNumberBR(pl.valorPlano),
        info: pl.infoPlano || null,
        sessoes: (pl.sessoes && pl.sessoes.length) ? pl.sessoes : null,
        addons: (produto.tipo === 'composicao' && idx === 0 && produto.addons && produto.addons.length) ? produto.addons : null
      }));
      let { error: errPlanos } = await client.from('produto_planos').insert(planosRowsFull);
      if (errPlanos) {
        console.warn('Supabase: erro ao inserir planos (full)', errPlanos);
        const mismatchPlan = String(errPlanos.message || '').includes('Could not find the') || errPlanos.code === 'PGRST204';
        if (mismatchPlan) {
          // Reinsere com colunas mínimas
          const planosRowsMin = planosRowsFull.map(pl => ({ produto_id: pl.produto_id, nome: pl.nome, valor: pl.valor }));
          const { error: errPlanosMin } = await client.from('produto_planos').insert(planosRowsMin);
          if (errPlanosMin) { console.warn('Supabase: erro ao inserir planos (mínimo)', errPlanosMin); showToast('Erro Supabase (planos mínimo): ' + (errPlanosMin.message || 'falha ao inserir'), 'error'); return null; }
          showToast('Produto cadastrado (schema parcial). Atualize tabela para colunas completas.');
        } else {
          showToast('Erro Supabase (planos): ' + (errPlanos.message || 'falha ao inserir'), 'error');
          return null;
        }
      }
      return produtoId;
    } catch (e) {
      console.warn('Supabase: exceção ao salvar produto', e);
      showToast('Erro Supabase: ' + (e.message || e), 'error');
      return null;
    }
  }

  // Botão Salvar
  const btnSalvar = document.querySelector('#btnSalvar');
  if (btnSalvar) {
    btnSalvar.addEventListener('click', async () => {
      const originalText = btnSalvar.textContent;
      btnSalvar.disabled = true; btnSalvar.textContent = (editingId) ? 'Editando…' : 'Salvando…';
      const produto = collectProduto();
      if (!produto.nome) {
        alert('Informe o nome do produto.');
        // Reabilita o botão e restaura o texto quando a validação falhar
        btnSalvar.disabled = false;
        btnSalvar.textContent = originalText;
        document.querySelector('#prodNome')?.focus();
        return;
      }
      // Editar Supabase
      if (editingId) {
        const ok = await updateProdutoSupabase(editingId, produto);
        if (ok) {
          showToast('✅ Produto atualizado no Supabase!');
          setTimeout(() => { window.location.href = 'produtos.html'; }, 1200);
          return;
        }
      } else {
        // Criar Supabase
        const produtoId = await saveProdutoSupabase(produto);
        if (produtoId) {
          showToast('🎉 Produto cadastrado no Supabase!');
          setTimeout(() => { window.location.href = 'produtos.html'; }, 1200);
          return;
        }
      }
      // Sem fallback local: reporta erro e reabilita botão
      showToast('❌ Não foi possível salvar/atualizar no Supabase.', 'error');
      btnSalvar.disabled = false; btnSalvar.textContent = originalText;
    });
  }

  async function updateProdutoSupabase(id, produto) {
    try {
      const client = (function getSupabaseClient(){
        try {
          if (window.supabaseConfig && typeof window.supabaseConfig.initSupabase === 'function') {
            return window.supabaseConfig.initSupabase();
          }
          if (typeof window.initSupabase === 'function') return window.initSupabase();
          if (window.supabase && typeof window.supabase.from === 'function') return window.supabase;
          return null;
        } catch(e){ return null; }
      })();
      if (!client) return false;
      // Atualiza produto
      const fullFields = {
        nome: produto.nome,
        tipo: produto.tipo,
        recorrencia: produto.recorrencia === 'sim',
        desconto_recorrencia: produto.descontoRecorrencia === 'sim',
        desconto_pagamento: produto.descontoPagamento === 'sim',
        desconto_condicional: produto.descontoCondicional === 'sim'
      };
      let { error: updErr } = await client
        .from('produtos')
        .update(fullFields)
        .eq('id', id);
      if (updErr) {
        const mismatch = String(updErr.message || '').includes('Could not find the') || updErr.code === 'PGRST204';
        if (mismatch) {
          const { error: updMinErr } = await client.from('produtos').update({ nome: produto.nome, tipo: produto.tipo, recorrencia: fullFields.recorrencia }).eq('id', id);
          if (updMinErr) { showToast('Erro Supabase (update mínimo): ' + (updMinErr.message || 'falha ao atualizar'), 'error'); return false; }
          // Aviso claro: schema parcial — colunas de desconto não existem, portanto não foram persistidas
          showToast('Produto atualizado (schema parcial): flags de desconto não foram salvas. Execute SUPABASE-SCHEMA-PRODUTOS.sql para habilitar.', 'error');
        } else {
          showToast('Erro Supabase (update): ' + (updErr.message || 'falha ao atualizar'), 'error');
          return false;
        }
      }
      // Verifica se o nome foi realmente atualizado; se não, tenta novamente com update mínimo
      try {
        const { data: checkRow, error: checkErr } = await client
          .from('produtos')
          .select('id, nome')
          .eq('id', id)
          .maybeSingle();
        if (!checkErr && checkRow && checkRow.nome !== produto.nome) {
          const { error: updRetryErr } = await client
            .from('produtos')
            .update({ nome: produto.nome })
            .eq('id', id);
          if (updRetryErr) {
            console.warn('Supabase: retry update nome falhou', updRetryErr);
          }
        }
      } catch(e) {
        console.warn('Supabase: verificação pós-update falhou', e);
      }
      // Recria planos: apaga e insere novamente
      await client.from('produto_planos').delete().eq('produto_id', id);
      const toNumberBR = (val) => {
        if (val === null || typeof val === 'undefined') return null;
        const s = String(val).trim();
        if (!s) return null;
        const clean = s.replace(/[^0-9,.-]/g, '');
        const normalized = clean.includes(',') ? clean.replace(/\./g, '').replace(',', '.') : clean;
        const n = parseFloat(normalized);
        return isNaN(n) ? null : n;
      };
      const rowsFull = produto.planos.map((pl, idx) => ({
        produto_id: id,
        nome: pl.nomePlano,
        valor: toNumberBR(pl.valorPlano),
        info: pl.infoPlano || null,
        sessoes: (pl.sessoes && pl.sessoes.length) ? pl.sessoes : null,
        addons: (produto.tipo === 'composicao' && idx === 0 && produto.addons && produto.addons.length) ? produto.addons : null
      }));
      let { error: insErr } = await client.from('produto_planos').insert(rowsFull);
      if (insErr) {
        const mismatchPlan = String(insErr.message || '').includes('Could not find the') || insErr.code === 'PGRST204';
        if (mismatchPlan) {
          const rowsMin = rowsFull.map(pl => ({ produto_id: pl.produto_id, nome: pl.nome, valor: pl.valor }));
          const { error: insMinErr } = await client.from('produto_planos').insert(rowsMin);
          if (insMinErr) { showToast('Erro Supabase (planos mínimo): ' + (insMinErr.message || 'falha ao inserir'), 'error'); return false; }
          showToast('Produto atualizado (schema parcial). Atualize tabela para colunas completas.');
        } else {
          showToast('Erro Supabase (planos): ' + (insErr.message || 'falha ao inserir'), 'error');
          return false;
        }
      }
      return true;
    } catch (e) {
      console.warn('Exceção ao atualizar produto no Supabase:', e);
      showToast('Erro Supabase: ' + (e.message || e), 'error');
      return false;
    }
  }

  // Removido suporte a atualização local

  // Checar status na inicialização
  checkSupabaseStatus();

  const btnReset = document.querySelector('#btnReset');
  const resetConfirmEl = document.querySelector('#resetConfirm');
  const btnConfirmReset = document.querySelector('#btnConfirmReset');
  const btnCancelReset = document.querySelector('#btnCancelReset');

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      resetConfirmEl?.classList.add('show');
    });
  }
  if (btnConfirmReset) {
    btnConfirmReset.addEventListener('click', () => {
      $('#prodNome').value = '';
      document.querySelector('input[name="rec"][value="sim"]').checked = true;
      qtdeSel.value = '1';
      document.querySelector('#prodDescRec input[value="nao"]').checked = true;
      document.querySelector('#prodDescPagamento input[value="nao"]').checked = true;
      const condNo = document.querySelector('#prodDescCondicional input[value="nao"]');
      if (condNo) condNo.checked = true;
      $('#previewOut').style.display = 'none';
      $('#previewOut').textContent = '';
      renderPlanos();
      // re-sincroniza o estado de desconto de recorrência
      syncDescRec();
      resetConfirmEl?.classList.remove('show');
    });
  }
  if (btnCancelReset) {
    btnCancelReset.addEventListener('click', () => {
      resetConfirmEl?.classList.remove('show');
    });
  }

  // Habilitar/desabilitar desconto de recorrência com base na recorrência
  function syncDescRec() {
    const isRec = document.querySelector('input[name="rec"]:checked')?.value === 'sim';
    const inputs = document.querySelectorAll('#prodDescRec input[name="descRec"]');
    inputs.forEach(inp => { inp.disabled = !isRec; });
    const cardDescRec = document.querySelector('#prodDescRec')?.closest('.option-card');
    if (cardDescRec) {
      cardDescRec.classList.toggle('disabled', !isRec);
    }
    if (!isRec) {
      document.querySelector('#prodDescRec input[value="nao"]').checked = true;
    }
  }
  document.querySelectorAll('input[name="rec"]').forEach(r => r.addEventListener('change', syncDescRec));
  syncDescRec();
})();