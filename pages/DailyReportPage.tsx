import React, { useState, useMemo } from 'react';
import { useData, useToast } from '../contexts/AppContext';
import { formatISODateToYMD, formatDateTime } from '../utils';
import { Link } from 'react-router-dom';
import { Download, FileDown, Calendar, DollarSign, Tag, Search } from 'lucide-react';
import { exportDailyReportToExcel, exportDailyReportToPdf } from '../services/dataService';
import { ToastType } from '../types';

interface DailyTransaction {
    studentName: string;
    rollNumber: string;
    type: 'Payment' | 'Discount';
    amount: number;
    details: string;
    date: string;
}

export const DailyReportPage = () => {
    const { students } = useData();
    const { addToast } = useToast();
    const [selectedDate, setSelectedDate] = useState(formatISODateToYMD(new Date().toISOString()));

    const dailyData = useMemo(() => {
        const transactions: DailyTransaction[] = [];
        let totalCollected = 0;
        let totalDiscounted = 0;
        
        students.forEach(student => {
            student.payments.forEach(p => {
                // Timezone-safe date comparison
                if (p.date.startsWith(selectedDate)) {
                    transactions.push({
                        studentName: student.name,
                        rollNumber: student.rollNumber,
                        type: 'Payment',
                        amount: p.amount,
                        details: p.remarks,
                        date: p.date,
                    });
                    totalCollected += p.amount;
                }
            });
            student.discounts.forEach(d => {
                // Timezone-safe date comparison
                if (d.date.startsWith(selectedDate)) {
                    transactions.push({
                        studentName: student.name,
                        rollNumber: student.rollNumber,
                        type: 'Discount',
                        amount: d.amount,
                        details: d.reason,
                        date: d.date,
                    });
                    totalDiscounted += d.amount;
                }
            });
        });
        
        transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return { transactions, totalCollected, totalDiscounted };
    }, [students, selectedDate]);
    
    const handleExportExcel = () => {
        if(dailyData.transactions.length === 0) {
            addToast("No data to export for the selected date.", ToastType.Info);
            return;
        }
        const result = exportDailyReportToExcel(dailyData.transactions, selectedDate);
        if (result.success) addToast("Daily report exported to Excel successfully!", ToastType.Success);
        else addToast(`Excel export failed: ${result.error}`, ToastType.Error);
    };

    const handleExportPdf = () => {
        if(dailyData.transactions.length === 0) {
            addToast("No data to export for the selected date.", ToastType.Info);
            return;
        }
        const summary = { totalCollected: dailyData.totalCollected, totalDiscounted: dailyData.totalDiscounted };
        const result = exportDailyReportToPdf(dailyData.transactions, selectedDate, summary);
        if (result.success) addToast("Daily report exported to PDF successfully!", ToastType.Success);
        else addToast(`PDF export failed: ${result.error}`, ToastType.Error);
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 className="text-3xl font-extrabold text-slate-900">Daily Financial Report</h2>
                 <div className="flex gap-3">
                    <button onClick={handleExportExcel} className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-200 ease-in-out">
                        <Download size={20} className="mr-2" /> Export Excel
                    </button>
                    <button onClick={handleExportPdf} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-200 ease-in-out">
                        <FileDown size={20} className="mr-2" /> Export PDF
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <div className="flex items-center gap-4">
                    <label htmlFor="reportDate" className="font-semibold text-slate-700 flex items-center">
                        <Calendar className="mr-2 text-indigo-600" /> Select Date:
                    </label>
                    <input
                        type="date"
                        id="reportDate"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4 transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.03]">
                    <div className="p-3 rounded-full bg-emerald-100 text-emerald-600"><DollarSign size={24} /></div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Collected Today</p>
                        <p className="text-2xl font-bold mt-1 text-emerald-600">{dailyData.totalCollected.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4 transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.03]">
                    <div className="p-3 rounded-full bg-amber-100 text-amber-600"><Tag size={24} /></div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Discounted Today</p>
                        <p className="text-2xl font-bold mt-1 text-amber-600">{dailyData.totalDiscounted.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                    </div>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Transactions for {new Date(selectedDate).toLocaleDateString('en-GB', { timeZone: 'UTC' })}</h3>
                {dailyData.transactions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                             <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Student Name</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Roll No.</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Type</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Details</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {dailyData.transactions.map((t, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-slate-800">{t.studentName}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500">{t.rollNumber}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.type === 'Payment' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{t.type}</span>
                                        </td>
                                        <td className="px-4 py-2 text-sm text-slate-700">{t.details || 'N/A'}</td>
                                        <td className={`px-4 py-2 text-right whitespace-nowrap text-sm font-semibold ${t.type === 'Payment' ? 'text-emerald-700' : 'text-amber-700'}`}>INR {t.amount.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Search size={48} className="mx-auto text-slate-400 mb-4" />
                        <h4 className="text-xl font-semibold text-slate-700">No Transactions Found</h4>
                        <p className="text-slate-500 mt-2">There were no payments or discounts recorded on this date.</p>
                         <Link to="/reports/summary" className="mt-6 inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-150">Back to Reports Summary</Link>
                    </div>
                )}
            </div>

        </div>
    );
};
