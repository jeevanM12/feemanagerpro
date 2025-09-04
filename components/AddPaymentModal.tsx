import React, { useState } from 'react';
import { useData, useToast } from '../contexts/AppContext.tsx';
import { Student, ToastType } from '../types.ts';
import { formatISODateToYMD } from '../utils.ts';

export const AddPaymentModal = ({ student, onClose }: { student: Student, onClose: () => void }) => {
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