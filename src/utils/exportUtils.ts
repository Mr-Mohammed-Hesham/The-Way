/**
 * Comprehensive Data & Report Export Utilities
 * Supports CSV (with UTF-8 BOM for Arabic Excel support), Formatted Excel HTML, JSON, and Print layouts.
 */

export function downloadCSV(filename: string, headers: string[], rows: (string | number | undefined | null)[][]) {
  // UTF-8 BOM (\uFEFF) ensures Excel opens Arabic characters correctly without garbled text
  const bom = '\uFEFF';
  
  const csvContent = [
    headers.map(h => `"${String(h || '').replace(/"/g, '""')}"`).join(','),
    ...rows.map(row =>
      row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
    )
  ].join('\r\n');

  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJSON(filename: string, data: any) {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const link = document.createElement('a');
  link.setAttribute('href', jsonString);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadExcelHTML(filename: string, sheetTitle: string, headers: string[], rows: (string | number | undefined | null)[][]) {
  const tableRows = rows
    .map(
      r => `<tr>${r.map(cell => `<td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${cell ?? ''}</td>`).join('')}</tr>`
    )
    .join('');

  const tableHeaders = headers
    .map(
      h => `<th style="border: 1px solid #ddd; padding: 10px; background-color: #1e3a8a; color: white; text-align: right; font-weight: bold;">${h}</th>`
    )
    .join('');

  const excelTemplate = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>${sheetTitle}</x:Name>
              <x:WorksheetOptions>
                <x:DisplayRightToLeft/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body { font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; direction: rtl; }
        table { border-collapse: collapse; width: 100%; direction: rtl; }
      </style>
    </head>
    <body dir="rtl">
      <h2 style="color: #1e3a8a; font-family: sans-serif; text-align: right;">${sheetTitle} - The Way Center</h2>
      <p style="color: #666; font-size: 12px; text-align: right;">تاريخ استخراج التقرير: ${new Date().toLocaleDateString('ar-EG')} - ${new Date().toLocaleTimeString('ar-EG')}</p>
      <table>
        <thead>
          <tr>${tableHeaders}</tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\uFEFF' + excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
