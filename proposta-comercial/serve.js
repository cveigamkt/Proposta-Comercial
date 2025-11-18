const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 8001;
// Servir a pasta 'proposta-comercial' como raiz do servidor
const root = path.join(process.cwd(), 'proposta-comercial');

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let filePath = req.url.split('?')[0];
  if (filePath === '/' || filePath === '') filePath = 'proposta-gerador.html';
  // Remover barras iniciais para evitar que path.join ignore o root em Windows
  filePath = filePath.replace(/^[/\\]+/, '');

  // Tratar favicon.ico para evitar 404 mesmo sem arquivo físico
  if (filePath.toLowerCase() === 'favicon.ico') {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#151515"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="36" fill="#00E388">P</text></svg>';
    res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
    return res.end(svg);
  }
  const abs = path.join(root, filePath);

  fs.stat(abs, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found');
    }
    if (stats.isDirectory()) {
      const indexPath = path.join(abs, 'index.html');
      if (fs.existsSync(indexPath)) {
        // Garantir Content-Type correto ao servir index.html de diretórios
        res.writeHead(200, { 'Content-Type': types['.html'] || 'text/html; charset=utf-8' });
        return fs.createReadStream(indexPath).pipe(res);
      }
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Forbidden');
    }
    const ext = path.extname(abs).toLowerCase();
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    fs.createReadStream(abs).pipe(res);
  });
});

server.listen(port, () => {
  console.log(`Servidor estático rodando em http://localhost:${port}`);
});
