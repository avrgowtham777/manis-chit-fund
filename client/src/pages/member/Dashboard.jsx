import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import CurrencyDisplay from '../../components/CurrencyDisplay';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CreditCard, IndianRupee, FileText, Bell } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/member/dashboard');
        setData(res.data);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="p-4 text-red-500 font-bold">Failed to load dashboard.</div>;

  const memberName = data.member?.name || user?.username || 'Member';
  const thisMonthPayment = data.currentMonthPayment;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Welcome Greeting with Animated Glow & Floating Icons */}
      <div className="bg-gradient-to-r from-navy-dark via-navy to-slate-900 text-white rounded-3xl p-7 shadow-2xl border-2 border-gold/40 relative overflow-hidden animate-dramatic glow-card">
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-gold/20 rounded-full blur-2xl pointer-events-none animate-pulse-gold"></div>
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold/20 border border-gold/40 rounded-full text-gold font-black text-xs uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-gold animate-ping"></span>
              Starting October 2026
            </div>
            <h2 className="text-3xl sm:text-4xl font-black mt-1 text-white tracking-tight">
              Hello, <span className="shimmer-text">{memberName}</span> 👋
            </h2>
            <p className="text-gray-300 font-semibold mt-1.5 flex items-center gap-2">
              <span className="font-mono bg-navy-light/60 px-2.5 py-0.5 rounded-md border border-blue-400/30 text-gold font-bold">
                {data.member?.member_code}
              </span>
              <span>• Active Chit Member</span>
            </p>
          </div>
          <span className="text-4xl animate-float hidden sm:block">✨</span>
        </div>
      </div>

      {/* Primary Payment Due Card */}
      <div className="cyber-card rounded-3xl p-6 md:p-8 border border-gold/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-2xl pointer-events-none"></div>
        <p className="text-xs font-black text-gold uppercase tracking-wider">Your Monthly Chit Payment</p>
        <p className="text-4xl sm:text-5xl font-black text-white mt-1">
          {formatCurrency(data.currentPayment)}
        </p>

        {thisMonthPayment && (
          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div>
              <p className="text-xs font-bold text-slate-400">
                {thisMonthPayment.month_label} ({thisMonthPayment.calendar_month})
              </p>
              <p className="text-base font-black text-white mt-0.5">
                Due: <span className="text-gold">{formatCurrency(thisMonthPayment.remaining_amount)}</span>
              </p>
            </div>
            <StatusBadge status={thisMonthPayment.status} />
          </div>
        )}
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="cyber-card rounded-2xl p-5 border border-emerald-500/30 bg-emerald-950/20 text-center shadow-lg">
          <p className="text-xs font-black text-emerald-400 uppercase tracking-wider mb-1">TOTAL PAID</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-300">{formatCurrency(data.totalPaid)}</p>
        </div>
        <div className="cyber-card rounded-2xl p-5 border border-rose-500/30 bg-rose-950/20 text-center shadow-lg">
          <p className="text-xs font-black text-rose-400 uppercase tracking-wider mb-1">TOTAL PENDING</p>
          <p className="text-2xl sm:text-3xl font-black text-rose-300">{formatCurrency(data.totalPending)}</p>
        </div>
      </div>

      {/* Chit Status Card */}
      <div className="cyber-card rounded-2xl p-6 border border-slate-800 flex justify-between items-center shadow-lg">
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider">CHIT STATUS</p>
          <p className={`text-xl sm:text-2xl font-black mt-1 ${data.member?.lift_status === 'lifted' ? 'text-emerald-400' : 'text-amber-400'}`}>
            {data.member?.lift_status === 'lifted' ? '🎉 Lifted' : '🟠 Not Yet Lifted'}
          </p>
          {data.liftMonth && (
            <p className="text-xs font-semibold text-slate-300 mt-1">
              Lift Month: {data.liftMonth.month_label} ({data.liftMonth.calendar_month})
            </p>
          )}
        </div>
        {data.member?.receivable_amount && (
          <div className="text-right">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Receivable Amount</p>
            <p className="text-xl sm:text-2xl font-black text-gold">{formatCurrency(data.member.receivable_amount)}</p>
          </div>
        )}
      </div>

      {/* Quick Navigation Buttons (Large for 35+ users) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <Link 
          to="/member/payments" 
          className="cyber-card flex items-center p-5 rounded-2xl shadow-xl font-black text-base text-white border border-slate-700/80 hover:border-gold transition-all group"
        >
          <CreditCard size={28} className="mr-3 text-gold group-hover:scale-110 transition-transform" /> MY PAYMENTS
        </Link>
        <Link 
          to="/member/chit" 
          className="cyber-card flex items-center p-5 rounded-2xl shadow-xl font-black text-base text-white border border-slate-700/80 hover:border-gold transition-all group"
        >
          <IndianRupee size={28} className="mr-3 text-gold group-hover:scale-110 transition-transform" /> MY CHIT DETAILS
        </Link>
        <Link 
          to="/member/receipts" 
          className="cyber-card flex items-center p-5 rounded-2xl shadow-xl font-black text-base text-white border border-slate-700/80 hover:border-gold transition-all group"
        >
          <FileText size={28} className="mr-3 text-gold group-hover:scale-110 transition-transform" /> MY RECEIPTS
        </Link>
        <Link 
          to="/member/notifications" 
          className="cyber-card flex items-center justify-between p-5 rounded-2xl shadow-xl font-black text-base text-white border border-slate-700/80 hover:border-gold transition-all group"
        >
          <div className="flex items-center">
            <Bell size={28} className="mr-3 text-gold group-hover:scale-110 transition-transform" /> NOTIFICATIONS
          </div>
          {data.unreadNotifications > 0 && (
            <span className="bg-rose-600 text-white text-xs px-2.5 py-1 rounded-full font-black animate-pulse">
              {data.unreadNotifications} NEW
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
