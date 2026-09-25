import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatCurrency } from '../../utils/currency';

export default function MyChit() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChit = async () => {
      try {
        const res = await api.get('/member/chit');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChit();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="text-red-500 font-bold p-4">Could not load chit details.</div>;

  const { member, settings, liftMonth, currentPayment } = data;
  const isLifted = member.lift_status === 'lifted';

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
          <span>My Chit Details</span>
          <span className="text-gold text-2xl">👑</span>
        </h2>
        <p className="text-slate-300 font-medium mt-1">Official subscription terms, duration, and lifting records</p>
      </div>

      <div className="cyber-card rounded-3xl overflow-hidden border border-gold/40 shadow-2xl">
        <div className="p-7 bg-gradient-to-r from-amber-500/20 via-gold/10 to-transparent border-b border-gold/30">
          <p className="text-gold font-black text-xs uppercase tracking-wider mb-1">Total Chit Fund Value</p>
          <p className="text-4xl sm:text-5xl font-black text-white">{formatCurrency(settings?.chit_value || 500000)}</p>
          <p className="text-slate-300 font-bold mt-1 text-sm">{settings?.name || "MANI'S CHIT FUND"}</p>
        </div>
        
        <div className="p-6 space-y-4 divide-y divide-slate-800">
          <div className="flex justify-between items-center py-3">
            <span className="text-slate-300 font-bold text-base">Total Duration</span>
            <span className="text-xl font-black text-white">{settings?.duration || 23} Months</span>
          </div>
          
          <div className="flex justify-between items-center py-3">
            <span className="text-slate-300 font-bold text-base">Lift Status</span>
            <span className={`text-sm font-black px-3 py-1 rounded-xl ${isLifted ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-amber-950 text-amber-300 border border-amber-500/40'}`}>
              {isLifted ? '🟢 LIFTED' : '🟠 NOT YET LIFTED'}
            </span>
          </div>

          {isLifted && (
            <>
              <div className="flex justify-between items-center py-3">
                <span className="text-slate-300 font-bold text-base">Lift Month</span>
                <span className="text-lg font-black text-white">
                  {liftMonth ? `${liftMonth.month_label} (${liftMonth.calendar_month})` : `Month ${member.lift_month_id}`}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-slate-300 font-bold text-base">Receivable Amount</span>
                <span className="text-2xl font-black text-gold">
                  {formatCurrency(member.receivable_amount)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-slate-300 font-bold text-base">Lift Date</span>
                <span className="text-lg font-black text-white">{member.lift_date || '—'}</span>
              </div>
            </>
          )}

          <div className="flex justify-between items-center py-4 bg-slate-900/80 -mx-6 px-6 mt-4 border-t border-slate-800">
            <div>
              <span className="text-slate-200 font-black text-base block">Current Monthly Payment</span>
              <span className="text-xs text-gold font-bold">
                {isLifted ? 'Post-lift rate applied' : 'Pre-lift rate applied'}
              </span>
            </div>
            <span className="text-3xl font-black text-white">{formatCurrency(currentPayment)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
