Okay, here is the documentation on how to set up the Certificate Generation Automation project using the Google Apps Script interface and `clasp`.

**Project Setup Guide: Certificate Generation Automation**

This guide explains how to deploy the local CertificateGenerationAutomation project files to Google Apps Script, link it to a Google Sheet, and configure it for use.

**Prerequisites:**

1.  **Google Account:** You need a Google account to create Google Workspace resources (Sheets, Slides, etc.) and use Google Apps Script.
2.  **Node.js and npm:** Required to install `clasp`. Download from [https://nodejs.org/](https://nodejs.org/) if you don't have them.
3.  **`clasp`:** Google's command-line tool for managing Apps Script projects. Install it globally if you haven't already:
    ```bash
    npm install -g @google/clasp
    ```
4.  **`clasp` Login:** Log in to `clasp` with your Google account:
    ```bash
    clasp login
    ```
    This will open a browser window for authentication. Grant the necessary permissions.
5.  **Project Files:** You should have the CertificateGenerationAutomation project files locally, including the `src`, `html`, and `appsscript.json` files.
6.  **Google Workspace Resources:** You need the URLs of the Google resources you created (Sheet, Slide Template, Form, Drive Folder). These are listed in your `resources.json` file.

**Setup Steps:**

1.  **Create the Container Google Sheet:**
    *   Go to [Google Sheets](https://sheets.google.com/) and create a **new, blank spreadsheet**.
    *   This sheet will contain the participant data and serve as the container for your Apps Script project.
    *   You can name it something relevant, like "Certificate Automation Control Sheet".
    *   **Important:** Make sure this sheet has the columns expected by the script. Add these exact headers in the first row (Row 1), in this order:
        *   `Timestamp`
        *   `Name`
        *   `Email`
        *   `Course`
        *   `Course Duration` (NEW - must match the title of your form question)
        *   `Certificate URL`
        *   `LinkedIn URL`
        *   `Status`
        *   `Issued Date`
        *   `Certificate ID`

2.  **Create/Update Google Form:**
    *   Ensure your Google Form (linked in `resources.json` and configured in Step 8) has questions with titles that exactly match the required sheet columns, especially:
        *   `Name`
        *   `Email`
        *   `Course`
        *   `Course Duration` (NEW - this question will provide the duration value, e.g., "10 horas")

3.  **Update Google Slide Template:**
    *   Edit your Google Slide template (linked in `resources.json` and configured in Step 8).
    *   Add the placeholder `{{DURATION}}` where you want the course duration (e.g., "10 horas") to appear on the certificate.

4.  **Navigate to Project Directory:**
    *   Open your terminal or command prompt.
    *   Navigate **into the inner CertificateGenerationAutomation directory** where the `appsscript.json` file is located:
        ```bash
        cd /home/paulo-yapper/Documents/Documentacao\ Dev/CertificateGenerationAutomation/CertificateGenerationAutomation
        ```
        *(Adjust the path if necessary)*

5.  **Create and Link the Apps Script Project:**
    *   Run the `clasp create` command to create a new Apps Script project associated with your Google Sheet:
        ```bash
        clasp create --type sheets --title "Certificate Generation Automation" --rootDir ./
        ```
        *   `--type sheets`: Specifies that this script project is bound to a Google Sheet.
        *   `--title "..."`: Sets the name of the Apps Script project as it will appear online.
        *   `--rootDir ./`: Tells `clasp` that the source files (`appsscript.json`, `src/`, `html/`) are in the current directory structure. `clasp` will map these to the flat structure required by Apps Script online.
    *   `clasp` will ask you to choose the Google Sheet to bind the script to. Select the **blank sheet you created in Step 1** from the list.
    *   This command creates a `.clasp.json` file in your local directory, linking it to the new Apps Script project.

6.  **Push Local Files to Apps Script:**
    *   Upload your local code (`.js`, `.html`, `appsscript.json`) to the Apps Script project you just created:
        ```bash
        clasp push
        ```
    *   If you encounter conflicts or warnings (e.g., about overwriting `appsscript.json`), you might need to use `clasp push -f` to force the upload. Use with caution.

7.  **Open the Apps Script Editor:**
    *   You can open the script directly from your terminal:
        ```bash
        clasp open
        ```
    *   Alternatively, open the Google Sheet you created, go to **Extensions > Apps Script**. You should see your uploaded files (`Code.js`, `AppUtils.js`, UI.js, Certificates.js, `Tests.js`, ConfigDialog.html, `EmailTemplate.html`, `GeneratorDialog.html`) and the `appsscript.json` manifest.

8.  **Configure the Script:**
    *   Go back to your **Google Sheet**.
    *   **Reload the Sheet** in your browser (Ctrl+R or Cmd+R). This is important to make the custom menu appear.
    *   You should now see a new menu item: **Ferramentas de Certificado** (Certificate Tools).
    *   Click **Ferramentas de Certificado > Configurar** (Configure Settings).
    *   A modal dialog will appear. You need to fill in the URLs for your Google Workspace resources. Get these URLs from your `resources.json` file. The labels in the dialog are now in Portuguese, but the underlying configuration keys (like `TEMPLATE_SLIDE_URL`) remain the same:
        *   **URL do Modelo de Slide:** Copy the `googleSlideTemplate` URL.
        *   **URL da Planilha de Controle:** Copy the `googleSheet` URL (this should be the URL of the sheet you are currently in).
        *   **URL da Pasta de Saída:** Copy the `googleDriveFolder` URL.
        *   **URL do Formulário (Edição):** **CRITICAL:** Copy the URL for your Google Form, but make sure it's the **Edit URL** (usually ends in `/edit`), **NOT** the View URL (ending in `/viewform`) listed in your `resources.json`. You need the Edit URL for the script to create triggers correctly. Find the Edit URL by opening your form for editing in Google Forms.
        *   **Nome da Organização:** Enter the name you want to appear in emails/LinkedIn (used if LinkedIn Org ID is not provided).
        *   **ID da Organização no LinkedIn (Opcional):** Enter the numeric ID of your organization's LinkedIn page. If provided, this overrides the Organization Name for generating LinkedIn "Add to Profile" URLs.
        *   **Email do Instrutor:** Enter the email address for the sender/reply-to.
        *   **URL da Planilha de Log de Erros (Opcional):** If you want errors logged to a separate sheet, create one and paste its URL here. Otherwise, leave it blank.
    *   Click **Salvar Configuração** (Save Configuration).

9.  **Authorize the Script:**
    *   The first time you run a function that requires permissions (like saving configuration or creating triggers), Apps Script will prompt you for **Authorization**.
    *   Review the permissions requested (accessing Sheets, Slides, Drive, Forms, sending email, running triggers, etc.). These are based on the OAuth scopes defined in `appsscript.json`.
    *   Click **Allow** to grant the script the necessary permissions to operate. You might need to go through an "Advanced" > "Go to..." flow if Google warns about the script being unverified.

10. **Create Triggers:**
    *   Once configured and authorized, set up the automated triggers:
    *   Click **Ferramentas de Certificado > Criar Gatilhos** (Create Triggers).
    *   This will set up:
        *   An `onFormSubmit` trigger for your configured Google Form.
        *   A daily time-based trigger (`cleanupTempFiles`).
    *   You should see a confirmation message.

11. **Test the Setup:**
    *   **Run Unit Tests:** Click **Ferramentas de Certificado > Executar Testes Unitários** (Run Unit Tests). Check the alert message and the logs (**Extensions > Apps Script > Executions**) for detailed results.
    *   **Manual Test (Form):** Submit a test entry through your Google Form. Check if:
        *   A new row appears in your Control Sheet with all data, including "Course Duration".
        *   The status updates to "Completed".
        *   A certificate PDF appears in your designated Google Drive Output Folder with the duration displayed correctly.
        *   You receive the certificate email, mentioning the duration.
    *   **Manual Test (Batch):** Add a few rows of sample data to your Control Sheet (Name, Email, Course, Course Duration). Select these rows. Click **Ferramentas de Certificado > Gerar Certificados** (Generate Certificates). Check the results in the dialog, Drive folder (duration on PDF), and email (duration mentioned).

Your Certificate Generation Automation project should now be set up and running within Google Apps Script, linked to your Google Sheet.