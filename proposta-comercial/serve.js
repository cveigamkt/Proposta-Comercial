const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 8001;
const root = process.cwd();

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
  if (filePath === '/' || filePath === '') filePath = '/proposta-gerador.html';
  const abs = path.join(root, filePath);

  fs.stat(abs, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found');
    }
    if (stats.isDirectory()) {
      const indexPath = path.join(abs, 'index.html');
      if (fs.existsSync(indexPath)) {
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
