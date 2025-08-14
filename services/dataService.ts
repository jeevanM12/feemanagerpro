import * as XLSX from 'xlsx';
import { Student } from '../types';
import { formatDateTime, calculateFeeDetails } from '../utils';

// We need to declare the XLSX variable because we are loading it from a CDN
declare var XLSX: any;

export const exportToExcel = (data: any[], filename: string, sheetname: string = 'Sheet1') => {
    try {
        if (!data || data.length === 0) {
            throw new Error("No data to export.");
        }
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetname);
        XLSX.writeFile(workbook, `${filename}.xlsx`);
        return { success: true };
    } catch (error) {
        console.error("Error exporting to Excel:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
};

export const prepareStudentListForExport = (students: Student[]) => {
    const dataToExport: any[] = [];
    students.forEach(student => {
        const { totalPaid, totalDiscount, remainingBalance } = calculateFeeDetails(student);
        const baseStudentData = {
            'Name': student.name,
            'Roll Number': student.rollNumber,
            'Class': student.class,
            'Grade': student.grade,
            'Total Fees': student.totalFees,
            'Total Paid (Cumulative)': totalPaid,
            'Total Discount (Cumulative)': totalDiscount,
            'Balance Due': remainingBalance,
        };
        
        let transactionsAdded = false;
        
        student.payments.forEach(p => {
            dataToExport.push({ ...baseStudentData, 'Transaction Type': 'Payment', 'Transaction ID': p.id, 'Amount': p.amount, 'Date': formatDateTime(p.date), 'Details': p.remarks || 'N/A' });
            transactionsAdded = true;
        });

        student.discounts.forEach(d => {
            dataToExport.push({ ...baseStudentData, 'Transaction Type': 'Discount', 'Transaction ID': d.id, 'Amount': d.amount, 'Date': formatDateTime(d.date), 'Details': d.reason || 'N/A' });
            transactionsAdded = true;
        });

        if (!transactionsAdded) {
            dataToExport.push({ ...baseStudentData, 'Transaction Type': 'N/A', 'Transaction ID': 'N/A', 'Amount': 'N/A', 'Date': 'N/A', 'Details': 'No transactions' });
        }
    });
    return dataToExport;
};
