import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  IndianRupee, 
  FileClock, 
  PlusCircle, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Sparkles,
  TrendingUp
} from 'lucide-react';
import api from '../../services/api';
import CurrencyDisplay from '../../components/CurrencyDisplay';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatCurrency } from '../../utils/currency';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, notifRes, settingsRes, monthsRes] = await Promise.all([
          api.get('/admin/members').catch(() => ({ data: [] })),
          api.get('/admin/notifications/summary').catch(() => ({ data: { pending: 0, partial: 0, completed: 0 }})),
          api.get('/admin/settings/settings').catch(() => ({ data: { chit_value: 500000, duration: 23 }})),
          api.get('/admin/settings/months').catch(() => ({ data: [] }))
        ]);
        
        const members = membersRes.data || [];
        const activeMembers = members.filter(m => m.status === 'active');
        const liftedCount = activeMembers.filter(m => m.lift_status === 'lifted').length;
        const settings = settingsRes.data || {};
        const summary = notifRes.data || {};

        setData({
          totalMembers: activeMembers.length,
          liftedMembers: liftedCount,
          notYetLifted: activeMembers.length - liftedCount,
          currentMonth: 1,
          chitValue: settings.chit_value || 500000,
          duration: settings.duration || 23,
          startMonth: settings.start_month || 'October',
          startYear: settings.start_year || 2026,
          pendingCount: summary.pendingCount || 0,
          partialCount: summary.partialCount || 0,
          completedCount: summary.completedCount || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="text-red-400 text-xl font-bold p-6">Failed to load dashboard data.</div>;

  const quickActions = [
    { to: '/admin/collection', label: 'MONTH 1 COLLECTION', desc: 'View October 2026 Payments', icon: Calendar, gradient: 'from-amber-500 to-yellow-600', textCol: 'text-slate-950' },
    { to: '/admin/payments', label: 'RECORD PAYMENT', desc: 'One-click receipt & SMS alert', icon: IndianRupee, gradient: 'from-emerald-600 to-teal-700', textCol: 'text-white' },
    { to: '/admin/payments/pending', label: 'PENDING DUES', desc: 'Track overdue members', icon: FileClock, gradient: 'from-rose-600 to-red-700', textCol: 'text-white' },
    { to: '/admin/chit-lift', label: 'CHIT LIFTING', desc: 'Assign monthly winner', icon: FileText, gradient: 'from-indigo-600 to-blue-700', textCol: 'text-white' },
    { to: '/admin/members', label: 'ALL MEMBERS', desc: 'View 15 member profiles', icon: Users, gradient: 'from-purple-600 to-indigo-700', textCol: 'text-white' },
    { to: '/admin/reports', label: 'DOWNLOAD REPORTS', desc: 'Official PDFs & Excel lists', icon: TrendingUp, gradient: 'from-blue-600 to-cyan-700', textCol: 'text-white' },
  ];

  return (
    <div className="space-y-8 animate-dramatic">
      {/* Warm Welcome Banner for Mother */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-navy to-slate-900 border-2 border-gold/40 p-8 shadow-2xl glow-card">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 border border-gold/30 text-gold text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles size={14} className="animate-spin" style={{ animationDuration: '4s' }} />
              OCTOBER 2026 – AUGUST 2028
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              Welcome, <span className="shimmer-text">Organiser</span> 🌸
            </h2>
            <p className="text-gray-300 font-medium text-base md:text-lg mt-1 max-w-xl">
              All 15 members and payments are organized here in one simple screen. Everything updates automatically!
            </p>
          </div>

          <div className="bg-slate-950/70 backdrop-blur-md border border-slate-700 p-5 rounded-2xl text-center md:text-right shrink-0 min-w-[200px]">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Chit Value</p>
            <p className="text-3xl md:text-4xl font-black text-gold mt-0.5">
              {formatCurrency(data.chitValue)}
            </p>
            <p className="text-xs font-semibold text-emerald-400 mt-1">23 Months Duration</p>
          </div>
        </div>
      </div>

      {/* 4 Big Key Stats with Icons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden glow-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Members</p>
              <p className="text-3xl md:text-4xl font-black text-white mt-1">{data.totalMembers}</p>
              <p className="text-xs font-semibold text-emerald-400 mt-2 flex items-center gap-1">
                <CheckCircle2 size={14} /> All 15 Registered
              </p>
            </div>
            <div className="p-3.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl">
              <Users size={28} />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden glow-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Month</p>
              <p className="text-3xl md:text-4xl font-black text-gold mt-1">Month 1</p>
              <p className="text-xs font-semibold text-gray-400 mt-2">
                Starts October 2026
              </p>
            </div>
            <div className="p-3.5 bg-gold/10 text-gold border border-gold/20 rounded-2xl">
              <Calendar size={28} />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden glow-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pre-Lift Monthly</p>
              <p className="text-3xl md:text-4xl font-black text-emerald-400 mt-1">₹23,000</p>
              <p className="text-xs font-semibold text-gray-400 mt-2">
                Post-Lift: ₹25,000
              </p>
            </div>
            <div className="p-3.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl">
              <IndianRupee size={28} />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden glow-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Members Yet To Lift</p>
              <p className="text-3xl md:text-4xl font-black text-white mt-1">
                {data.notYetLifted} <span className="text-lg font-normal text-gray-400">/ 15</span>
              </p>
              <p className="text-xs font-semibold text-amber-400 mt-2 flex items-center gap-1">
                <Clock size={14} /> Ready for Month 1 Lift
              </p>
            </div>
            <div className="p-3.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl">
              <Sparkles size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Tiles — Large, Beautiful, Easy to Touch for Mom */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>What would you like to do?</span>
          </h3>
          <span className="text-xs font-semibold text-gray-400">Tap any button to open</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {quickActions.map((action, i) => (
            <Link
              key={i}
              to={action.to}
              className={`group p-6 rounded-3xl bg-gradient-to-br ${action.gradient} shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between min-h-[140px]`}
            >
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-2xl bg-black/20 backdrop-blur-sm text-white">
                  <action.icon size={26} />
                </div>
                <ArrowUpRight size={22} className={`${action.textCol} opacity-70 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all`} />
              </div>
              <div className="mt-4">
                <h4 className={`text-lg md:text-xl font-black tracking-tight ${action.textCol}`}>
                  {action.label}
                </h4>
                <p className={`text-xs md:text-sm font-medium ${action.textCol} opacity-80 mt-0.5`}>
                  {action.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
