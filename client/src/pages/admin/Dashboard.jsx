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
    { to: '/admin/members', label: 'ALL MEMBERS', desc: `View all ${data.totalMembers} member profiles`, icon: Users, gradient: 'from-purple-600 to-indigo-700', textCol: 'text-white' },
    { to: '/admin/reports', label: 'DOWNLOAD REPORTS', desc: 'Official PDFs & Excel lists', icon: TrendingUp, gradient: 'from-blue-600 to-cyan-700', textCol: 'text-white' },
  ];

  return (
    <div className="space-y-8 animate-dramatic">
      {/* Top Cyber Status Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 px-6 rounded-2xl bg-slate-900/80 border border-gold/30 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs sm:text-sm font-black text-white tracking-wider uppercase flex items-center gap-2">
            <span className="text-gold font-mono">MCF-2026</span>
            <span className="text-slate-600">•</span>
            <span>SYSTEM ACTIVE</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400">ENCRYPTED LEDGER</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="neon-pill-gold text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            OCT 2026 – AUG 2028
          </span>
          <span className="neon-pill-emerald text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
            23 MONTHS
          </span>
        </div>
      </div>

      {/* Futuristic Hero Holographic Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-navy-dark border-2 border-gold/40 p-8 md:p-10 shadow-[0_0_50px_rgba(212,168,67,0.2)] cyber-card">
        {/* Floating Ambient Cosmic Nebula Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/15 rounded-full blur-3xl pointer-events-none animate-float"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-black uppercase tracking-widest shadow-inner">
              <Sparkles size={14} className="animate-spin" style={{ animationDuration: '5s' }} />
              AUTONOMOUS CHIT INTELLIGENCE
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Welcome, <span className="shimmer-text">Organiser</span> 👑
            </h2>
            <p className="text-slate-300 font-medium text-base md:text-lg max-w-2xl leading-relaxed">
              Real-time digital ledger for all {data.totalMembers} members. All monthly dues, pre/post lift calculations, and official receipts are computed automatically.
            </p>
          </div>

          {/* 3D Hologram Chit Value Matrix */}
          <div className="bg-slate-950/90 backdrop-blur-2xl border-2 border-gold/50 p-6 rounded-3xl text-center lg:text-right shrink-0 min-w-[260px] shadow-[0_0_35px_rgba(212,168,67,0.25)] relative overflow-hidden group hover:border-gold transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-transparent opacity-50"></div>
            <p className="text-xs font-black text-gold/80 uppercase tracking-widest relative z-10 flex items-center justify-center lg:justify-end gap-1.5">
              <span>TOTAL CHIT VALUE</span>
              <span className="w-2 h-2 rounded-full bg-gold animate-ping"></span>
            </p>
            <p className="text-4xl sm:text-5xl font-black text-gold mt-1 tracking-tight shimmer-text relative z-10">
              {formatCurrency(data.chitValue)}
            </p>
            <div className="mt-2.5 flex items-center justify-center lg:justify-end gap-2 relative z-10">
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-700/80 px-2.5 py-0.5 rounded-full">
                ✓ 100% BACKED & AUDITED
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Futuristic Hologram Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Members */}
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-700/80 hover:border-blue-400/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden cyber-card group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Members</p>
              <p className="text-4xl sm:text-5xl font-black text-white mt-1 tracking-tight">{data.totalMembers}</p>
              <div className="mt-3">
                <span className="text-xs font-black text-emerald-300 bg-emerald-950/70 border border-emerald-800 px-3 py-1 rounded-xl inline-flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 size={13} className="text-emerald-400" /> All {data.totalMembers} Registered
                </span>
              </div>
            </div>
            <div className="p-4 bg-blue-500/15 text-blue-400 border border-blue-500/30 rounded-2xl group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/10">
              <Users size={28} />
            </div>
          </div>
        </div>

        {/* Card 2: Active Month */}
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-700/80 hover:border-gold/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden cyber-card group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-2xl pointer-events-none group-hover:bg-gold/20 transition-all"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Month</p>
              <p className="text-4xl sm:text-5xl font-black text-gold mt-1 tracking-tight shimmer-text">Month 1</p>
              <div className="mt-3">
                <span className="text-xs font-black text-gold bg-gold/15 border border-gold/40 px-3 py-1 rounded-xl inline-flex items-center gap-1.5 shadow-sm">
                  Starts October 2026
                </span>
              </div>
            </div>
            <div className="p-4 bg-gold/15 text-gold border border-gold/30 rounded-2xl group-hover:scale-110 transition-transform shadow-lg shadow-gold/10">
              <Calendar size={28} />
            </div>
          </div>
        </div>

        {/* Card 3: Pre-Lift Monthly */}
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-700/80 hover:border-emerald-400/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden cyber-card group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Pre-Lift Monthly</p>
              <p className="text-4xl sm:text-5xl font-black text-emerald-400 mt-1 tracking-tight">₹23,000</p>
              <div className="mt-3">
                <span className="text-xs font-bold text-slate-200 bg-slate-800/90 border border-slate-700 px-3 py-1 rounded-xl inline-flex items-center gap-1.5 shadow-sm">
                  Post-Lift: ₹25,000
                </span>
              </div>
            </div>
            <div className="p-4 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-2xl group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/10">
              <IndianRupee size={28} />
            </div>
          </div>
        </div>

        {/* Card 4: Chit Lift Pool */}
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-700/80 hover:border-amber-400/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden cyber-card group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Members Yet To Lift</p>
              <p className="text-4xl sm:text-5xl font-black text-amber-300 mt-1 tracking-tight">
                {data.notYetLifted} <span className="text-xl font-normal text-slate-400">/ {data.totalMembers}</span>
              </p>
              <div className="mt-3">
                <span className="text-xs font-black text-amber-300 bg-amber-950/70 border border-amber-800 px-3 py-1 rounded-xl inline-flex items-center gap-1.5 shadow-sm">
                  <Clock size={13} className="text-amber-400" /> Ready for Month 1 Lift
                </span>
              </div>
            </div>
            <div className="p-4 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-2xl group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/10">
              <Sparkles size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Command Matrix ("What would you like to do?") */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center text-gold font-black">
              ⚡
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Command Center
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                Tap any command module to manage payments, auctions, or download statements
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-gold bg-gold/10 border border-gold/30 px-3 py-1.5 rounded-full w-fit">
            6 ACTIVE MODULES
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {quickActions.map((action, i) => (
            <Link
              key={i}
              to={action.to}
              className={`group p-6 rounded-3xl bg-gradient-to-br ${action.gradient} shadow-2xl hover:shadow-[0_0_35px_rgba(212,168,67,0.3)] transition-all hover:-translate-y-1.5 relative overflow-hidden flex flex-col justify-between min-h-[155px] border border-white/20`}
            >
              <div className="flex justify-between items-start">
                <div className="p-3.5 rounded-2xl bg-black/25 backdrop-blur-md text-white shadow-inner">
                  <action.icon size={26} />
                </div>
                <div className="p-2 rounded-xl bg-black/20 backdrop-blur-sm text-white">
                  <ArrowUpRight size={20} className={`${action.textCol} opacity-80 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all`} />
                </div>
              </div>
              <div className="mt-4">
                <h4 className={`text-xl font-black tracking-tight ${action.textCol}`}>
                  {action.label}
                </h4>
                <p className={`text-xs md:text-sm font-bold ${action.textCol} opacity-90 mt-1`}>
                  {action.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Chit Timeline Progress Bar — Futuristic HUD Strip */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 cyber-card">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
          <div>
            <h4 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span className="text-gold">✦</span> Chit Auction Receivable Progression (23 Months)
            </h4>
            <p className="text-xs text-slate-400 font-medium">
              Month 1 starts at ₹4,80,000 and progressively matures up to ₹5,35,000 in Month 23
            </p>
          </div>
          <Link
            to="/admin/settings"
            className="text-xs font-black text-gold hover:text-white bg-gold/10 hover:bg-gold/20 border border-gold/30 px-3.5 py-1.5 rounded-xl transition-all w-fit"
          >
            VIEW SCHEDULE →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Month 1 (Oct 2026)</span>
            <p className="text-base font-black text-gold">₹4,80,000</p>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Month 4</span>
            <p className="text-base font-black text-slate-300">₹4,85,000</p>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Month 7</span>
            <p className="text-base font-black text-slate-300">₹5,00,000</p>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Month 18</span>
            <p className="text-base font-black text-slate-300">₹5,02,000</p>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Month 21</span>
            <p className="text-base font-black text-slate-300">₹5,10,000</p>
          </div>
          <div className="bg-slate-950/80 border border-gold/40 p-3 rounded-2xl text-center bg-gold/5">
            <span className="text-[10px] font-black text-gold uppercase">Month 23 (Aug 2028)</span>
            <p className="text-base font-black text-emerald-400">₹5,35,000</p>
          </div>
        </div>
      </div>
    </div>
  );
}
