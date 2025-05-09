/**
 * User interface components for the Certificate Generator.
 * Handles dialogs, sidebars, and user interactions.
 */

var UI = (function() {
  /**
   * Shows the main certificate generator dialog.
   */
  function showGeneratorDialog() {
    // Correct the filename path: remove 'html/' prefix
    const html = HtmlService.createHtmlOutputFromFile('GeneratorDialog')
      .setWidth(450)
      .setHeight(400);
      // Removed setTitle as it's deprecated for showModalDialog

    SpreadsheetApp.getUi().showModalDialog(html, 'Generate Certificates');
  }

  /**
   * Shows the configuration dialog.
   */
  function showConfigDialog() {
    const currentConfig = PropertiesService.getScriptProperties().getProperties();

    // Correct the filename path: remove 'html/' prefix
    const template = HtmlService.createTemplateFromFile('ConfigDialog');
    // Filter currentConfig to only include keys present in the global CONFIG object
    const filteredConfig = {};
    for (const key in CONFIG) { 
        if (CONFIG.hasOwnProperty(key)) {
            // ---> Use currentConfig[key] which should now include CONTROL_SHEET_ID <--- 
            filteredConfig[key] = currentConfig[key] || ''; // Use saved value or empty string
        }
    }
    template.config = filteredConfig; // Pass ID/URL/Org values to the template

    const html = template.evaluate()
      .setWidth(500)
      .setHeight(550);
      // Removed setTitle as it's deprecated for showModalDialog

    SpreadsheetApp.getUi().showModalDialog(html, 'Configuration');
  }

  /**
   * Processes a batch of certificates from the selected rows in the Control Sheet (gid=0).
   * Re-generates certificates and updates the selected row directly with the new PDF URL, timestamp, status, etc.
   * @param {Object} formData - Data from the form (e.g., { sendEmails: true })
   * @return {Object} Results of the batch processing (e.g., { total: 5, successful: 4, failed: 1, errors: [...] })
   */
  function processBatch(formData) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    // --- Ensure we are working on the Control Sheet (gid=0) ---
    const controlSheetId = CONFIG.CONTROL_SHEET_ID;
    if (!controlSheetId) {
        return { total: 0, successful: 0, failed: 1, errors: ['CONTROL_SHEET_ID is not configured. Cannot find Control Sheet.'] };
    }
    const controlSpreadsheet = SpreadsheetApp.openById(controlSheetId);
    const sheet = AppUtils.getSheetByGid_(controlSpreadsheet, 0); // Get Control Sheet (gid=0)
    if (!sheet) {
        return { total: 0, successful: 0, failed: 1, errors: ['Control Sheet (gid=0) not found in Spreadsheet ID: ' + controlSheetId] };
    }

    const selection = sheet.getSelection(); // Selection is now on the Control Sheet
    const ranges = selection.getActiveRangeList().getRanges();

    const results = { total: 0, successful: 0, failed: 0, errors: [] };

    // --- Get headers from the Control Sheet (gid=0) ---
    const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const headerMap = {}; // Map original header names to 0-based index
    const normalizedHeaderMap = {}; // Map normalized header names to 0-based index
    headerRow.forEach((header, index) => {
        if (header && typeof header === 'string') {
            const trimmedHeader = header.trim();
            const normalizedHeader = trimmedHeader.toLowerCase().replace(/\s+/g, '_');
            if (trimmedHeader) {
                headerMap[trimmedHeader] = index;
            }
            if (normalizedHeader) {
                normalizedHeaderMap[normalizedHeader] = index;
            }
        }
    });

    // Define expected headers in the Control Sheet for reading data
    const requiredHeaders = ['Full Name', 'Email Address', 'Course Name', 'Course Duration'];
    const requiredIndices = {};
    for (const header of requiredHeaders) {
        if (headerMap[header] === undefined) {
            const errorMsg = 'Missing required column header in Control Sheet (gid=0): "' + header + '"';
            logError(errorMsg, null);
            results.errors.push(errorMsg);
            results.failed = results.total > 0 ? results.total : 1;
            return results;
        }
        requiredIndices[header] = headerMap[header];
    }
    // Get indices for columns to update
    const timestampCol = headerMap['Timestamp'];
    const statusCol = headerMap['Status'];
    const errorMsgCol = headerMap['Error Message'];
    const certIdCol = headerMap['Certificate ID'];
    const issuedDateCol = headerMap['Issued Date']; // Keep original issued date? Or update? Let's keep original for now.
    const certUrlCol = headerMap['Certificate URL'];
    const linkedInUrlCol = headerMap['LinkedIn URL'];

    // Process each selected range
    for (let r = 0; r < ranges.length; r++) {
      const range = ranges[r];
      const startRow = range.getRow();
      const numRows = range.getNumRows();
      // Get all values for the range at once for efficiency
      const rangeValues = range.getValues();

      for (let i = 0; i < numRows; i++) {
        const currentRowIndex = startRow + i;
        if (currentRowIndex === 1) continue; // Skip header row

        const rowValues = rangeValues[i]; // Get the current row's data array
        results.total++;
        let participantName = rowValues[requiredIndices['Full Name']] || 'Unknown Participant';

        try {
          // --- Extract data needed for re-generation from the current row ---
          const name = rowValues[requiredIndices['Full Name']];
          const email = rowValues[requiredIndices['Email Address']];
          const course = rowValues[requiredIndices['Course Name']];
          const duration = rowValues[requiredIndices['Course Duration']]; // Duration should already be correct in the log

          // Validate required data
          if (!name || !email || !course) {
              let missingFields = [];
              if (!name) missingFields.push('Full Name');
              if (!email) missingFields.push('Email Address');
              if (!course) missingFields.push('Course Name');
              throw new Error('Missing required data (' + missingFields.join(', ') + ') in selected row.');
          }

          Logger.log('Re-generating row ' + currentRowIndex + ' for: ' + name);

          // Prepare data for certificate generation
          // Use normalized keys expected by Certificates.generateCertificate
          const certificateInputData = {
              full_name: name,
              email: email,
              course_name: course,
              course_duration: duration
              // Add other fields from the row if the template needs them, using normalizedHeaderMap
              // e.g., timestamp: rowValues[normalizedHeaderMap['timestamp']]
          };

          // 1. Generate NEW certificate
          const certificateData = Certificates.generateCertificate(certificateInputData);

          if (!certificateData) {
            throw new Error('Certificate generation step failed. Check execution logs.');
          }

          // 2. Generate NEW LinkedIn URL
          const linkedInUrl = AppUtils.generateLinkedInUrl(certificateData); // Uses new certId, pdfUrl, issuedDate

          // --- Update the EXISTING row ---
          const currentRowRange = sheet.getRange(currentRowIndex, 1, 1, sheet.getLastColumn());
          const newRowValues = currentRowRange.getValues()[0]; // Get current values to modify

          // Update specific columns
          if (timestampCol !== undefined) newRowValues[timestampCol] = new Date(); // Update timestamp
          if (statusCol !== undefined) newRowValues[statusCol] = 'Re-generated'; // Update status
          if (errorMsgCol !== undefined) newRowValues[errorMsgCol] = ''; // Clear error message
          if (certIdCol !== undefined) newRowValues[certIdCol] = certificateData.certificateId; // Update Certificate ID
          // Keep original issued date: if (issuedDateCol !== undefined) newRowValues[issuedDateCol] = certificateData.issuedDate ? Utilities.formatDate(new Date(certificateData.issuedDate), Session.getScriptTimeZone(), 'yyyy-MM-dd') : '';
          if (certUrlCol !== undefined) newRowValues[certUrlCol] = certificateData.pdfUrl; // Update Certificate URL
          if (linkedInUrlCol !== undefined) newRowValues[linkedInUrlCol] = linkedInUrl; // Update LinkedIn URL

          // Write the updated values back to the row
          currentRowRange.setValues([newRowValues]);

          // 3. Send email if requested
          if (formData.sendEmails) {
            if (email && typeof email === 'string' && email.includes('@')) {
              AppUtils.sendCertificateEmail(
                email,
                name,
                course,
                certificateData.pdfUrl, // New PDF URL
                linkedInUrl,           // New LinkedIn URL
                duration,
                certificateData.certificateId // New Certificate ID
              );
            } else {
              // Log warning about invalid email, but row is already updated
              const emailErrorMsg = 'Skipping email for ' + name + ' (Row ' + currentRowIndex + '): Invalid or missing email address (' + email + ').';
              Logger.log('WARNING: ' + emailErrorMsg);
              if (typeof AppUtils.logError === 'function') {
                 AppUtils.logError(emailErrorMsg, null, 'WARNING');
              }
            }
          }

          results.successful++;
          AppUtils.sleep(500); // Sleep

        } catch (error) {
          // Log the processing error for this row
          const errorMsg = 'Row ' + currentRowIndex + ' (' + participantName + '): ' + error.message;
          results.failed++;
          results.errors.push(errorMsg);
          AppUtils.logError('Batch re-generation error for row ' + currentRowIndex + ' (' + participantName + ')', error);

          // Attempt to update the row status to 'Failed'
          try {
            const currentRowRange = sheet.getRange(currentRowIndex, 1, 1, sheet.getLastColumn());
            const errorRowValues = currentRowRange.getValues()[0]; // Get current values

            if (timestampCol !== undefined) errorRowValues[timestampCol] = new Date(); // Update timestamp
            if (statusCol !== undefined) errorRowValues[statusCol] = 'Failed Re-gen'; // Set status
            if (errorMsgCol !== undefined) errorRowValues[errorMsgCol] = String(error.message || 'Unknown error'); // Set error message

            currentRowRange.setValues([errorRowValues]); // Write updates
          } catch (updateError) {
             AppUtils.logError('CRITICAL: Failed to update row ' + currentRowIndex + ' status after re-generation error.', updateError);
          }
        }
      } // End loop through rows in a range
    } // End loop through ranges

    Logger.log('Batch re-generation finished. Results: ' + JSON.stringify(results));
    return results;
  }

  /**
   * Saves the configuration from the ConfigDialog UI.
   * @param {Object} config - Configuration values (IDs, URLs, Org Name/ID) from the form
   * @return {Object} Result of the save operation (e.g., { success: true, message: '...' })
   */
  function saveConfig(config) { // config object should now contain CONTROL_SHEET_ID
    try {
      // ---> Updated requiredKeys to use CONTROL_SHEET_ID <--- 
      const requiredKeys = ['TEMPLATE_SLIDE_URL', 'CONTROL_SHEET_ID', 'OUTPUT_FOLDER_URL', 'FORM_URL', 'ORGANIZATION_NAME', 'INSTRUCTOR_EMAIL'];
      for (const key of requiredKeys) {
          if (!config[key]) {
              // Check if it's the optional error log sheet URL or Org ID
              if (key === 'ERROR_LOG_SHEET_URL' || key === 'ORGANIZATION_ID') continue;
              return { success: false, message: 'Erro: Valor de configuração obrigatório ausente para ' + key };
          }
          // Optional: Add basic URL/ID validation regex here if needed
          if ((key.includes('_URL') || key.includes('_ID')) && typeof config[key] !== 'string') {
             return { success: false, message: 'Erro: Valor inválido para ' + key };
          }
      }

      // Validate Org ID is numeric if provided
      if (config.ORGANIZATION_ID && !/^[0-9]+$/.test(config.ORGANIZATION_ID)) {
          return { success: false, message: 'Erro: O ID da organização do LinkedIn deve ser numérico.' };
      }

      // Filter config to only save keys that exist in the global CONFIG object
      const propertiesToSave = {};
      for (const key in CONFIG) {
          if (CONFIG.hasOwnProperty(key) && config.hasOwnProperty(key)) {
              // ---> Extract ID if it's a URL field that should be an ID (like CONTROL_SHEET_ID) <--- 
              // Although the input should be ID now, keep this as a fallback/safety
              if (key === 'CONTROL_SHEET_ID' && config[key].includes('docs.google.com/spreadsheets/d/')) {
                  propertiesToSave[key] = AppUtils.extractIdFromUrl(config[key], 'sheet');
                  if (!propertiesToSave[key]) {
                      return { success: false, message: 'Erro: Não foi possível extrair o ID da Planilha de Controle da URL fornecida.' };
                  }
              } else {
                  propertiesToSave[key] = config[key]; // Save the value directly (should be ID or URL as appropriate)
              }
          }
      }

      // Ensure CONTROL_SHEET_ID is actually being saved
      if (!propertiesToSave.hasOwnProperty('CONTROL_SHEET_ID') || !propertiesToSave['CONTROL_SHEET_ID']) {
          Logger.log('ERROR in saveConfig: CONTROL_SHEET_ID was missing from propertiesToSave before setting. Input config: ' + JSON.stringify(config) + ', Properties being saved: ' + JSON.stringify(propertiesToSave)); // Added more detail
          return { success: false, message: 'Erro interno: CONTROL_SHEET_ID não foi processado corretamente.' };
      } else {
          // ---> Log what IS being saved <--- 
          Logger.log('Attempting to save properties: ' + JSON.stringify(propertiesToSave));
      }

      PropertiesService.getScriptProperties().setProperties(propertiesToSave, true); // true deletes other properties

      // ---> Log properties immediately after setting <--- 
      const propsAfterSave = PropertiesService.getScriptProperties().getProperties();
      Logger.log('Properties immediately after setProperties call: ' + JSON.stringify(propsAfterSave));

      // Update global CONFIG in memory immediately
      loadConfig(); // Reload config from properties service (defined in Code.js)

      // ---> Verify after loading <--- 
      if (!CONFIG.CONTROL_SHEET_ID) {
          Logger.log('ERROR after saveConfig and loadConfig: CONFIG.CONTROL_SHEET_ID is still missing! Properties loaded by loadConfig: ' + JSON.stringify(PropertiesService.getScriptProperties().getProperties())); // Log properties again
          return { success: false, message: 'Erro: A configuração foi salva, mas o CONTROL_SHEET_ID ainda está ausente após recarregar. Verifique os logs.' };
      }

      Logger.log('Configuração salva com sucesso. CONTROL_SHEET_ID = ' + CONFIG.CONTROL_SHEET_ID);
      return { success: true, message: 'Configuração salva com sucesso.' };
    } catch (error) {
      logError('Falha ao salvar configuração', error);
      return { success: false, message: 'Erro ao salvar configuração: ' + error.message };
    }
  }

  /**
   * Shows the Instructions dialog.
   */
  function showInstructionsDialog() {
    try {
      const html = HtmlService.createHtmlOutputFromFile('InstructionsDialog')
          .setWidth(600)
          .setHeight(450);
      SpreadsheetApp.getUi().showModalDialog(html, 'Instruções de uso');
      Logger.log('Instructions dialog displayed.');
    } catch (error) {
      Logger.log('Error displaying instructions dialog: ' + error);
      // Use AppUtils.logError if available and appropriate
      if (typeof AppUtils !== 'undefined' && AppUtils.logError) {
        AppUtils.logError('Failed to display instructions dialog', error);
      }
      // Show a basic alert as fallback
      try {
        SpreadsheetApp.getUi().alert('Could not open the instructions dialog. Please check logs.');
      } catch (uiError) {
        Logger.log('Could not display UI alert for instructions dialog error.');
      }
    }
  }

  // Public API
  return {
    showGeneratorDialog: showGeneratorDialog,
    showConfigDialog: showConfigDialog,
    processBatch: processBatch,
    saveConfig: saveConfig,
    showInstructionsDialog: showInstructionsDialog // Expose the new function
  };
})();

Logger.log('UI.js loaded and UI object created. typeof UI: ' + typeof UI);