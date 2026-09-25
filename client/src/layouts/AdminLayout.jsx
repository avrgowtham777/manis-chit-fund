import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Menu, Sparkles, Heart } from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout() {
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 flex text-slate-900 antialiased selection:bg-gold selection:text-slate-900">
      {/* Desktop Sidebar with Glass Polish */}
      <div className="hidden md:flex w-72 flex-col fixed inset-y-0 z-50">
        <Sidebar onClose={() => {}} />
      </div>

      {/* Mobile Sidebar overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex animate-fadeIn">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 shadow-2xl border-r border-slate-800">
            <Sidebar onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-72 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 py-3.5 md:px-8 z-40 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-300 hover:text-white rounded-xl bg-slate-800 border border-slate-700 focus:outline-none"
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>MANI'S CHIT FUND</span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gold/20 text-gold border border-gold/30">
                  <Sparkles size={12} /> Organiser Portal
                </span>
              </h1>
              <p className="text-xs text-gray-400 font-medium hidden sm:block">
                October 2026 – August 2028 • 23 Months
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={logout}
              className="flex items-center text-xs md:text-sm font-bold text-gray-300 bg-slate-800/90 hover:bg-red-950/80 hover:text-red-300 border border-slate-700 hover:border-red-800/60 px-3.5 py-2 rounded-xl transition-all shadow-sm"
            >
              <LogOut size={16} className="mr-1.5 text-gold" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Inner Page Scroll Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-950 text-slate-100">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
