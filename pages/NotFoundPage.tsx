import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 text-center p-4">
      <div>
        <h1 className="text-6xl font-extrabold text-indigo-600">404</h1>
        <p className="text-2xl font-semibold text-slate-800 mt-4">Page Not Found</p>
        <p className="text-slate-600 mt-2">Sorry, the page you are looking for does not exist.</p>
        <Link 
          to="/" 
          className="mt-6 inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-150"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};