import React, { useState, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AppContext';
import { APP_NAME } from '../constants';
import { ChevronDown, LogOut, BarChart3, CalendarDays, UserCog } from 'lucide-react';

const Navbar = () => {
    const { loggedInUser, logout } = useAuth();
    const navigate = useNavigate();
    const [reportsDropdownOpen, setReportsDropdownOpen] = useState(false);
    const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    
    const activeLinkClass = { color: '#60a5fa' }; // text-blue-400

    return (
        <nav className="bg-gray-800 text-white p-4 shadow-lg">
          <div className="container mx-auto flex flex-wrap justify-between items-center">
            <h1 className="text-xl md:text-2xl font-bold cursor-pointer mb-2 sm:mb-0" onClick={() => navigate('/')}>
              {APP_NAME.split(' ')[0]}<span className="text-blue-400">{APP_NAME.split(' ')[1]}</span>
            </h1>
            {loggedInUser && (
              <div className="flex flex-wrap items-center space-x-1 sm:space-x-2 md:space-x-3">
                <NavLink to="/" className="hover:text-blue-300 px-2 py-1 rounded-md text-xs sm:text-sm" style={({isActive}) => isActive ? activeLinkClass : {}}>Dashboard</NavLink>
                {loggedInUser.permissions.canViewReports && (
                    <div className="relative" onMouseEnter={() => setReportsDropdownOpen(true)} onMouseLeave={() => setReportsDropdownOpen(false)}>
                        <button className="hover:text-blue-300 px-2 py-1 rounded-md text-xs sm:text-sm flex items-center">
                            Reports <ChevronDown size={16} className="ml-1"/>
                        </button>
                        {reportsDropdownOpen && (
                            <div className="absolute left-0 mt-1 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-20">
                                <NavLink to="/reports/summary" className="block px-4 py-2 text-xs sm:text-sm text-white hover:bg-gray-600 rounded-md cursor-pointer flex items-center"><BarChart3 size={16} className="mr-2"/> Summary</NavLink>
                                <NavLink to="/reports/daily" className="block px-4 py-2 text-xs sm:text-sm text-white hover:bg-gray-600 rounded-md cursor-pointer flex items-center"><CalendarDays size={16} className="mr-2"/> Daily</NavLink>
                                <NavLink to="/reports/monthly" className="block px-4 py-2 text-xs sm:text-sm text-white hover:bg-gray-600 rounded-md cursor-pointer flex items-center"><CalendarDays size={16} className="mr-2"/> Monthly</NavLink>
                            </div>
                        )}
                    </div>
                )}
                {loggedInUser.role === 'admin' && (
                  <div className="relative" onMouseEnter={() => setAdminDropdownOpen(true)} onMouseLeave={() => setAdminDropdownOpen(false)}>
                    <button className="hover:text-blue-300 px-2 py-1 rounded-md text-xs sm:text-sm flex items-center">
                      Admin <ChevronDown size={16} className="ml-1"/>
                    </button>
                    {adminDropdownOpen && (
                      <div className="absolute left-0 mt-1 w-52 bg-gray-700 rounded-md shadow-lg py-1 z-20">
                        <NavLink to="/admin/users" className="block px-4 py-2 text-xs sm:text-sm text-white hover:bg-gray-600 rounded-md cursor-pointer flex items-center"><UserCog size={16} className="mr-2"/> User Management</NavLink>
                      </div>
                    )}
                  </div>
                )}
                <span className="text-gray-300 text-xs sm:text-sm hidden md:inline">| {loggedInUser.email}</span>
                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs sm:text-sm flex items-center"><LogOut size={16} className="mr-1"/> Logout</button>
              </div>
            )}
          </div>
        </nav>
    );
};


export const MainLayout = () => {
    return (
        <div className="min-h-screen bg-gray-100 font-sans antialiased">
            <Navbar />
            <main>
                <Outlet />
            </main>
        </div>
    );
};
