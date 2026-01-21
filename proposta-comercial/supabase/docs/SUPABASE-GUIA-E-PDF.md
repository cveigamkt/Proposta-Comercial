# Guia: Supabase e PDFs no projeto Proposta-Comercial

Este documento explica, de forma prática, como o projeto usa o Supabase (banco de dados, segurança e storage) e como funciona a geração e o armazenamento dos contratos em PDF.

## Visão Geral do Supabase

- **Supabase** é uma plataforma que oferece Postgres gerenciado, autenticação, storage e APIs em tempo real, acessados via cliente JavaScript.
- No projeto, utilizamos: **Postgres (DB)**, **RLS/Policies** para segurança tabelar, e **Storage** para guardar os PDFs dos contratos. A autenticação não é obrigatória para os fluxos atuais, por isso algumas políticas permitem acesso público controlado.

## Componentes Usados no Projeto

- **Banco de Dados (Postgres)**: tabelas principais e uma view para relatórios.
- **Row Level Security (RLS)**: políticas que definem quem pode `SELECT/INSERT/UPDATE` em cada tabela.
- **Storage (Bucket `contratos`)**: armazena arquivos `.pdf`, com URL pública para download.
- **Cliente JS (`supabase-js`)**: o código cria um cliente e centraliza operações em `supabase-config.js`.

## Estrutura de Dados

- `propostas_criadas`: instâncias de propostas geradas/aceitas pelo cliente. No aceite, persistimos `recorrencia`, `forma_pagamento`, `email_cliente`, `telefone_cliente` e `melhor_dia_pagamento`.
- `proposta_itens`: itens selecionados pelo cliente no aceite, com preço, desconto e origem.
- `proposta_status_history`: trilha de status da proposta (`nova`, `enviada`, `aceita`, `itens_preenchidos`, etc.).
- `proposta_contratos`: registro do contrato gerado, incluindo `contrato_url` (no Storage) e metadados de assinatura (hash, IP, timestamps).
- `resumo_propostas` (view): consolida informações para o painel administrativo a partir de `propostas_criadas` e `proposta_contratos`.

Scripts úteis no repositório:

- `SUPABASE-SCHEMA-PROPOSTAS.sql`: estrutura geral de propostas e contratos.
- `SUPABASE-MIGRATION-ADD-CAMPOS-CLIENTE.sql`: adiciona `melhor_dia_pagamento` em `propostas_criadas` e recria a view `resumo_propostas`.
- `SUPABASE-MIGRATION-REMOVE-REPRESENTANTES.sql`: remove a tabela legada `representantes_proposta` e a view dependente `propostas_geradas`.

## Segurança com RLS e Políticas

- As tabelas têm **RLS habilitado** para controlar operações por linha.
- Fluxo atual sem autenticação: políticas permitem inserções e leituras necessárias para o aceite e para o painel admin, mantendo campos sensíveis restritos quando aplicável.
- Bucket `contratos` no Storage configurado como **público** para permitir download dos PDFs; uploads definem `contentType: 'application/pdf'`.

## Configuração do Cliente Supabase

- Variáveis necessárias: `SUPABASE_URL` e `SUPABASE_ANON_KEY`.
- O projeto centraliza a inicialização em `proposta-comercial/supabase-config.js`, expondo utilitários pelo objeto global `window.supabaseConfig`.
- Funções principais:
  - `initSupabase()`: cria o cliente e o reutiliza.
  - `atualizarPropostaNoSupabase(propostaId, dadosAceite)`: grava o aceite em `propostas_criadas` (status, recorrência, forma de pagamento, contato e melhor dia), persiste itens em `proposta_itens` e registra no `proposta_status_history`.
  - `gerarEArmazenarContrato(propostaCriadaId, dadosContrato)`: gera o PDF via jsPDF, faz upload no bucket `contratos` e insere registro em `proposta_contratos` com `contrato_url` e metadados.
  - `gerarPDFContrato(dadosContrato)`: monta o PDF em memória (Blob) usando jsPDF.
  - `checarBloqueioReassinatura(propostaCriadaId)`: consulta `proposta_contratos` para impedir reassinaturas indevidas.

## Fluxo de Assinatura e Contrato PDF

1. **Aceite pelo cliente** em `proposta-visualizacao.html` (modal em 3 etapas: Dados → Leitura → Assinar).
2. **Coleta de dados**: e-mail para faturamento, telefone de contato e melhor dia de pagamento, além dos dados do representante (CPF e data de nascimento).
3. **Persistência do aceite**: atualização de `propostas_criadas` com `status='aceita'`, `recorrencia`, `forma_pagamento`, `email_cliente`, `telefone_cliente` e `melhor_dia_pagamento`; gravação dos itens em `proposta_itens` e do status em `proposta_status_history`.
4. **Geração do PDF**: chamada a `gerarPDFContrato` (jsPDF) para produzir um `Blob` com base em `contrato-template.md` e nos dados do aceite.
5. **Upload no Storage**: envio do PDF para o bucket `contratos` com nome único (`contrato-<propostaId>-<timestamp>.pdf`).
6. **Registro em `proposta_contratos`**: salva `contrato_url` pública e metadados (hash, IP, timestamp).
7. **Admin**: a view `resumo_propostas` exibe `melhor_dia_pagamento`, e contatos do cliente, além do link do contrato.

## Geração de PDFs (jsPDF)

- Biblioteca: **jsPDF** via CDN UMD (`jspdf.umd.min.js`).
- Páginas de referência:
  - `proposta-visualizacao.html`: integra o aceite, geração e upload do contrato.
  - `testar-contrato-pdf.html`: gera um PDF de exemplo para validar layout e conteúdo.
- Abordagem de renderização:
  - Criação do `jsPDF()` e utilitário de parágrafo com quebra de linha (`splitTextToSize`).
  - Margens e paginação manual (adiciona páginas quando o conteúdo ultrapassa o limite).
  - Fonte padrão `helvetica`; há código de suporte para fontes Unicode se necessário.
- Template: o arquivo `contrato-template.md` pode ser carregado e interpolado para compor o texto base do contrato, garantindo consistência de layout.
- Hash de assinatura: função `gerarHashAssinatura` cria um identificador a partir dos dados do aceite (usa `CryptoJS.SHA256` quando disponível ou `btoa` como fallback).

## Storage de Contratos

- Bucket: `contratos` (público), com políticas que permitem upload e leitura.
- Upload: feito pelo cliente Supabase com `contentType: 'application/pdf'` e `upsert: false`.
- URL pública: obtida via `client.storage.from('contratos').getPublicUrl(nomeArquivo)` e salva na tabela `proposta_contratos` para referência futura.

## Como Testar Localmente

1. Garanta que o Supabase tenha:
   - Tabelas criadas e RLS habilitado.
   - Bucket `contratos` criado como público.
   - Políticas do `representantes_proposta` aplicadas (use `SUPABASE-ADD-REPRESENTANTE.sql`).
2. Configure `SUPABASE_URL` e `SUPABASE_ANON_KEY` no ambiente cliente (variáveis usadas por `supabase-config.js`).
3. Suba um servidor local (exemplos):
   - `npm start` na raiz do projeto;
   - ou `npx http-server proposta-comercial -p 8000`.
4. Acesse:
   - `proposta-visualizacao.html` para executar o fluxo completo (aceite + PDF + upload);
   - `testar-contrato-pdf.html` para gerar um PDF de exemplo sem integração com DB.

## Erros Comuns e Soluções

- `CREATE POLICY IF NOT EXISTS`: não suportado pelo Postgres/Supabase. Use `DROP POLICY IF EXISTS` e depois `CREATE POLICY`.
- `403` no Storage: verifique se o bucket `contratos` é público e se as políticas permitem upload/leitura.
- `EADDRINUSE` ao iniciar servidor: a porta já está ocupada. Altere a porta (`-p 8081`) ou finalize o processo anterior.
- Falha ao carregar jsPDF: confirme o `<script>` do CDN e a ordem de carregamento antes de chamar funções que dependem de `window.jspdf`.

## Manutenção e Observações

- View `resumo_propostas`: centraliza dados para o admin; se novas colunas forem adicionadas, considere atualizar a view.
- Segurança: como algumas operações são públicas, limite os campos permitidos e revise políticas regularmente.
- Legado removido: `representantes_proposta` e a view `propostas_geradas` foram descontinuadas; todos os dados relevantes agora residem em `propostas_criadas` e `proposta_contratos`.

## Checklist de Deploy

- [ ] Variáveis `SUPABASE_URL` e `SUPABASE_ANON_KEY` configuradas.
- [ ] Bucket `contratos` criado e público.
- [ ] Scripts SQL aplicados (tabelas, índices, RLS/políticas).
- [ ] Páginas que usam jsPDF com `<script>` CDN funcionando.
- [ ] Teste manual do fluxo: aceite da proposta → geração PDF → upload → download.

---

Para dúvidas, consulte `supabase-config.js`, `proposta-visualizacao.html` e `testar-contrato-pdf.html`, onde o fluxo completo está implementado.