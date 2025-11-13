// Menu lateral simples para navegação interna
(function () {
  function initMenu() {
    if (document.querySelector('.menu-lateral')) return;

    // Estilos básicos do menu
    const style = document.createElement('style');
    style.textContent = `
      .menu-lateral{position:fixed;left:0;top:0;height:100vh;width:240px;background:#151515;border-right:1px solid #262626;padding:16px;z-index:9999}
      .menu-lateral .brand{color:#fff;font-weight:800;margin-bottom:12px}
      .menu-lateral a{display:block;color:#00E388;text-decoration:none;padding:10px 12px;border-radius:8px;background:#111;margin-bottom:8px;font-weight:600}
      .menu-lateral a:hover{background:#1a1a1a}
      .menu-lateral a.active{background:#1E5942;color:#fff}
      body.menu-lateral-active{margin-left:240px}
      @media (max-width:900px){
        .menu-lateral{transform:translateX(-100%);transition:transform .2s;width:220px}
        .menu-lateral.open{transform:translateX(0)}
        body.menu-lateral-active{margin-left:0}
      }
    `;
    document.head.appendChild(style);

    const current = (location.pathname || '').toLowerCase();
    // Detect base path: some deployments serve from '/proposta-comercial/' while others from '/'
    const inSubdir = current.includes('/proposta-comercial/');
    const base = inSubdir ? '/proposta-comercial/' : '/';
    const nav = document.createElement('nav');
    nav.className = 'menu-lateral';

    const brand = document.createElement('div');
    brand.className = 'brand';
    brand.textContent = '📁 Menu';
    nav.appendChild(brand);

    function link(href, text) {
      const a = document.createElement('a');
      const full = (base + href).replace('//','/');
      a.href = full; a.textContent = text;
      if (current.endsWith('/' + href.toLowerCase()) || current.endsWith(href.toLowerCase()) || current.endsWith(full.toLowerCase())) {
        a.classList.add('active');
      }
      return a;
    }

    nav.appendChild(link('proposta-gerador.html', 'Gerador de Proposta'));
    nav.appendChild(link('proposta-rapida.html', 'Criador de Proposta Rápida'));
    nav.appendChild(link('clientes.html', 'Clientes'));
    nav.appendChild(link('admin.html', 'Propostas'));

    document.body.appendChild(nav);

    if (window.innerWidth > 900) {
      document.body.classList.add('menu-lateral-active');
    } else {
      // Em mobile, abrir menu ao tocar na borda esquerda
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