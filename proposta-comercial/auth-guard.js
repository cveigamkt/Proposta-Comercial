// Auth Guard: força login em páginas protegidas (exceto visualização da proposta)
(function(){
  try {
    const path = (window.location && window.location.pathname || '').toLowerCase();
    const file = path.substring(path.lastIndexOf('/') + 1);
    const isLogin = file === 'login.html' || file === 'login';
    const isVisualization = (
      file === 'proposta-visualizacao.html' ||
      file === 'index.html' && path.includes('/proposta-visualizacao/') ||
      path.endsWith('/proposta-visualizacao') ||
      path.includes('/proposta-visualizacao/')
    );
    if (isLogin || isVisualization) return; // não proteger login nem visualização

    if (!window.supabaseConfig || typeof window.supabaseConfig.initSupabase !== 'function') {
      console.warn('auth-guard: supabase-config.js não carregado');
      return;
    }
    const client = window.supabaseConfig.initSupabase();

    function baseLink(){
      const { origin, pathname } = window.location;
      const idx = pathname.lastIndexOf('/');
      const basePath = idx >= 0 ? pathname.slice(0, idx + 1) : '/';
      return origin + basePath;
    }

    (async () => {
      try {
        const { data: { session } } = await client.auth.getSession();
        const logged = !!(session && session.user);
        if (!logged) {
          const currentFile = file || 'index.html';
          const redirect = encodeURIComponent(currentFile);
          window.location.href = baseLink() + 'login.html?redirect=' + redirect;
        }
      } catch (e) {
        console.warn('auth-guard: falha ao obter sessão', e);
        // Em caso de erro, redirecionar por segurança
        const currentFile = file || 'index.html';
        const redirect = encodeURIComponent(currentFile);
        window.location.href = baseLink() + 'login.html?redirect=' + redirect;
      }
    })();
  } catch (e) {
    console.warn('auth-guard: exceção não tratada', e);
  }
})();