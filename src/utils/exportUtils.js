import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export data to Excel (.xlsx)
 * @param {Array} data - Array of objects to export
 * @param {string} fileName - Name of the file to save
 * @param {string} sheetName - Name of the worksheet
 */
export const exportToExcel = (data, fileName = 'export', sheetName = 'Sheet1') => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

/**
 * Export data to PDF (.pdf)
 * @param {Array} columns - Array of column definitions { header, accessor }
 * @param {Array} data - Array of objects to export
 * @param {string} fileName - Name of the file to save
 * @param {string} title - Title to display on the PDF
 */
export const exportToPDF = (columns, data, fileName = 'export', title = 'Data Export') => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);

    // Convert data to format required by autoTable
    const tableRows = data.map(record => columns.map(col => record[col.accessor]));
    const tableHeaders = [columns.map(col => col.header)];

    doc.autoTable({
        head: tableHeaders,
        body: tableRows,
        startY: 30,
        styles: { fontSize: 8 },
        headStyles: { fillStyle: 'darkblue', textColor: 255 }
    });

    doc.save(`${fileName}.pdf`);
};
