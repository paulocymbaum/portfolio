
# Guia da Interface e Solução de Problemas

Este documento explica as diferentes telas e botões da ferramenta de geração de certificados e oferece soluções para problemas comuns.

## Menu "Certificate Tools"

Este menu personalizado aparece na sua Planilha Google após a configuração inicial. Ele contém as seguintes opções:

*   **Generate Certificates:** Abre a janela para gerar certificados manualmente para linhas selecionadas na planilha.
*   **Configure Settings:** Abre a janela para definir ou atualizar as configurações essenciais da ferramenta (URLs, IDs, etc.).
*   **Create Triggers:** Configura a automação para rodar quando o formulário for enviado e agenda tarefas de manutenção. Execute isso uma vez durante a configuração inicial ou se a automação parar de funcionar.
*   **Run Unit Tests:** (Apenas para desenvolvedores) Executa testes internos do código.

## Tela: Configure Settings (`ConfigDialog.html`)

Esta janela permite que você conecte a ferramenta com seus arquivos e contas do Google.

*   **Campos de Entrada:**
    *   `URL do Modelo de Slide`: Link para o Google Slide usado como base.
    *   `ID da Planilha de Controle`: Identificador único da sua planilha.
    *   `URL da Pasta de Saída`: Link para a pasta do Google Drive onde os PDFs serão salvos.
    *   `URL do Formulário (Edição)`: Link de *edição* do seu Formulário Google.
    *   `Nome da Organização`: Nome da sua instituição.
    *   `ID da Organização no LinkedIn`: ID numérico da página da sua organização no LinkedIn (opcional).
    *   `Email do Instrutor`: Email que aparecerá como remetente.
    *   `URL da Planilha de Log de Erros`: Link para uma planilha onde os erros podem ser registrados (opcional).
*   **Botões:**
    *   `Cancelar` (Ícone de X): Fecha a janela sem salvar nenhuma alteração.
    *   `Salvar Configuração` (Ícone de Disquete/Salvar): Salva as informações inseridas nos campos. Um ícone de "sincronizando" aparece enquanto salva.
*   **Mensagens de Status (Abaixo dos botões):**
    *   Verde (`success`): Indica que as configurações foram salvas com sucesso. A janela fechará automaticamente após alguns segundos.
    *   Vermelho (`error`): Indica que houve um problema ao salvar. Verifique se todos os links e IDs estão corretos.

## Tela: Generate Certificates (`GeneratorDialog.html`)

Esta janela é usada para criar certificados manualmente para participantes cujas informações já estão na planilha.

*   **Instruções:** Lembra você de selecionar as linhas desejadas na planilha antes de clicar em gerar.
*   **Checkbox:**
    *   `Enviar emails aos participantes`: Marque esta caixa se quiser que um email seja enviado para cada pessoa selecionada após a geração do certificado.
*   **Botões:**
    *   `Cancelar` (Ícone de X): Fecha a janela sem gerar certificados.
    *   `Gerar Certificados` (Ícone de Engrenagem/Processo): Inicia o processo de geração para as linhas selecionadas na planilha. Um ícone de "sincronizando" aparece enquanto processa.
*   **Mensagem de Status (Abaixo dos botões):**
    *   Cinza (`info`): Aparece enquanto os certificados estão sendo gerados.
    *   Verde (`success`): Indica que o processo terminou.
    *   Vermelho (`error`): Indica que ocorreu um erro geral durante o processo.
*   **Área de Resultados (Aparece após a conclusão):**
    *   `Total processado`: Número total de linhas selecionadas que foram processadas.
    *   `Sucesso`: Quantos certificados foram gerados (e emails enviados, se aplicável) com sucesso.
    *   `Falha`: Quantos certificados falharam.
    *   Lista de Erros: Se houver falhas, os detalhes do erro para cada linha afetada serão listados aqui.

## Email Enviado (`EmailTemplate.html`)

Quando um certificado é gerado (automaticamente ou manualmente com a opção de email marcada), o participante recebe um email com:

*   Uma mensagem de parabéns.
*   O nome do curso e a carga horária (se fornecida).
*   Um botão verde ("Visualizar Certificado") com um ícone de documento, que leva ao PDF do certificado.
*   Um botão azul ("Adicionar ao LinkedIn") com o ícone do LinkedIn, que abre o LinkedIn para adicionar o certificado ao perfil.
*   A data de emissão e o ID único do certificado no rodapé.

## Problemas Comuns

*   **Erro ao Salvar Configurações:**
    *   Verifique se todos os URLs e IDs estão corretos e se você colou o valor certo no campo certo (especialmente o ID da Planilha e a URL de *Edição* do Formulário).
    *   Certifique-se de que você tem permissão de edição para o Slide, Planilha e Pasta.
*   **Automação do Formulário Não Funciona:**
    *   Verifique se você executou **Certificate Tools > Create Triggers**.
    *   Confirme se a `URL do Formulário (Edição)` na configuração está correta.
    *   Verifique se você autorizou o script corretamente quando solicitado.
*   **Erro na Geração Manual:**
    *   Verifique a lista de erros na janela de resultados para detalhes específicos.
    *   Confirme se as informações nas linhas selecionadas (nome, email, curso) estão corretas.
    *   Verifique se o Modelo de Slide ainda existe e está acessível.
*   **Emails Não Chegam:**
    *   Verifique se a opção "Enviar emails" estava marcada na geração manual.
    *   Confirme se o `Email do Instrutor` na configuração é um endereço válido.
    *   Verifique a pasta de Spam do destinatário.
    *   O Google Apps Script tem cotas diárias de envio de email. Se você gerar muitos certificados de uma vez, pode atingir o limite.
*   **Ícones Não Aparecem nos Botões ou Email:**
    *   Isso pode acontecer devido a configurações de segurança do navegador ou do cliente de email que bloqueiam imagens de fontes externas (icons8.com). A funcionalidade dos botões não é afetada.
