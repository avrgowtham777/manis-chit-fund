import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  IndianRupee, 
  FileClock, 
  ClipboardList, 
  Database, 
  Bell, 
  Settings, 
  ShieldCheck,
  X
} from 'lucide-react';

const links = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/collection', icon: FileText, label: 'Current Month' },
  { to: '/admin/payments', icon: IndianRupee, label: 'Record Payment' },
  { to: '/admin/payments/pending', icon: FileClock, label: 'Pending Dues' },
  { to: '/admin/chit-lift', icon: IndianRupee, label: 'Chit Lifting' },
  { to: '/admin/members', icon: Users, label: 'All Members' },
  { to: '/admin/reports', icon: ClipboardList, label: 'Download Reports' },
  { to: '/admin/notifications', icon: Bell, label: 'Alerts & Messages' },
  { to: '/admin/audit', icon: Database, label: 'Audit Trail' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
  { to: '/admin/backup', icon: Database, label: 'Backup & Reset' },
];

export default function Sidebar({ onClose }) {
  return (
    <div className="h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 text-white flex flex-col pt-4">
      {/* Brand Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-gold to-amber-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-gold/20">
            M
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight leading-tight">
              MANI'S CHIT
            </h2>
            <p className="text-[11px] font-bold text-gold tracking-widest uppercase">
              Admin Portal
            </p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white bg-slate-800 border border-slate-700"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5 custom-scrollbar">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              end={link.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-gold via-amber-400 to-yellow-500 text-slate-950 shadow-md shadow-gold/25 font-black scale-[1.02]' 
                    : 'text-gray-300 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              <Icon size={20} className="mr-3 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Mother's Comfort Footer */}
      <div className="p-4 mx-4 mb-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
        <p className="text-xs font-semibold text-gray-400">Chit Value</p>
        <p className="text-lg font-black text-gold">₹5,00,000</p>
        <p className="text-[10px] text-gray-500 font-medium mt-0.5">23 Months Management</p>
      </div>
    </div>
  );
}
