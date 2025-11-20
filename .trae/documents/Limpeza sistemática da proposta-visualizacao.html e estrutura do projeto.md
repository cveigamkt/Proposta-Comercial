## Diagnóstico Inicial
- Arquivo alvo: `proposta-comercial/proposta-visualizacao.html`
- Problemas estruturais:
  - Fechamentos desbalanceados no bloco “Timer Fixo”: `</div>` extra e `</section>` indevido em `proposta-comercial/proposta-visualizacao.html:1298–1299`.
  - Duplo `</script>` e JS residual após `</html>` em `proposta-comercial/proposta-visualizacao.html:6273–6291`.
  - Uso de `#nomeCliente` sem elemento correspondente (ex.: PDF em `proposta-comercial/proposta-visualizacao.html:3927`); há fallback parcial, arrisca inconsistência.
- Ruído e manutenção:
  - Comentários “Linha X” no resumo financeiro (1410–1468) e marcadores redundantes em seções (“ETAPA X”, 4805–4951).
  - Logs extensos com `console.log` espalhados; já existem utilitários `reportError/reportWarn/reportInfo` (10–45), melhor centralizar.
- Dependências essenciais e não quebrar:
  - `supabase-config.js` (5068) e `@supabase/supabase-js@2` (5066).
  - `jsPDF` (8) e `validacao-cpf-cnpj.js` (5067).

## Escopo e Critérios de Remoção
- Código obsoleto/não utilizado: trechos pós-`</html>`, fechamentos incorretos, referências a elementos inexistentes, funções/comentários comentados sem uso.
- Pastas vazias: apenas remover diretórios totalmente vazios e sem `.gitkeep`; manter `supabase/.temp` e pastas técnicas.
- Documentação desatualizada: consolidar changelogs redundantes; remover instruções antigas que contradizem o estado atual.
- Arquivos de teste abandonados: nenhum encontrado.
- Comentários redundantes: manter explicativos essenciais; remover marcadores repetitivos sem valor técnico.

## Backup e Log
- Criar backup do arquivo: `proposta-visualizacao.backup.<data>.html` em `proposta-comercial/backups/`.
- Gerar log detalhado `logs/limpeza-<data>.md` com:
  - Lista de exclusões (arquivo/linhas/motivo).
  - Itens ajustados (ex.: correção de tags, remoção de comentários, substituição de logs).
  - Verificações executadas e resultados.

## Limpezas no Arquivo
- Corrigir estrutura:
  - Remover `</div>` e `</section>` indevidos (1298–1299).
  - Corrigir duplo `</script>` (6273–6274) e eliminar JS após `</html>` (6277–6291), movendo o bloco “Comissão visível…” para um `<script>` válido antes de `</body>`.
- Eliminar referências obsoletas:
  - Remover uso de `#nomeCliente` em geração de PDF e onde mais ocorrer, padronizando em `#empresaCliente` (ou criar elemento se necessário).
- Comentários e logs:
  - Remover comentários “Linha X” no resumo financeiro e consolidar rótulos de etapas em textos curtos.
  - Substituir `console.log` não essencial por `reportInfo` ou guardá-los com `window.DEBUG === true`.
- Organização:
  - Garantir fechamento único de `<script>`, `<body>` e `<html>` no final do arquivo.

## Limpezas na Estrutura do Projeto
- Pastas vazias:
  - Varrer `Proposta-Comercial/` e remover diretórios estritamente vazios.
  - Não remover: `supabase/.temp`, pastas com `.gitkeep`, e qualquer diretório citado em configs (`netlify.toml`, `vercel.json`, `deno.json`).
- Documentação:
  - Consolidar `CHANGELOG-COMISSAO-HIBRIDO.md` e `RESUMO-CORRECOES.md` em `CHANGELOG.md`.
  - Revisar `README.md` e `INSTRUCOES-ATUALIZACAO.md`; manter apenas instruções atuais, linkar guias em `proposta-comercial/supabase/docs/`.

## Verificações Pós-Limpeza
- Integridade:
  - Carregar `proposta-visualizacao.html` com `id` real e validar: carregamento de proposta, cálculo de valores, modais, exportação de PDF e e-mail via Supabase Functions.
- Desempenho:
  - Medir tamanho do arquivo e tempo de `DOMContentLoaded`; comparar antes/depois e registrar no log.
  - Verificar melhora de renderização removendo ruído/JS redundante.
- Documentação:
  - Conferir que `README.md` e `CHANGELOG.md` refletem o estado atual.
- Dependências:
  - Checar carregamento de `@supabase/supabase-js`, `supabase-config.js`, `jsPDF` e `validacao-cpf-cnpj.js` sem erros.

## Entregáveis
- Backup do arquivo original.
- Arquivo limpo e organizado.
- Log de alterações com motivos e referências (linhas/arquivos).
- Relatório breve de integridade, desempenho e dependências.

Confirma o plano para eu executar as alterações, gerar backup e log, e validar tudo no servidor local?