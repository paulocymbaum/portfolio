# Gerador Automático de Certificados - Manual do Usuário

Bem-vindo! Este guia explica como configurar e usar a planilha para gerar certificados automaticamente.

## O que isso faz?

Esta ferramenta automatiza a criação e o envio de certificados de conclusão de curso. Quando alguém preenche um formulário Google associado, a ferramenta:

1.  Registra as informações da pessoa na planilha.
2.  Cria um certificado personalizado em PDF usando um modelo do Google Slides.
3.  Salva o PDF em uma pasta específica no Google Drive.
4.  Envia um email para a pessoa com um link para o certificado e uma opção para adicioná-lo ao LinkedIn.

Você também pode gerar certificados manualmente para pessoas já listadas na planilha.

## Configuração Inicial (Apenas uma vez)

Antes de usar, você precisa configurar algumas coisas:

1.  **Faça uma Cópia:** Se você recebeu esta planilha, faça sua própria cópia (Arquivo > Fazer uma cópia).
2.  **Abra o Editor de Scripts:** Vá em Extensões > Apps Script. Isso abre o código que faz a mágica acontecer.
3.  **Configure as Definições:**
    *   Na planilha, procure pelo novo menu chamado **Certificate Tools**.
    *   Clique em **Certificate Tools > Configure Settings**.
    *   Uma janela de configuração aparecerá. Preencha os seguintes campos:
        *   **URL do Modelo de Slide:** Cole o link do Google Slide que servirá de modelo para os certificados.
        *   **ID da Planilha de Controle:** Cole o ID da sua planilha. Você o encontra na barra de endereço do navegador (é a parte longa entre `/d/` e `/edit`).
        *   **URL da Pasta de Saída:** Cole o link da pasta no Google Drive onde os certificados PDF serão salvos.
        *   **URL do Formulário (Edição):** Cole o link de *edição* do seu Formulário Google. É importante que seja o link de edição, não o link de visualização.
        *   **Nome da Organização:** O nome da sua empresa ou organização.
        *   **ID da Organização no LinkedIn (Opcional):** Se sua organização tem uma página no LinkedIn, cole o ID numérico dela aqui (encontrado na URL da página da empresa). Isso melhora o botão "Adicionar ao LinkedIn" no email.
        *   **Email do Instrutor:** O endereço de email que aparecerá como remetente dos certificados.
        *   **URL da Planilha de Log de Erros (Opcional):** Se quiser, cole o link de outra planilha onde os erros serão registrados.
    *   Clique em **Salvar Configuração**.
4.  **Crie os Gatilhos (Triggers):**
    *   No menu **Certificate Tools**, clique em **Create Triggers**.
    *   Você precisará autorizar o script a acessar seus dados do Google (Planilhas, Drive, Formulários, Gmail). Leia as permissões e clique em "Permitir".
    *   Isso configura a automação para rodar sempre que o formulário for enviado e também agenda uma limpeza diária de arquivos temporários.

## Como Usar

### Geração Automática (Via Formulário)

*   Depois de configurar os gatilhos, sempre que alguém preencher o Formulário Google vinculado, um certificado será gerado e enviado automaticamente.
*   Você verá uma nova linha aparecer na sua Planilha de Controle com o status "Generated" e os links para o PDF e LinkedIn.

### Geração Manual (Para Linhas na Planilha)

1.  **Selecione as Linhas:** Na sua Planilha de Controle, selecione uma ou mais linhas de participantes para quem você deseja gerar (ou regerar) certificados.
2.  **Abra o Gerador:** Vá em **Certificate Tools > Generate Certificates**.
3.  **Escolha as Opções:**
    *   Marque a caixa "Enviar emails aos participantes" se desejar que eles recebam o email com o certificado.
4.  **Clique em Gerar:** Clique no botão **Gerar Certificados**.
5.  **Aguarde:** O processo pode levar alguns segundos por certificado.
6.  **Veja os Resultados:** Uma janela mostrará quantos certificados foram processados com sucesso ou falharam.

Pronto! Se tiver dúvidas, consulte o arquivo `TROUBLESHOOTING.md` ou peça ajuda a quem configurou a planilha para você.