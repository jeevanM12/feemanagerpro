import React, { useMemo } from 'react';
import { useData, useToast } from '../contexts/AppContext';
import { calculateFeeDetails } from '../utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, FileDown } from 'lucide-react';
import { exportReportToExcel, exportReportToPdf } from '../services/dataService';
import { ToastType } from '../types';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#6366f1', '#14b8a6'];
const BAR_COLOR = '#f59e0b'; // amber-500

export const ReportsPage = () => {
    const { students } = useData();
    const { addToast } = useToast();

    const reportsData = useMemo(() => {
        const studentsWithDetails = students.map(s => ({ ...s, ...calculateFeeDetails(s) }));

        const totalFees = studentsWithDetails.reduce((sum, s) => sum + s.totalFees, 0);
        const totalPaid = studentsWithDetails.reduce((sum, s) => sum + s.totalPaid, 0);
        const totalDiscount = studentsWithDetails.reduce((sum, s) => sum + s.totalDiscount, 0);
        const totalPending = studentsWithDetails.reduce((sum, s) => sum + s.remainingBalance, 0);

        const financialOverview = [
            { name: 'Collected', value: totalPaid },
            { name: 'Discounted', value: totalDiscount },
            { name: 'Pending', value: totalPending },
        ];

        const classWisePending = studentsWithDetails.reduce((acc, student) => {
            if (!acc[student.class]) {
                acc[student.class] = { name: `Class ${student.class}`, pending: 0 };
            }
            acc[student.class].pending += student.remainingBalance;
            return acc;
        }, {} as { [key: string]: { name: string, pending: number } });

        return {
            financialOverview,
            classWisePending: Object.values(classWisePending),
            summaryCards: [
                { title: "Total Students", value: students.length },
                { title: "Total Fees Expected", value: totalFees, isCurrency: true },
                { title: "Total Fees Collected", value: totalPaid, isCurrency: true },
                { title: "Total Balance Due", value: totalPending, isCurrency: true, isWarning: totalPending > 0 },
            ]
        };
    }, [students]);

    const handleExportExcel = () => {
        const classDataForExport = reportsData.classWisePending.map(c => ({
            'Class': c.name,
            'Pending Amount (INR)': c.pending
        }));
        const summaryDataForExport = reportsData.financialOverview.map(s => ({
            'Category': s.name,
            'Amount (INR)': s.value
        }));
    
        const result = exportReportToExcel(summaryDataForExport, classDataForExport, "financial_summary_report");
        if (result.success) {
            addToast("Report exported to Excel successfully!", ToastType.Success);
        } else {
            addToast(`Excel export failed: ${result.error}`, ToastType.Error);
        }
    };
    
    const handleExportPdf = () => {
        const result = exportReportToPdf(reportsData.summaryCards, reportsData.financialOverview, reportsData.classWisePending, "financial_summary_report");
        if (result.success) {
            addToast("Report exported to PDF successfully!", ToastType.Success);
        } else {
            addToast(`PDF export failed: ${result.error}`, ToastType.Error);
        }
    };


    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 className="text-3xl font-extrabold text-slate-900">Financial Reports Summary</h2>
                <div className="flex gap-3">
                    <button onClick={handleExportExcel} className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-200 ease-in-out">
                        <Download size={20} className="mr-2" /> Export Excel
                    </button>
                    <button onClick={handleExportPdf} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-200 ease-in-out">
                        <FileDown size={20} className="mr-2" /> Export PDF
                    </button>
                </div>
            </div>


            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {reportsData.summaryCards.map((card, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-lg">
                        <p className="text-sm font-medium text-slate-500">{card.title}</p>
                        <p className={`text-3xl font-bold mt-1 ${card.isWarning ? 'text-red-600' : 'text-slate-800'}`}>
                           {card.value.toLocaleString('en-IN', { style: card.isCurrency ? 'currency' : 'decimal', currency: 'INR', maximumFractionDigits: 0 })}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Financial Overview Pie Chart */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">Financial Overview</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={reportsData.financialOverview} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                {reportsData.financialOverview.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `INR ${value.toLocaleString()}`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Class-wise Pending Bar Chart */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">Pending Fees by Class</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={reportsData.classWisePending}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `₹${value/1000}k`} />
                            <Tooltip formatter={(value: number) => `INR ${value.toLocaleString()}`} />
                            <Legend />
                            <Bar dataKey="pending" fill={BAR_COLOR} name="Pending Amount" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};