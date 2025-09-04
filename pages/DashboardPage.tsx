import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData, useAuth, useToast } from '../contexts/AppContext';
import { calculateFeeDetails } from '../utils';
import { StudentWithFeeDetails, Student, ToastType } from '../types';
import { prepareStudentListForExport, exportToExcel, exportToPdf } from '../services/dataService';
import { Eye, Edit3, Trash2, PlusCircle, UploadCloud, Download, Search, X, ChevronUp, ChevronDown, ListFilter, BarChart3, Users, DollarSign, FileText, Tag, FileDown, BookCopy } from 'lucide-react';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { EmptyState } from '../components/EmptyState';
import * as XLSX from 'xlsx';

const SummaryCard = ({ title, value, icon, isCurrency = false, isWarning = false }: { title: string, value: number, icon: React.ReactNode, isCurrency?: boolean, isWarning?: boolean }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4 transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.03]">
        <div className={`p-3 rounded-full ${isWarning ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className={`text-2xl font-bold mt-1 ${isWarning ? 'text-red-600' : 'text-slate-800'}`}>
                {isCurrency ? value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }) : value.toLocaleString()}
            </p>
        </div>
    </div>
);

export const DashboardPage = () => {
  const { students, deleteStudent, importStudents } = useData();
  const { loggedInUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof StudentWithFeeDetails | null; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

  const studentsWithFeeDetails = useMemo(() => students.map(student => ({ ...student, ...calculateFeeDetails(student) })), [students]);
  const uniqueClasses = useMemo(() => [...new Set(students.map(s => s.class))].sort(), [students]);
  const uniqueGrades = useMemo(() => [...new Set(students.map(s => s.grade))].sort(), [students]);

  const dashboardSummary = useMemo(() => {
        const totalFees = studentsWithFeeDetails.reduce((sum, s) => sum + s.totalFees, 0);
        const totalPaid = studentsWithFeeDetails.reduce((sum, s) => sum + s.totalPaid, 0);
        const totalDiscount = studentsWithFeeDetails.reduce((sum, s) => sum + s.totalDiscount, 0);
        const totalPending = studentsWithFeeDetails.reduce((sum, s) => sum + s.remainingBalance, 0);
        return { totalStudents: students.length, totalFees, totalPaid, totalDiscount, totalPending };
    }, [studentsWithFeeDetails]);

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
    return <ListFilter className="inline ml-1 h-4 w-4 text-slate-400" />;
  };

  const handleExportExcel = () => {
    if (!loggedInUser?.permissions.canImportExport) {
        addToast("You don't have permission to export.", ToastType.Error);
        return;
    }
    const data = prepareStudentListForExport(students);
    const result = exportToExcel(data, "student_list_with_transactions");
    if(result.success) addToast("Student list exported to Excel successfully!", ToastType.Success);
    else addToast(`Excel export failed: ${result.error}`, ToastType.Error);
  };

  const handleExportPdf = () => {
      if (!loggedInUser?.permissions.canImportExport) {
          addToast("You don't have permission to export.", ToastType.Error);
          return;
      }
      const result = exportToPdf(sortedStudents, "student_financial_report");
      if (result.success) addToast("PDF report exported successfully!", ToastType.Success);
      else addToast(`PDF export failed: ${result.error}`, ToastType.Error);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);

            const importedStudentsList: Student[] = json.map((row: any): Partial<Student> => ({
                name: row['Name'],
                rollNumber: String(row['Roll Number'] || row['RollNo'] || ''),
                class: String(row['Class'] || ''),
                grade: String(row['Grade'] || ''),
                totalFees: parseFloat(row['Total Fees']),
            }))
            .filter(s => s.name && s.rollNumber && !isNaN(s.totalFees!) && s.totalFees! > 0) as Student[];

            if (importedStudentsList.length > 0) {
                const { newCount, updatedCount } = importStudents(importedStudentsList);
                addToast(`Import successful! Added ${newCount} new students, updated ${updatedCount}.`, ToastType.Success);
            } else {
                addToast('No valid student data found in the file. Please check column headers (Name, Roll Number, Class, Grade, Total Fees).', ToastType.Error);
            }
        } catch (error) {
            console.error("Import error:", error);
            addToast("Failed to process the file. Ensure it's a valid Excel file.", ToastType.Error);
        } finally {
           if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
        }
    };
    reader.readAsArrayBuffer(file);
  };
  
  const confirmDelete = (studentId: string) => {
      setStudentToDelete(studentId);
      setIsConfirmModalOpen(true);
  };
  
  const handleDelete = () => {
      if (studentToDelete) {
          deleteStudent(studentToDelete);
          addToast("Student deleted successfully.", ToastType.Success);
      }
      setIsConfirmModalOpen(false);
      setStudentToDelete(null);
  };
  
  if (students.length === 0) {
      return (
          <div className="container mx-auto p-4 sm:p-6 lg:p-8">
               <EmptyState
                  icon={<Users size={48} className="text-indigo-600" />}
                  title="No Student Records Found"
                  message="It looks like you haven't added any students yet. Get started by adding your first student record."
                  actionButton={
                      loggedInUser?.permissions.canAddStudents ? (
                          <button onClick={() => navigate('/student/new')} className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md flex items-center transition duration-200 ease-in-out transform hover:-translate-y-0.5 text-base">
                              <PlusCircle size={22} className="mr-2" /> Add Your First Student
                          </button>
                      ) : null
                  }
               />
          </div>
      );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-6 flex items-center">
          <BarChart3 className="mr-3 text-indigo-600" size={32} /> Dashboard
        </h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            <SummaryCard title="Total Students" value={dashboardSummary.totalStudents} icon={<Users size={24} />} />
            <SummaryCard title="Unique Classes" value={uniqueClasses.length} icon={<BookCopy size={24} />} />
            <SummaryCard title="Total Fees" value={dashboardSummary.totalFees} isCurrency icon={<FileText size={24}/>} />
            <SummaryCard title="Total Collected" value={dashboardSummary.totalPaid} isCurrency icon={<DollarSign size={24}/>} />
            <SummaryCard title="Total Discount" value={dashboardSummary.totalDiscount} isCurrency icon={<Tag size={24}/>} />
            <SummaryCard title="Balance Due" value={dashboardSummary.totalPending} isCurrency isWarning={dashboardSummary.totalPending > 0} icon={<DollarSign size={24}/>} />
        </div>
      
        {/* Actions & Filters */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h3 className="text-xl font-semibold text-slate-800">Student Records</h3>
                <div className="flex flex-wrap gap-3">
                  {loggedInUser?.permissions.canAddStudents && (
                     <button onClick={() => navigate('/student/new')} className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-200 ease-in-out transform hover:-translate-y-0.5">
                        <PlusCircle size={20} className="mr-2" /> Add Student
                     </button>
                  )}
                  {loggedInUser?.permissions.canImportExport && (
                    <>
                      <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept=".xlsx, .xls" />
                      <button onClick={() => fileInputRef.current?.click()} className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-200 ease-in-out transform hover:-translate-y-0.5">
                          <UploadCloud size={20} className="mr-2" /> Import
                      </button>
                       <button onClick={handleExportExcel} className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-200 ease-in-out transform hover:-translate-y-0.5">
                          <Download size={20} className="mr-2" /> Export Excel
                       </button>
                       <button onClick={handleExportPdf} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-200 ease-in-out transform hover:-translate-y-0.5">
                          <FileDown size={20} className="mr-2" /> Export PDF
                       </button>
                    </>
                  )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative flex-grow md:col-span-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input type="text" placeholder="Search by name or roll number..." className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                    {searchTerm && (<button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"><X size={18} /></button>)}
                </div>
                <select className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
                    <option value="">All Classes</option>
                    {uniqueClasses.map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>
                <select className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}>
                    <option value="">All Grades</option>
                    {uniqueGrades.map(g => <option key={g} value={g}>Grade {g}</option>)}
                </select>
            </div>
        </div>

        {/* Student Table */}
        {loggedInUser?.permissions.canViewStudents ? (
            <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('name')}>Name {getSortIndicator('name')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('rollNumber')}>Roll No. {getSortIndicator('rollNumber')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('class')}>Class {getSortIndicator('class')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('totalFees')}>Total Fees {getSortIndicator('totalFees')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('remainingBalance')}>Balance Due {getSortIndicator('remainingBalance')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                {sortedStudents.length > 0 ? (
                    sortedStudents.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{student.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{student.rollNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{student.class}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">INR {student.totalFees.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`font-semibold ${student.remainingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>INR {student.remainingBalance.toLocaleString()}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                            <button onClick={() => navigate(`/student/${student.id}`)} className="text-sky-600 hover:text-sky-800 transition-colors duration-150" title="View Details"><Eye size={20} /></button>
                            {loggedInUser.permissions.canEditStudents && <button onClick={() => navigate(`/student/${student.id}/edit`)} className="text-indigo-600 hover:text-indigo-900 transition-colors duration-150" title="Edit Student"><Edit3 size={20} /></button>}
                            {loggedInUser.permissions.canDeleteStudents && <button onClick={() => confirmDelete(student.id)} className="text-red-600 hover:text-red-900 transition-colors duration-150" title="Delete Student"><Trash2 size={20} /></button>}
                        </div>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr><td colSpan={6} className="px-6 py-4 text-center text-slate-500">No students found for the current filters.</td></tr>
                )}
                </tbody>
            </table>
            </div>
        ) : (
            <div className="bg-white p-6 rounded-xl shadow-lg text-center py-10"><p className="text-xl text-slate-600">You do not have permission to view student records.</p></div>
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