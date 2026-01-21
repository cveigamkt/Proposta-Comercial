## Objetivo
- Criar um botão/área de detalhes (+) por linha no Admin para exibir informações preenchidas pelo usuário: representante, melhor dia de pagamento, e-mail, telefone, recorrência e forma de pagamento assinadas (quando existirem).

## Dados a Exibir
- `representante_cliente`, `melhor_dia_pagamento`, `email_cliente`, `telefone_cliente` (base).
- `recorrencia_assinada`, `forma_pagamento_assinada`, `assinado_em` (quando disponíveis via view/fallback).
- Opcional: `contrato_pdf_url` quando existir.

## Fontes e Disponibilidade
- View principal: `resumo_propostas` já inclui todos estes campos (`admin.html:299-309`).
- Fallback: busca direta em `propostas_criadas` também mapeia os mesmos campos (`admin.html:357-389`).

## UI/UX
- Nova coluna "Detalhes": um componente `<details>` com `<summary>+ Detalhes` por linha.
- Conteúdo: grid/stack com títulos curtos e valores (mostrando "—" quando vazio).
- Responsivo e consistente com o tema (usa classes já existentes: `.chip`, `.muted`).

## Implementação Técnica
1. Renderização da Tabela
- Em `proposta-comercial/admin.html:467+` adicionar a coluna "Detalhes" com `<details>`.
- Montar HTML dinâmico com os campos acima; usar `formatarDataHora` já definida (`admin.html:220-230`).
2. Helpers
- Função `fmt` para mostrar `—` quando vazio.
- Função `fmtTel` simples (opcional) para exibir telefone mais legível.
3. Estilo
- Reaproveitar estilos existentes; opcionalmente adicionar um bloco `.details-panel` com padding e borda leve.

## Logs e Telemetria
- Logar no console a abertura/fechamento do painel por proposta id e conteúdo.

## Validação
- Testar com: proposta pendente sem assinaturas; proposta aceita com `assinado_em`; proposta com `melhor_dia_pagamento` e representante preenchidos.

## Entregáveis
- Coluna "Detalhes" por linha no Admin.
- Painel expandível com campos: representante, melhor dia pagamento, e-mail, telefone, recorrência/forma assinadas e link de contrato (se houver).

Posso implementar agora conforme descrito?