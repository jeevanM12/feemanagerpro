import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData, useToast } from '../contexts/AppContext';
import { ToastType } from '../types';
import { ChevronLeft, UserPlus } from 'lucide-react';

export const StudentAddPage = () => {
  const navigate = useNavigate();
  const { addStudent, students } = useData();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] =useState('');
  const [className, setClassName] = useState('');
  const [grade, setGrade] = useState('');
  const [totalFees, setTotalFees] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !rollNumber || !className || !grade || !totalFees) {
        addToast("All fields are required.", ToastType.Error);
        return;
    }

    const parsedFees = parseFloat(totalFees);
    if (isNaN(parsedFees) || parsedFees <= 0) {
        addToast("Please enter a valid total fee amount.", ToastType.Error);
        return;
    }

    if (students.some(s => s.rollNumber.toLowerCase() === rollNumber.toLowerCase().trim())) {
        addToast("A student with this roll number already exists.", ToastType.Error);
        return;
    }

    addStudent({
        name: name.trim(),
        rollNumber: rollNumber.trim(),
        class: className.trim(),
        grade: grade.trim(),
        totalFees: parsedFees,
    });
    
    addToast('Student added successfully!', ToastType.Success);
    navigate('/');
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <button onClick={() => navigate('/')} className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800 font-semibold">
            <ChevronLeft size={20} className="mr-2" /> Back to Dashboard
        </button>
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <UserPlus size={24} className="mr-3 text-emerald-600" /> Add New Student
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-slate-600 text-sm font-bold mb-2" htmlFor="rollNumber">Roll Number</label>
                    <input type="text" id="rollNumber" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} className="shadow appearance-none border border-slate-600 bg-slate-700 text-white rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                </div>
                 <div>
                    <label className="block text-slate-600 text-sm font-bold mb-2" htmlFor="name">Full Name</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="shadow appearance-none border border-slate-600 bg-slate-700 text-white rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                </div>
                 <div>
                    <label className="block text-slate-600 text-sm font-bold mb-2" htmlFor="class">Class</label>
                    <input type="text" id="class" value={className} onChange={(e) => setClassName(e.target.value)} className="shadow appearance-none border border-slate-600 bg-slate-700 text-white rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                </div>
                 <div>
                    <label className="block text-slate-600 text-sm font-bold mb-2" htmlFor="grade">Grade</label>
                    <input type="text" id="grade" value={grade} onChange={(e) => setGrade(e.target.value)} className="shadow appearance-none border border-slate-600 bg-slate-700 text-white rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                </div>
                 <div>
                    <label className="block text-slate-600 text-sm font-bold mb-2" htmlFor="totalFees">Total Fees (INR)</label>
                    <input type="number" id="totalFees" value={totalFees} onChange={(e) => setTotalFees(e.target.value)} className="shadow appearance-none border border-slate-600 bg-slate-700 text-white rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500" required min="1" />
                </div>
                <div className="flex justify-end pt-4">
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition duration-150">
                        <UserPlus size={18} className="mr-2" /> Add Student
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};