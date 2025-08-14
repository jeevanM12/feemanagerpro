import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData, useAuth, useToast } from '../contexts/AppContext';
import { Student, Payment, Discount } from '../types';
import { calculateFeeDetails, formatDateTime, formatISODateToYMD } from '../utils';
import { ChevronLeft, Eye, Edit3, Trash2, PlusCircle, Download } from 'lucide-react';
import { ConfirmationModal } from '../components/ConfirmationModal';

// In a larger app, modals would be separate components.
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
            addToast('Please enter a valid amount.', 'error');
            return;
        }
        addPayment(student.id, { amount: parsedAmount, remarks, date: new Date(date).toISOString() });
        addToast('Payment added successfully', 'success');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative">
                <h2 className="text-2xl font-bold mb-6">Add Payment for {student.name}</h2>
                <form onSubmit={handleSubmit}>
                    {/* Form fields */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Amount (INR)</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Date</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3" required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Remarks</label>
                        <textarea value={remarks} onChange={e => setRemarks(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 h-24" />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">Cancel</button>
                        <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">Add Payment</button>
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

    if (!student) {
        return <div className="p-8 text-center">Loading student details...</div>;
    }

    const { totalPaid, totalDiscount, remainingBalance, lastPaymentDate } = calculateFeeDetails(student);

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <button onClick={() => navigate('/')} className="mb-6 flex items-center text-blue-600 hover:text-blue-800 font-semibold">
                <ChevronLeft size={20} className="mr-2" /> Back to Dashboard
            </button>

            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{student.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                    <div><span className="font-medium">Roll Number:</span> {student.rollNumber}</div>
                    <div><span className="font-medium">Class:</span> {student.class}</div>
                    <div><span className="font-medium">Grade:</span> {student.grade}</div>
                </div>
            </div>

            {/* Fee Summary */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Fee Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg"><p className="font-medium">Total Fees:</p><p className="text-xl font-bold text-blue-700">INR {student.totalFees.toLocaleString()}</p></div>
                    <div className="p-4 bg-green-50 rounded-lg"><p className="font-medium">Total Paid:</p><p className="text-xl font-bold text-green-700">INR {totalPaid.toLocaleString()}</p></div>
                    <div className="p-4 bg-yellow-50 rounded-lg"><p className="font-medium">Total Discount:</p><p className="text-xl font-bold text-yellow-700">INR {totalDiscount.toLocaleString()}</p></div>
                    <div className={`p-4 rounded-lg ${remainingBalance > 0 ? 'bg-red-50' : 'bg-green-50'}`}><p className="font-medium">Balance Due:</p><p className={`text-xl font-bold ${remainingBalance > 0 ? 'text-red-700' : 'text-green-700'}`}>INR {remainingBalance.toLocaleString()}</p></div>
                </div>
            </div>

            {/* Payments & Discounts Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">Payments</h3>
                        {loggedInUser?.permissions.canManagePayments && (
                            <button onClick={() => setModal('payment')} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1.5 px-3 rounded-lg flex items-center text-sm"><PlusCircle size={18} className="mr-1" /> Add</button>
                        )}
                    </div>
                    {student.payments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-xs font-medium uppercase">Amount</th><th className="px-4 py-2 text-left text-xs font-medium uppercase">Date</th><th className="px-4 py-2 text-left text-xs font-medium uppercase">Remarks</th></tr></thead>
                                <tbody>
                                    {student.payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(p => (
                                        <tr key={p.id} className="border-b"><td className="px-4 py-2">INR {p.amount.toLocaleString()}</td><td className="px-4 py-2">{formatDateTime(p.date)}</td><td className="px-4 py-2">{p.remarks}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className="text-center text-gray-500 py-4">No payments recorded.</p>}
                </div>
                {/* Discounts section would go here, similar to payments */}
            </div>
            
            {modal === 'payment' && <AddPaymentModal student={student} onClose={() => setModal(null)} />}
        </div>
    );
};
