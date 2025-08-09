import XLSX from 'xlsx';
import path from 'path';

// Read the Excel file
const workbook = XLSX.readFile('C:\\Users\\chefd\\Downloads\\Wings of Steel 25-26 Season.xlsx');

// Get all sheet names
console.log('Available sheets:', workbook.SheetNames);

// Read each sheet
workbook.SheetNames.forEach(sheetName => {
  console.log(`\n\n========== ${sheetName} ==========\n`);
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, dateNF: 'yyyy-mm-dd' });
  
  // Print all rows to see the complete data
  data.forEach((row, index) => {
    if (row && row.length > 0) {
      console.log(`Row ${index + 1}:`, row.join(' | '));
    }
  });
});