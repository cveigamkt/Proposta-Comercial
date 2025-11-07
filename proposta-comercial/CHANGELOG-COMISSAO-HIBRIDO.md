# Changelog - Comissão Híbrida com Opção % ou Fixo

## 📋 Resumo da Alteração
Adicionada funcionalidade para o modelo **Híbrido** permitir escolher entre:
- **Comissão Percentual** (%) sobre vendas
- **Comissão Fixa** (R$) por venda

Anteriormente, o modelo híbrido exigia valor fixo mensal + percentual sobre vendas. Agora permite valor fixo mensal + escolha entre % OU R$ fixo por venda.

## 🗂️ Arquivos Alterados

### 1. **proposta-gerador.html**
**Alterações:**
- Adicionado campo `<select id="tipoComissaoHibrido">` com opções:
  - `percentual` - Percentual (%)
  - `fixo` - Valor Fixo (R$)
- Adicionado campo `<input id="valorComissaoFixa">` para valor fixo por venda
- Container `tipoComissaoHibridoContainer` exibido apenas quando modelo = híbrido
- Container `valorComissaoFixaContainer` exibido quando tipo = fixo

**Localização:** Linhas ~172-204 (seção Modelo de Cobrança)

---

### 2. **proposta-gerador.js**
**Alterações:**

#### Event Listeners (linhas ~320-380)
- `modeloCobranca.addEventListener('change')`: 
  - Agora gerencia `tipoComissaoHibridoContainer` e `valorComissaoFixaContainer`
  - Exibe seletor de tipo quando híbrido
  
- **NOVO:** `tipoComissaoHibrido.addEventListener('change')`:
  - Alterna entre `percentualComissaoContainer` e `valorComissaoFixaContainer`
  - Limpa campo não utilizado quando alterna

- **NOVO:** `valorComissaoFixa.addEventListener('input')`:
  - Atualiza valores e badge quando comissão fixa muda

#### Função atualizarBadgeComissao() (linhas ~639-660)
- Agora verifica `tipoComissaoHibrido`
- Exibe badge diferente conforme tipo:
  - Percentual: `+ 5% sobre vendas`
  - Fixo: `+ R$ 50.00 por venda`

#### Função coletarDadosFormulario() (linhas ~595-610)
- Adiciona ao objeto retornado:
  - `tipoComissaoHibrido`
  - `valorComissaoFixa`

#### Função salvarProposta() (linhas ~485-515)
- Salva no Supabase (propostas_criadas):
  - `tipo_comissao_hibrido`
  - `valor_comissao_fixa`

---

### 3. **proposta-visualizacao.html**
**Alterações em 4 locais:**

#### Cards de Serviço (linhas ~1724-1750)
- Lê `tipo_comissao_hibrido` e `valor_comissao_fixa` da URL ou propostaCarregada
- Exibe no card:
  - Híbrido %: `Híbrido: R$ 1.500 + 5% sobre vendas`
  - Híbrido R$: `Híbrido: R$ 1.500 + R$ 50.00 por venda`

#### Detalhamento Serviços (linhas ~1878-1905)
- Mesma lógica para exibição no resumo de valores

#### Resumo de Serviços (linhas ~1987-2010)
- Mesma lógica para modal de resumo

#### Geração de Contrato (linhas ~3340-3370)
- `cobrancaDescricao`: formatação correta conforme tipo
- `clausulaComissao`: 
  - Se `pctComissao > 0`: cláusula com percentual
  - Se `valorComissaoFixa > 0`: cláusula com valor fixo por venda
  - Ambas incluem valor fixo mensal se híbrido

#### Aceite de Proposta (linhas ~3035-3065)
- Adiciona ao `dadosProposta`:
  - `tipoComissaoHibrido`
  - `valorComissaoFixa`

---

### 4. **SUPABASE-UPDATE-COMISSAO-FIXA.sql** (NOVO)
**Criado script SQL para:**
- Adicionar colunas em `propostas_criadas` e `propostas`:
  - `tipo_comissao_hibrido VARCHAR(20) DEFAULT 'percentual'`
  - `valor_comissao_fixa DECIMAL(10,2) DEFAULT 0`
- Recriar view `resumo_propostas` incluindo novos campos
- Comentários de documentação

**⚠️ IMPORTANTE:** Execute este script no Supabase SQL Editor antes de usar a funcionalidade!

---

## 🎯 Modelos de Cobrança Suportados

### 1. **Fixo**
- Apenas valor fixo mensal do plano
- `tem_comissao_vendas = false`
- `valor_fixo_trafego > 0`

### 2. **Comissão Pura (%)**
- Apenas percentual sobre vendas
- `tem_comissao_vendas = true`
- `percentual_comissao > 0`
- `valor_fixo_trafego = 0`

### 3. **Híbrido com Percentual**
- Valor fixo mensal + percentual sobre vendas
- `tem_comissao_vendas = true`
- `tipo_comissao_hibrido = 'percentual'`
- `percentual_comissao > 0`
- `valor_fixo_trafego > 0`

### 4. **Híbrido com Valor Fixo** ⭐ NOVO
- Valor fixo mensal + R$ fixo por venda
- `tem_comissao_vendas = true`
- `tipo_comissao_hibrido = 'fixo'`
- `valor_comissao_fixa > 0`
- `valor_fixo_trafego > 0`

---

## 📝 Exemplo de Uso

### Cenário: Híbrido com R$ 50 por venda
1. Gerador:
   - Seleciona "Tráfego Pago: Plano Advanced"
   - Modelo de Cobrança: **Híbrido**
   - Tipo de Comissão: **Valor Fixo (R$)**
   - Valor Fixo Mensal: **1500**
   - Valor Fixo por Venda: **50**

2. Badge exibida no card: `+ R$ 50.00 por venda`

3. Visualização mostra: `Híbrido: R$ 1.500,00/mês + R$ 50,00 por venda`

4. Contrato inclui cláusula:
   > "Para o serviço de Tráfego Pago, as partes acordam a remuneração adicional de R$ 50,00 (reais) por venda realizada e atribuída às campanhas... Esta comissão é devida cumulativamente ao valor fixo mensal de R$ 1.500,00."

---

## ✅ Checklist de Implementação

- [x] HTML: Campos `tipoComissaoHibrido` e `valorComissaoFixa`
- [x] JS: Event listeners para alternar entre % e R$
- [x] JS: Função `atualizarBadgeComissao` com suporte a valor fixo
- [x] JS: Coletar dados no `coletarDadosFormulario`
- [x] JS: Salvar no Supabase com novos campos
- [x] Visualização: Exibir corretamente em cards e resumos
- [x] Visualização: Cláusula de contrato diferenciada
- [x] SQL: Script de migração criado
- [ ] **SQL: EXECUTAR script no Supabase** ⚠️
- [ ] Testar fluxo completo: Gerar → Visualizar → Aceitar → PDF

---

## 🚀 Próximos Passos

1. **Executar SUPABASE-UPDATE-COMISSAO-FIXA.sql** no Supabase
2. Testar criação de proposta com modelo híbrido (% e R$)
3. Verificar exibição correta na visualização
4. Confirmar PDF do contrato com cláusula adequada
5. Adicionar coluna "Cobrança" no painel admin para exibir modelo (pendente)

---

**Data:** 7 de novembro de 2025  
**Autor:** GitHub Copilot  
**Solicitação:** "NO comissão sobre vendas Hibrido tem q ter a opção de vendas % ou fixo"
