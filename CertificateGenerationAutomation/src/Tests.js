/**
 * Unit Testing Suite for Certificate Generation Automation.
 * Contains functions to test individual components in isolation.
 */

// Simple Assertion Helpers (Apps Script doesn't have built-in assert)
function assertEquals(expected, actual, message) {
  if (expected !== actual) {
    const msg = message + ": Expected \"" + expected + "\", but got \"" + actual + "\"";
    Logger.log("FAIL: " + msg);
    throw new Error(msg); // Throw error to stop execution on failure
  } else {
    Logger.log("PASS: " + message);
  }
}

function assertNotNull(actual, message) {
  if (actual === null || actual === undefined) {
    const msg = message + ": Expected a non-null/undefined value, but got \"" + actual + "\"";
    Logger.log("FAIL: " + msg);
    throw new Error(msg);
  } else {
    Logger.log("PASS: " + message);
  }
}

function assertTrue(condition, message) {
  if (!condition) {
    const msg = message + ": Expected condition to be true, but it was false.";
    Logger.log("FAIL: " + msg);
    throw new Error(msg);
  } else {
    Logger.log("PASS: " + message);
  }
}

// --- Test Runner --- //

function runAllTests() {
  Logger.log("--- Starting Unit Tests ---");
  let testsPassed = 0;
  let testsFailed = 0;
  const testFunctions = [
    testExtractIdFromUrl,
    testGenerateUniqueId,
    testFormatRowData,
    testGenerateLinkedInUrl
    // Add more test functions here
  ];

  testFunctions.forEach(testFunc => {
    try {
      Logger.log("\nRunning test: " + testFunc.name + "...");
      testFunc();
      testsPassed++;
      Logger.log("..." + testFunc.name + " PASSED");
    } catch (e) {
      testsFailed++;
      Logger.log("..." + testFunc.name + " FAILED - Error: " + e.message);
      // Log stack trace if available
      if (e.stack) {
        Logger.log("Stack Trace:\n" + e.stack);
      }
    }
  });

  Logger.log("\n--- Test Summary ---");
  Logger.log("Total Tests: " + (testsPassed + testsFailed));
  Logger.log("Passed: " + testsPassed);
  Logger.log("Failed: " + testsFailed);
  Logger.log("---------------------");

  // Optional: Display summary in UI if run manually
  if (testsFailed > 0) {
    SpreadsheetApp.getUi().alert("Unit Tests Finished: " + testsPassed + " passed, " + testsFailed + " failed. Check Logs for details.");
  } else {
    SpreadsheetApp.getUi().alert("Unit Tests Finished: All " + testsPassed + " tests passed!");
  }
}

// --- AppUtils Tests --- //

function testExtractIdFromUrl() {
  const sheetUrl = "https://docs.google.com/spreadsheets/d/1k41VFcBR4T4FvCx3ngGYgLoQE91lLv6l6Ezx2P8TtOU/edit#gid=0";
  const slideUrl = "https://docs.google.com/presentation/d/1qg_9Z9SjXn37V749XOD10t9qP1U33mrp/edit?usp=sharing";
  const folderUrl = "https://drive.google.com/drive/folders/1kQ7rjSWpJt8Y25ONrtHdoR8DGy5ILf9m?usp=sharing";
  const formEditUrl = "https://docs.google.com/forms/d/1FAIpQLSdFbSoMkOD1nwWLgoGmUtjOo394BIJ6GzgJxjsb2Z0j9oOodg/edit"; // Edit URL
  const formViewUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdFbSoMkOD1nwWLgoGmUtjOo394BIJ6GzgJxjsb2Z0j9oOodg/viewform?usp=sharing"; // View URL - Expect null
  const invalidUrl = "not a url";
  const nullUrl = null;

  assertEquals("1k41VFcBR4T4FvCx3ngGYgLoQE91lLv6l6Ezx2P8TtOU", AppUtils.extractIdFromUrl(sheetUrl), "Sheet URL ID Extraction");
  assertEquals("1qg_9Z9SjXn37V749XOD10t9qP1U33mrp", AppUtils.extractIdFromUrl(slideUrl), "Slide URL ID Extraction");
  assertEquals("1kQ7rjSWpJt8Y25ONrtHdoR8DGy5ILf9m", AppUtils.extractIdFromUrl(folderUrl), "Folder URL ID Extraction");
  assertEquals("1FAIpQLSdFbSoMkOD1nwWLgoGmUtjOo394BIJ6GzgJxjsb2Z0j9oOodg", AppUtils.extractIdFromUrl(formEditUrl), "Form Edit URL ID Extraction");
  // The refined regex is not expected to extract from the viewform URL structure
  assertEquals(null, AppUtils.extractIdFromUrl(formViewUrl), "Form View URL ID Extraction (Expected Null)");
  assertEquals(null, AppUtils.extractIdFromUrl(invalidUrl), "Invalid URL Extraction");
  assertEquals(null, AppUtils.extractIdFromUrl(nullUrl), "Null URL Extraction");
}

function testGenerateUniqueId() {
  const id1 = AppUtils.generateUniqueId();
  const id2 = AppUtils.generateUniqueId();
  assertNotNull(id1, "Generated ID 1 should not be null");
  assertNotNull(id2, "Generated ID 2 should not be null");
  assertTrue(id1 !== id2, "Generated IDs should be unique");
  // Check format (basic regex: YYYYMMDD-HHMMSS-random)
  assertTrue(/^\d{8}-\d{6}-[a-z0-9]{8}$/.test(id1), "ID 1 format check");
  assertTrue(/^\d{8}-\d{6}-[a-z0-9]{8}$/.test(id2), "ID 2 format check");
}

function testFormatRowData() {
  const formData = {
    name: "Test User",
    email: "test@example.com",
    course: "Test Course 101",
    course_duration: "10 horas", // Added duration
    extra_field: "should be ignored"
  };
  const rowData = AppUtils.formatRowData(formData);

  assertEquals(11, rowData.length, "Row data should have 11 elements");
  assertTrue(rowData[0] instanceof Date, "Element 0 should be a Date (Timestamp)");
  assertEquals("Pending", rowData[1], "Element 1 should be Status 'Pending'");
  assertEquals("", rowData[2], "Element 2 should be empty (Error Message)");
  assertEquals("", rowData[3], "Element 3 should be empty (Certificate ID)");
  assertEquals("", rowData[4], "Element 4 should be empty (Issued Date)");
  assertEquals("Test User", rowData[5], "Element 5 should be Name");
  assertEquals("test@example.com", rowData[6], "Element 6 should be Email");
  assertEquals("Test Course 101", rowData[7], "Element 7 should be Course");
  assertEquals("10 horas", rowData[8], "Element 8 should be Duration");
  assertEquals("", rowData[9], "Element 9 should be empty (Cert URL)");
  assertEquals("", rowData[10], "Element 10 should be empty (LinkedIn URL)");
}

function testGenerateLinkedInUrl() {
  // Mock CONFIG for this test
  const originalOrgName = CONFIG.ORGANIZATION_NAME;
  const originalOrgId = CONFIG.ORGANIZATION_ID;

  const certData = {
    name: "Test User",
    course: "Awesome Course",
    pdfUrl: "https://example.com/cert.pdf",
    certificateId: "CERT12345",
    issuedDate: "2025-05-03T10:00:00.000Z" // May 3rd, 2025
  };

  // Scenario 1: Only Organization Name is set
  Logger.log("Testing LinkedIn URL with Org Name only...");
  CONFIG.ORGANIZATION_NAME = "Test Org Name";
  CONFIG.ORGANIZATION_ID = ""; // Ensure ID is empty
  let linkedInUrl = AppUtils.generateLinkedInUrl(certData);
  assertNotNull(linkedInUrl, "URL (Org Name) should not be null");
  assertTrue(linkedInUrl.includes("organizationName=Test%20Org%20Name"), "URL (Org Name) should contain encoded organization name");
  assertTrue(!linkedInUrl.includes("organizationId="), "URL (Org Name) should NOT contain organizationId");
  // Check other fields remain
  assertTrue(linkedInUrl.includes("name=Awesome%20Course"), "URL (Org Name) should contain course");
  assertTrue(linkedInUrl.includes("issueYear=2025"), "URL (Org Name) should contain year");
  assertTrue(linkedInUrl.includes("issueMonth=5"), "URL (Org Name) should contain month");
  assertTrue(linkedInUrl.includes("certUrl=https%3A%2F%2Fexample.com%2Fcert.pdf"), "URL (Org Name) should contain certUrl");
  assertTrue(linkedInUrl.includes("certId=CERT12345"), "URL (Org Name) should contain certId");

  // Scenario 2: Only Organization ID is set
  Logger.log("Testing LinkedIn URL with Org ID only...");
  CONFIG.ORGANIZATION_NAME = ""; // Ensure Name is empty
  CONFIG.ORGANIZATION_ID = "1234567";
  linkedInUrl = AppUtils.generateLinkedInUrl(certData);
  assertNotNull(linkedInUrl, "URL (Org ID) should not be null");
  assertTrue(linkedInUrl.includes("organizationId=1234567"), "URL (Org ID) should contain organizationId");
  assertTrue(!linkedInUrl.includes("organizationName="), "URL (Org ID) should NOT contain organizationName");
  // Check other fields remain
  assertTrue(linkedInUrl.includes("name=Awesome%20Course"), "URL (Org ID) should contain course");

  // Scenario 3: Both Organization Name and ID are set (ID should take priority)
  Logger.log("Testing LinkedIn URL with both Org Name and ID...");
  CONFIG.ORGANIZATION_NAME = "Test Org Name Should Be Ignored";
  CONFIG.ORGANIZATION_ID = "987654";
  linkedInUrl = AppUtils.generateLinkedInUrl(certData);
  assertNotNull(linkedInUrl, "URL (Both) should not be null");
  assertTrue(linkedInUrl.includes("organizationId=987654"), "URL (Both) should contain organizationId");
  assertTrue(!linkedInUrl.includes("organizationName="), "URL (Both) should NOT contain organizationName");
  // Check other fields remain
  assertTrue(linkedInUrl.includes("name=Awesome%20Course"), "URL (Both) should contain course");

  // Scenario 4: Neither Name nor ID is set (Fallback)
  Logger.log("Testing LinkedIn URL with neither Org Name nor ID...");
  CONFIG.ORGANIZATION_NAME = "";
  CONFIG.ORGANIZATION_ID = "";
  linkedInUrl = AppUtils.generateLinkedInUrl(certData);
  assertNotNull(linkedInUrl, "URL (Neither) should not be null");
  assertTrue(linkedInUrl.includes("organizationName=Your%20Organization"), "URL (Neither) should contain fallback organization name");
  assertTrue(!linkedInUrl.includes("organizationId="), "URL (Neither) should NOT contain organizationId");
  // Check other fields remain
  assertTrue(linkedInUrl.includes("name=Awesome%20Course"), "URL (Neither) should contain course");

  // Restore original config
  CONFIG.ORGANIZATION_NAME = originalOrgName;
  CONFIG.ORGANIZATION_ID = originalOrgId;
}

// --- Certificates Tests (Example - More needed) --- //

// function testFillPlaceholders() {
//   // This is harder to test without real SlidesApp interaction or complex mocks.
//   // Could test the placeholder object creation logic if separated.
//   Logger.log("SKIPPED: testFillPlaceholders (requires SlidesApp mocking or integration test)");
// }

// --- Add more test functions below --- //
