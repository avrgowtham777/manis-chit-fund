import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout() {
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
        <Sidebar onClose={() => {}} />
      </div>

      {/* Mobile Sidebar overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-navy">
            <Sidebar onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
        <header className="bg-navy shadow flex items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden mr-4 text-white focus:outline-none"
            >
              <Menu size={28} />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-white">MANI'S CHIT FUND</h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center text-white bg-navy-light px-4 py-2 rounded-lg font-medium hover:bg-navy-dark"
          >
            <LogOut size={20} className="mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
