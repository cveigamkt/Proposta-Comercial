# Estrutura do Projeto - Sistema de Proposta Comercial

## Organização de Diretórios
```
Proposta-Comercial/
├── .amazonq/rules/memory-bank/     # Documentação do Memory Bank
├── proposta-comercial/             # Aplicação principal
│   ├── index.html                  # Página inicial com navegação
│   ├── proposta-gerador.html       # Interface de criação de propostas
│   ├── proposta-visualizacao.html  # Visualização da proposta para cliente
│   ├── proposta-styles.css         # Estilos CSS responsivos
│   ├── proposta-gerador.js         # Lógica do gerador de propostas
│   ├── google-apps-script-novo.gs  # Script para integração Google Sheets
│   ├── vercel.json                 # Configuração de deploy Vercel
│   └── README.md                   # Documentação do sistema
├── .gitattributes                  # Configurações Git
└── netlify.toml                    # Configuração alternativa de deploy
```

## Componentes Principais

### Interface do Usuário
- **index.html**: Landing page com branding Heat Digital e navegação principal
- **proposta-gerador.html**: Formulário completo para criação de propostas com validação
- **proposta-visualizacao.html**: Interface profissional para visualização e aceitação pelo cliente
- **proposta-styles.css**: Estilos unificados com design responsivo e tema Heat Digital

### Lógica de Negócio
- **proposta-gerador.js**: Cálculos de preços, validações e geração de links únicos
- **google-apps-script-novo.gs**: Backend para armazenamento em Google Sheets com sistema de duas abas

### Configuração e Deploy
- **vercel.json**: Rewrites para URLs amigáveis (/gerador, /proposta)
- **README.md**: Documentação completa do sistema e instruções de uso

## Padrões Arquiteturais

### Frontend
- **Single Page Application (SPA)**: Navegação via JavaScript sem recarregamento
- **Mobile-First Design**: CSS responsivo com breakpoints para diferentes dispositivos
- **Component-Based Structure**: Separação clara entre apresentação, lógica e estilos

### Backend
- **Serverless Architecture**: Google Apps Script como backend sem servidor
- **RESTful API**: Endpoints para criação e aceitação de propostas
- **Data Persistence**: Google Sheets como banco de dados com estrutura normalizada

### Integração
- **URL Parameters**: Transferência de dados entre páginas via query strings
- **Local Storage**: Cache temporário de dados do formulário
- **CORS Headers**: Configuração para comunicação cross-origin

## Fluxo de Dados
1. **Criação**: Formulário → JavaScript → Google Apps Script → Google Sheets (Propostas Enviadas)
2. **Visualização**: URL Parameters → JavaScript → Renderização dinâmica
3. **Aceitação**: Formulário Cliente → Google Apps Script → Google Sheets (Propostas Aceitas)
4. **Export**: jsPDF → Geração local de PDF → Download automático

## Arquitetura de Deploy

### Vercel (Principal)
- Rewrites configurados para URLs amigáveis
- Headers otimizados para performance
- Deploy automático via Git integration
- CDN global para carregamento rápido

### Netlify (Alternativo)
- Configuração via netlify.toml
- Redirects e headers personalizados
- Build commands para otimização

## Responsabilidades dos Componentes

### Camada de Apresentação
- **HTML**: Estrutura semântica e acessibilidade
- **CSS**: Design system consistente e responsividade
- **JavaScript**: Interatividade e validações client-side

### Camada de Negócio
- **Cálculos**: Algoritmos de precificação e descontos
- **Validações**: Regras de negócio e consistência de dados
- **Integrações**: Comunicação com APIs externas

### Camada de Dados
- **Google Sheets**: Persistência de propostas e histórico
- **Local Storage**: Cache temporário e preferências
- **URL Parameters**: Estado da aplicação e compartilhamento