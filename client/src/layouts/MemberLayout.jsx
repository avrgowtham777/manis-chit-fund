import { Outlet } from 'react-router-dom';
import MobileNav from '../components/MobileNav';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Sparkles } from 'lucide-react';

export default function MemberLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 py-3 sm:px-6 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-gold to-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-gold/30">
            M
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              <span>MANI'S CHIT FUND</span>
              <Sparkles size={16} className="text-gold" />
            </h1>
            <p className="text-gold text-xs font-bold tracking-wide">
              MEMBER PORTAL • OCT 2026
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-red-300 bg-red-950/50 hover:bg-red-900/50 border border-red-800/60 transition-colors"
        >
          <LogOut size={16} />
          <span>Exit</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-28 bg-slate-100 text-slate-900">
        <Outlet />
      </main>

      <MobileNav />
    </div>
  );
}
