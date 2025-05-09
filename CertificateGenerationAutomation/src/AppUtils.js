/**
 * Utility functions for the Certificate Generator.
 * Provides reusable helper methods across the application.
 */

var AppUtils = (function() {
  // Cache for column indices to avoid repeated lookups
  var _columnIndicesCache = {};

  /**
   * Finds a sheet within a spreadsheet by its GID (sheetId).
   * @param {Spreadsheet} spreadsheet The Spreadsheet object.
   * @param {number} gid The GID (sheetId) of the sheet to find.
   * @return {Sheet|null} The found Sheet object or null if not found.
   */
  function getSheetByGid_(spreadsheet, gid) {
    if (!spreadsheet) return null;
    var sheets = spreadsheet.getSheets();
    for (var i = 0; i < sheets.length; i++) {
      if (sheets[i].getSheetId() === gid) {
        return sheets[i];
      }
    }
    Logger.log('getSheetByGid_ WARN: Sheet with GID ' + gid + ' not found in spreadsheet ID ' + spreadsheet.getId());
    return null;
  }

  /**
   * Gets column indices from the header row of a sheet. Caches results.
   * @param {Sheet} sheet The specific Sheet object to get headers from.
   * @return {Object} An object mapping column names (lowercase) to their 1-based indices.
   */
  function getColumnIndices(sheet) {
    var sheetName = sheet.getName();
    if (_columnIndicesCache[sheetName]) {
      return _columnIndicesCache[sheetName];
    }

    try {
      var headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      var indices = {};
      headerRow.forEach(function(header, index) {
        if (header && typeof header === 'string' && header.trim() !== '') {
          indices[header.trim()] = index + 1;
        }
      });

      if (Object.keys(indices).length === 0) {
        Logger.log('WARNING: No headers found or header row is empty in sheet "' + sheetName + '".');
      }

      _columnIndicesCache[sheetName] = indices;
      return indices;
    } catch (e) {
      Logger.log('Error getting column indices for sheet "' + sheetName + '": ' + e);
      return {};
    }
  }

  /**
   * Finds the duration for a given course name from the Courses sheet.
   * @param {string} courseName The name of the course to look up.
   * @return {string|null} The duration string or null if not found or error.
   */
  function getCourseDuration(courseName) {
    if (!CONFIG.COURSES_SHEET_ID) {
      Logger.log('WARNING: COURSES_SHEET_ID is not configured. Cannot look up duration.');
      return null;
    }
    if (!courseName) {
      Logger.log('WARNING: No course name provided to getCourseDuration.');
      return null;
    }

    try {
      var coursesSpreadsheet = SpreadsheetApp.openById(CONFIG.COURSES_SHEET_ID);
      // Assuming the courses sheet is the first sheet (gid=0) in that spreadsheet file
      var coursesSheet = getSheetByGid_(coursesSpreadsheet, 0);
      if (!coursesSheet) {
        logError('Could not find Courses sheet (gid=0) in spreadsheet ID: ' + CONFIG.COURSES_SHEET_ID, null);
        return null;
      }

      var courseIndices = getColumnIndices(coursesSheet);
      // Use the exact header name expected in the Courses sheet
      var courseNameCol = courseIndices['Course Name']; // Assuming header is 'Course Name'
      var durationCol = courseIndices['Course Duration'];   // <--- Changed from 'duration'

      if (!courseNameCol || !durationCol) {
        // Update error message to reflect the headers being checked
        logError('Missing required columns ("Course Name" or "Course Duration") in Courses sheet: ' + coursesSheet.getName(), null);
        return null;
      }

      var data = coursesSheet.getDataRange().getValues();
      // Start from row 1 to skip header
      for (var i = 1; i < data.length; i++) {
        // Check if course name matches (case-insensitive, trim whitespace)
        if (data[i][courseNameCol - 1] && typeof data[i][courseNameCol - 1] === 'string' &&
            data[i][courseNameCol - 1].trim().toLowerCase() === courseName.trim().toLowerCase()) {
          var duration = data[i][durationCol - 1];
          Logger.log('Found duration "' + duration + '" for course "' + courseName + '"');
          return duration ? String(duration) : null; // Return duration as string
        }
      }

      Logger.log('WARNING: Course "' + courseName + '" not found in Courses sheet.');
      return null;
    } catch (e) {
      logError('Error looking up course duration for "' + courseName + '" in sheet ID ' + CONFIG.COURSES_SHEET_ID, e);
      return null;
    }
  }

  /**
   * Generates a unique ID.
   * Combines timestamp with random string for uniqueness.
   * @return {string} Unique ID (e.g., '20250503-143000-abcdef123')
   */
  function generateUniqueId() {
    return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss-') +
           Math.random().toString(36).substring(2, 10);
  }

  /**
   * Formats form data into a row array for the control sheet.
   * Order must match the columns defined in Appscript.js::SHEET_COLUMNS.
   * @param {Object} formData - Data from form submission (normalized keys, including course_duration)
   * @return {Array} Array of values for the sheet row
   */
  function formatRowData(formData) {
    return [
      new Date(),
      'Pending',
      '',
      '',
      '',
      formData.name || '',
      formData.email || '',
      formData.course || '',
      formData.course_duration || '',
      '',
      ''
    ];
  }

  /**
   * Extracts the Google Workspace resource ID from its URL.
   * Handles Sheets, Slides, Docs, Folders, and Form Edit URLs.
   * @param {string} url The URL of the Google resource.
   * @param {string} typeHint Optional hint ('sheet', 'slide', 'folder', 'form') for validation.
   * @return {string|null} The extracted ID or null if extraction fails.
   */
  function extractIdFromUrl(url, typeHint) {
    if (!url || typeof url !== 'string') {
      logError('Invalid URL provided for ID extraction: ' + url, null);
      return null;
    }
    var id = null;
    try {
      // Regex for /d/ID/ pattern (Sheets, Docs, Slides, Forms Edit URL)
      var match = url.match(/\/d\/([a-zA-Z0-9-_]{15,})\//);
      if (match && match[1]) {
        id = match[1];
      } else {
        // Regex for /folders/ID pattern
        match = url.match(/\/folders\/([a-zA-Z0-9-_]{15,})/);
        if (match && match[1]) {
          id = match[1];
        }
      }

      if (!id) {
        logError('Could not extract ID from URL: ' + url, null);
      }

      // Basic validation for Form Edit URL hint
      if (id && typeHint === 'form' && url.indexOf('/forms/d/') === -1) {
        logError('URL does not look like a valid Form Edit URL: ' + url, null);
        // Depending on strictness, you might nullify id here, but let's keep it for now
      }
    } catch (e) {
      logError('Error extracting ID from URL: ' + url, e);
      id = null;
    }
    return id;
  }

  /**
   * Appends data to the specified sheet.
   * @param {string} sheetId The ID of the Google Sheet FILE.
   * @param {Array} rowData An array representing the row data to append.
   * @return {number} The row number where the data was appended.
   */
  function appendToSheet(sheetId, rowData) {
    if (!sheetId) {
      throw new Error("appendToSheet Error: Missing sheetId.");
    }
    try {
      var spreadsheet = SpreadsheetApp.openById(sheetId);
      var sheet = getSheetByGid_(spreadsheet, 0);
      if (!sheet) {
        throw new Error('appendToSheet Error: Control sheet (gid=0) not found in spreadsheet ID: ' + sheetId);
      }

      var dataToAppend = rowData.slice();
      if (dataToAppend.length > 0 && !(dataToAppend[0] instanceof Date)) {
        dataToAppend.unshift(new Date());
      } else if (dataToAppend.length === 0) {
        dataToAppend.push(new Date());
      }

      sheet.appendRow(dataToAppend);
      var lastRow = sheet.getLastRow();
      Logger.log('Data appended to sheet ID ' + sheetId + ' (gid=0) at row ' + lastRow);
      return lastRow;
    } catch (e) {
      logError('Failed to append data to sheet ID ' + sheetId + ' (gid=0)', e);
      throw e;
    }
  }

  /**
   * Appends a log entry for a generated certificate to the control sheet (gid=0).
   * @param {Object} certificateData An object containing certificate details
   *        (name, email, course, course_duration, pdfUrl, certificateId, linkedInUrl, status, errorMessage, issuedDate).
   *        issuedDate should be the completion date (can be Date object or ISO string).
   * @return {number} The row number where the data was appended.
   */
  function logCertificateToControlSheet(certificateData) {
    var sheetId = CONFIG.CONTROL_SHEET_ID;
    if (!sheetId) {
      logError("logCertificateToControlSheet Error: CONTROL_SHEET_ID is not configured.", new Error("Missing CONTROL_SHEET_ID"));
      return -1; 
    }

    try {
      var spreadsheet = SpreadsheetApp.openById(sheetId);
      var sheet = getSheetByGid_(spreadsheet, 0); // Assuming control sheet is always gid=0
      if (!sheet) {
        logError('logCertificateToControlSheet Error: Control sheet (gid=0) not found in spreadsheet ID: ' + sheetId, new Error("Sheet gid=0 not found"));
        return -1;
      }

      // Define the order of columns for the control sheet log entry.
      // Expected Order: Timestamp, Status, Error Message, Certificate ID, Issued Date, Full Name, Email Address, Course Name, Course Duration, Certificate URL, LinkedIn URL
      // Ensure issuedDate is handled correctly whether it's a Date object or ISO string
      var issuedDateObject = certificateData.issuedDate ? new Date(certificateData.issuedDate) : null;
      var formattedIssuedDate = issuedDateObject && !isNaN(issuedDateObject) ? Utilities.formatDate(issuedDateObject, Session.getScriptTimeZone(), 'yyyy-MM-dd') : '';

      var rowData = [
        new Date(),                                  // Timestamp (A)
        certificateData.status || 'Unknown',         // Status (B)
        certificateData.errorMessage || '',          // Error Message (C)
        certificateData.certificateId || '',         // Certificate ID (D)
        formattedIssuedDate,                         // Issued Date (E) - Now using completion date
        certificateData.name || '',                  // Full Name (F)
        certificateData.email || '',                 // Email Address (G)
        certificateData.course || '',                // Course Name (H)
        certificateData.course_duration || '',       // Course Duration (I)
        certificateData.pdfUrl || '',                // Certificate URL (J)
        certificateData.linkedInUrl || ''            // LinkedIn URL (K)
      ];

      sheet.appendRow(rowData);
      var lastRow = sheet.getLastRow();
      Logger.log('Appended certificate log to sheet ID ' + sheetId + ' (gid=0) at row ' + lastRow + ' for ' + (certificateData.name || 'Unknown Participant'));
      return lastRow;

    } catch (e) {
      var participantName = certificateData ? certificateData.name : 'Unknown Participant';
      logError('Failed to append certificate log to sheet (ID: ' + sheetId + ', gid=0) for ' + participantName, e);
      return -1;
    }
  }

  /**
   * Generates a LinkedIn "Add to Profile" URL for the certificate.
   * Prioritizes ORGANIZATION_ID over ORGANIZATION_NAME if both are configured.
   * @param {Object} certificateData - Certificate metadata including name, course, pdfUrl, certificateId, issuedDate.
   *                                   issuedDate should be the completion date (can be Date object or ISO string).
   * @return {string} LinkedIn add profile URL.
   */
  function generateLinkedInUrl(certificateData) {
    const baseUrl = 'https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME';
    // Ensure issuedDate is handled correctly whether it's a Date object or ISO string
    const issueDate = certificateData.issuedDate ? new Date(certificateData.issuedDate) : new Date(); // Default to now if missing

    const params = {
      name: certificateData.course || 'Certificate',
      issueYear: issueDate.getFullYear(),
      issueMonth: issueDate.getMonth() + 1, // LinkedIn uses 1-based month
      certUrl: certificateData.pdfUrl || '',
      certId: certificateData.certificateId || ''
    };

    if (CONFIG.ORGANIZATION_ID && /^[0-9]+$/.test(CONFIG.ORGANIZATION_ID)) {
      params.organizationId = CONFIG.ORGANIZATION_ID;
    } else if (CONFIG.ORGANIZATION_NAME) {
      params.organizationName = CONFIG.ORGANIZATION_NAME;
    } else {
      params.organizationName = 'Your Organization';
    }

    const paramParts = [];
    for (const key in params) {
      if (params.hasOwnProperty(key) && params[key]) {
        paramParts.push(key + '=' + encodeURIComponent(params[key]));
      }
    }
    const finalUrl = baseUrl + '&' + paramParts.join('&');
    Logger.log('Generated LinkedIn URL for ' + certificateData.name + ': ' + finalUrl);
    return finalUrl;
  }

  /**
   * Sends a certificate email to the participant using an HTML template.
   * @param {string} email - Recipient email address.
   * @param {string} name - Recipient name.
   * @param {string} course - Course name.
   * @param {string} pdfUrl - Certificate PDF URL.
   * @param {string} linkedInUrl - LinkedIn URL.
   * @param {string} duration - Course duration.
   * @param {string} certificateId - Unique Certificate ID.
   * @param {Date | string} issuedDate - The date the certificate was issued (completion date).
   */
  function sendCertificateEmail(email, name, course, pdfUrl, linkedInUrl, duration, certificateId, issuedDate) { // Added issuedDate param
    try {
      if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        throw new Error('Invalid recipient email address: ' + email);
      }

      const template = HtmlService.createTemplateFromFile('EmailTemplate');
      template.name = name || 'Participant';
      template.course = course || 'the course';
      template.duration = duration || '';
      template.pdfUrl = pdfUrl || '';
      template.linkedInUrl = linkedInUrl || '';
      // Format the issuedDate for the email
      const dateObject = issuedDate ? new Date(issuedDate) : new Date();
      template.date = dateObject && !isNaN(dateObject) ? Utilities.formatDate(dateObject, Session.getScriptTimeZone(), 'dd/MM/yyyy') : Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy');
      template.certificateId = certificateId || '';
      template.CONFIG = CONFIG;

      const htmlBody = template.evaluate().getContent();

      const textBody =
        `Congratulations ${template.name}!\n\n` +
        `You have successfully completed ${template.course}` +
        (template.duration ? ` (${template.duration}).\n\n` : `.\n\n`) +
        `Your certificate is available at: ${template.pdfUrl || '[Link not available]'}\n\n` +
        (template.linkedInUrl ? `Add this certificate to your LinkedIn profile: ${template.linkedInUrl}\n\n` : '') +
        `Issued on: ${template.date}` + // Use the formatted date
        (template.certificateId ? `\nCertificate ID: ${template.certificateId}` : '');

      const subject = `Seu Certificado de ${template.course}`;

      // --- Prepare Email Options ---
      const emailOptions = {
        htmlBody: htmlBody,
        name: CONFIG.ORGANIZATION_NAME || 'Certificate Issuer', // Sender Name
        replyTo: CONFIG.INSTRUCTOR_EMAIL || '' // Keep Reply-To
      };

      // *** ADDED: Set 'from' address if INSTRUCTOR_EMAIL is configured AND is a valid alias ***
      // Note: This will fail if INSTRUCTOR_EMAIL is not a verified alias for the executing user.
      if (CONFIG.INSTRUCTOR_EMAIL && CONFIG.INSTRUCTOR_EMAIL !== Session.getEffectiveUser().getEmail()) {
         // Check if it's different from the script runner's email to avoid unnecessary 'from'
         emailOptions.from = CONFIG.INSTRUCTOR_EMAIL;
         Logger.log('Attempting to send email from configured alias: ' + CONFIG.INSTRUCTOR_EMAIL);
      } else {
         Logger.log('Sending email from default script user: ' + Session.getEffectiveUser().getEmail());
      }
      // --- End Added Section ---

      GmailApp.sendEmail(
        email,
        subject,
        textBody,
        emailOptions // Use the prepared options object
      );

      Logger.log('Certificate email sent successfully to: ' + email);
    } catch (error) {
      // Check if the error is due to an invalid 'from' address (alias not set up)
      if (error.message && error.message.includes('Invalid argument: from')) {
         logError('Failed to send certificate email to: ' + email + '. Error likely due to INSTRUCTOR_EMAIL (' + CONFIG.INSTRUCTOR_EMAIL + ') not being a verified alias for the user (' + Session.getEffectiveUser().getEmail() + ').', error);
         // Optionally, try sending without the 'from' address as a fallback
         try {
           Logger.log('Retrying email send without the \'from\' alias...');
           delete emailOptions.from; // Remove the problematic 'from'
           GmailApp.sendEmail(email, subject, textBody, emailOptions);
           Logger.log('Fallback email sent successfully from default user.');
         } catch (fallbackError) {
           logError('Fallback email send also failed for: ' + email, fallbackError);
         }
      } else {
        // Log other errors as usual
        logError('Failed to send certificate email to: ' + email, error);
      }
    }
  }

  /**
   * Logs errors to the Apps Script logger and optionally to a designated Google Sheet.
   * @param {string} message - Error description.
   * @param {Error | null} error - Optional Error object.
   */
  function logError(message, error) {
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    const errorMessage = error ? error.toString() : 'No error object provided';
    const stack = (error && error.stack) ? error.stack : 'N/A';

    Logger.log(`ERROR [${timestamp}]: ${message} - Details: ${errorMessage}\nStack: ${stack}`);

    const errorSheetUrl = CONFIG.ERROR_LOG_SHEET_URL;
    if (errorSheetUrl) {
      const errorSheetId = extractIdFromUrl(errorSheetUrl, 'sheet');
      if (errorSheetId) {
        try {
          const errorSheet = SpreadsheetApp.openById(errorSheetId).getActiveSheet();
          errorSheet.appendRow([
            new Date(),
            message,
            errorMessage,
            stack
          ]);
        } catch (e) {
          Logger.log('CRITICAL: Failed to log error to sheet URL: ' + errorSheetUrl + ' (ID: ' + errorSheetId + ') - Error: ' + e.toString());
        }
      } else {
        Logger.log('WARNING: Invalid Error Log Sheet URL configured: ' + errorSheetUrl);
      }
    }
  }

  /**
   * Pauses script execution for a specified duration.
   * Useful for staying within Google Apps Script quotas.
   * @param {number} ms - Milliseconds to sleep (e.g., 1000 for 1 second).
   */
  function sleep(ms) {
    if (ms > 0) {
      Utilities.sleep(ms);
    }
  }

  return {
    generateUniqueId: generateUniqueId,
    formatRowData: formatRowData,
    appendToSheet: appendToSheet,
    logCertificateToControlSheet: logCertificateToControlSheet,
    generateLinkedInUrl: generateLinkedInUrl,
    sendCertificateEmail: sendCertificateEmail,
    logError: logError,
    sleep: sleep,
    extractIdFromUrl: extractIdFromUrl,
    getCourseDuration: getCourseDuration,
    getSheetByGid_: getSheetByGid_ // <-- Add this line to expose the function
  };
})();