import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CreditCard, IndianRupee, FileText, Bell, User } from 'lucide-react';

const tabs = [
  { to: '/member', icon: LayoutDashboard, label: 'Home' },
  { to: '/member/payments', icon: CreditCard, label: 'Payments' },
  { to: '/member/chit', icon: IndianRupee, label: 'Chit' },
  { to: '/member/receipts', icon: FileText, label: 'Receipts' },
  { to: '/member/notifications', icon: Bell, label: 'Alerts' },
  { to: '/member/profile', icon: User, label: 'Profile' },
];

export default function MobileNav() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 flex justify-around items-center z-50 h-20 px-2 pb-safe shadow-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/member'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full p-1 transition-all ${
                isActive 
                  ? 'text-gold font-black scale-110' 
                  : 'text-gray-400 hover:text-gray-200'
              }`
            }
          >
            <Icon size={24} className="mb-1" />
            <span className="text-[10px] sm:text-xs text-center leading-tight">{tab.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
}
