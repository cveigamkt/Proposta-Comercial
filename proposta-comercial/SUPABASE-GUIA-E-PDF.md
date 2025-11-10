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

- `propostas`: catálogo/modelo das propostas disponíveis.
- `propostas_criadas`: instâncias de propostas geradas/aceitas pelo cliente.
- `contratos`: registro do contrato gerado, incluindo `pdf_url` no Storage e metadados de assinatura.
- `representantes_proposta`: dados do representante capturados no aceite (nome, CPF, nascimento, contato, melhor dia de pagamento, etc.).
- `resumo_propostas` (view): consolida informações para o painel administrativo.

Scripts úteis no repositório:

- `SUPABASE-SCHEMA-PROPOSTAS.sql`: estrutura geral de propostas e contratos.
- `SUPABASE-ADD-REPRESENTANTE.sql`: cria a tabela `representantes_proposta`, índices e políticas RLS.

## Segurança com RLS e Políticas

- As tabelas têm **RLS habilitado** para controlar operações por linha.
- No `SUPABASE-ADD-REPRESENTANTE.sql`, as políticas são criadas de forma idempotente usando `DROP POLICY IF EXISTS` seguido de `CREATE POLICY` (Postgres não suporta `CREATE POLICY IF NOT EXISTS`).
- Políticas principais de `representantes_proposta`:
  - `INSERT` público: permite inserir dados do representante sem login (fluxo de aceite).
  - `SELECT` público: permite leitura para exibir dados no admin.
  - `UPDATE` público (campo `validado`): prepara terreno para validação manual no admin.
- O bucket `contratos` do Storage está configurado como **público**, com políticas adequadas para listar/obter arquivos. Cada upload define `contentType: 'application/pdf'`.

## Configuração do Cliente Supabase

- Variáveis necessárias: `SUPABASE_URL` e `SUPABASE_ANON_KEY`.
- O projeto centraliza a inicialização em `proposta-comercial/supabase-config.js`, expondo utilitários pelo objeto global `window.supabaseConfig`.
- Funções principais (podem variar conforme evolução do código):
  - `initSupabase()`: cria o cliente e o reutiliza.
  - `salvarPropostaAceita(dados)`: grava a proposta aceita em `propostas_criadas`/`propostas` com os campos relevantes do aceite.
  - `gerarEArmazenarContrato(propostaId, dadosContrato)`: gera o PDF via jsPDF, faz upload no bucket `contratos` e insere registro em `contratos` com `pdf_url` e metadados de assinatura.
  - `gerarPDFContrato(dadosContrato)`: monta o PDF em memória (Blob) usando jsPDF.
  - `salvarDadosRepresentante(dados)`: persiste os dados do representante em `representantes_proposta`, vinculados à proposta criada.
  - `checarBloqueioReassinatura(propostaCriadaId)`: consulta status para impedir reassinaturas indevidas.

## Fluxo de Assinatura e Contrato PDF

1. **Cliente aceita a proposta** na página `proposta-visualizacao.html`.
2. O sistema salva a proposta aceita (`salvarPropostaAceita`) e captura dados do representante (se fornecidos).
3. **Geração do PDF**: `gerarEArmazenarContrato` chama `gerarPDFContrato` (jsPDF) para produzir um `Blob` do contrato.
4. **Upload no Storage**: o PDF é enviado para o bucket `contratos` com nome único (`contrato-<propostaId>-<timestamp>.pdf`).
5. **Registro em `contratos`**: salva `pdf_url` pública e metadados (hash, IP, timestamp), permitindo que o admin ou o cliente façam o download.
6. A interface exibe um link “Baixar Contrato em PDF”.

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
- URL pública: obtida via `client.storage.from('contratos').getPublicUrl(nomeArquivo)` e salva na tabela `contratos` para referência futura.

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

- Índices: há índices em `representantes_proposta` e um índice único `uniq_representante_por_proposta` para evitar múltiplos representantes por proposta.
- View `resumo_propostas`: centraliza dados para o admin; se novas colunas forem adicionadas, considere atualizar a view.
- Segurança: como algumas operações são públicas, limite os campos permitidos e revise políticas regularmente.

## Checklist de Deploy

- [ ] Variáveis `SUPABASE_URL` e `SUPABASE_ANON_KEY` configuradas.
- [ ] Bucket `contratos` criado e público.
- [ ] Scripts SQL aplicados (tabelas, índices, RLS/políticas).
- [ ] Páginas que usam jsPDF com `<script>` CDN funcionando.
- [ ] Teste manual do fluxo: aceite da proposta → geração PDF → upload → download.

---

Para dúvidas, consulte `supabase-config.js`, `proposta-visualizacao.html` e `testar-contrato-pdf.html`, onde o fluxo completo está implementado.