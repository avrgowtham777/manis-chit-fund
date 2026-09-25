import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, IndianRupee, FileClock, ClipboardList, Database, Bell, Settings } from 'lucide-react';

const links = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/members', icon: Users, label: 'Members' },
  { to: '/admin/collection', icon: FileText, label: 'Current Month' },
  { to: '/admin/payments', icon: IndianRupee, label: 'Record Payment' },
  { to: '/admin/payments/pending', icon: FileClock, label: 'Pending Payments' },
  { to: '/admin/chit-lift', icon: IndianRupee, label: 'Chit Lifting' },
  { to: '/admin/reports', icon: ClipboardList, label: 'Reports' },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
  { to: '/admin/audit', icon: Database, label: 'Activity Log' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
  { to: '/admin/backup', icon: Database, label: 'Backup' },
];

export default function Sidebar({ onClose }) {
  return (
    <div className="h-full bg-navy text-white flex flex-col pt-16 md:pt-4">
      <div className="px-6 py-4 md:hidden border-b border-navy-light mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Menu</h2>
        <button onClick={onClose} className="p-2 bg-navy-light rounded-lg">X</button>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              end={link.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-lg font-medium rounded-lg transition-colors ${
                  isActive ? 'bg-gold text-navy font-bold' : 'text-gray-300 hover:bg-navy-light hover:text-white'
                }`
              }
            >
              <Icon size={24} className="mr-4" />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
