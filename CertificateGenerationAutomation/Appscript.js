/**
 * @OnlyCurrentDoc
 *
 * This script contains setup functions for the Certificate Generation Automation project.
 * Run the initialSetup function manually ONCE from the Apps Script editor
 * to create the necessary Google Workspace files and configure the script properties and triggers.
 */

// --- CONFIGURATION CONSTANTS ---
const PARENT_FOLDER_NAME = 'GeradorDeCertificados'; // New parent folder
const TEMPLATE_NAME = 'Certificate Template';
const SHEET_NAME = 'Certificate Control Sheet'; // Name for the main sheet TAB
const LOG_SHEET_NAME = 'Error Log Sheet'; // <-- Add Log Sheet Name
const FORM_NAME = 'Certificate Request Form';
const FOLDER_NAME = 'Generated Certificates';
const DEFAULT_ORG_NAME = 'Your Organization Name'; // Replace later via Config Dialog
const DEFAULT_INSTRUCTOR_EMAIL = 'instructor@example.com'; // Replace later via Config Dialog

// Sheet Columns
const SHEET_COLUMNS = [
  'Timestamp', 'Status', 'Error Message', 'Certificate ID', 'Issued Date',
  'Full Name', 'Email Address', 'Course Name', 'Course Duration (Optional)',
  'Certificate URL', 'LinkedIn URL'
];

// Log Sheet Columns (Optional, but good practice)
const LOG_SHEET_COLUMNS = ['Timestamp', 'Message', 'Error Details', 'Stack Trace'];

// Form Questions (Match data needed for SHEET_COLUMNS and placeholders)
const FORM_QUESTIONS = [
  { title: 'Full Name', type: FormApp.ItemType.TEXT, required: true },
  { title: 'Course Name', type: FormApp.ItemType.TEXT, required: true },
  // Simplified title for easier key normalization
  { title: 'Course Duration', type: FormApp.ItemType.TEXT, required: false },
  { title: 'Course Completion Date', type: FormApp.ItemType.DATE, required: true } // Added Date Question
];

/**
 * !!! RUN THIS FUNCTION MANUALLY ONCE FROM THE EDITOR !!!
 * Creates the necessary Google Slides, Sheet, Form, and Folder.
 * Saves their IDs/URLs to Script Properties. // Modified comment
 * Sets up the required triggers.
 */
function initialSetup() {
  try {
    Logger.log('Starting Initial Setup. This process will create necessary files and triggers. Please wait...');

    // --- 1. Create Google Workspace Resources ---
    Logger.log('Creating resources...');

    // Create Parent Folder
    const parentFolder = DriveApp.createFolder(PARENT_FOLDER_NAME);
    const parentFolderId = parentFolder.getId();
    Logger.log('Parent Folder created: ID = ' + parentFolderId + ', URL = ' + parentFolder.getUrl());

    // Create Output Folder inside Parent Folder
    const outputFolder = parentFolder.createFolder(FOLDER_NAME);
    const outputFolderId = outputFolder.getId();
    Logger.log('Output Folder created: ID = ' + outputFolderId + ', URL = ' + outputFolder.getUrl());

    // Create Google Slides Template (Basic)
    const templateSlide = SlidesApp.create(TEMPLATE_NAME);
    const templateSlideId = templateSlide.getId();
    // Add basic placeholders matching Certificates.js expectations
    const slide = templateSlide.getSlides()[0];
    slide.insertTextBox('{{NAME}}', 100, 100, 400, 50);
    slide.insertTextBox('{{COURSE}}', 100, 160, 400, 50);
    slide.insertTextBox('{{DATE}}', 100, 220, 400, 50);
    slide.insertTextBox('{{CERTIFICATE_ID}}', 100, 280, 400, 50);
    slide.insertTextBox('{{DURATION}}', 100, 340, 400, 50); // Added DURATION placeholder
    templateSlide.saveAndClose();
    // Move template to parent folder for organization
    DriveApp.getFileById(templateSlideId).moveTo(parentFolder);
    Logger.log('Template Slide created: ID = ' + templateSlideId + ', URL = ' + DriveApp.getFileById(templateSlideId).getUrl());


    // Create Google Sheet (Control Sheet)
    const controlSheet = SpreadsheetApp.create(SHEET_NAME); // Creates the FILE with this name
    const controlSheetId = controlSheet.getId(); // Get the ID
    const controlSheetUrl = controlSheet.getUrl(); // Keep URL for logging/reference
    const sheet = controlSheet.getActiveSheet(); // Get the first sheet created by default

    // ---> RENAME THE SHEET TAB <---
    sheet.setName(SHEET_NAME); // Explicitly set the sheet tab name

    sheet.appendRow(SHEET_COLUMNS); // Add header row to the correctly named sheet
    sheet.setFrozenRows(1);
    // Move sheet to parent folder for organization
    DriveApp.getFileById(controlSheetId).moveTo(parentFolder);
    Logger.log('Control Sheet created: ID = ' + controlSheetId + ', URL = ' + controlSheetUrl + ', Sheet Tab Name = "' + SHEET_NAME + '"');

    // ---> Create Google Sheet (Log Sheet) <---
    const logSheetFile = SpreadsheetApp.create(LOG_SHEET_NAME);
    const logSheetId = logSheetFile.getId();
    const logSheetUrl = logSheetFile.getUrl(); // Get the URL
    const logSheet = logSheetFile.getActiveSheet();
    logSheet.appendRow(LOG_SHEET_COLUMNS); // Add header row
    logSheet.setFrozenRows(1);
    // Move log sheet file to parent folder
    DriveApp.getFileById(logSheetId).moveTo(parentFolder);
    Logger.log('Log Sheet created: ID = ' + logSheetId + ', URL = ' + logSheetUrl);

    // Create Google Form
    const form = FormApp.create(FORM_NAME);
    const formId = form.getId();
    form.setCollectEmail(true); // Automatically collect email
    form.setConfirmationMessage('Thank you for your submission!');
    form.setAllowResponseEdits(false);
    form.setPublishingSummary(false);

    FORM_QUESTIONS.forEach(q => {
      let item; // Declare item outside switch/if
      // Use the correct ItemType based on the definition
      switch (q.type) {
        case FormApp.ItemType.TEXT:
          item = form.addTextItem();
          break;
        case FormApp.ItemType.DATE:
          item = form.addDateItem();
          // Optionally include year if needed, default is usually fine
          // item.setIncludesYear(true);
          break;
        // Add other types here if needed (e.g., MULTIPLE_CHOICE)
        default:
          Logger.log('Unsupported form item type specified: ' + q.type + ' for question: ' + q.title);
          return; // Skip this question
      }
      item.setTitle(q.title);
      item.setRequired(q.required);
    });
    // Link form responses to the created sheet
    form.setDestination(FormApp.DestinationType.SPREADSHEET, controlSheetId);
    // Move form to parent folder for organization
    DriveApp.getFileById(formId).moveTo(parentFolder);
    Logger.log('Google Form created: ID = ' + formId + ', Edit URL = ' + form.getEditUrl() + ', Published URL = ' + form.getPublishedUrl());


    // --- 2. Save Configuration to Properties ---
    Logger.log('Saving configuration...');
    const propertiesToSave = {
      'TEMPLATE_SLIDE_URL': DriveApp.getFileById(templateSlideId).getUrl(),
      'CONTROL_SHEET_ID': controlSheetId, // ADDED - Store the ID
      'SHEET_NAME': SHEET_NAME, // Keep sheet name for targeting the tab
      'ERROR_LOG_SHEET_URL': logSheetUrl,
      'OUTPUT_FOLDER_URL': outputFolder.getUrl(),
      'PARENT_FOLDER_ID': parentFolderId,
      'FORM_URL': form.getEditUrl(),
      'ORGANIZATION_NAME': DEFAULT_ORG_NAME,
      'INSTRUCTOR_EMAIL': DEFAULT_INSTRUCTOR_EMAIL,
    };
    PropertiesService.getScriptProperties().setProperties(propertiesToSave, false);
    Logger.log('Configuration save attempted.');

    // ---> Verification Step <--- 
    const savedProps = PropertiesService.getScriptProperties().getProperties();
    let verificationPassed = true;
    Object.keys(propertiesToSave).forEach(key => {
        if (savedProps[key] !== propertiesToSave[key]) {
            Logger.log('VERIFICATION FAILED for property: ' + key + '. Expected: ' + propertiesToSave[key] + ', Found: ' + savedProps[key]);
            verificationPassed = false;
        }
    });

    if (verificationPassed) {
        Logger.log('Configuration successfully saved and verified in Script Properties.');
    } else {
        Logger.log('ERROR: Configuration verification failed. Some properties were not saved correctly. Please check permissions or potential script property limits.');
        throw new Error('Failed to save configuration properties correctly. Setup aborted.'); // Stop setup if verification fails
    }

    // --- 3. Setup Triggers ---
    Logger.log('Setting up triggers...');
    // Pass controlSheetId directly
    setupTriggers(formId, controlSheetId);
    Logger.log('Triggers set up.');

    // --- 4. Final Message ---
    const message = 'Setup Complete!\n\n' +
                    'Created Resources inside folder "' + PARENT_FOLDER_NAME + '" (check logs for URLs/IDs):\n' +
                    '- Certificate Template (Google Slide)\n' +
                    '- Control Sheet (Google Sheet)\n' +
                    '- Error Log Sheet (Google Sheet)\n' + // <-- Update message
                    '- Request Form (Google Form)\n' +
                    '- Output Folder (' + FOLDER_NAME + ')\n\n' +
                    'Configuration saved. Triggers created.\n\n' +
                    'IMPORTANT:\n' +
                    '1. Customize the "' + TEMPLATE_NAME + '" Google Slide with your design and ensure placeholders match.\n' +
                    '2. Review the "' + FORM_NAME + '" questions.\n' +
                    '3. Use the "Certificate Tools > Configure Settings" menu in the Sheet to update Organization Name, Instructor Email, etc.\n' +
                    '4. Reload the Sheet/Editor for the menu to appear.';
    Logger.log('Setup Successful!\n' + message);

  } catch (error) {
    const errorDetails = 'ERROR during initial setup: ' + error.toString() + '\n' + error.stack;
    Logger.log(errorDetails);
    Logger.log('Setup Failed. An error occurred during setup. Please check the logs for details. Error: ' + error.toString());
    throw error;
  }
}

/**
 * Creates the necessary triggers for the application.
 * Called by initialSetup.
 * @param {string} formId The ID of the Google Form to attach the trigger to.
 * @param {string} controlSheetId The ID of the Google Sheet to attach the trigger to.
 */
function setupTriggers(formId, controlSheetId) { // Added controlSheetId parameter
  // Delete existing triggers to avoid duplicates
  const existingTriggers = ScriptApp.getProjectTriggers();
  existingTriggers.forEach(trigger => {
    // Keep deletion logic for form and cleanup triggers
    if (trigger.getHandlerFunction() === 'onFormSubmit' || trigger.getHandlerFunction() === 'cleanupTempFiles' || trigger.getHandlerFunction() === 'onOpen') {
        ScriptApp.deleteTrigger(trigger);
    }
  });
  Logger.log('Deleted existing trigger(s).');

  // 1. Form Submit Trigger (Installable)
  try {
    const form = FormApp.openById(formId);
    ScriptApp.newTrigger('onFormSubmit') // Assumes function 'onFormSubmit' exists in Code.js
      .forForm(form)
      .onFormSubmit()
      .create();
    Logger.log('Created trigger for onFormSubmit.');
  } catch (e) {
     Logger.log('Failed to create onFormSubmit trigger. Ensure Form ID is correct and function "onFormSubmit" exists. Error: ' + e);
     throw new Error('Failed to create onFormSubmit trigger. Check Logs.'); // Stop setup if this fails
  }

  // 2. Time-Driven Trigger for Cleanup (Installable)
  try {
    ScriptApp.newTrigger('cleanupTempFiles') // Assumes function 'cleanupTempFiles' exists and is globally accessible (e.g., defined in Code.js)
      .timeBased()
      .everyDays(1) // Run once a day
      .atHour(2)    // Run around 2 AM
      .create();
    Logger.log('Created daily time-based trigger for cleanupTempFiles.');
  } catch (e) {
     Logger.log('Failed to create cleanupTempFiles trigger. Ensure function "cleanupTempFiles" exists and is globally accessible. Error: ' + e);
     // Might not be critical to stop setup, but log it.
  }

  // 3. onOpen Trigger for the specific Control Sheet (Installable)
  try {
    ScriptApp.newTrigger('onOpen') // Assumes function 'onOpen' exists in Code.js
      .forSpreadsheet(controlSheetId) // Target the specific sheet
      .onOpen()
      .create();
    Logger.log('Created installable onOpen trigger for Control Sheet ID: ' + controlSheetId);
  } catch (e) {
     Logger.log('Failed to create installable onOpen trigger for Control Sheet. Ensure function "onOpen" exists. Error: ' + e);
     // Might not be critical to stop setup, but log it.
  }
}

