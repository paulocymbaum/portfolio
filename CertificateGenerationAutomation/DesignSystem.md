# Design Kit - Gerador de Certificados

Este documento descreve os princípios de design, paleta de cores, tipografia e componentes padrão utilizados nas interfaces HTML deste projeto (Apps Script). O objetivo é garantir consistência visual, boa legibilidade e acessibilidade. Textos sempre em Portugues

## 1. Princípios Gerais

*   **Consistência:** Utilizar os mesmos estilos e componentes em todas as interfaces.
*   **Clareza:** Priorizar a legibilidade do texto e a fácil compreensão dos elementos da interface.
*   **Acessibilidade:** Garantir contraste adequado entre texto e fundo, e utilizar tamanhos de fonte legíveis.
*   **Simplicidade:** Manter o design limpo e focado na funcionalidade principal.

## 2. Paleta de Cores

A paleta de cores é baseada em um azul ardósia escuro para elementos primários e links, e cores neutras para garantir contraste e clareza.

```css
/* Variáveis CSS (definidas em :root nos arquivos HTML) */
:root {
  /* Cores Principais */
  --primary-color: #483D8B; /* DarkSlateBlue (para Títulos, Botões Primários, Links) */

  /* Cores de Texto */
  --text-color: #000000;       /* Preto (Principal para corpo de texto, labels) */
  --secondary-text-color: #6c757d; /* Cinza Médio (Texto de ajuda, placeholders, rodapés) */
  --link-color: var(--primary-color); /* DarkSlateBlue para links */
  --link-hover-color: #7B68EE;    /* MediumSlateBlue para hover de links */
  --button-primary-text: #FFFFFF; /* Branco para texto em botões primários */
  --button-secondary-text: #FFFFFF;/* Branco para texto em botões secundários */

  /* Cores de Fundo */
  --background-color: #f8f9fa;         /* Cinza Muito Claro (Fundo geral da página/dialog) */
  --content-background-color: #FFFFFF; /* Branco (Fundo de caixas de conteúdo, formulários) */

  /* Cores de Borda e Linhas */
  --border-color: #dee2e6; /* Cinza Claro (Bordas de inputs, divisórias) */

  /* Cores de Botão */
  --button-primary-bg: var(--primary-color); /* DarkSlateBlue para botão principal */
  --button-primary-hover-bg: #7B68EE;    /* MediumSlateBlue para hover */
  --button-secondary-bg: #6c757d;       /* Cinza Médio para botão secundário (Cancelar) */
  --button-secondary-hover-bg: #5a6268; /* Cinza Escuro para hover */
  --button-disabled-bg: #cccccc;       /* Cinza Claro para botões desabilitados */

  /* Cores de Feedback (Status) */
  --success-bg: #d1e7dd; /* Verde Claro (Fundo) */
  --success-text: #0f5132; /* Verde Escuro (Texto) */
  --error-bg: #f8d7da;   /* Vermelho Claro (Fundo) */
  --error-text: #842029; /* Vermelho Escuro (Texto) */
  --info-bg: #cfe2ff;    /* Azul Claro (Fundo) */
  --info-text: #052c65;  /* Azul Escuro (Texto) */

  /* Cores de Input (Foco) */
  --input-focus-border: #7B68EE; /* MediumSlateBlue (Borda no foco) */
  --input-focus-shadow: rgba(72, 61, 139, 0.25); /* Sombra DarkSlateBlue Transparente (Box-shadow no foco) */

  /* Outros */
  --code-bg-color: #f1f1f1; /* Cinza Claro para fundo de blocos de código (Instruções) */
}
```

**Uso:**

*   `--primary-color`: Títulos principais (`h2`, `h3`), botões de ação primária.
*   `--text-color`: Corpo de texto principal (Preto), labels, títulos secundários (se não forem primários). Garante contraste máximo com fundos claros.
*   `--secondary-text-color`: Textos auxiliares, placeholders, descrições curtas (`.help-text`).
*   `--link-color`: Usado para links (`<a>`).
*   `--background-color` / `--content-background-color`: Fundos principais.
*   Cores de Feedback: Usar as combinações `bg`/`text` correspondentes para garantir legibilidade dentro das mensagens de status (Verde, Vermelho, Azul claro).

## 3. Tipografia

A escolha da fonte visa a legibilidade em telas.

*   **Fonte Principal:** `'Helvetica Neue', Helvetica, Arial, sans-serif`
    *   **Justificativa:** Fontes sans-serif são geralmente consideradas mais legíveis em interfaces digitais. Helvetica Neue e Arial são amplamente disponíveis e oferecem boa clareza.
*   **Tamanhos:**
    *   Corpo de Texto / Inputs / Labels: `14px` (Base)
    *   Texto de Ajuda (`.help-text`): `12px`
    *   Títulos Principais (`h2`): `~20-24px` (Depende do contexto, usar `font-weight: 500` ou `bold`)
    *   Títulos Secundários (`h3`): `~16-18px` (Usar `font-weight: bold`)
*   **Peso da Fonte:**
    *   Normal: `400` (Padrão para corpo de texto)
    *   Negrito: `bold` ou `700` (Para labels, títulos, texto enfatizado `<strong>`)
    *   Médio: `500` (Para títulos principais, se desejado um peso menor que negrito)
*   **Cor do Texto:**
    *   Usar `--text-color` (Preto) para a maioria dos textos (parágrafos, labels, etc.).
    *   Usar `--primary-color` (DarkSlateBlue) para títulos principais (`h2`, `h3`).
    *   Usar `--secondary-text-color` para textos menos importantes.
    *   Usar `--link-color` (DarkSlateBlue) para links.

## 4. Componentes Padrão

### 4.1. Botões (`.btn`)

*   **Estilo:** Fundo sólido, texto claro (`--button-primary-text` ou `--button-secondary-text`), cantos arredondados (`border-radius: 4px`), padding adequado (`10px 20px`).
*   **Ação Primária (`#save-btn`, `#generate-btn`):** Fundo `--button-primary-bg` (DarkSlateBlue).
*   **Ação Secundária (`.btn-cancel`):** Fundo `--button-secondary-bg` (Cinza).
*   **Hover:** Leve alteração do fundo (`--button-primary-hover-bg`, `--button-secondary-hover-bg`).
*   **Desabilitado (`:disabled`):** Fundo `--button-disabled-bg` (Cinza claro), cursor `not-allowed`, opacidade reduzida.
*   **Ícones:** Permitido usar ícones. Cor contrastante com o fundo (geralmente branco).

### 4.2. Inputs de Texto (`input[type="text"]`)

*   **Estilo:** Borda fina (`1px solid --border-color`), fundo `--content-background-color` (Branco), texto `--text-color` (Preto), padding interno (`10px`), cantos arredondados (`border-radius: 4px`).
*   **Foco (`:focus`):** Borda muda para `--input-focus-border` (MediumSlateBlue) e adiciona `box-shadow` com `--input-focus-shadow`.
*   **Placeholder:** Usar `--secondary-text-color`.

### 4.3. Labels (`label`)

*   **Estilo:** Texto `--text-color` (Preto), `font-weight: bold`, `font-size: 14px`. Posicionado acima do input.

### 4.4. Texto de Ajuda (`.help-text`)

*   **Estilo:** Texto `--secondary-text-color` (Cinza), `font-size: 12px`. Posicionado abaixo do input.

### 4.5. Checkboxes (`input[type="checkbox"]`)

*   **Estilo:** Usar `accent-color: var(--primary-color)` (DarkSlateBlue) para colorir a caixa quando marcada.

### 4.6. Mensagens de Status (`#status`, `#results`)

*   **Estilo:** Caixa com padding, cantos arredondados, texto centralizado e em negrito.
*   **Cores:** Usar as combinações de fundo/texto definidas (Verde, Vermelho, Azul claro).

### 4.7. Containers / Dialogs

*   **Fundo:** Usar `--background-color` para o fundo geral.
*   **Caixas de Conteúdo:** Usar `--content-background-color` (Branco) com `padding`, `border-radius` e `box-shadow`.

## 5. Acessibilidade (WCAG)

*   **Contraste:** Priorizar o contraste. `--text-color` (Preto) sobre `--content-background-color` (Branco) oferece contraste máximo (21:1). `--primary-color` (DarkSlateBlue #483D8B) sobre branco tem contraste de 5.84:1 (bom, atende AA para texto normal e AAA para texto grande). As combinações de cores para status também atendem aos requisitos.
*   **Tamanho da Fonte:** Base de `14px`.
*   **Indicação de Foco:** Usar bordas e sombras claras nos inputs.
*   **Labels:** Associar `label`s aos `input`s.

Este kit serve como guia para manter a consistência e qualidade visual das interfaces do projeto.
