import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Sun, Moon, Shield, Book, Home, LogOut, UserPlus } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { currentUser, isAdmin, logout } = useAuth();
  const location = useLocation();

  const toggleDarkMode = () => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.remove('dark');
    } else {
      html.classList.add('dark');
    }
    setDarkMode(!darkMode);
  };

  const isActive = (path: string) => location.pathname === path ? 'text-primary font-bold' : 'text-gray-600 dark:text-gray-300 hover:text-primary';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
                  Xplorixa
                </span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8 items-center">
                <Link to="/" className={isActive('/')}>Home</Link>
                <Link to="/docs" className={isActive('/docs')}>API Docs</Link>
                {!currentUser && <Link to="/register" className={isActive('/register')}>Register</Link>}
                {isAdmin && <Link to="/admin" className={isActive('/admin')}>Admin</Link>}
              </div>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
              <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              {currentUser ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700 dark:text-gray-200">{currentUser.email}</span>
                  <button 
                    onClick={() => logout()}
                    className="flex items-center space-x-1 px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link to="/login" className="px-4 py-2 rounded-md bg-primary text-white hover:bg-blue-600 transition-colors">
                  Login
                </Link>
              )}
            </div>

            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="pt-2 pb-3 space-y-1 px-4">
              <Link to="/" className="block py-2 text-base font-medium text-gray-700 dark:text-gray-200" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link to="/docs" className="block py-2 text-base font-medium text-gray-700 dark:text-gray-200" onClick={() => setIsMenuOpen(false)}>API Docs</Link>
              {!currentUser && <Link to="/register" className="block py-2 text-base font-medium text-gray-700 dark:text-gray-200" onClick={() => setIsMenuOpen(false)}>Register</Link>}
              {isAdmin && <Link to="/admin" className="block py-2 text-base font-medium text-gray-700 dark:text-gray-200" onClick={() => setIsMenuOpen(false)}>Admin Panel</Link>}
              {currentUser ? (
                 <button onClick={() => { logout(); setIsMenuOpen(false); }} className="w-full text-left py-2 text-base font-medium text-red-600">Logout</button>
              ) : (
                 <Link to="/login" className="block py-2 text-base font-medium text-primary" onClick={() => setIsMenuOpen(false)}>Login</Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Xplorixa. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;