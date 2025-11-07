# Diretrizes de Desenvolvimento - Sistema de Proposta Comercial

## Padrões de Código JavaScript

### Estrutura de Dados
- **Objetos de Configuração**: Use objetos constantes para armazenar dados estruturados de planos e configurações
```javascript
const planosSocialMedia = {
    'start': {
        nome: 'START',
        valor: 1500.00,
        entregaveis: ['item1', 'item2']
    }
};
```

### Nomenclatura e Convenções
- **Variáveis**: camelCase para variáveis e funções (`nomeCliente`, `calcularValores`)
- **Constantes**: camelCase para objetos de dados (`planosSocialMedia`, `planosTrafegoPago`)
- **IDs HTML**: kebab-case com prefixos descritivos (`servicoSocialMidia`, `entregaveisSocialMedia`)
- **Funções**: Verbos descritivos que indicam ação (`calcularValores`, `atualizarSimulador`, `formatarMoeda`)

### Manipulação do DOM
- **Seletores**: Use `getElementById` para elementos únicos
- **Event Listeners**: Adicione listeners após verificar se o elemento existe
- **Validação**: Sempre valide dados antes de processar
```javascript
document.getElementById('servicoSocialMidia').addEventListener('change', function() {
    const plano = this.value;
    // Processar mudança
});
```

### Cálculos e Formatação
- **Valores Monetários**: Use `toLocaleString` com configuração brasileira
```javascript
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
```
- **Descontos**: Implemente como funções puras que retornam percentuais
- **Validação Numérica**: Use `parseFloat` com `replace` para vírgulas

### Gerenciamento de Estado
- **Timestamp Global**: Use variáveis globais para dados que persistem durante a sessão
- **Reset de Estado**: Implemente funções para limpar estado quando necessário
- **Cache Local**: Use localStorage para dados temporários do formulário

## Padrões HTML

### Estrutura Semântica
- **Formulários**: Use `<form>` com campos `required` apropriados
- **Seções**: Organize conteúdo em `<section>` e `<div>` com classes descritivas
- **Labels**: Sempre associe labels aos inputs correspondentes

### Acessibilidade
- **IDs Únicos**: Cada elemento deve ter ID único e descritivo
- **Atributos ARIA**: Use quando necessário para melhorar acessibilidade
- **Navegação por Teclado**: Garanta que todos os elementos sejam acessíveis via teclado

### Validação de Formulários
- **Campos Obrigatórios**: Marque com `required` e valide no JavaScript
- **Tipos de Input**: Use tipos apropriados (`email`, `number`, `text`)
- **Feedback Visual**: Forneça feedback imediato para validações

## Padrões CSS

### Metodologia de Classes
- **Descritivas**: Classes que descrevem função ou conteúdo (`container-entregaveis`, `botao-toggle`)
- **Responsividade**: Mobile-first com media queries progressivas
- **Variáveis CSS**: Use custom properties para cores e espaçamentos consistentes

### Layout e Responsividade
- **CSS Grid**: Para layouts principais e estruturas complexas
- **Flexbox**: Para alinhamento de elementos e componentes menores
- **Breakpoints**: 768px como ponto de quebra principal mobile/desktop

### Estilos Visuais
- **Cores**: Mantenha paleta consistente com variáveis CSS
- **Tipografia**: Use Google Fonts (Inter) com pesos apropriados
- **Espaçamento**: Múltiplos de 8px para consistência visual

## Integração com APIs

### Google Apps Script
- **Estrutura de Dados**: Padronize objetos enviados com campos consistentes
- **Error Handling**: Implemente try/catch para todas as chamadas de API
- **FormData**: Use FormData para envio de dados estruturados
```javascript
const formData = new FormData();
Object.keys(dadosScript).forEach(key => {
    formData.append(key, dadosScript[key]);
});
```

### URL Parameters
- **URLSearchParams**: Use para criar e manipular query strings
- **Encoding**: Garanta encoding adequado de caracteres especiais
- **Validação**: Valide parâmetros recebidos antes de usar

## Padrões de Validação

### Validação Client-Side
- **Campos Obrigatórios**: Verifique se campos essenciais estão preenchidos
- **Lógica de Negócio**: Valide regras específicas (pelo menos um serviço selecionado)
- **Feedback Imediato**: Use `alert` para erros críticos, feedback visual para outros casos

### Sanitização de Dados
- **Trim**: Sempre use `.trim()` em inputs de texto
- **Parsing Numérico**: Valide números com `isNaN` após conversão
- **Caracteres Especiais**: Trate vírgulas em números decimais

## Performance e Otimização

### Carregamento de Recursos
- **CSS Inline**: Estilos críticos inline para evitar FOUC
- **Lazy Loading**: Carregue recursos sob demanda quando possível
- **Minificação**: Mantenha código limpo e comentado, deixe minificação para build

### Manipulação de DOM
- **Batch Updates**: Agrupe mudanças no DOM para evitar reflows
- **Event Delegation**: Use quando apropriado para múltiplos elementos similares
- **Cache de Seletores**: Armazene referências de elementos usados frequentemente

## Tratamento de Erros

### Estratégias de Error Handling
- **Try/Catch**: Para operações assíncronas e chamadas de API
- **Console Logging**: Para debug em desenvolvimento
- **Fallbacks**: Implemente comportamentos alternativos para falhas

### Debugging
- **Console Messages**: Use console.log para rastrear fluxo de dados
- **Validation Logs**: Registre validações importantes
- **Error Context**: Inclua contexto suficiente em mensagens de erro

## Documentação de Código

### Comentários
- **Seções**: Comente blocos funcionais principais
- **Funções Complexas**: Documente lógica não óbvia
- **TODOs**: Marque melhorias futuras claramente

### Estrutura de Arquivos
- **Separação de Responsabilidades**: Mantenha HTML, CSS e JS organizados
- **Nomenclatura Consistente**: Use padrões consistentes para nomes de arquivos
- **Versionamento**: Mantenha backups com sufixos descritivos (-backup, -novo)

## Boas Práticas Específicas

### Cálculos Financeiros
- **Precisão Decimal**: Use arredondamento apropriado para valores monetários
- **Múltiplas Moedas**: Mantenha formatação consistente (pt-BR)
- **Validação de Limites**: Verifique limites de investimento por plano

### UX/UI Patterns
- **Progressive Disclosure**: Mostre informações gradualmente (toggles para entregáveis)
- **Feedback Visual**: Indique estados de loading, sucesso e erro
- **Navegação Intuitiva**: Mantenha fluxo lógico entre páginas

### Segurança
- **Validação Dupla**: Client-side para UX, server-side para segurança
- **Sanitização**: Limpe dados antes de enviar para APIs
- **HTTPS**: Sempre use conexões seguras para dados sensíveis