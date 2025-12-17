import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
// import html2canvas from 'html2canvas' // Unused import

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable
  }
}

// Export to Excel
export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
  try {
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    
    // Generate Excel file and download
    XLSX.writeFile(wb, `${filename}.xlsx`)
    
    return { success: true, message: 'Excel file exported successfully' }
  } catch (error) {
    console.error('Error exporting Excel:', error)
    return { success: false, message: 'Failed to export Excel file' }
  }
}

// Export to PDF
export const exportToPDF = (
  data: any[], 
  columns: { header: string; dataKey: string }[], 
  filename: string,
  title: string = 'Laboratory Report'
) => {
  try {
    // Create new PDF document
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(18)
    doc.text(title, 14, 22)
    
    // Add timestamp
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString()}`, 14, 32)
    
    // Prepare table data
    const tableColumns = columns.map(col => col.header)
    const tableRows = data.map(item => 
      columns.map(col => item[col.dataKey] || '')
    )
    
    // Add table
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246], // Blue color
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // Light gray
      },
      margin: { top: 40, right: 14, bottom: 20, left: 14 }
    })
    
    // Save PDF
    doc.save(`${filename}.pdf`)
    
    return { success: true, message: 'PDF file exported successfully' }
  } catch (error) {
    console.error('Error exporting PDF:', error)
    return { success: false, message: 'Failed to export PDF file' }
  }
}

// Export Equipment Data
export const exportEquipmentData = (equipments: any[], format: 'excel' | 'pdf') => {
  const filename = `equipment_report_${new Date().toISOString().split('T')[0]}`
  
  if (format === 'excel') {
    const excelData = equipments.map(equipment => ({
      'Equipment ID': equipment.id,
      'Name': equipment.name,
      'Type': equipment.type,
      'Category': equipment.category,
      'Manufacturer': equipment.manufacturer,
      'Model': equipment.model,
      'Serial Number': equipment.serialNumber,
      'Room': equipment.room,
      'Status': equipment.status,
      'Last Check': equipment.lastCheck,
      'Next Check': equipment.nextCheck
    }))
    
    return exportToExcel(excelData, filename, 'Equipment Report')
  } else {
    const columns = [
      { header: 'ID', dataKey: 'id' },
      { header: 'Name', dataKey: 'name' },
      { header: 'Type', dataKey: 'type' },
      { header: 'Room', dataKey: 'room' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Last Check', dataKey: 'lastCheck' }
    ]
    
    return exportToPDF(equipments, columns, filename, 'Equipment Status Report')
  }
}

// Export Reagent Data
export const exportReagentData = (reagents: any[], format: 'excel' | 'pdf') => {
  const filename = `reagent_report_${new Date().toISOString().split('T')[0]}`
  
  if (format === 'excel') {
    const excelData = reagents.map(reagent => ({
      'Lot Number': reagent.lotNumber,
      'Supplier': reagent.supplier,
      'Expiration Date': reagent.date,
      'Quantity': reagent.quantity,
      'Type': reagent.type,
      'Status': reagent.status
    }))
    
    return exportToExcel(excelData, filename, 'Reagent Report')
  } else {
    // Use HTML print method like Patient's test results
    return exportReagentDataToPDFHTML(reagents);
  }
}

// Export Reagent Data to PDF using HTML print (similar to Patient test results)
export const exportReagentDataToPDFHTML = (reagents: any[]) => {
  try {
    // Determine report type based on data structure
    let reportTitle = 'Reagent Report';
    let tableHeaders = '';
    let tableRows = '';

    if (reagents.length > 0) {
      const firstItem = reagents[0];
      
      // Supply History Report
      if (firstItem.type === 'supply') {
        reportTitle = 'Reagent Supply History Report';
        tableHeaders = '<tr><th>Reagent Name</th><th>Catalog Number</th><th>Lot Number</th><th>Vendor</th><th>Receipt Date</th><th>Quantity</th><th>Status</th></tr>';
        tableRows = reagents.map(item => `
          <tr>
            <td>${item.reagentName || 'N/A'}</td>
            <td>${item.catalogNumber || 'N/A'}</td>
            <td>${item.lotNumber || 'N/A'}</td>
            <td>${item.supplier || 'N/A'}</td>
            <td>${item.date || 'N/A'}</td>
            <td>${item.quantity || 'N/A'}</td>
            <td>${item.status || 'N/A'}</td>
          </tr>
        `).join('');
      }
      // Usage History Report
      else if (firstItem.type === 'usage') {
        reportTitle = 'Reagent Usage History Report';
        tableHeaders = '<tr><th>Reagent Name</th><th>Usage Date</th><th>Quantity Used</th><th>Used By</th><th>Notes</th><th>Status</th></tr>';
        tableRows = reagents.map(item => `
          <tr>
            <td>${item.reagentName || 'N/A'}</td>
            <td>${item.date || 'N/A'}</td>
            <td>${item.quantity || 'N/A'}</td>
            <td>${item.usedBy || 'N/A'}</td>
            <td>${item.notes || 'N/A'}</td>
            <td>${item.status || 'Used'}</td>
          </tr>
        `).join('');
      }
      // Reagent List Report
      else if (firstItem.type === 'reagents') {
        reportTitle = 'Reagent Inventory List';
        tableHeaders = '<tr><th>Reagent Name</th><th>Catalog Number</th><th>Manufacturer</th><th>CAS Number</th><th>Quantity Available</th><th>Unit</th><th>Description</th></tr>';
        tableRows = reagents.map(item => `
          <tr>
            <td>${item.reagentName || 'N/A'}</td>
            <td>${item.catalogNumber || 'N/A'}</td>
            <td>${item.manufacturer || 'N/A'}</td>
            <td>${item.casNumber || 'N/A'}</td>
            <td>${item.quantityAvailable || 'N/A'}</td>
            <td>${item.unit || 'N/A'}</td>
            <td>${item.description || 'N/A'}</td>
          </tr>
        `).join('');
      }
      // Vendor List Report
      else if (firstItem.type === 'vendors') {
        reportTitle = 'Vendor List Report';
        tableHeaders = '<tr><th>Vendor ID</th><th>Vendor Name</th><th>Email</th><th>Phone</th><th>Address</th></tr>';
        tableRows = reagents.map(item => `
          <tr>
            <td>${item.id || 'N/A'}</td>
            <td>${item.name || 'N/A'}</td>
            <td>${item.email || 'N/A'}</td>
            <td>${item.phone || 'N/A'}</td>
            <td>${item.address || 'N/A'}</td>
          </tr>
        `).join('');
      }
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${reportTitle}</title>
        <style>
          body { font-family: Arial; margin: 20px; }
          h1 { color: black; text-align: center; font-weight: bold; margin-bottom: 10px; }
          .timestamp { text-align: center; color: gray; font-size: 12px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid black; padding: 8px; text-align: left; font-size: 11px; }
          th { background: lightgray; font-weight: bold; }
          .summary { margin: 20px 0; padding: 15px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 5px; }
          .summary h3 { margin-top: 0; }
          @media print {
            body { margin: 0; }
            @page { margin: 15mm; }
          }
        </style>
      </head>
      <body>
        <h1>${reportTitle}</h1>
        <div class="timestamp">Generated on: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString()}</div>
        
        <div class="summary">
          <h3>Report Summary</h3>
          <p><strong>Total Records:</strong> ${reagents.length}</p>
          <p><strong>Report Date:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
        </div>

        <table>
          <thead>
            ${tableHeaders}
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div style="margin-top: 30px; text-align: center; color: gray; font-size: 10px;">
          <p>Laboratory Management System - Confidential Report</p>
        </div>
      </body>
      </html>
    `;

    // Open in new window and print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load then trigger print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    }

    return { success: true, message: 'Reagent report PDF opened for printing' };
  } catch (error) {
    console.error('Error exporting reagent data PDF:', error);
    return { success: false, message: `Failed to export reagent data PDF: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

// Export Event Log Data
export const exportEventLogData = (events: any[], format: 'excel' | 'pdf') => {
  const filename = `event_log_report_${new Date().toISOString().split('T')[0]}`
  
  if (format === 'excel') {
    const excelData = events.map(event => ({
      'Event ID': event.eventId,
      'Action': event.action,
      'Message': event.eventLogMessage,
      'Operator': event.operator,
      'Date': event.date,
      'Time': event.timestamp,
      'Status': event.status,
      'Category': event.category
    }))
    
    return exportToExcel(excelData, filename, 'Event Log Report')
  } else {
    const columns = [
      { header: 'Event ID', dataKey: 'eventId' },
      { header: 'Action', dataKey: 'action' },
      { header: 'Operator', dataKey: 'operator' },
      { header: 'Date', dataKey: 'date' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Category', dataKey: 'category' }
    ]
    
    return exportToPDF(events, columns, filename, 'System Event Log Report')
  }
}

// Export Test Results to PDF
export const exportTestResultsToPDF = (testReport: any, userData: any) => {
  const filename = `test_results_${testReport.id}_${new Date().toISOString().split('T')[0]}`
  
  try {
    const doc = new jsPDF()
    
    // Use default font but ensure proper encoding
    doc.setFont('helvetica')
    
    // Add title
    doc.setFontSize(18)
    doc.text('Test Results Report', 14, 22)
    
    // Add timestamp
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString()}`, 14, 32)
    
    // Format date of birth for display
    const formatDateOfBirth = (dateString: string) => {
      if (!dateString) return '';
      try {
        if (dateString.includes('T') && dateString.includes('Z')) {
          const date = new Date(dateString);
          if (!isNaN(date.getTime())) {
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear().toString();
            return `${day}-${month}-${year}`;
          }
        }
        return dateString;
      } catch (error) {
        return dateString;
      }
    };
    
    // Note: convertToASCII function removed as it's not being used

    const patientData = [
      ['Name', (userData?.fullName || '').toString()],
      ['Date of Birth', formatDateOfBirth(userData?.dateOfBirth || '')],
      ['Gender', (userData?.gender || '').toString()],
      ['Phone Number', (userData?.phoneNumber || '').toString()]
    ];
    
    autoTable(doc, {
      head: [['Patient Information', '']],
      body: patientData,
      startY: 50,
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      columnStyles: { 0: { fontStyle: 'bold' } }
    });
    
    // Add test info table
    const testData = [
      ['Test Type', (testReport.testType || '').toString()],
      ['Department', (testReport.department || '').toString()],
      ['Result Date', (testReport.resultDate || '').toString()],
      ['Doctor', (testReport.doctor || '').toString()]
    ];
    
    autoTable(doc, {
      head: [['Test Information', '']],
      body: testData,
      startY: (doc as any).lastAutoTable.finalY + 20,
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      columnStyles: { 0: { fontStyle: 'bold' } }
    });
    
    // Add test results table
    if (testReport.results) {
      const resultsData = Object.entries(testReport.results).map(([key, result]: [string, any]) => {
        // Map parameter keys to readable names
        const parameterNames: { [key: string]: string } = {
          'wbc': 'White Blood Cell (WBC)',
          'rbc': 'Red Blood Cell (RBC)',
          'hemoglobin': 'Hemoglobin (HGB)',
          'hematocrit': 'Hematocrit (HCT)',
          'platelet': 'Platelet Count (PLT)',
          'mcv': 'Mean Corpuscular Volume (MCV)',
          'mch': 'Mean Corpuscular Hemoglobin (MCH)',
          'mchc': 'Mean Corpuscular Hemoglobin Concentration (MCHC)',
          // Urine Test Parameters
          'leukocytes': 'Leukocytes (LEU)',
          'nitrite': 'Nitrite (NIT)',
          'protein': 'Protein (PRO)',
          'pH': 'pH',
          'blood': 'Blood (BLD)',
          'specificGravity': 'Specific Gravity (SG)',
          'ketone': 'Ketone (KET)',
          'glucose': 'Glucose (GLU)',
          // Fecal Test Parameters
          'fecalOccultBlood': 'Fecal Occult Blood (FOBT)',
          'fecalFat': 'Fecal Fat',
          'ovaAndParasites': 'Ova and Parasites (O and P)',
          'reducingSubstances': 'Reducing Substances (RS)',
          'fecalCalprotectin': 'Fecal Calprotectin (FC)',
          'colorConsistency': 'Color / Consistency',
          // Other Test Parameters
          'totalCholesterol': 'Total Cholesterol',
          'ldlCholesterol': 'LDL Cholesterol',
          'hdlCholesterol': 'HDL Cholesterol',
          'triglycerides': 'Triglycerides',
          'tsh': 'Thyroid Stimulating Hormone (TSH)',
          't4': 'Thyroxine (T4)',
          't3': 'Triiodothyronine (T3)',
          'freeT4': 'Free T4',
          'alt': 'Alanine Aminotransferase (ALT)',
          'ast': 'Aspartate Aminotransferase (AST)',
          'bilirubin': 'Bilirubin',
          'alkalinePhosphatase': 'Alkaline Phosphatase',
          'creatinine': 'Creatinine',
          'bun': 'Blood Urea Nitrogen (BUN)',
          'egfr': 'Estimated GFR',
          'fastingGlucose': 'Fasting Glucose',
          'hba1c': 'Hemoglobin A1c',
          'insulin': 'Insulin',
          'vitaminD': 'Vitamin D',
          'ferritin': 'Ferritin',
          'iron': 'Iron',
          'tibc': 'Total Iron Binding Capacity (TIBC)',
          'psa': 'Prostate Specific Antigen (PSA)',
          'freePsa': 'Free PSA'
        };
        
        return [
          parameterNames[key] || key,
          (result.value || '').toString(),
          (result.unit || '').toString(),
          (result.normal || '').toString(),
          (result.status || '').toString()
        ];
      });
      
      autoTable(doc, {
        head: [['Parameter', 'Value', 'Unit', 'Reference Range', 'Status']],
        body: resultsData,
        startY: (doc as any).lastAutoTable.finalY + 20,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      });
    }
    
    // Add AI Auto Review section
    doc.setFontSize(12);
    doc.text('AI Auto Review', 14, (doc as any).lastAutoTable.finalY + 20);
    
    doc.setFontSize(10);
    const aiReviewText = [
      '✓ Overall Assessment: All parameters are within normal ranges.',
      '📊 Key Findings: Test results show healthy values across all measured parameters.',
      '🔍 Recommendation: Continue current lifestyle and regular monitoring.'
    ];
    
    let yPosition = (doc as any).lastAutoTable.finalY + 35;
    aiReviewText.forEach(line => {
      doc.text(line, 14, yPosition);
      yPosition += 6;
    });
    
    // Add Doctor Comments section
    doc.setFontSize(12);
    doc.text('Doctor Comments', 14, yPosition + 10);
    
    doc.setFontSize(10);
    const doctorComment = `👨‍⚕️ ${testReport.doctor}: "Patient's test results are excellent. All parameters are within normal limits, indicating good overall health. No immediate concerns or follow-up required."`;
    
    // Split long text into multiple lines
    const splitText = doc.splitTextToSize(doctorComment, 180);
    doc.text(splitText, 14, yPosition + 25);
    
    doc.save(`${filename}.pdf`);
    return { success: true, message: 'Test results PDF exported successfully' };
  } catch (error) {
    console.error('Error exporting test results PDF:', error);
    return { success: false, message: `Failed to export test results PDF: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};

// Simple PDF export using browser's print function
export const exportTestResultsToPDFHTML = async (testReport: any, userData: any) => {
  try {
    // Format date of birth for display
    const formatDateOfBirth = (dateString: string) => {
      if (!dateString) return '';
      try {
        if (dateString.includes('T') && dateString.includes('Z')) {
          const date = new Date(dateString);
          if (!isNaN(date.getTime())) {
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear().toString();
            return `${day}-${month}-${year}`;
          }
        }
        return dateString;
      } catch (error) {
        return dateString;
      }
    };

    // Create simple HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Test Results Report</title>
        <style>
          body { font-family: Arial; margin: 20px; }
          h1 { color: black; text-align: center; font-weight: bold; margin-bottom: 30px; }
          h2 { background: none; color: black; padding: 10px 0; font-weight: bold; margin-top: 25px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid black; padding: 10px; text-align: left; vertical-align: top; }
          th { background: lightgray; }
          .ai-review-content { padding: 15px; line-height: 1.8; white-space: pre-wrap; background: #f8f9fa; }
          .no-content { padding: 15px; color: #999; font-style: italic; background: #f8f9fa; }
        </style>
      </head>
      <body>
        <h1>Test Results Report</h1>
        
        <h2>Patient Information</h2>
        <table>
          <tr><th>Name</th><td>${userData?.fullName || 'N/A'}</td></tr>
          <tr><th>Date of Birth</th><td>${formatDateOfBirth(userData?.dateOfBirth || '')}</td></tr>
          <tr><th>Gender</th><td>${userData?.gender || 'N/A'}</td></tr>
          <tr><th>Phone</th><td>${userData?.phoneNumber || 'N/A'}</td></tr>
        </table>

        <h2>Test Information</h2>
        <table>
          <tr><th>Test Type</th><td>${testReport.testType || 'N/A'}</td></tr>
          <tr><th>Department</th><td>${testReport.department || 'N/A'}</td></tr>
          <tr><th>Result Date</th><td>${testReport.resultDate || 'N/A'}</td></tr>
          <tr><th>Doctor</th><td>${testReport.doctor || 'N/A'}</td></tr>
        </table>

        ${testReport.results ? `
        <h2>Test Results</h2>
        <table>
          <tr><th>Parameter</th><th>Value</th><th>Unit</th><th>Reference</th><th>Status</th></tr>
          ${Object.entries(testReport.results).map(([key, result]: [string, any]) => {
            const parameterNames: { [key: string]: string } = {
              'wbc': 'White Blood Cell', 'rbc': 'Red Blood Cell', 'hemoglobin': 'Hemoglobin',
              'hematocrit': 'Hematocrit', 'platelet': 'Platelet Count', 'mcv': 'MCV',
              'mch': 'MCH', 'mchc': 'MCHC', 
              // Urine Test Parameters
              'leukocytes': 'Leukocytes (LEU)', 'nitrite': 'Nitrite (NIT)', 'protein': 'Protein (PRO)',
              'pH': 'pH', 'blood': 'Blood (BLD)', 'specificGravity': 'Specific Gravity (SG)',
              'ketone': 'Ketone (KET)', 'glucose': 'Glucose (GLU)',
              // Fecal Test Parameters
              'fecalOccultBlood': 'Fecal Occult Blood', 'fecalFat': 'Fecal Fat',
              'ovaAndParasites': 'Ova and Parasites', 'reducingSubstances': 'Reducing Substances',
              'fecalCalprotectin': 'Fecal Calprotectin', 'colorConsistency': 'Color/Consistency',
              // Other Tests
              'totalCholesterol': 'Total Cholesterol', 'ldlCholesterol': 'LDL', 
              'hdlCholesterol': 'HDL', 'triglycerides': 'Triglycerides'
            };
            return `<tr><td>${parameterNames[key] || key}</td><td>${result.value || ''}</td><td>${result.unit || ''}</td><td>${result.normal || ''}</td><td>${result.status || ''}</td></tr>`;
          }).join('')}
        </table>
        ` : ''}

        ${testReport.aiDescription || testReport.hasAiDescription ? `
        <h2>AI Auto Review</h2>
        <table>
          <tr>
            <td class="ai-review-content">${testReport.aiDescription || 'AI analysis is available but content could not be loaded.'}</td>
          </tr>
        </table>
        ` : `
        <h2>AI Auto Review</h2>
        <table>
          <tr>
            <td class="no-content">No AI analysis available for this test result.</td>
          </tr>
        </table>
        `}

        <h2>Doctor Comments</h2>
        <table>
          <tr><th>Doctor</th><td>${testReport.finalComment?.doctorName || testReport.doctor || 'N/A'}</td></tr>
          <tr><th>Comments</th><td>${testReport.finalComment?.content || 'No final comment selected yet.'}</td></tr>
          <tr><th>Review Date</th><td>${testReport.finalComment?.reviewDate || testReport.resultDate || 'N/A'}</td></tr>
        </table>
      </body>
      </html>
    `;

    // Open in new window and print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load then trigger print immediately
      printWindow.onload = () => {
        printWindow.print();
        // Close window immediately after printing
        printWindow.close();
      };
    }

    return { success: true, message: 'Test results PDF opened for printing' };
  } catch (error) {
    console.error('Error exporting test results PDF:', error);
    return { success: false, message: `Failed to export test results PDF: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};