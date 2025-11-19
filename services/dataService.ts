import { Student, StudentWithFeeDetails } from '../types.ts';
import { formatDateTime, calculateFeeDetails } from '../utils.ts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

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

export const exportToPdf = (data: StudentWithFeeDetails[], filename: string) => {
    try {
        const doc = new jsPDF();
        
        doc.text("Student Financial Report", 14, 16);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

        const tableColumn = ["Name", "Roll No.", "Class", "Total Fees", "Total Paid", "Balance Due"];
        const tableRows: any[][] = [];

        data.forEach(student => {
            const studentData = [
                student.name,
                student.rollNumber,
                student.class,
                `INR ${student.totalFees.toLocaleString()}`,
                `INR ${student.totalPaid.toLocaleString()}`,
                `INR ${student.remainingBalance.toLocaleString()}`,
            ];
            tableRows.push(studentData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            theme: 'grid',
            headStyles: { fillColor: [22, 160, 133] }
        });

        doc.save(`${filename}.pdf`);
        return { success: true };
    } catch (error) {
        console.error("Error exporting to PDF:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
};

export const exportReportToExcel = (summaryData: any[], classData: any[], filename: string) => {
    try {
        const summarySheet = XLSX.utils.json_to_sheet(summaryData);
        const classSheet = XLSX.utils.json_to_sheet(classData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Financial Summary');
        XLSX.utils.book_append_sheet(workbook, classSheet, 'Class-wise Pending Fees');
        XLSX.writeFile(workbook, `${filename}.xlsx`);
        return { success: true };
    } catch (error) {
        console.error("Error exporting report to Excel:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
};

export const exportReportToPdf = (summaryCards: any[], summaryData: any[], classData: any[], filename: string) => {
    try {
        const doc = new jsPDF();
        
        doc.text("Financial Report Summary", 14, 16);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

        // Summary Cards as a table
        autoTable(doc, {
            head: [['Metric', 'Value']],
            body: summaryCards.map((c: any) => [c.title, c.isCurrency ? `INR ${c.value.toLocaleString()}` : c.value.toLocaleString()]),
            startY: 30,
            theme: 'striped',
        });
        const firstTableHeight = (doc as any).lastAutoTable.finalY;

        // Financial Overview table
        doc.text("Financial Overview Breakdown", 14, firstTableHeight + 15);
        autoTable(doc, {
            head: [['Category', 'Amount']],
            body: summaryData.map(d => [d.name, `INR ${d.value.toLocaleString()}`]),
            startY: firstTableHeight + 20,
            theme: 'grid',
            headStyles: { fillColor: [22, 160, 133] }
        });
        const secondTableHeight = (doc as any).lastAutoTable.finalY;

        // Class-wise Pending table
        doc.text("Pending Fees by Class", 14, secondTableHeight + 15);
        autoTable(doc, {
            head: [['Class', 'Pending Amount']],
            body: classData.map(d => [d.name, `INR ${d.pending.toLocaleString()}`]),
            startY: secondTableHeight + 20,
            theme: 'grid',
            headStyles: { fillColor: [255, 128, 66] }
        });

        doc.save(`${filename}.pdf`);
        return { success: true };
    } catch (error) {
        console.error("Error exporting report to PDF:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
};

// --- NEW DAILY/MONTHLY EXPORT FUNCTIONS ---

export const exportDailyReportToExcel = (transactions: any[], date: string) => {
    try {
        const dataToExport = transactions.map(t => ({
            'Student Name': t.studentName,
            'Roll Number': t.rollNumber,
            'Transaction Type': t.type,
            'Details': t.details,
            'Amount (INR)': t.amount,
            'Date': formatDateTime(t.date),
        }));
        return exportToExcel(dataToExport, `daily_report_${date}`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
};

export const exportDailyReportToPdf = (transactions: any[], date: string, summary: { totalCollected: number, totalDiscounted: number }) => {
    try {
        const doc = new jsPDF();
        const formattedDate = new Date(date).toLocaleDateString('en-GB');
        doc.text(`Daily Financial Report for ${formattedDate}`, 14, 16);
        
        autoTable(doc, {
            body: [
                ['Total Collected', `INR ${summary.totalCollected.toLocaleString()}`],
                ['Total Discounted', `INR ${summary.totalDiscounted.toLocaleString()}`],
            ],
            startY: 22,
            theme: 'striped',
        });
        
        const tableColumn = ["Student Name", "Roll No.", "Type", "Details", "Amount"];
        const tableRows = transactions.map(t => [t.studentName, t.rollNumber, t.type, t.details, `INR ${t.amount.toLocaleString()}`]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: (doc as any).lastAutoTable.finalY + 10,
            theme: 'grid',
        });

        doc.save(`daily_report_${date}.pdf`);
        return { success: true };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
};

export const exportMonthlyReportToExcel = (dailyData: any[], monthYear: string, summary: { totalCollected: number, totalDiscounted: number }) => {
    try {
        const summaryData = [
            { Metric: 'Total Collected', Amount: summary.totalCollected },
            { Metric: 'Total Discounted', Amount: summary.totalDiscounted }
        ];
        const dailyExportData = dailyData.map(d => ({ 'Day': d.day, 'Amount Collected (INR)': d.collected }));

        const summarySheet = XLSX.utils.json_to_sheet(summaryData);
        const dailySheet = XLSX.utils.json_to_sheet(dailyExportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Monthly Summary');
        XLSX.utils.book_append_sheet(workbook, dailySheet, 'Daily Collections');
        XLSX.writeFile(workbook, `monthly_report_${monthYear}.xlsx`);
        return { success: true };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
};

export const exportMonthlyReportToPdf = (dailyData: any[], monthYear: string, summary: { totalCollected: number, totalDiscounted: number }) => {
     try {
        const doc = new jsPDF();
        doc.text(`Monthly Financial Report for ${monthYear}`, 14, 16);

        autoTable(doc, {
            body: [
                ['Total Collected', `INR ${summary.totalCollected.toLocaleString()}`],
                ['Total Discounted', `INR ${summary.totalDiscounted.toLocaleString()}`],
            ],
            startY: 22,
            theme: 'striped',
        });
        
        const tableColumn = ["Day of Month", "Amount Collected (INR)"];
        const tableRows = dailyData.filter(d => d.collected > 0).map(d => [d.day, `INR ${d.collected.toLocaleString()}`]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: (doc as any).lastAutoTable.finalY + 10,
            theme: 'grid',
        });
        
        doc.save(`monthly_report_${monthYear}.pdf`);
        return { success: true };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
};