import React, { useMemo } from 'react';
import { useData } from '../contexts/AppContext';
import { calculateFeeDetails } from '../utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download } from 'lucide-react';

// Recharts is loaded from CDN, so we need to declare it
declare var Recharts: any;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const ReportsPage = () => {
    const { students } = useData();
    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } = Recharts;

    const reportsData = useMemo(() => {
        const studentsWithDetails = students.map(s => ({ ...s, ...calculateFeeDetails(s) }));

        const totalFees = studentsWithDetails.reduce((sum, s) => sum + s.totalFees, 0);
        const totalPaid = studentsWithDetails.reduce((sum, s) => sum + s.totalPaid, 0);
        const totalDiscount = studentsWithDetails.reduce((sum, s) => sum + s.totalDiscount, 0);
        const totalPending = studentsWithDetails.reduce((sum, s) => sum + s.remainingBalance, 0);

        const financialOverview = [
            { name: 'Collected', value: totalPaid },
            { name: 'Pending', value: totalPending },
            { name: 'Discounted', value: totalDiscount },
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
                { title: "Total Fees Expected", value: totalFees },
                { title: "Total Fees Collected", value: totalPaid },
                { title: "Total Balance Due", value: totalPending, isCurrency: true, isWarning: totalPending > 0 },
            ]
        };
    }, [students]);


    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Financial Reports</h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {reportsData.summaryCards.map((card, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-lg">
                        <p className="text-sm font-medium text-gray-500">{card.title}</p>
                        <p className={`text-3xl font-bold mt-1 ${card.isWarning ? 'text-red-600' : 'text-gray-900'}`}>
                           {card.value.toLocaleString('en-IN', { style: card.isCurrency ? 'currency' : 'decimal', currency: 'INR', maximumFractionDigits: 0 })}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Financial Overview Pie Chart */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Financial Overview</h3>
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
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Pending Fees by Class</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={reportsData.classWisePending}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `₹${value/1000}k`} />
                            <Tooltip formatter={(value: number) => `INR ${value.toLocaleString()}`} />
                            <Legend />
                            <Bar dataKey="pending" fill="#FF8042" name="Pending Amount" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
