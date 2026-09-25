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
      <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-navy/10">
        <p className="text-base font-bold text-gray-500 uppercase tracking-wide">Your Monthly Payment</p>
        <p className="text-4xl font-black text-navy mt-1">
          {formatCurrency(data.currentPayment)}
        </p>

        {thisMonthPayment && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between bg-gray-50 p-4 rounded-xl">
            <div>
              <p className="text-sm font-bold text-gray-500">
                {thisMonthPayment.month_label} ({thisMonthPayment.calendar_month})
              </p>
              <p className="text-base font-bold text-navy">
                Due: {formatCurrency(thisMonthPayment.remaining_amount)}
              </p>
            </div>
            <StatusBadge status={thisMonthPayment.status} />
          </div>
        )}
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-200 text-center">
          <p className="text-sm font-bold text-gray-500 mb-1">TOTAL PAID</p>
          <p className="text-2xl font-black text-green-600">{formatCurrency(data.totalPaid)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-200 text-center">
          <p className="text-sm font-bold text-gray-500 mb-1">TOTAL PENDING</p>
          <p className="text-2xl font-black text-red-600">{formatCurrency(data.totalPending)}</p>
        </div>
      </div>

      {/* Chit Status Card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 flex justify-between items-center">
        <div>
          <p className="text-sm font-bold text-gray-500">CHIT STATUS</p>
          <p className={`text-2xl font-black mt-1 ${data.member?.lift_status === 'lifted' ? 'text-green-600' : 'text-navy'}`}>
            {data.member?.lift_status === 'lifted' ? '🎉 Lifted' : 'Not Yet Lifted'}
          </p>
          {data.liftMonth && (
            <p className="text-sm font-semibold text-gray-600 mt-1">
              Lift Month: {data.liftMonth.month_label} ({data.liftMonth.calendar_month})
            </p>
          )}
        </div>
        {data.member?.receivable_amount && (
          <div className="text-right">
            <p className="text-sm font-bold text-gray-500">Receivable Amount</p>
            <p className="text-xl font-black text-gold">{formatCurrency(data.member.receivable_amount)}</p>
          </div>
        )}
      </div>

      {/* Quick Navigation Buttons (Large for 35+ users) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <Link 
          to="/member/payments" 
          className="flex items-center p-5 bg-navy text-white rounded-xl shadow-md font-bold text-lg hover:bg-navy-dark transition-all"
        >
          <CreditCard size={28} className="mr-3 text-gold" /> MY PAYMENTS
        </Link>
        <Link 
          to="/member/chit" 
          className="flex items-center p-5 bg-navy text-white rounded-xl shadow-md font-bold text-lg hover:bg-navy-dark transition-all"
        >
          <IndianRupee size={28} className="mr-3 text-gold" /> MY CHIT DETAILS
        </Link>
        <Link 
          to="/member/receipts" 
          className="flex items-center p-5 bg-navy text-white rounded-xl shadow-md font-bold text-lg hover:bg-navy-dark transition-all"
        >
          <FileText size={28} className="mr-3 text-gold" /> MY RECEIPTS
        </Link>
        <Link 
          to="/member/notifications" 
          className="flex items-center justify-between p-5 bg-navy text-white rounded-xl shadow-md font-bold text-lg hover:bg-navy-dark transition-all"
        >
          <div className="flex items-center">
            <Bell size={28} className="mr-3 text-gold" /> NOTIFICATIONS
          </div>
          {data.unreadNotifications > 0 && (
            <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-black">
              {data.unreadNotifications} NEW
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
