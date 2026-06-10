/**
 * Google Apps Script — Titan Capital Application Webhook
 *
 * SETUP:
 * 1. Create a new Google Sheet (this will be your "Applications" sheet).
 * 2. Add these column headers in Row 1:
 *    Timestamp | First Name | Last Name | Email | Phone | LinkedIn |
 *    Company | Website | One-liner | Problem | Industries | Stage |
 *    Raising | Raised Before | Hear About | Anything Else | Pitch Deck Link
 *
 * 3. Go to Extensions → Apps Script, paste this code.
 * 4. Deploy → New deployment → Web app:
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the web app URL and add it to your .env.local:
 *    GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/xxxxx/exec
 *
 * PITCH DECK STORAGE:
 * 6. Create a Google Drive folder for pitch decks.
 * 7. Copy its folder ID from the URL (the part after /folders/).
 * 8. Paste it below in PITCH_DECK_FOLDER_ID.
 *    If left empty, pitch deck files won't be saved (only the filename is recorded).
 */

/* ── Set this to your Google Drive folder ID for pitch decks ── */
var PITCH_DECK_FOLDER_ID = ""; // e.g. "1aBcDeFgHiJkLmNoPqRsTuVwXyZ"

/* doGet — required for Google to verify the deployment */
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ status: "ok", message: "Titan Capital webhook is live" })
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Build phone string
    var phone = "";
    if (data.phoneDial && data.phone) {
      phone = data.phoneDial + " " + data.phone;
    }

    // ── Save pitch deck to Google Drive (if file data + folder configured) ──
    var pitchDeckLink = data.fileName || "";

    if (PITCH_DECK_FOLDER_ID && data.fileBase64 && data.fileName) {
      try {
        var folder = DriveApp.getFolderById(PITCH_DECK_FOLDER_ID);
        var decoded = Utilities.base64Decode(data.fileBase64);
        var blob = Utilities.newBlob(
          decoded,
          data.fileMimeType || "application/octet-stream",
          data.fileName
        );
        var file = folder.createFile(blob);
        // Make file viewable by anyone with the link
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        pitchDeckLink = file.getUrl();
      } catch (fileErr) {
        // If file save fails, still record the submission with filename only
        pitchDeckLink = data.fileName + " (upload failed: " + fileErr.message + ")";
      }
    }

    // Append row to sheet
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.firstName || "",
      data.lastName || "",
      data.email || "",
      phone,
      data.linkedin || "",
      data.companyName || "",
      data.websiteUrl || "",
      data.oneLiner || "",
      data.problem || "",
      data.industries || "",
      data.currentStage || "",
      data.raisingAmount || "",
      data.raisedBefore || "",
      data.hearAbout || "",
      data.anythingElse || "",
      pitchDeckLink,
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ success: true, pitchDeckLink: pitchDeckLink })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: err.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
