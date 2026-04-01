// Sheet ID: 115QYlukXQs0WZi0bIyAKO0RIudu9cZ1PvzRdZQQF3w0

const SHEET_ID = '115QYlukXQs0WZi0bIyAKO0RIudu9cZ1PvzRdZQQF3w0';
const SHEET_NAME = 'Sheet1'; // Make sure your sheet tab is named Sheet1 (or change this to match)

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = JSON.parse(e.postData.contents);
    
    // Create timestamp
    const timestamp = new Date();
    
    // Construct the row array matching the columns plan
    // Columns: Timestamp, Date, Task Name, Description, Employees, Start Time, End Time, Total Hours
    const rowData = [
      timestamp,
      data.date,
      data.taskName,
      data.description,
      data.employees.join(', '), // Convert array of employees to string
      data.startTime,
      data.endTime,
      data.totalHours
    ];
    
    // Append the row to the sheet
    sheet.appendRow(rowData);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'success', 
      message: 'Data saved successfully!' 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'error', 
      message: error.message 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // Assume row 1 is headers: skip it.
    let records = [];
    if (values.length > 1) {
      for (let i = 1; i < values.length; i++) {
        let row = values[i];
        records.push({
          timestamp: row[0],
          date: row[1],
          taskName: row[2],
          description: row[3],
          employees: row[4],
          startTime: row[5],
          endTime: row[6],
          totalHours: row[7]
        });
      }
    }
    
    // Filter data by date if start and end dates are provided
    if (e.parameter.action === 'getRecords' && e.parameter.startDate && e.parameter.endDate) {
       const start = new Date(e.parameter.startDate);
       const end = new Date(e.parameter.endDate);
       end.setHours(23, 59, 59, 999); // Include the whole end day

       records = records.filter(record => {
         const recordDateStr = String(record.date);
         let recordDate;
         
         // If it's a date object from sheet
         if (record.date instanceof Date) {
             recordDate = record.date;
         } else {
             // If it's stored as string YYYY-MM-DD
             recordDate = new Date(recordDateStr);
         }
         
         return recordDate >= start && recordDate <= end;
       });
    }

    // Return the JSON data
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      data: records
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'error', 
      message: error.message 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle CORS Preflight requests for fetch()
 * Note: Apps Script automatically redirects DO OPTIONS to doGet, but it's good practice 
 * to handle it just in case someone tries to use complex post headers.
 * Usually, normal GET/POST using text/plain bypasses strict CORS in apps script.
 */
function doOptions(e) {
  const output = ContentService.createTextOutput('');
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
