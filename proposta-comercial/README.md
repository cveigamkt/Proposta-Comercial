# 💼 Sistema de Proposta Comercial - Heat Digital

## Sobre
Sistema para criar e enviar propostas comerciais personalizadas para clientes potenciais.

## Arquivos

### Para VOCÊ (Administrador):
- **proposta-gerador.html** - Interface para criar propostas
- **proposta-gerador.js** - Lógica do gerador

### Para o CLIENTE:
- **proposta-visualizacao.html** - Proposta formatada (apenas leitura)
- **proposta-visualizacao.js** - Lógica da visualização

### Compartilhado:
- **proposta-styles.css** - Estilos de ambas as páginas

---

## 🎯 Como Funciona

### 1️⃣ Você cria a proposta
1. Abra `proposta-gerador.html`
2. Preencha os dados do cliente
3. Selecione os serviços
4. Configure valores e pagamento
5. Clique em "Gerar Link da Proposta"
6. Copie o link gerado

### 2️⃣ Cliente visualiza
1. Cliente abre o link que você enviou
2. Vê uma proposta profissional e completa
3. Pode aceitar ou entrar em contato
4. **Não pode editar nada**

---

## 📋 Serviços Disponíveis

### Social Media (Estratégia de Comunicação)
- **START** - R$ 1.200,00/mês
  - 3 posts semanais
  - Linha editorial
  - Até 8 artes/mês
  - Copywriting
  - Organização via plataforma
  - Análise de concorrentes

- **SCALE** - R$ 1.600,00/mês
  - 5 posts semanais
  - Linha editorial + manual
  - Até 12 artes/mês
  - Copywriting
  - Relatório mensal
  - Organização via plataforma
  - Análise de concorrentes

- **HEAT** - R$ 2.500,00/mês
  - 7 posts semanais
  - Linha editorial premium
  - Até 16 artes (feed, stories, carrosséis)
  - Copywriting estratégico
  - Relatórios completos
  - Monitoramento de tendências
  - Suporte em tempo real
  - Calendário de campanhas

### Tráfego Pago
- **FOCO** - R$ 1.897,00/mês
  - Investimento: R$ 5.000/mês
  - 3 Criativos em imagem (briefing + produção)
  - Rastreamento e acompanhamento de leads
  - Planejamento de campanhas
  - Script de vendas
  - Análise de concorrência
  - Definição de público-alvo (ICP)
  - Acompanhamento: 1 reunião mensal com o cliente

- **ACELERAÇÃO** - R$ 2.297,00/mês
  - Investimento: R$ 5.001 a 10.000/mês
  - 5 Criativos em imagem (briefing + produção)
  - Rastreamento e acompanhamento de leads
  - Planejamento de campanhas
  - Script de vendas
  - Análise de concorrência
  - Definição de público-alvo (ICP)
  - Acompanhamento: 2 reuniões mensais com o cliente

- **DESTAQUE** - Negociação
  - Investimento: R$ 10.001+/mês
  - 8 Criativos em imagem (briefing + produção)
  - Rastreamento e acompanhamento de leads
  - Planejamento de campanhas
  - Script de vendas
  - Análise de concorrência
  - Definição de público-alvo (ICP)
  - Acompanhamento: 4 reuniões mensais com o cliente + suporte estratégico direto do Head de Tráfego

---

## 💰 Valores e Desconto

- ✅ Cálculo automático do valor total
- ✅ **Desconto fixo de 5%** sempre aplicado
- ✅ Condições do desconto:
  - Responder pesquisa de satisfação
  - Pagamento em dia da mensalidade

### Formas de Pagamento
- À vista (Pix/Boleto)
- 50% agora + 50% em 30 dias
- Mensalidade recorrente

---

## 📊 O que o Cliente Vê

1. **Header** - Logo e tagline Heat
2. **Apresentação** - Nome, empresa, data
3. **Metodologia Heat** - 4 pilares principais
4. **Serviços Contratados** - Detalhamento completo
5. **Valores e Condições** - Transparente e claro
6. **Processo de Trabalho** - 4 etapas detalhadas
7. **CTA** - WhatsApp e e-mail para contato
8. **Footer** - Informações legais

---

## 🎨 Design

- ✅ Identidade visual Heat
- ✅ Design profissional e moderno
- ✅ Totalmente responsivo (mobile-friendly)
- ✅ Pronto para impressão
- ✅ Baseado nos slides da metodologia

---

## 🚀 Fluxo de Uso

```
VOCÊ                          CLIENTE
  │                              │
  ├─ Abre gerador               │
  ├─ Preenche dados             │
  ├─ Seleciona serviços         │
  ├─ Gera link                  │
  ├─ Copia link                 │
  │                              │
  └─ Envia link ──────────────> ├─ Recebe link
                                 ├─ Abre proposta
                                 ├─ Visualiza detalhes
                                 ├─ Avalia oferta
                                 └─ Contata para aceitar
```

---

## ⚙️ Tecnologias

- HTML5
- CSS3 (Grid, Flexbox)
- JavaScript (Vanilla)
- URL Parameters (para passar dados)
- Responsive Design
- Print-friendly CSS

---

## 📝 Observações

- ✅ Cliente **não pode editar** nada
- ✅ Todos os dados vão na URL (seguro para proposta)
- ✅ Link pode ser enviado via WhatsApp, E-mail, etc.
- ✅ Funciona offline depois de carregado
- ✅ Não precisa de servidor backend
- ✅ Pode ter ambos os serviços ou apenas um

---

## 🔒 Segurança

- Dados passados via URL (não armazenados)
- Cliente só visualiza (sem formulários)
- Validação no gerador antes de criar link
- Link único por proposta

---

## 🌐 Deploy e Acesso

### Acesso Local:
- **[index.html](./index.html)** - Página inicial com navegação
- **[proposta-gerador.html](./proposta-gerador.html)** - Gerador direto

### Deploy na Vercel:
- Suba todos os arquivos da pasta `proposta-comercial` para um repositório GitHub, GitLab ou Bitbucket.
- No Vercel, clique em "Add New Project" e selecione o repositório.
- Defina o diretório de publicação como `proposta-comercial`.
- O arquivo `vercel.json` já está configurado para rotas amigáveis.
- Clique em "Deploy" e acesse sua URL do Vercel.

## Rotas amigáveis
- `/` → página inicial
- `/gerador` → gerador de propostas
- `/proposta` → visualização da proposta

## Observação
Se quiser usar outra hospedagem, basta garantir que os arquivos HTML, JS e CSS estejam juntos e ajustar as rotas conforme a documentação da plataforma.
