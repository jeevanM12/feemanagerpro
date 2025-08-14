import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData, useAuth, useToast } from '../contexts/AppContext';
import { calculateFeeDetails } from '../utils';
import { StudentWithFeeDetails, Student } from '../types';
import { prepareStudentListForExport, exportToExcel } from '../services/dataService';
import { Eye, Edit3, Trash2, PlusCircle, UploadCloud, Download, Search, X, ChevronUp, ChevronDown, ListFilter, BarChart3, Users, DollarSign, FileText } from 'lucide-react';
import { ConfirmationModal } from '../components/ConfirmationModal';

// This is a large component, in a real-world scenario, it would be broken down further.
// For example, StudentTable, DashboardHeader, and Modals could be separate components.

export const DashboardPage = () => {
  const { students, deleteStudent } = useData();
  const { loggedInUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof StudentWithFeeDetails | null; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

  const studentsWithFeeDetails = useMemo(() => students.map(student => ({ ...student, ...calculateFeeDetails(student) })), [students]);
  const uniqueClasses = useMemo(() => [...new Set(students.map(s => s.class))].sort(), [students]);
  const uniqueGrades = useMemo(() => [...new Set(students.map(s => s.grade))].sort(), [students]);

  const filteredStudents = useMemo(() => {
    return studentsWithFeeDetails
      .filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(student => filterClass === '' || student.class === filterClass)
      .filter(student => filterGrade === '' || student.grade === filterGrade);
  }, [studentsWithFeeDetails, searchTerm, filterClass, filterGrade]);

  const sortedStudents = useMemo(() => {
    let sortableItems = [...filteredStudents];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key]! < b[sortConfig.key]!) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key]! > b[sortConfig.key]!) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredStudents, sortConfig]);

  const requestSort = (key: keyof StudentWithFeeDetails) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof StudentWithFeeDetails) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? <ChevronUp className="inline ml-1 h-4 w-4" /> : <ChevronDown className="inline ml-1 h-4 w-4" />;
    }
    return <ListFilter className="inline ml-1 h-4 w-4 text-gray-400" />;
  };

  const handleExport = () => {
    if (!loggedInUser?.permissions.canImportExport) {
        addToast("You don't have permission to export.", 'error');
        return;
    }
    const data = prepareStudentListForExport(students);
    const result = exportToExcel(data, "student_list_with_transactions");
    if(result.success) addToast("Student list exported successfully!", 'success');
    else addToast(`Export failed: ${result.error}`, 'error');
  };
  
  const confirmDelete = (studentId: string) => {
      setStudentToDelete(studentId);
      setIsConfirmModalOpen(true);
  };
  
  const handleDelete = () => {
      if (studentToDelete) {
          deleteStudent(studentToDelete);
          addToast("Student deleted successfully.", "success");
      }
      setIsConfirmModalOpen(false);
      setStudentToDelete(null);
  };


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
          <BarChart3 className="mr-3 text-blue-600" size={32} /> Dashboard
        </h2>
      
        {/* Actions & Filters */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Student Records</h3>
                <div className="flex flex-wrap gap-3">
                  {loggedInUser?.permissions.canAddStudents && (
                     <button onClick={() => navigate('/student/new')} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-200 ease-in-out transform hover:-translate-y-0.5">
                        <PlusCircle size={20} className="mr-2" /> Add Student
                     </button>
                  )}
                  {loggedInUser?.permissions.canImportExport && (
                    <>
                      <button className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-200 ease-in-out transform hover:-translate-y-0.5">
                          <UploadCloud size={20} className="mr-2" /> Import (WIP)
                      </button>
                       <button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-200 ease-in-out transform hover:-translate-y-0.5">
                          <Download size={20} className="mr-2" /> Export List
                       </button>
                    </>
                  )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative flex-grow md:col-span-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Search by name or roll number..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                    {searchTerm && (<button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"><X size={18} /></button>)}
                </div>
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
                    <option value="">All Classes</option>
                    {uniqueClasses.map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}>
                    <option value="">All Grades</option>
                    {uniqueGrades.map(g => <option key={g} value={g}>Grade {g}</option>)}
                </select>
            </div>
        </div>

        {/* Student Table */}
        {loggedInUser?.permissions.canViewStudents ? (
            <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('name')}>Name {getSortIndicator('name')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('rollNumber')}>Roll No. {getSortIndicator('rollNumber')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('class')}>Class {getSortIndicator('class')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('totalFees')}>Total Fees {getSortIndicator('totalFees')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('remainingBalance')}>Balance Due {getSortIndicator('remainingBalance')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {sortedStudents.length > 0 ? (
                    sortedStudents.map(student => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.rollNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.class}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">INR {student.totalFees.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`font-semibold ${student.remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>INR {student.remainingBalance.toLocaleString()}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                            <button onClick={() => navigate(`/student/${student.id}`)} className="text-blue-600 hover:text-blue-900 transition-colors duration-150" title="View Details"><Eye size={20} /></button>
                            {loggedInUser.permissions.canEditStudents && <button onClick={() => navigate(`/student/${student.id}/edit`)} className="text-indigo-600 hover:text-indigo-900 transition-colors duration-150" title="Edit Student"><Edit3 size={20} /></button>}
                            {loggedInUser.permissions.canDeleteStudents && <button onClick={() => confirmDelete(student.id)} className="text-red-600 hover:text-red-900 transition-colors duration-150" title="Delete Student"><Trash2 size={20} /></button>}
                        </div>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No students found.</td></tr>
                )}
                </tbody>
            </table>
            </div>
        ) : (
            <div className="bg-white p-6 rounded-xl shadow-lg text-center py-10"><p className="text-xl text-gray-600">You do not have permission to view student records.</p></div>
        )}
        <ConfirmationModal 
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={handleDelete}
            title="Confirm Deletion"
            message="Are you sure you want to delete this student and all their records? This action cannot be undone."
        />
    </div>
  );
};
