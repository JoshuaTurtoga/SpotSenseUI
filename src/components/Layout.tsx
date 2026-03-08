import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, LayoutDashboard, LogOut, User, MapPin, ShieldCheck, Menu, X, CreditCard } from 'lucide-react';
import { useState } from 'react';
import ChatWidget from './ChatWidget';

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="bg-indigo-600 p-2 rounded-lg">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">SpotSense</span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/dashboard') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/admin') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Admin
                    </Link>
                  )}
                  {user.role === 'cashier' && (
                    <Link
                      to="/cashier"
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/cashier') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      Cashier
                    </Link>
                  )}
                  <Link
                    to="/find-car"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/find-car') ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    Find My Car
                  </Link>
                  <div className="h-6 w-px bg-gray-200 mx-2" />
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Hi, {user.name}</span>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900 p-2"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Dashboard
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    >
                      Admin Panel
                    </Link>
                  )}
                  {user.role === 'cashier' && (
                    <Link
                      to="/cashier"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    >
                      Cashier Station
                    </Link>
                  )}
                  <Link
                    to="/find-car"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Find My Car
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 hover:bg-indigo-50"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} SpotSense. All rights reserved.
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
}
