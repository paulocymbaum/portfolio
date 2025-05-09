/**
 * Main entry point for the Certificate Generation Automation.
 * Handles trigger setup and core workflow orchestration.
 */

Logger.log('Code.js loading.');

// Global configuration and debug flags
const DEBUG_MODE = false;
const CONFIG = {
  TEMPLATE_SLIDE_URL: '', // URL of the Google Slide template
  CONTROL_SHEET_ID: '',   // ID of the Google Sheet
  SHEET_NAME: '',         // Name of the target sheet tab
  OUTPUT_FOLDER_URL: '',  // URL of the Drive folder
  FORM_URL: '',           // URL of the Google Form (Edit URL preferred for trigger setup)
  ORGANIZATION_NAME: '', // Name of organization
  ORGANIZATION_ID: '',   // Optional: LinkedIn Organization ID (numeric) - overrides Name for LinkedIn URL
  INSTRUCTOR_EMAIL: '',   // Email to use as sender
  ERROR_LOG_SHEET_URL: '' // Optional: URL of a sheet to log errors
};

// Load configuration from Properties on initialization
function loadConfig() {
  const savedConfig = PropertiesService.getScriptProperties().getProperties();
  let foundSheetId = false; // Flag to check if ID was loaded
  Object.keys(CONFIG).forEach(key => { // Iterate over keys in our default CONFIG object
    if (savedConfig.hasOwnProperty(key)) { // Check if a property with the same key exists in saved properties
      CONFIG[key] = savedConfig[key];
      if (key === 'CONTROL_SHEET_ID' && savedConfig[key]) {
        foundSheetId = true; // Mark as found if key exists and has a value
      }
    }
  });
  // Log status of CONTROL_SHEET_ID loading
  if (foundSheetId) {
    Logger.log('Configuration loaded. CONTROL_SHEET_ID = ' + CONFIG.CONTROL_SHEET_ID);
  } else {
    Logger.log('Configuration loaded, but CONTROL_SHEET_ID was NOT found or is empty in Script Properties.');
    // Optionally throw an error here if it's critical for the script to run
    // throw new Error("Critical configuration missing: CONTROL_SHEET_ID not found in Script Properties.");
  }
}

// Initialize config when the script loads
loadConfig();

/**
 * Runs when the script is opened from Google Sheets.
 * Creates custom menu for manual certificate generation.
 */
function onOpen() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('Ferramentas de Certificado') // <-- Changed main menu name
        .addItem('Segunda Via de Certificado', 'showGeneratorDialog') // <-- Kept Portuguese name
        .addSeparator()
        .addItem('Configurações', 'showConfigDialog') // <-- Changed to Portuguese
        .addItem('Criar Gatilhos', 'createTriggers') // <-- Changed to Portuguese
        .addSeparator()
        .addItem('Instruções', 'showInstructionsDialog') // <-- Added Instructions menu item
        .addSeparator()
        .addItem('Executar Testes Unitários', 'runAllTests') // <-- Changed to Portuguese
        .addToUi();
}

// Functions to expose UI methods globally
function showGeneratorDialog() {
  Logger.log('Attempting to call UI.showGeneratorDialog. typeof UI: ' + typeof UI);
  if (typeof UI !== 'undefined' && UI.showGeneratorDialog) {
    return UI.showGeneratorDialog();
  } else {
    Logger.log('ERROR: UI object or UI.showGeneratorDialog not found!');
    try {
      SpreadsheetApp.getUi().alert('Error: UI component not loaded. Please try reloading the sheet and try again.');
    } catch(e) {
      Logger.log('Could not display UI alert for missing UI.showGeneratorDialog: ' + e);
    }
    return null;
  }
}

function showConfigDialog() {
  Logger.log('Attempting to call UI.showConfigDialog. typeof UI: ' + typeof UI);
  if (typeof UI !== 'undefined' && UI.showConfigDialog) {
    return UI.showConfigDialog();
  } else {
    Logger.log('ERROR: UI object or UI.showConfigDialog not found!');
    try {
      SpreadsheetApp.getUi().alert('Error: UI component not loaded. Please try reloading the sheet and try again.');
    } catch(e) {
      Logger.log('Could not display UI alert for missing UI.showConfigDialog: ' + e);
    }
    return null;
  }
}

// ADDED: Function to expose UI.showInstructionsDialog globally
function showInstructionsDialog() {
  Logger.log('Attempting to call UI.showInstructionsDialog. typeof UI: ' + typeof UI);
  if (typeof UI !== 'undefined' && UI.showInstructionsDialog) {
    return UI.showInstructionsDialog();
  } else {
    Logger.log('ERROR: UI object or UI.showInstructionsDialog not found!');
    try {
      SpreadsheetApp.getUi().alert('Error: UI component not loaded. Please try reloading the sheet and try again.');
    } catch(e) {
      Logger.log('Could not display UI alert for missing UI.showInstructionsDialog: ' + e);
    }
    return null;
  }
}

function processBatch(formData) {
  Logger.log('Attempting to call UI.processBatch. typeof UI: ' + typeof UI);
  if (typeof UI !== 'undefined' && UI.processBatch) {
    return UI.processBatch(formData);
  } else {
    const errorMsg = 'ERROR: UI object or UI.processBatch not found!';
    Logger.log(errorMsg);
    throw new Error('UI component not loaded.'); // Throw error for server-side calls
  }
}

function saveConfig(config) {
  Logger.log('Attempting to call UI.saveConfig. typeof UI: ' + typeof UI);
  if (typeof UI !== 'undefined' && UI.saveConfig) {
    return UI.saveConfig(config);
  } else {
    const errorMsg = 'ERROR: UI.object or UI.saveConfig not found!';
    Logger.log(errorMsg);
    throw new Error('UI component not loaded.'); // Throw error for server-side calls
  }
}

/**
 * Runs when a Google Form is submitted.
 * @param {Object} e - Form submit event object
 */
function onFormSubmit(e) {
  try {
    // --- Get Item Responses ---
    const formData = e.response.getItemResponses().reduce(function(data, item) {
      // Normalize keys: lowercase, replace spaces with underscores
      const key = item.getItem().getTitle().trim().toLowerCase().replace(/\s+/g, '_');
      // Handle Date response specifically
      if (item.getItem().getType() === FormApp.ItemType.DATE) {
        // GetResponse returns date as string 'YYYY-MM-DD' or 'YYYY-MM-DD HH:MM:SS' if time included
        // Convert to Date object, assuming script timezone is appropriate
        const dateString = item.getResponse();
        // Check if response is not empty before parsing
        data[key] = dateString ? new Date(dateString) : null;
      } else {
        data[key] = item.getResponse();
      }
      return data;
    }, {});

    // --- Get Respondent's Email (if collected) ---
    try {
        const respondentEmail = e.response.getRespondentEmail();
        if (respondentEmail) {
            formData.email = respondentEmail; // Add email to formData
        } else {
            Logger.log('WARNING: Respondent email was not collected or is unavailable.');
            formData.email = null; // Explicitly set to null if not found
        }
    } catch (emailError) {
        // Log if getRespondentEmail fails (e.g., form setting changed)
        AppUtils.logError('Could not retrieve respondent email from form submission', emailError);
        formData.email = null;
    }

    // Add specific handling for duration if needed (e.g., ensuring ' horas' suffix)
    if (formData.course_duration && typeof formData.course_duration === 'string' && !formData.course_duration.toLowerCase().includes('hora')) {
        formData.course_duration += ' horas'; // Append ' horas' if missing
    }

    if (DEBUG_MODE) {
        Logger.log("Form Data Received: " + JSON.stringify(formData));
    }

    // Process the new submission
    processNewSubmission(formData);

  } catch (error) {
    // Use AppUtils.logError for consistent error logging
    const formId = AppUtils.extractIdFromUrl(CONFIG.FORM_URL) || 'Unknown Form URL';
    AppUtils.logError('Form submission error for form associated with URL: ' + CONFIG.FORM_URL, error);
  }
}

/**
 * Processes a new form submission to generate a certificate.
 * @param {Object} formData - Data from the form submission (keys normalized: lowercase, underscores)
 */
function processNewSubmission(formData) {
  const participantName = formData.full_name || 'Unknown Participant'; // Use full_name consistent with formData keys
  let certificateData = null; // Initialize certificateData
  // Use the completion date from the form if available, otherwise default (though form field is required)
  const completionDate = formData.course_completion_date instanceof Date ? formData.course_completion_date : new Date();

  // Prepare base log data using normalized keys from formData
  let logData = {
      name: participantName,
      email: formData.email || '', // Email should be added by onFormSubmit
      course: formData.course_name || '',
      course_duration: formData.course_duration || '', // Use normalized key
      status: 'Pending', // Initial status
      errorMessage: '',
      certificateId: '',
      pdfUrl: '',
      linkedInUrl: '',
      issuedDate: completionDate // Use the completion date from the form
  };

  try {
    // 1. Generate certificate PDF (Calls Certificates.js)
    // Pass the full formData which includes course_duration etc.
    // Also pass the completionDate explicitly if needed, or ensure formData contains it
    // Let's modify generateCertificate to primarily use the date passed within formData
    certificateData = Certificates.generateCertificate(formData); // formData now contains course_completion_date

    if (!certificateData) {
      // If generateCertificate returned null, it means an error occurred and was logged internally.
      // Update status and log the failure.
      logData.status = 'Failed';
      logData.errorMessage = 'Certificate generation step failed. Check execution logs.';
      // Log the failure entry to the control sheet
      AppUtils.logCertificateToControlSheet(logData);
      // Exit the function as we cannot proceed without certificate details
      return;
    }

    // 2. Generate LinkedIn URL using data from the generated certificate
    // certificateData should now contain the correct issuedDate (completion date)
    const linkedInUrl = AppUtils.generateLinkedInUrl(certificateData);

    // 3. Prepare final log data with generated certificate details
    logData.status = 'Generated';
    logData.pdfUrl = certificateData.pdfUrl;
    logData.certificateId = certificateData.certificateId;
    logData.linkedInUrl = linkedInUrl;
    logData.issuedDate = certificateData.issuedDate; // Use issuedDate from certificateData (which is the completion date)

    // 4. Log the successful generation to the control sheet (gid=0)
    AppUtils.logCertificateToControlSheet(logData);

    // 5. Send email to participant - Check for valid email from logData
    if (logData.email && typeof logData.email === 'string' && logData.email.includes('@')) {
      AppUtils.sendCertificateEmail(
        logData.email,
        logData.name,
        logData.course,
        logData.pdfUrl,
        logData.linkedInUrl,
        logData.course_duration, // Pass duration from logData
        logData.certificateId    // Pass the generated certificate ID from logData
      );
    } else {
      // Log a warning if the email is missing or looks invalid
      const emailErrorMsg = 'Skipping email for ' + participantName + ': Invalid or missing email address provided (' + logData.email + ').';
      Logger.log('WARNING: ' + emailErrorMsg);
      // Optionally log this to the error sheet as a warning/notice
      if (typeof AppUtils.logError === 'function') {
         AppUtils.logError(emailErrorMsg, null, 'WARNING'); // Add severity if logError supports it
      }
      // Note: The status in the sheet remains 'Generated' even if email fails.
      // If needed, you could update the specific row status later.
    }

    if (DEBUG_MODE) {
      Logger.log('Certificate successfully generated and processed for: ' + participantName);
    }

  } catch (error) {
    // Log the overall processing error using the central function
    AppUtils.logError('Certificate processing failed for ' + participantName, error);

    // Attempt to log the failure to the control sheet even if certificate generation failed partially
    logData.status = 'Failed';
    // Ensure error message is a string, even if error.message is undefined
    logData.errorMessage = String(error.message || 'Unknown processing error') + (error.stack ? '\nStack: ' + error.stack : '');
    try {
        // Log the failure state using the prepared logData object
        AppUtils.logCertificateToControlSheet(logData);
    } catch (logSheetError) {
        // Log a critical error if even logging the failure fails
        AppUtils.logError('CRITICAL: Failed to log processing failure to Control Sheet for ' + participantName, logSheetError);
    }
  }
}

/**
 * Creates necessary triggers for the application.
 * Run this function once during setup. Requires FORM_URL to be set in config.
 */
function createTriggers() {
  try {
    const formUrl = CONFIG.FORM_URL;
    const formId = formUrl ? AppUtils.extractIdFromUrl(formUrl, 'form') : null;

    if (!formId) {
      const message = "Form URL is not set or invalid in configuration. Cannot create form trigger.";
      Logger.log(message);
      try { 
        SpreadsheetApp.getUi().alert(message); 
      } catch(uiError) { 
        Logger.log('Could not display UI alert.'); 
      }
      return;
    }

    // Delete any existing triggers to avoid duplicates
    const triggers = ScriptApp.getProjectTriggers();

    for (let i = 0; i < triggers.length; i++) {
      const trigger = triggers[i];
      const handlerFunction = trigger.getHandlerFunction();
      if (handlerFunction === 'onFormSubmit') {
        ScriptApp.deleteTrigger(trigger);
        Logger.log("Deleted existing onFormSubmit trigger.");
      } else if (handlerFunction === 'cleanupTempFiles') { // Keep deleting old daily triggers if they exist
        ScriptApp.deleteTrigger(trigger);
        Logger.log("Deleted obsolete cleanupTempFiles trigger.");
      }
    }

    // Create form submit trigger
    const form = FormApp.openById(formId);
    ScriptApp.newTrigger('onFormSubmit')
      .forForm(form)
      .onFormSubmit()
      .create();
    Logger.log("Created new onFormSubmit trigger for Form ID: " + formId + " (from URL: " + formUrl + ")");

    try { 
      SpreadsheetApp.getUi().alert("Form Submit trigger created successfully!"); 
    } catch(uiError) { 
      Logger.log('Could not display UI alert.'); 
    }

  } catch (error) {
    AppUtils.logError("Failed to create triggers", error);
    try { 
      SpreadsheetApp.getUi().alert("Failed to create triggers. Check logs and ensure Form URL is correct (Edit URL) and you have permissions."); 
    } catch(uiError) { 
      Logger.log('Could not display UI alert.'); 
    }
  }
}

/**
 * Error logging function exposed globally. Calls AppUtils.
 */
function logError(message, error) {
  // Forward call to AppUtils.js
  AppUtils.logError(message, error);
}