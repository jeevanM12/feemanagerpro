import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData, useAuth, useToast } from '../contexts/AppContext';
import { Student, Payment, Discount, ToastType } from '../types';
import { calculateFeeDetails, formatDateTime, formatISODateToYMD } from '../utils';
import { ChevronLeft, PlusCircle, Tag, FileText } from 'lucide-react';
import { ConfirmationModal } from '../components/ConfirmationModal';

// Modals
const AddPaymentModal = ({ student, onClose }: { student: Student, onClose: () => void }) => {
    const { addPayment } = useData();
    const { addToast } = useToast();
    const [amount, setAmount] = useState('');
    const [remarks, setRemarks] = useState('');
    const [date, setDate] = useState(formatISODateToYMD(new Date().toISOString()));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            addToast('Please enter a valid amount.', ToastType.Error);
            return;
        }
        addPayment(student.id, { amount: parsedAmount, remarks, date: new Date(date).toISOString() });
        addToast('Payment added successfully', ToastType.Success);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative animate-fade-in-down">
                <h2 className="text-2xl font-bold mb-6">Add Payment for {student.name}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2">Amount (INR)</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2">Date</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2">Remarks</label>
                        <textarea value={remarks} onChange={e => setRemarks(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg">Add Payment</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AddDiscountModal = ({ student, onClose }: { student: Student, onClose: () => void }) => {
    const { addDiscount } = useData();
    const { addToast } = useToast();
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [date, setDate] = useState(formatISODateToYMD(new Date().toISOString()));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            addToast('Please enter a valid amount.', ToastType.Error);
            return;
        }
        if (!reason.trim()) {
            addToast('Please enter a reason for the discount.', ToastType.Error);
            return;
        }
        addDiscount(student.id, { amount: parsedAmount, reason, date: new Date(date).toISOString() });
        addToast('Discount added successfully', ToastType.Success);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative animate-fade-in-down">
                <h2 className="text-2xl font-bold mb-6">Add Discount for {student.name}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2">Amount (INR)</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2">Date</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    <div>
                        <label className="block text-slate-700 text-sm font-bold mb-2">Reason</label>
                        <textarea value={reason} onChange={e => setReason(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg">Add Discount</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export const StudentDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { students } = useData();
    const { loggedInUser } = useAuth();
    const [student, setStudent] = useState<Student | null>(null);
    const [modal, setModal] = useState<'payment' | 'discount' | null>(null);

    useEffect(() => {
        const foundStudent = students.find(s => s.id === id);
        if (foundStudent) {
            setStudent(foundStudent);
        } else {
            navigate('/404');
        }
    }, [id, students, navigate]);
    
    const transactionHistory = useMemo(() => {
        if (!student) return [];
        const paymentsHistory = student.payments.map(p => ({
            ...p,
            type: 'Payment',
            details: p.remarks,
        }));
        const discountsHistory = student.discounts.map(d => ({
            ...d,
            type: 'Discount',
            details: d.reason,
        }));
        
        const allTransactions = [...paymentsHistory, ...discountsHistory];
        allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return allTransactions;
    }, [student]);


    if (!student) {
        return <div className="p-8 text-center">Loading student details...</div>;
    }

    const { totalPaid, totalDiscount, remainingBalance } = calculateFeeDetails(student);

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <button onClick={() => navigate('/')} className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800 font-semibold">
                <ChevronLeft size={20} className="mr-2" /> Back to Dashboard
            </button>

            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-4">{student.name}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2 text-slate-600">
                        <div><span className="font-medium">Roll Number:</span> {student.rollNumber}</div>
                        <div><span className="font-medium">Class:</span> {student.class}</div>
                        <div><span className="font-medium">Grade:</span> {student.grade}</div>
                    </div>
                  </div>
                  {loggedInUser?.permissions.canEditStudents && (
                     <button onClick={() => navigate(`/student/${student.id}/edit`)} className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-200 ease-in-out">
                        Edit Student
                     </button>
                  )}
                </div>
            </div>

            {/* Fee Summary */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Fee Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-sky-50 rounded-lg"><p className="font-medium">Total Fees:</p><p className="text-xl font-bold text-sky-700">INR {student.totalFees.toLocaleString()}</p></div>
                    <div className="p-4 bg-emerald-50 rounded-lg"><p className="font-medium">Total Paid:</p><p className="text-xl font-bold text-emerald-700">INR {totalPaid.toLocaleString()}</p></div>
                    <div className="p-4 bg-amber-50 rounded-lg"><p className="font-medium">Total Discount:</p><p className="text-xl font-bold text-amber-700">INR {totalDiscount.toLocaleString()}</p></div>
                    <div className={`p-4 rounded-lg ${remainingBalance > 0 ? 'bg-red-50' : 'bg-emerald-50'}`}><p className="font-medium">Balance Due:</p><p className={`text-xl font-bold ${remainingBalance > 0 ? 'text-red-700' : 'text-emerald-700'}`}>INR {remainingBalance.toLocaleString()}</p></div>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold flex items-center"><FileText size={22} className="mr-2 text-indigo-600"/> Transaction History</h3>
                    <div className="flex items-center gap-2">
                        {loggedInUser?.permissions.canManagePayments && (
                            <button onClick={() => setModal('payment')} className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-1.5 px-3 rounded-lg flex items-center text-sm"><PlusCircle size={18} className="mr-1" /> Add Payment</button>
                        )}
                        {loggedInUser?.permissions.canManageDiscounts && (
                            <button onClick={() => setModal('discount')} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-1.5 px-3 rounded-lg flex items-center text-sm"><Tag size={18} className="mr-1" /> Add Discount</button>
                        )}
                    </div>
                </div>
                {transactionHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Date</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Type</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Details</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {transactionHistory.map(t => (
                                    <tr key={t.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500">{formatDateTime(t.date)}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.type === 'Payment' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                                {t.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-sm text-slate-700">{t.details || 'N/A'}</td>
                                        <td className={`px-4 py-2 text-right whitespace-nowrap text-sm font-semibold ${t.type === 'Payment' ? 'text-emerald-700' : 'text-amber-700'}`}>
                                            INR {t.amount.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className="text-center text-slate-500 py-8">No transactions recorded for this student.</p>}
            </div>
            
            {modal === 'payment' && <AddPaymentModal student={student} onClose={() => setModal(null)} />}
            {modal === 'discount' && <AddDiscountModal student={student} onClose={() => setModal(null)} />}
        </div>
    );
};