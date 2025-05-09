# Manual de Uso - Automação de Geração de Certificados

Este manual descreve como executar, autorizar e usar o script de automação de geração de certificados diretamente na Planilha Google.

## Executando o Script pela Primeira Vez

1.  **Acesse o Google Drive:** Abra a pasta compartilhada no Google Drive onde o arquivo do Apps Script foi disponibilizado.
2.  **Encontre o Arquivo:** Localize o arquivo do projeto Apps Script (geralmente vinculado a uma Planilha Google, Documento ou Formulário, ou como um script independente).
3.  **Abra o Editor de Script:**
    *   Se o script estiver vinculado a um arquivo (Planilha, Documento, etc.), abra o arquivo e vá em `Menu Lateral Esquerdo` > `Editor de scripts`>`Appscript.gs`.
    *   Se for um script independente, localize-o no Drive e abra-o diretamente.
4.  **Selecione a Função Principal:** No editor de scripts, localize a barra de seleção de funções (geralmente ao lado dos ícones de depuração e execução). Selecione a função principal que inicia a interface do usuário ou o processo principal (chamada `initialSetup`). 
5.  **Execute o Script:** Clique no botão "Executar" (ícone de triângulo ▶️).

## Processo de Autorização

Na primeira vez que você executar o script (ou após adicionar novos serviços que exigem permissão), o Google solicitará sua autorização.

1.  **Revisar Permissões:** Uma janela pop-up "Autorização necessária" aparecerá, informando que o script precisa da sua permissão para acessar seus dados ou agir em seu nome (por exemplo, acessar Planilhas Google, Google Drive, enviar e-mails). Clique em "Revisar permissões".
2.  **Escolher Conta:** Selecione a conta do Google que você deseja usar para autorizar o script.
3.  **Aviso de App Não Verificado:** Você provavelmente verá uma tela dizendo "Este app não foi verificado pelo Google". Isso é normal para scripts que não foram publicados na loja oficial.
    *   Clique em "**Avançado**" (ou similar).
    *   Clique em "**Acessar <Nome do Script> (não seguro)**" (ou texto similar).
4.  **Conceder Permissões:** Uma nova tela mostrará as permissões específicas que o script está solicitando (ex: "Ver, editar, criar e excluir suas planilhas do Google Drive", "Enviar e-mail como você"). Leia atentamente e, se concordar, clique em "**Permitir**".

## Pós-Autorização

Após a autorização bem-sucedida, o script continuará sua execução. Dependendo de como o script foi projetado:

*   Um menu personalizado pode aparecer no arquivo vinculado (Planilha, Documento).
*   Uma barra lateral ou caixa de diálogo pode abrir.
*   O processo de geração de certificados pode iniciar diretamente.

Siga as instruções na interface do usuário do script (menus, diálogos) para configurar e iniciar a geração dos certificados. Consulte o `WALKTHROUGH.md` para um guia passo a passo da interface.

## Iniciando e Usando a Ferramenta na Planilha Google

Após a primeira execução e autorização (descritas acima), a ferramenta geralmente adiciona uma interface à Planilha Google para facilitar o uso:

1.  **Abra a Planilha Google:** Navegue até a Planilha Google principal associada a esta automação.
2.  **Localize o Menu Personalizado:** O script normalmente cria um menu personalizado na barra de menus da Planilha (ao lado de "Ajuda"). O nome do menu pode ser algo como "Gerador de Certificados", "Automação" ou similar.
3.  **Abra a Interface Principal:** Clique no menu personalizado e selecione a opção para iniciar a ferramenta (por exemplo, "Gerar Certificados", "Abrir Gerador", "Configurar"). Isso geralmente abrirá:
    *   **Uma Barra Lateral (Sidebar):** Um painel que aparece no lado direito da Planilha.
    *   **Uma Caixa de Diálogo (Dialog):** Uma janela pop-up sobre a Planilha.
4.  **Interaja com a Interface:** Siga as `Instruções` e preencha os campos na barra lateral ou na caixa de diálogo para:
    *   Selecionar a lista de participantes.
    *   Escolher o modelo de certificado.
    *   Definir as configurações de e-mail (se aplicável).
    *   Iniciar o processo de geração e envio.

## Configurações Adicionais na Planilha

Além da interface principal, a Planilha Google associada pode conter configurações específicas necessárias para o funcionamento correto da automação.

1.  **Planilhas de Configuração:** Procure por abas (planilhas) dedicadas a configurações de certificado, que podem ter nomes como "Configuração", "Instruções", "Gatilhos", etc. É aqui que você pode precisar definir valores como IDs de pastas do Drive, modelos de documentos, ou outras informações específicas.
2.  **Configuração de "Alias Google":** Verifique as planilhas de configuração em Ferramentas de Certificado, e veja as instruções específicas nesses documentos. 


## Obtendo Ajuda Adicional

Para dúvidas ou um guia mais detalhado sobre funcionalidades específicas diretamente na interface:

*   Procure por uma opção chamada **"Instruções"** ou **"Ajuda"** dentro do menu personalizado da ferramenta na Planilha Google.
*   Esta opção geralmente abre uma caixa de diálogo com informações adicionais, dicas de uso ou passos para solução de problemas comuns.


