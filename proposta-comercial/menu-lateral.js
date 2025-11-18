// Menu lateral simples para navegação interna
(function () {
  function initMenu() {
    if (document.querySelector('.menu-lateral')) return;

    // Favicon inline para evitar 404 de /favicon.ico
    if (!document.querySelector('link[rel="icon"]')) {
      const fav = document.createElement('link');
      fav.rel = 'icon';
      const svg = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#151515"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="36" fill="#00E388">P</text></svg>');
      fav.href = 'data:image/svg+xml,' + svg;
      document.head.appendChild(fav);
    }

    // Estilos do menu com suporte a recolhimento
    const style = document.createElement('style');
    style.textContent = `
      .menu-lateral{position:fixed;left:0;top:0;height:100vh;width:240px;background:#151515;border-right:1px solid #262626;padding:16px;z-index:9999;transition:width .2s}
      .menu-lateral .brand{color:#fff;font-weight:800;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between}
      .menu-lateral .toggle{background:#111;border:1px solid #333;color:#e5e5e5;border-radius:8px;padding:6px 8px;cursor:pointer}
      .menu-lateral .menu-section-title{font-size:.75rem;color:#aaa;text-transform:uppercase;letter-spacing:.6px;margin:14px 8px 6px;padding:4px 8px;border-bottom:1px solid #262626}
      .menu-lateral a{display:flex;align-items:center;gap:10px;color:#00E388;text-decoration:none;padding:10px 12px;border-radius:8px;background:#111;margin:6px 0;font-weight:600}
      .menu-lateral a:hover{background:#181818}
      .menu-lateral a.active{background:#1E5942;color:#fff;border:1px solid #267356}
      .menu-lateral a .icon{width:20px;text-align:center}
      .menu-lateral a .label{white-space:nowrap}
      .menu-lateral.collapsed{width:64px;padding:16px 10px}
      .menu-lateral.collapsed .brand .label{display:none}
      .menu-lateral.collapsed .menu-section-title{display:none}
      .menu-lateral.collapsed a .label{display:none}
      body.menu-lateral-active{margin-left:240px}
      body.menu-lateral-collapsed{margin-left:64px}
      @media (max-width:900px){
        .menu-lateral{transform:translateX(-100%);transition:transform .2s,width .2s;width:220px}
        .menu-lateral.open{transform:translateX(0)}
        body.menu-lateral-active, body.menu-lateral-collapsed{margin-left:0}
      }
    `;
    document.head.appendChild(style);

    const current = (location.pathname || '').toLowerCase();
    const inSubdir = current.includes('/proposta-comercial/');
    const base = inSubdir ? '/proposta-comercial/' : '/';
    const nav = document.createElement('nav');
    nav.className = 'menu-lateral';

    const brand = document.createElement('div');
    brand.className = 'brand';
    const brandLabel = document.createElement('span');
    brandLabel.className = 'label';
    brandLabel.textContent = 'Menu';
    const toggle = document.createElement('button');
    toggle.className = 'toggle';
    toggle.title = 'Recolher/expandir menu';
    toggle.textContent = '«';
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const collapsed = nav.classList.toggle('collapsed');
      document.body.classList.toggle('menu-lateral-collapsed', collapsed);
      document.body.classList.toggle('menu-lateral-active', !collapsed);
      localStorage.setItem('menuCollapsed', collapsed ? '1' : '0');
    });
    brand.appendChild(brandLabel);
    brand.appendChild(toggle);
    nav.appendChild(brand);

    function link(href, text, icon) {
      const a = document.createElement('a');
      const full = (base + href).replace('//','/');
      a.href = full;
      const ico = document.createElement('span'); ico.className = 'icon'; ico.textContent = icon || '•';
      const lab = document.createElement('span'); lab.className = 'label'; lab.textContent = text;
      a.appendChild(ico); a.appendChild(lab);
      if (current.endsWith('/' + href.toLowerCase()) || current.endsWith(href.toLowerCase()) || current.endsWith(full.toLowerCase())) {
        a.classList.add('active');
      }
      return a;
    }

    function section(title){
      const h = document.createElement('div');
      h.className = 'menu-section-title';
      h.textContent = '— ' + title + ' —';
      return h;
    }

    // Produtos
    nav.appendChild(section('Produtos'));
    nav.appendChild(link('produtos.html', 'Produtos', '📦'));
    nav.appendChild(link('produto-cadastro.html', 'Cadastro de Produto', '➕'));

    // Propostas
    nav.appendChild(section('Propostas'));
    nav.appendChild(link('proposta-gerador.html', 'Gerador de Proposta', '⚙️'));
    nav.appendChild(link('proposta-rapida.html', 'Criar Proposta Rápida', '⚡'));
    nav.appendChild(link('admin.html', 'Propostas enviadas', '🧾'));

    // Clientes
    nav.appendChild(section('Clientes'));
    nav.appendChild(link('clientes.html', 'Clientes', '👥'));

    document.body.appendChild(nav);

    // Estado inicial: desktop ativo ou recolhido conforme preferência
    const preferCollapsed = localStorage.getItem('menuCollapsed') === '1';
    if (window.innerWidth > 900) {
      if (preferCollapsed) {
        nav.classList.add('collapsed');
        document.body.classList.add('menu-lateral-collapsed');
      } else {
        document.body.classList.add('menu-lateral-active');
      }
    } else {
      document.addEventListener('click', (e) => {
        if (e.clientX < 24) nav.classList.toggle('open');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMenu);
  } else {
    initMenu();
  }
})();