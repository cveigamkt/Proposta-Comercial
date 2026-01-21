## Objetivo
- Garantir que o PDF do contrato assinado inclua a proposta base do Catálogo (entregáveis/seções) e os add-ons selecionados.
- Não ativar ou modificar envio de e-mails; foco exclusivo no conteúdo do contrato.

## Contexto Atual
- A visualização monta `servicosContratados` contendo o serviço do Catálogo, com `secoes`, `entregaveis` e possíveis `addonsDisponiveis` (com `selecionado`).
- Durante a assinatura, já construímos `dadosContrato` com `catalogoProdutoNome`, `catalogoPlanoNome`, `catalogoSessoes`, `catalogoEntregaveis` e `catalogoAddons`; e chamamos `gerarEArmazenarContrato(...)` que usa `gerarPDFContrato(...)` para compor o PDF.
- O renderer do PDF em `supabase-config.js` já possui blocos para inserir o serviço do Catálogo e add-ons, porém depende da forma dos dados.

## Implementação
1. Padronizar a coleta dos add-ons no momento da assinatura
- Em `proposta-visualizacao.html` dentro de `assinarContrato()`:
  - Obter o serviço do Catálogo (`catalogoSrv`), e construir `catalogoAddons` como lista de add-ons selecionados: usar `catalogoSrv.addOnsContratados` quando existir; caso contrário, derivar de `catalogoSrv.addonsDisponiveis.filter(a => a.selecionado)` mapeando para `{ nome, tipoPreco, valorUnitario/valor, qtdSelecionada }`.
  - Garantir que `catalogoSessoes` contenha o formato suportado (array de objetos `{ titulo, itens }` ou mapa `{Titulo: [itens]}`), e quando não houver, preencher `catalogoEntregaveis` como lista simples.

2. Robustez no renderer do PDF
- Em `supabase-config.js` na função `gerarPDFContrato(dadosContrato)`:
  - Na seção "SERVIÇO DO CATÁLOGO":
    - Renderizar `catalogoSessoes` (array ou mapa) e, sem seções, usar `catalogoEntregaveis`.
    - Inserir bloco de "ADD-ONS SELECIONADOS" com base em `dadosContrato.catalogoAddons`, aceitando tanto o formato detalhado (com preço e quantidade) quanto um formato simples `{ nome, descricao }`.
  - Manter a regra da Landing Page vinculada à recorrência de 12 meses.

3. Não alterar e-mail
- Remover qualquer alteração que tenha ativado envio de e-mail automático; manter a função de e-mail no estado anterior (sem disparo) conforme sua instrução.

## Verificação
- Subir a visualização local.
- Gerar uma proposta com produto do Catálogo que tenha add-ons, selecionar módulos.
- Assinar e baixar o PDF.
- Conferir no PDF:
  - Título "SERVIÇO DO CATÁLOGO — <Plano>" com seções/entregáveis.
  - Bloco "ADD-ONS SELECIONADOS" com os módulos escolhidos e, quando aplicável, valores e quantidades.
  - Ausência de envio automático de e-mail.

## Segurança e Escopo
- Apenas mudanças no front-end (HTML/JS); sem alterações de schema ou políticas.
- Sem exposição de segredos; respeita dados existentes do cliente/proposta.

## Rollback
- Patches pequenos e isolados; caso necessário, reversão fácil às versões anteriores sem efeitos colaterais no banco.