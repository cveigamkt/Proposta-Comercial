## Causa
- A página `proposta-visualizacao.html` monta `servicosContratados` em dois fluxos: (1) dados do banco (`window.propostaCarregada`) e (2) parâmetros da URL (modo preview). Quando existe `id` na URL e também permanecem parâmetros do catálogo/serviços, ambos fluxos adicionam o mesmo serviço, gerando duplicação (ex.: Tráfego Pago — Aceleração). 

## Correções
1. Gate por origem dos dados:
- Detectar `isFromDB = !!window.propostaCarregada?.id` e `isPreview = !params.get('id')`.
- Quando `isFromDB`, desativar o fluxo de montagem por parâmetros da URL (bloco em torno de 2009 e 2035) e usar apenas dados do banco.
2. Catálogo preferencial do banco:
- Quando `isFromDB`, montar Catálogo a partir de `window.propostaCarregada.metadata.catalogo` (produto, plano, valor, sessões, addons) ao invés de ler da URL.
3. Deduplicação defensiva:
- Após montar a lista, aplicar um filtro por chave `${tipo}:${plano}` para evitar serviços duplicados quando ambos fluxos passarem por engano.
4. Logs de diagnóstico:
- Adicionar logs que informem qual fluxo foi usado (DB vs preview) e quantos serviços foram montados antes/depois da deduplicação.

## Implementação
- Editar `proposta-visualizacao.html` nas seções de construção de `servicosContratados` (~1732, ~1762, ~2009, ~2035) para:
  - Introduzir variáveis `isFromDB`/`isPreview`.
  - Condicionar adição de serviços (Tráfego Pago/Social/ Catálogo) ao fluxo correto.
  - Ler `metadata.catalogo` quando presente.
  - Adicionar função `dedupServicos(lista)` e aplicá-la antes de render.

## Validação
- Criar proposta com Tráfego Pago Aceleração (com `id`) e verificar se apenas um bloco aparece.
- Testar modo preview (sem `id`, só parâmetros) para confirmar que continua exibindo corretamente.
- Verificar que valores (`valorBase`, detalhamento e simulador) continuam consistentes.

Posso aplicar essas mudanças agora?