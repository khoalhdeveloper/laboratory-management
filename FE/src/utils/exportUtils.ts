import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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
    const columns = [
      { header: 'Lot Number', dataKey: 'lotNumber' },
      { header: 'Supplier', dataKey: 'supplier' },
      { header: 'Expiration Date', dataKey: 'date' },
      { header: 'Quantity', dataKey: 'quantity' },
      { header: 'Status', dataKey: 'status' }
    ]
    
    return exportToPDF(reagents, columns, filename, 'Reagent Inventory Report')
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
