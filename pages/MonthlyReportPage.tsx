import React, { useState, useMemo } from 'react';
import { useData, useToast } from '../contexts/AppContext';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, FileDown, DollarSign, Tag, FileText, Search } from 'lucide-react';
import { exportMonthlyReportToExcel, exportMonthlyReportToPdf } from '../services/dataService';
import { ToastType } from '../types';

const BAR_COLOR = '#10b981'; // emerald-500

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
const months = [
    { value: 0, name: 'January' }, { value: 1, name: 'February' }, { value: 2, name: 'March' },
    { value: 3, name: 'April' }, { value: 4, name: 'May' }, { value: 5, name: 'June' },
    { value: 6, name: 'July' }, { value: 7, name: 'August' }, { value: 8, name: 'September' },
    { value: 9, name: 'October' }, { value: 10, name: 'November' }, { value: 11, name: 'December' }
];

export const MonthlyReportPage = () => {
    const { students } = useData();
    const { addToast } = useToast();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

    const monthlyData = useMemo(() => {
        let totalCollected = 0;
        let totalDiscounted = 0;
        let transactionCount = 0;

        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const dailyCollections = Array.from({ length: daysInMonth }, (_, i) => ({
            day: i + 1,
            collected: 0
        }));

        students.forEach(student => {
            [...student.payments, ...student.discounts].forEach(transaction => {
                const transactionDate = new Date(transaction.date);
                if (transactionDate.getFullYear() === selectedYear && transactionDate.getMonth() === selectedMonth) {
                    transactionCount++;
                    if ('remarks' in transaction) { // It's a payment
                        totalCollected += transaction.amount;
                        dailyCollections[transactionDate.getDate() - 1].collected += transaction.amount;
                    } else { // It's a discount
                        totalDiscounted += transaction.amount;
                    }
                }
            });
        });

        return { totalCollected, totalDiscounted, transactionCount, dailyCollections };
    }, [students, selectedYear, selectedMonth]);
    
    const handleExportExcel = () => {
        if(monthlyData.transactionCount === 0) {
             addToast("No data to export for the selected month.", ToastType.Info);
             return;
        }
        const summary = { totalCollected: monthlyData.totalCollected, totalDiscounted: monthlyData.totalDiscounted };
        const result = exportMonthlyReportToExcel(monthlyData.dailyCollections, `${months[selectedMonth].name}-${selectedYear}`, summary);
        if (result.success) addToast("Monthly report exported to Excel successfully!", ToastType.Success);
        else addToast(`Excel export failed: ${result.error}`, ToastType.Error);
    };

    const handleExportPdf = () => {
         if(monthlyData.transactionCount === 0) {
             addToast("No data to export for the selected month.", ToastType.Info);
             return;
        }
        const summary = { totalCollected: monthlyData.totalCollected, totalDiscounted: monthlyData.totalDiscounted };
        const result = exportMonthlyReportToPdf(monthlyData.dailyCollections, `${months[selectedMonth].name}-${selectedYear}`, summary);
        if (result.success) addToast("Monthly report exported to PDF successfully!", ToastType.Success);
        else addToast(`PDF export failed: ${result.error}`, ToastType.Error);
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 className="text-3xl font-extrabold text-slate-900">Monthly Financial Report</h2>
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
                <div className="flex flex-wrap items-center gap-4">
                    <label className="font-semibold text-slate-700">Select Period:</label>
                    <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                    </select>
                    <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4 transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.03]">
                    <div className="p-3 rounded-full bg-emerald-100 text-emerald-600"><DollarSign size={24} /></div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Collected</p>
                        <p className="text-2xl font-bold mt-1 text-emerald-600">{monthlyData.totalCollected.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4 transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.03]">
                    <div className="p-3 rounded-full bg-amber-100 text-amber-600"><Tag size={24} /></div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Discounted</p>
                        <p className="text-2xl font-bold mt-1 text-amber-600">{monthlyData.totalDiscounted.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4 transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.03]">
                    <div className="p-3 rounded-full bg-indigo-100 text-indigo-600"><FileText size={24} /></div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Transactions</p>
                        <p className="text-2xl font-bold mt-1 text-indigo-600">{monthlyData.transactionCount}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Daily Collections for {months[selectedMonth].name} {selectedYear}</h3>
                {monthlyData.transactionCount > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={monthlyData.dailyCollections} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
                            <Tooltip formatter={(value: number) => `INR ${value.toLocaleString()}`} />
                            <Legend />
                            <Bar dataKey="collected" fill={BAR_COLOR} name="Amount Collected" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                     <div className="text-center py-20">
                        <Search size={48} className="mx-auto text-slate-400 mb-4" />
                        <h4 className="text-xl font-semibold text-slate-700">No Transactions Found</h4>
                        <p className="text-slate-500 mt-2">There is no financial data for the selected month.</p>
                        <Link to="/reports/summary" className="mt-6 inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-150">Back to Reports Summary</Link>
                    </div>
                )}
            </div>
        </div>
    );
};
