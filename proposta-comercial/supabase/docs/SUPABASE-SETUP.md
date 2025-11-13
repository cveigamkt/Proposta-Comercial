# Configuração do Supabase para Sistema de Propostas

## 📋 Passo a Passo para Configurar

### 1. Criar Projeto no Supabase
1. Acesse https://supabase.com
2. Crie uma conta ou faça login
3. Clique em "New Project"
4. Preencha:
   - Nome: `heat-digital-propostas`
   - Database Password: (crie uma senha segura)
   - Region: South America (São Paulo) - mais próximo do Brasil
5. Aguarde a criação do projeto (~2 minutos)

### 2. Obter Credenciais
1. No painel do projeto, clique em **Settings** (⚙️)
2. Vá em **API**
3. Copie:
   - **Project URL**: `https://seu-projeto.supabase.co`
   - **anon public key**: `eyJhbGci...` (chave longa)

### 3. Atualizar Credenciais no Código
Edite o arquivo `supabase-config.js` e substitua:

```javascript
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-publica-aqui';
```

---

## 🗄️ Criar Tabelas no Banco de Dados

### Passo 1: Acessar SQL Editor
1. No painel do Supabase, clique em **SQL Editor** no menu lateral
2. Clique em **New query**

### Passo 2: Executar Scripts SQL

#### Script 1: Criar Tabela de Propostas

```sql
-- Criar tabela de propostas
CREATE TABLE propostas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Dados do cliente
    nome_cliente TEXT NOT NULL,
    empresa_cliente TEXT NOT NULL,
    email_cliente TEXT NOT NULL,
    telefone_cliente TEXT,
    cpf_cnpj TEXT NOT NULL,
    
    -- Serviços contratados
    servico_social_midia TEXT,
    servico_trafego_pago TEXT,
    investimento_midia TEXT,
    
    -- Condições comerciais
    recorrencia TEXT NOT NULL,
    forma_pagamento TEXT NOT NULL,
    valor_mensal NUMERIC(10,2) NOT NULL,
    valor_total NUMERIC(10,2) NOT NULL,
    desconto_aplicado NUMERIC(10,2) DEFAULT 0,
    
    -- Observações
    observacoes TEXT,
    
    -- Status e rastreamento
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aceita', 'recusada', 'cancelada')),
    aceita_em TIMESTAMP WITH TIME ZONE,
    ip_cliente TEXT,
    user_agent TEXT
);

-- Criar índices para melhor performance
CREATE INDEX idx_propostas_status ON propostas(status);
CREATE INDEX idx_propostas_email ON propostas(email_cliente);
CREATE INDEX idx_propostas_cpf_cnpj ON propostas(cpf_cnpj);
CREATE INDEX idx_propostas_created_at ON propostas(created_at DESC);

-- Adicionar comentários
COMMENT ON TABLE propostas IS 'Armazena todas as propostas comerciais geradas e aceitas';
COMMENT ON COLUMN propostas.status IS 'Status da proposta: pendente, aceita, recusada ou cancelada';
```

**Cole este script e clique em RUN** ▶️

---

#### Script 2: Criar Tabela de Contratos

```sql
-- Criar tabela de contratos
CREATE TABLE contratos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Relacionamento com proposta
    proposta_id UUID NOT NULL REFERENCES propostas(id) ON DELETE CASCADE,
    
    -- Dados do contrato
    pdf_url TEXT NOT NULL,
    assinatura_digital TEXT NOT NULL,
    ip_assinatura TEXT NOT NULL,
    timestamp_assinatura TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadados
    versao_contrato TEXT DEFAULT '1.0',
    hash_verificacao TEXT
);

-- Criar índices
CREATE INDEX idx_contratos_proposta_id ON contratos(proposta_id);
CREATE INDEX idx_contratos_created_at ON contratos(created_at DESC);

-- Adicionar comentários
COMMENT ON TABLE contratos IS 'Armazena os contratos gerados e assinados digitalmente';
COMMENT ON COLUMN contratos.assinatura_digital IS 'Hash SHA256 da assinatura para validação';
```

**Cole este script e clique em RUN** ▶️

---

### 4. Configurar Storage para PDFs

#### Passo 1: Criar Bucket
1. No painel do Supabase, clique em **Storage** no menu lateral
2. Clique em **Create a new bucket**
3. Preencha:
   - **Name**: `contratos`
   - **Public bucket**: ✅ Marque como público (para download dos PDFs)
4. Clique em **Create bucket**

#### Passo 2: Configurar Políticas de Acesso

**IMPORTANTE:** Use APENAS a interface do Dashboard para criar políticas de Storage. O SQL direto pode dar erro de permissão.

##### Via Interface do Dashboard (MÉTODO CORRETO)

##### Via Interface do Dashboard (MÉTODO CORRETO)

**Passo 1: Marcar bucket como público**
1. Vá em **Storage** no menu lateral
2. Clique nos 3 pontos ⋮ ao lado do bucket `contratos`
3. Clique em **Edit bucket**
4. ✅ Marque a opção **Public bucket**
5. Clique em **Save**

**Passo 2: Criar política de leitura (SELECT)**
1. Clique no bucket `contratos`
2. Vá na aba **Policies** (ao lado de Configuration)
3. Clique em **New Policy**
4. No campo **Policy name**, digite: `Public read access`
5. Em **Allowed operation**, marque apenas: **SELECT**
6. Em **Policy definition**, deixe o código que aparece por padrão (ou cole):
   ```sql
   ((bucket_id = 'contratos'::text))
   ```
7. Clique em **Review** e depois **Save policy**

**Passo 3: Criar política de upload (INSERT)**
1. Ainda na aba **Policies**, clique em **New Policy** novamente
2. No campo **Policy name**, digite: `Allow uploads`
3. Em **Allowed operation**, marque apenas: **INSERT**
4. Em **Target roles**, deixe selecionado: `public`
5. Em **Policy definition (WITH CHECK)**, cole:
   ```sql
   ((bucket_id = 'contratos'::text))
   ```
6. Clique em **Review** e depois **Save policy**

**Passo 4: (Opcional) Criar política de atualização (UPDATE)**
1. Clique em **New Policy** mais uma vez
2. No campo **Policy name**, digite: `Allow updates`
3. Em **Allowed operation**, marque: **UPDATE**
4. Em **Policy definition**, cole:
   ```sql
   ((bucket_id = 'contratos'::text))
   ```
5. Clique em **Review** e depois **Save policy**

##### Verificar se as Políticas Foram Criadas

**Via Dashboard:**
1. Vá em **Storage** → Clique no bucket `contratos`
2. Clique na aba **Policies**
3. Você deve ver pelo menos 2 políticas:
   - `Public read access` (SELECT)
   - `Allow uploads` (INSERT)

**Via SQL (Opcional):**
Execute no SQL Editor para confirmar:

```sql
-- Ver todas as políticas do storage
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;
```

##### Troubleshooting de Políticas

**Erro: "must be owner of table objects"**
- ❌ **NÃO use SQL direto para criar políticas de Storage**
- ✅ Use APENAS a interface do Dashboard (veja passos acima)
- O Supabase restringe modificações diretas na tabela `storage.objects` por segurança

**Erro: "Policy already exists"**
- Vá em Storage → bucket `contratos` → aba **Policies**
- Delete a política duplicada clicando nos 3 pontos ⋮ → Delete
- Crie novamente seguindo os passos acima

**Erro: "new row violates row-level security policy"**
- Verifique se o bucket está marcado como **Public** (Storage → ⋮ → Edit bucket → Public bucket ✅)
- Confirme que criou as políticas de SELECT e INSERT
- Verifique se o nome do bucket no código está correto: `'contratos'`

**Erro: "permission denied for table buckets"**
- Não tente usar SQL para modificar `storage.buckets`
- Use a interface: Storage → ⋮ ao lado do bucket → Edit bucket → Public bucket ✅

---

## ✅ Verificar Instalação

### Teste 1: Verificar Tabelas
Execute no SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('propostas', 'contratos');
```

Deve retornar 2 linhas: `propostas` e `contratos`

### Teste 2: Verificar Storage
1. Vá em **Storage**
2. Deve aparecer o bucket `contratos`

---

## 🔐 Segurança e Row Level Security (RLS)

### Habilitar RLS nas Tabelas

```sql
-- Habilitar RLS na tabela propostas
ALTER TABLE propostas ENABLE ROW LEVEL SECURITY;

-- Política: Permitir inserção pública (qualquer um pode criar proposta)
CREATE POLICY "Permitir criação de propostas"
ON propostas FOR INSERT
TO public
WITH CHECK (true);

-- Política: Permitir leitura apenas pelo admin (você configurará auth depois)
CREATE POLICY "Admin pode ler todas propostas"
ON propostas FOR SELECT
TO authenticated
USING (true);

-- Habilitar RLS na tabela contratos
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;

-- Política: Permitir inserção pública
CREATE POLICY "Permitir criação de contratos"
ON contratos FOR INSERT
TO public
WITH CHECK (true);

-- Política: Permitir leitura pública (para download do PDF)
CREATE POLICY "Permitir leitura de contratos"
ON contratos FOR SELECT
TO public
USING (true);
```

---

## 📊 Queries Úteis para Administração

### Ver todas as propostas aceitas
```sql
SELECT 
    id,
    nome_cliente,
    empresa_cliente,
    email_cliente,
    valor_total,
    status,
    aceita_em
FROM propostas
WHERE status = 'aceita'
ORDER BY aceita_em DESC;
```

### Ver propostas dos últimos 7 dias
```sql
SELECT 
    nome_cliente,
    empresa_cliente,
    valor_total,
    status,
    created_at
FROM propostas
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### Relatório de conversão
```sql
SELECT 
    status,
    COUNT(*) as quantidade,
    SUM(valor_total) as valor_total_somado
FROM propostas
GROUP BY status;
```

### Ver contratos gerados hoje
```sql
SELECT 
    c.id,
    p.nome_cliente,
    p.empresa_cliente,
    c.pdf_url,
    c.timestamp_assinatura
FROM contratos c
JOIN propostas p ON c.proposta_id = p.id
WHERE DATE(c.created_at) = CURRENT_DATE
ORDER BY c.created_at DESC;
```

---

## 🔄 Próximos Passos Opcionais

### 1. Dashboard Admin (Futuro)
- Criar painel para visualizar propostas
- Gráficos de conversão
- Exportar relatórios

### 2. Notificações por E-mail
- Integrar com SendGrid ou Resend
- Enviar contrato por e-mail automaticamente
- Notificar admin quando proposta for aceita

### 3. Webhook para CRM
- Integrar com RD Station, HubSpot, etc
- Enviar dados da proposta aceita automaticamente

---

## 🆘 Troubleshooting

### Erro: "relation does not exist"
- Verifique se executou os scripts SQL de criação das tabelas

### Erro: "new row violates row-level security policy"
- Verifique se criou as políticas de RLS corretamente

### Erro ao fazer upload de PDF
- Verifique se o bucket `contratos` foi criado
- **Certifique-se de que o bucket está marcado como PUBLIC:**
  - Vá em Storage → ⋮ ao lado do bucket → Edit bucket → ✅ Public bucket → Save
- **Verifique se as políticas foram criadas via Dashboard (NÃO via SQL):**
  - Vá em Storage → bucket `contratos` → aba **Policies**
  - Deve ter pelo menos: `Public read access` (SELECT) e `Allow uploads` (INSERT)
- **Teste direto no navegador:** Após criar as políticas, tente acessar:
  ```
  https://[SEU_PROJETO].supabase.co/storage/v1/object/public/contratos/test.pdf
  ```
  - **404** (not found) = ✅ políticas OK, arquivo não existe ainda
  - **401/403** (unauthorized) = ❌ políticas não configuradas ou bucket não é público

### Erro: "must be owner of table objects"
- ❌ Você tentou criar políticas de Storage via SQL
- ✅ Use APENAS a interface do Dashboard do Supabase
- Veja a seção "Configurar Políticas de Acesso" para o método correto

### Erro de CORS
- No Supabase, vá em Settings > API
- Em "CORS Origins", adicione: `*` (ou seu domínio específico)

### Erro: "bucket_id 'contratos' does not exist"
- O bucket não foi criado ou foi deletado
- Vá em Storage → Create a new bucket → Nome: `contratos` → Public bucket: ✅

### Erro: "relation storage.objects does not exist"
- Problema raro de configuração do Supabase
- Tente recriar o projeto ou contate o suporte do Supabase

---

## 📞 Suporte

Documentação oficial do Supabase:
- https://supabase.com/docs
- https://supabase.com/docs/guides/database
- https://supabase.com/docs/guides/storage

---

**✅ Após configurar tudo, o sistema estará pronto para:**
- Aceitar propostas com validação de CPF/CNPJ
- Gerar contratos em PDF automaticamente
- Armazenar tudo com segurança no Supabase
- Ter validade jurídica para assinatura eletrônica
