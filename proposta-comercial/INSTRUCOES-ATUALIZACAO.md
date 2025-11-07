# Instruções de Atualização - Valores Separados e Dados Completos

## ✅ Melhorias Implementadas

Esta atualização adiciona os seguintes recursos ao sistema:

1. **CPF/CNPJ do Cliente**: Agora é obrigatório no gerador e será exibido no painel admin
2. **Valores Separados**: Social Media e Tráfego Pago aparecem com valores individuais
3. **Recorrência**: Capturada no wizard de assinatura (3, 6 ou 12 meses)
4. **Forma de Pagamento**: Capturada no wizard de assinatura (À Vista ou Parcelado)

## 📋 Passos para Aplicar a Atualização

### 1. Executar Script SQL no Supabase

**IMPORTANTE**: Execute este passo primeiro antes de testar o sistema!

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral esquerdo)
4. Abra o arquivo `SUPABASE-UPDATE-VALORES-SEPARADOS.sql`
5. Cole o conteúdo completo no editor SQL
6. Clique em **Run** para executar
7. Verifique se apareceu "Success. No rows returned" (isso é normal)

**O que este script faz:**
- Adiciona colunas `valor_social_midia` e `valor_trafego_pago` nas tabelas
- Atualiza a view `resumo_propostas` para incluir os novos campos
- Adiciona comentários de documentação

### 2. Verificar as Alterações

Após executar o SQL, verifique no **Table Editor**:

#### Tabela `propostas_criadas`
Deve ter as colunas:
- ✅ `cpf_cnpj` (já existia)
- ✅ `valor_social_midia` (nova)
- ✅ `valor_trafego_pago` (nova)
- ✅ `investimento_midia` (já existia)
- ✅ `recorrencia` (já existia)
- ✅ `forma_pagamento` (já existia)

#### Tabela `propostas`
Deve ter as mesmas colunas acima.

#### View `resumo_propostas`
Deve incluir todos os campos para o painel admin.

### 3. Testar o Fluxo Completo

#### 3.1. Gerar Nova Proposta
1. Acesse `http://localhost:8081/proposta-gerador.html`
2. Preencha todos os campos, **incluindo CPF/CNPJ**
3. Clique em "Gerar Link da Proposta"
4. Copie o link gerado

**O que deve acontecer:**
- Os valores de Social Media e Tráfego Pago são calculados e salvos separadamente
- CPF/CNPJ é obrigatório e validado
- Link UUID é gerado corretamente

#### 3.2. Visualizar e Assinar Proposta
1. Abra o link da proposta em nova aba
2. Preencha os dados do cliente (nome, CPF/CNPJ, email, telefone)
3. **Selecione a recorrência** (3, 6 ou 12 meses)
4. **Selecione a forma de pagamento** (À Vista ou Parcelado)
5. Leia o contrato e aceite
6. Assine o contrato

**O que deve acontecer:**
- Os valores são recalculados baseados na recorrência escolhida
- A forma de pagamento é registrada
- Contrato PDF é gerado e salvo no Storage
- Proposta é marcada como "aceita"

#### 3.3. Verificar no Painel Admin
1. Acesse `http://localhost:8081/admin.html`
2. Busque pela proposta (nome, CPF/CNPJ ou empresa)

**O que você deve ver:**
```
| Data | Cliente | Empresa | CPF/CNPJ | Serviços | Valores | Recorrência | Pagamento | Status | Proposta | Contrato |
|------|---------|---------|----------|----------|---------|-------------|-----------|--------|----------|----------|
| ...  | João    | ABC     | 123...   | 📱 START (R$ 1.500,00) | R$ 3.900,00/mês | 6 meses | À Vista | Aceita | [Abrir] [Copiar] | [PDF] |
|      |         |         |          | 🎯 FOCO (R$ 2.400,00)  | Total: R$ 23.400,00 |     |         |        |          |           |
|      |         |         |          | 💰 Mídia: R$ 3.000,00  |                     |     |         |        |          |           |
```

## 📊 Estrutura de Dados

### Proposta Criada (gerador)
```javascript
{
  nome_cliente: "João Silva",
  cpf_cnpj: "123.456.789-00",          // ✨ Obrigatório
  servico_social_midia: "START",
  servico_trafego_pago: "FOCO",
  valor_social_midia: 1500.00,         // ✨ Novo
  valor_trafego_pago: 2400.00,         // ✨ Novo
  investimento_midia: "R$ 3.000,00",
  valor_mensal: 3900.00,
  valor_total: 23400.00,               // Recalculado na assinatura
  recorrencia: "Mensal",               // Padrão inicial
  forma_pagamento: "À Vista"           // Padrão inicial
}
```

### Proposta Assinada (após aceite)
```javascript
{
  // ... todos os campos acima +
  recorrencia: "6 meses",              // ✨ Escolha do cliente
  forma_pagamento: "Parcelado",        // ✨ Escolha do cliente
  status: "aceita",
  aceita_em: "2025-01-07T..."
}
```

## 🎨 Painel Admin - Novidades

### Colunas Adicionadas
1. **CPF/CNPJ**: Exibe o documento do cliente
2. **Recorrência**: Mostra o período contratado (3, 6 ou 12 meses)
3. **Pagamento**: Mostra a forma de pagamento escolhida

### Coluna Serviços Atualizada
Agora exibe:
```
📱 START (R$ 1.500,00)
🎯 FOCO (R$ 2.400,00)
💰 Mídia: R$ 3.000,00
```

Valores individuais facilitam análise de composição da receita.

### Priorização de Dados
O painel usa os dados da assinatura quando disponíveis:
- `recorrencia_assinada` > `recorrencia` (da proposta criada)
- `forma_pagamento_assinada` > `forma_pagamento` (da proposta criada)

## 🐛 Solução de Problemas

### Erro: "column does not exist"
**Causa**: Script SQL não foi executado
**Solução**: Execute o arquivo `SUPABASE-UPDATE-VALORES-SEPARADOS.sql` no Supabase

### Valores aparecem como 0 ou null no admin
**Causa**: Propostas antigas criadas antes da atualização
**Solução**: Gere novas propostas. As antigas não terão os valores separados.

### CPF/CNPJ não aparece no painel
**Causa**: Campo não preenchido no gerador
**Solução**: Agora o campo é obrigatório. Regenere a proposta.

### Recorrência/Pagamento aparecem como "—"
**Causa**: Cliente não selecionou no wizard de assinatura
**Solução**: Isso não deve acontecer mais. Verifique se o wizard está exibindo as opções corretamente.

## 📝 Notas Importantes

1. **Propostas Antigas**: Propostas criadas antes desta atualização não terão valores separados (aparecerão como 0 ou null)
2. **Migração**: Não é necessário migrar dados antigos - apenas novas propostas usarão os novos campos
3. **Compatibilidade**: O sistema continua funcionando com propostas antigas, mas os novos campos não estarão preenchidos
4. **Validação**: CPF/CNPJ é validado automaticamente no gerador

## ✨ Benefícios

1. **Análise Financeira**: Separa receita de Social Media vs Tráfego Pago
2. **Rastreamento**: CPF/CNPJ permite busca precisa no painel
3. **Controle**: Recorrência e forma de pagamento registrados para análise
4. **Transparência**: Cliente vê valores detalhados antes de assinar
5. **Relatórios**: Dados estruturados facilitam exportação e análise

## 📞 Suporte

Se encontrar problemas:
1. Verifique o console do navegador (F12)
2. Confirme que o SQL foi executado corretamente
3. Teste com uma nova proposta do zero
4. Verifique se todas as validações estão passando

---

**Versão**: 2.0 - Valores Separados
**Data**: 07/01/2025
**Status**: ✅ Pronto para Produção
