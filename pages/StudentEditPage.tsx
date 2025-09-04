import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData, useToast } from '../contexts/AppContext';
import { Student, ToastType } from '../types';
import { ChevronLeft, Save } from 'lucide-react';

export const StudentEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { students, updateStudent } = useData();
  const { addToast } = useToast();

  const [studentData, setStudentData] = useState<Student | null>(null);

  useEffect(() => {
    const studentToEdit = students.find(s => s.id === id);
    if (studentToEdit) {
      setStudentData(studentToEdit);
    } else {
      addToast('Student not found.', ToastType.Error);
      navigate('/');
    }
  }, [id, students, navigate, addToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (studentData) {
      setStudentData({
        ...studentData,
        [name]: name === 'totalFees' ? parseFloat(value) || 0 : value,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentData) {
      if (!studentData.name || !studentData.class || !studentData.grade || studentData.totalFees <= 0) {
          addToast("Please fill all fields with valid data.", ToastType.Error);
          return;
      }
      updateStudent(studentData);
      addToast('Student details updated successfully!', ToastType.Success);
      navigate(`/student/${id}`);
    }
  };

  if (!studentData) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <button onClick={() => navigate(`/student/${id}`)} className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800 font-semibold">
            <ChevronLeft size={20} className="mr-2" /> Back to Student Details
        </button>
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Edit Student: {studentData.name}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-slate-600 text-sm font-bold mb-2" htmlFor="rollNumber">Roll Number</label>
                    <input type="text" id="rollNumber" name="rollNumber" value={studentData.rollNumber} className="shadow appearance-none border rounded w-full py-2 px-3 text-slate-700 bg-slate-200 cursor-not-allowed" readOnly />
                </div>
                 <div>
                    <label className="block text-slate-600 text-sm font-bold mb-2" htmlFor="name">Full Name</label>
                    <input type="text" id="name" name="name" value={studentData.name} onChange={handleChange} className="shadow appearance-none border border-slate-600 bg-slate-700 text-white rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                </div>
                 <div>
                    <label className="block text-slate-600 text-sm font-bold mb-2" htmlFor="class">Class</label>
                    <input type="text" id="class" name="class" value={studentData.class} onChange={handleChange} className="shadow appearance-none border border-slate-600 bg-slate-700 text-white rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                </div>
                 <div>
                    <label className="block text-slate-600 text-sm font-bold mb-2" htmlFor="grade">Grade</label>
                    <input type="text" id="grade" name="grade" value={studentData.grade} onChange={handleChange} className="shadow appearance-none border border-slate-600 bg-slate-700 text-white rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                </div>
                 <div>
                    <label className="block text-slate-600 text-sm font-bold mb-2" htmlFor="totalFees">Total Fees (INR)</label>
                    <input type="number" id="totalFees" name="totalFees" value={studentData.totalFees} onChange={handleChange} className="shadow appearance-none border border-slate-600 bg-slate-700 text-white rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500" required min="1" />
                </div>
                <div className="flex justify-end pt-4">
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition duration-150">
                        <Save size={18} className="mr-2" /> Save Changes
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};