# Stack Tecnológico - Sistema de Proposta Comercial

## Linguagens e Tecnologias

### Frontend
- **HTML5**: Estrutura semântica com elementos modernos
- **CSS3**: Grid Layout, Flexbox, Custom Properties, Animations
- **JavaScript (ES6+)**: Vanilla JS com módulos, async/await, destructuring
- **jsPDF**: Biblioteca para geração de PDF client-side

### Backend
- **Google Apps Script**: Runtime JavaScript serverless
- **Google Sheets API**: Persistência de dados via planilhas

### Styling e Design
- **Google Fonts**: Tipografia Inter para consistência visual
- **CSS Grid**: Layout responsivo e flexível
- **CSS Custom Properties**: Variáveis para tema Heat Digital
- **Media Queries**: Breakpoints mobile-first

## Dependências e Bibliotecas

### Produção
```javascript
// jsPDF - Geração de PDF
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

// Google Fonts - Tipografia
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

### Desenvolvimento
- **Vercel CLI**: Deploy e desenvolvimento local
- **Git**: Controle de versão
- **VS Code**: Editor recomendado com extensões HTML/CSS/JS

## Configurações de Build

### Vercel (vercel.json)
```json
{
  "rewrites": [
    { "source": "/gerador", "destination": "/proposta-gerador.html" },
    { "source": "/proposta", "destination": "/proposta-visualizacao.html" },
    { "source": "/editor", "destination": "/proposta-editor.html" }
  ]
}
```

### Netlify (netlify.toml)
```toml
[build]
  publish = "proposta-comercial"

[[redirects]]
  from = "/gerador"
  to = "/proposta-gerador.html"
  status = 200
```

## Comandos de Desenvolvimento

### Setup Local
```bash
# Clone do repositório
git clone <repository-url>
cd Proposta-Comercial/proposta-comercial

# Servidor local (Python)
python -m http.server 8000

# Ou Node.js
npx serve .

# Acesso local
http://localhost:8000
```

### Deploy Vercel
```bash
# Instalação Vercel CLI
npm i -g vercel

# Deploy inicial
vercel

# Deploy de produção
vercel --prod

# Logs em tempo real
vercel logs
```

### Deploy Netlify
```bash
# Instalação Netlify CLI
npm i -g netlify-cli

# Deploy manual
netlify deploy --dir=proposta-comercial

# Deploy de produção
netlify deploy --prod --dir=proposta-comercial
```

## Estrutura de Arquivos CSS

### Organização de Estilos
```css
/* Variáveis globais */
:root {
  --primary-color: #ff6b35;
  --secondary-color: #1a1a1a;
  --accent-color: #f8f9fa;
}

/* Reset e base */
* { box-sizing: border-box; }

/* Layout responsivo */
@media (max-width: 768px) { /* Mobile */ }
@media (min-width: 769px) { /* Desktop */ }
```

### Metodologia CSS
- **BEM**: Block Element Modifier para nomenclatura
- **Mobile-First**: Estilos base para mobile, expansão para desktop
- **CSS Grid**: Layout principal com fallback Flexbox
- **Custom Properties**: Variáveis CSS para consistência de tema

## APIs e Integrações

### Google Apps Script
```javascript
// Endpoint para salvar proposta
const SCRIPT_URL = 'https://script.google.com/macros/s/[ID]/exec';

// Estrutura de dados
const propostaData = {
  timestamp: new Date().toISOString(),
  cliente: 'Nome do Cliente',
  planos: ['social-media-scale', 'trafego-foco'],
  valores: { total: 4600, desconto: 460 }
};
```

### Local Storage
```javascript
// Cache de dados do formulário
localStorage.setItem('proposta-draft', JSON.stringify(formData));
const draft = JSON.parse(localStorage.getItem('proposta-draft'));
```

## Performance e Otimização

### Métricas Alvo
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3s

### Estratégias de Otimização
- **CSS Inline**: Estilos críticos inline para evitar FOUC
- **Lazy Loading**: Carregamento sob demanda de recursos
- **Minificação**: Compressão automática via Vercel/Netlify
- **CDN**: Distribuição global de assets estáticos

## Compatibilidade

### Navegadores Suportados
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+

### Polyfills Necessários
- **CSS Grid**: Suporte nativo (IE11 com prefixos)
- **Fetch API**: Suporte nativo em navegadores modernos
- **ES6 Features**: Transpilação não necessária para target browsers

## Monitoramento e Debug

### Ferramentas de Debug
```javascript
// Console logging para desenvolvimento
console.log('Proposta gerada:', propostaData);

// Error handling
try {
  await salvarProposta(data);
} catch (error) {
  console.error('Erro ao salvar:', error);
}
```

### Analytics
- **Vercel Analytics**: Métricas de performance automáticas
- **Console Logs**: Debug de fluxo de dados
- **Network Tab**: Monitoramento de requests