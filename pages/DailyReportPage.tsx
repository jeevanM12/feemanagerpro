import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Download, FileDown } from 'lucide-react';

export const DailyReportPage = () => {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-center">
      <div className="bg-white p-12 rounded-xl shadow-lg inline-block">
        <Wrench className="mx-auto text-amber-500 h-16 w-16 mb-4" />
        <h1 className="text-4xl font-extrabold text-slate-800">Daily Reports</h1>
        <p className="text-xl text-slate-600 mt-4">This feature is currently under construction.</p>
        <p className="text-slate-500 mt-2">Our team is working hard to bring you detailed daily financial summaries.</p>
        <div className="flex gap-4 justify-center mt-8">
            <button disabled title="Feature coming soon" className="bg-sky-300 cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg flex items-center">
                <Download size={20} className="mr-2" /> Export Excel
            </button>
            <button disabled title="Feature coming soon" className="bg-teal-300 cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg flex items-center">
                <FileDown size={20} className="mr-2" /> Export PDF
            </button>
        </div>
        <Link 
          to="/reports/summary" 
          className="mt-8 inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-150"
        >
          Back to Reports Summary
        </Link>
      </div>
    </div>
  );
};