import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  actionButton?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, actionButton }) => {
  return (
    <div className="text-center bg-white p-12 rounded-xl shadow-lg mt-8">
      <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-indigo-100 mb-6">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-slate-800">{title}</h3>
      <p className="mt-2 text-slate-600 max-w-md mx-auto">{message}</p>
      {actionButton && (
        <div className="mt-8">
          {actionButton}
        </div>
      )}
    </div>
  );
};
