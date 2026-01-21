# Changelog - Sistema de Propostas Comerciais

## [2.1.0] - 2025-11-19

### Comissão Híbrida (% ou Fixo)
- Permite escolher entre comissão percentual (%) ou valor fixo por venda no modelo Híbrido.
- Atualizações em `proposta-gerador.html`, `proposta-gerador.js` e `proposta-visualizacao.html` para exibição e cálculo.
- Script `SUPABASE-UPDATE-COMISSAO-FIXA.sql` adiciona campos em `propostas_criadas`/`propostas` e atualiza views.

### Proteções de Propostas Assinadas
- Bloqueio de edição e exclusão no `admin.html` para propostas com status aceito/assinado.
- Redirecionamento e proteção no gerador (`proposta-gerador.js`) para evitar edição de propostas assinadas.
- Exibição consistente de recorrência e forma de pagamento.

### Observações
- Consulte a seção de instruções para execução de scripts e validações.

## [2.0.0] - 2025-01-07

### ✨ Novas Funcionalidades

#### 1. Valores Separados por Serviço
- **Social Media**: Valor mensal do plano agora é registrado separadamente
- **Tráfego Pago**: Valor mensal do plano agora é registrado separadamente
- **Investimento em Mídia**: Continua como campo de texto independente
- **Benefício**: Permite análise detalhada da composição da receita

#### 2. CPF/CNPJ Obrigatório
- Campo CPF/CNPJ agora é **obrigatório** no gerador de propostas
- Validação automática de formato (CPF ou CNPJ)
- Exibido no painel admin para facilitar buscas e identificação
- **Benefício**: Rastreamento preciso de clientes

#### 3. Recorrência Capturada na Assinatura
- Cliente escolhe período ao assinar: **3, 6 ou 12 meses**
- Valor total é recalculado automaticamente
- Salvo na tabela `propostas` (propostas aceitas)
- Exibido no painel admin
- **Benefício**: Registro preciso do compromisso contratual

#### 4. Forma de Pagamento Capturada na Assinatura
- Cliente escolhe ao assinar: **À Vista ou Parcelado**
- Salvo na tabela `propostas` (propostas aceitas)
- Exibido no painel admin
- **Benefício**: Controle de fluxo de caixa e cobrança

### 🔄 Alterações

#### Gerador de Propostas (`proposta-gerador.js`)
```diff
+ Cálculo de valor_social_midia separado
+ Cálculo de valor_trafego_pago separado
+ Validação obrigatória de CPF/CNPJ
+ Envio dos valores separados para o Supabase
```

#### Visualização de Propostas (`proposta-visualizacao.html`)
```diff
+ Cálculo de valores separados a partir dos serviços contratados
+ Captura de recorrência no wizard (3, 6 ou 12 meses)
+ Captura de forma de pagamento no wizard (À Vista/Parcelado)
+ Envio dos novos campos para salvarPropostaAceita
```

#### Configuração Supabase (`supabase-config.js`)
```diff
+ Recebe e salva valor_social_midia
+ Recebe e salva valor_trafego_pago
+ Campos incluídos na inserção em 'propostas'
```

#### Painel Admin (`admin.html`)
```diff
+ Coluna "CPF/CNPJ"
+ Coluna "Recorrência"
+ Coluna "Pagamento"
+ Valores separados exibidos na coluna "Serviços"
  - 📱 PLANO (R$ X,XX)
  - 🎯 PLANO (R$ X,XX)
  - 💰 Mídia: R$ X,XX
+ Prioriza dados da assinatura sobre dados da proposta criada
```

#### Banco de Dados (Supabase)
```sql
-- Tabela: propostas_criadas
+ valor_social_midia DECIMAL(10,2)
+ valor_trafego_pago DECIMAL(10,2)

-- Tabela: propostas
+ valor_social_midia DECIMAL(10,2)
+ valor_trafego_pago DECIMAL(10,2)

-- View: resumo_propostas
+ Inclui todos os novos campos
+ Inclui recorrencia_assinada
+ Inclui forma_pagamento_assinada
```

### 📦 Arquivos Adicionados

1. **SUPABASE-UPDATE-VALORES-SEPARADOS.sql**
   - Script de migração do banco de dados
   - Adiciona colunas necessárias
   - Atualiza view do admin
   - Adiciona comentários de documentação

2. **INSTRUCOES-ATUALIZACAO.md**
   - Guia completo de instalação da atualização
   - Passo a passo de testes
   - Solução de problemas comuns
   - Estrutura de dados explicada

3. **CHANGELOG.md** (este arquivo)
   - Histórico de versões
   - Documentação de mudanças

### 🐛 Correções

- Validação de CPF/CNPJ agora bloqueia geração de proposta sem documento válido
- Valores são sempre calculados e enviados corretamente ao banco
- Fallback no admin inclui todos os campos necessários

### 🔧 Melhorias de Código

- Separação clara de responsabilidades no cálculo de valores
- Comentários adicionados para facilitar manutenção
- Campos opcionais tratados com fallback apropriado
- Lógica de priorização de dados (assinados > criados)

### 📊 Impacto no Banco de Dados

#### Antes (v1.0)
```
propostas_criadas:
- valor_mensal (total combinado)
- valor_total
- recorrencia (apenas padrão)
- forma_pagamento (apenas padrão)
```

#### Depois (v2.0)
```
propostas_criadas:
- valor_mensal (total combinado)
- valor_social_midia ✨ NOVO
- valor_trafego_pago ✨ NOVO
- valor_total
- recorrencia (será sobrescrito na assinatura)
- forma_pagamento (será sobrescrito na assinatura)

propostas (aceitas):
- [todos os campos acima]
- recorrencia ✨ ATUALIZADO (escolha real do cliente)
- forma_pagamento ✨ ATUALIZADO (escolha real do cliente)
```

### 🎯 Casos de Uso Melhorados

#### Análise Financeira
**Antes**: "Quanto faturamos com Social Media?"
- Resposta: Impossível saber sem análise manual

**Depois**: Query direto no Supabase:
```sql
SELECT SUM(valor_social_midia) as receita_social_media
FROM propostas
WHERE status = 'aceita';
```

#### Busca de Clientes
**Antes**: Buscar por nome ou email
**Depois**: Buscar por nome, email, empresa ou **CPF/CNPJ**

#### Gestão de Contratos
**Antes**: Recorrência e pagamento eram campos genéricos
**Depois**: Dados reais capturados no momento da assinatura

### 🚀 Próximos Passos Sugeridos

1. **Dashboard de Métricas**
   - Total de receita por serviço
   - Distribuição de recorrências (3/6/12 meses)
   - Preferência de forma de pagamento

2. **Exportação de Dados**
   - CSV/Excel com todos os campos
   - Filtros avançados

3. **Notificações**
   - Email ao gerar proposta
   - Email ao aceitar proposta
   - Lembrete de renovação baseado em recorrência

4. **Relatórios**
   - Propostas pendentes por período
   - Taxa de conversão
   - Ticket médio por serviço

### 📚 Documentação Atualizada

- ✅ README.md atualizado com novos campos
- ✅ Schema SQL documentado com comentários
- ✅ Instruções de atualização criadas
- ✅ Changelog mantido

### 🔒 Segurança

- Validação de CPF/CNPJ no frontend
- Campos obrigatórios garantem integridade dos dados
- RLS (Row Level Security) mantido e funcional

### ⚠️ Breaking Changes

Nenhuma breaking change - sistema é **retrocompatível**:
- Propostas antigas continuam funcionando
- Novos campos são opcionais no banco (DEFAULT 0)
- View admin trata campos ausentes com fallback

### 📈 Métricas de Sucesso

Após implementar esta atualização, você poderá:
- ✅ Separar receita por tipo de serviço
- ✅ Buscar clientes por CPF/CNPJ
- ✅ Analisar preferências de recorrência
- ✅ Planejar fluxo de caixa baseado em forma de pagamento
- ✅ Gerar relatórios mais detalhados

---

## [1.0.0] - 2025-01-06

### ✨ Versão Inicial

- Sistema de geração de propostas com UUID
- Visualização e aceite de propostas
- Wizard de assinatura em 3 etapas
- Geração de PDF com fontes Roboto
- Painel administrativo básico
- Integração com Supabase
- Servidor local configurado

---

**Mantido por**: Equipe de Desenvolvimento
**Última Atualização**: 07/01/2025
