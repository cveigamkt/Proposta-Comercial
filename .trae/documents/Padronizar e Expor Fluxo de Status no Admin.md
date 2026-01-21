## Visão Geral
- Manter `propostas_criadas.status` como fonte de verdade e exibir estado derivado "expirada" quando `expira_em < NOW()` e `status='pendente'`.
- Padronizar transições: pendente → aceita | recusada; e derivado: pendente + expira_em passado → expirada (somente exibição).

## Melhorias no Admin
1. Adicionar ações explícitas:
- Botão "Aceitar" (já existe via `assinarProposta`) e novo botão "Recusar" que atualiza `status='recusada'`.
- Opcional: ação "Reabrir" (seta `status='pendente'`), apenas para admin.
2. Mostrar histórico de status:
- Painel por linha com acesso rápido ao `proposta_status_history` (últimos 5 eventos).
- Registrar evento ao clicar em "Recusar"/"Reabrir".
3. Enriquecimento de serviços:
- Exibir além de `proposta_itens` um resumo do catálogo salvo em `propostas_criadas.metadata.catalogo` (produto, plano, valor) quando não houver itens.
- Adicionar logs focados em: IDs consultados, quantidade de itens retornados, dif entre view e fallback.

## Backend (Supabase)
- Usar políticas já existentes para atualizar `status` para `aceita`/`recusada` (mantendo `USING status='pendente'`).
- Não persistir `expirada` como status; manter como cálculo para exibição e relatórios.

## UI/UX
- Chips:
- `pendente` (cinza), `aceita` (verde), `recusada` (vermelho), `expirada` (cinza claro – derivado).
- Tooltip explicando "expirada = pendente + prazo vencido".

## Telemetria e Logs
- Console logs agrupados para: carregamento da view, fallback, busca de `proposta_itens`, render por linha com contagem de itens.
- Logs de ação (aceitar/recusar) com payloads e resultado da chamada.

## Entregáveis
- Botão "Recusar" no Admin com atualização segura.
- Listagem do histórico por proposta.
- Resumo do catálogo no Admin quando `proposta_itens` estiver vazio.
- Logs ampliados e consistentes no Admin.

Confirma que posso implementar essas melhorias agora?