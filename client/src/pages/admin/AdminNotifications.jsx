import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nRes, sRes] = await Promise.all([
          api.get('/admin/notifications').catch(() => ({ data: [] })),
          api.get('/admin/notifications/summary').catch(() => ({ data: {} }))
        ]);
        setNotifications(nRes.data);
        setSummary(sRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
          <span>Notifications & Alerts</span>
          <span className="text-gold text-2xl">🔔</span>
        </h2>
        <p className="text-slate-300 font-medium mt-1">Live system notifications, collection milestones, and pending dues alerts</p>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="cyber-card p-5 rounded-2xl border border-rose-500/40 bg-rose-950/20 shadow-lg">
            <p className="text-xs font-black text-rose-400 uppercase tracking-wider">Pending Dues</p>
            <p className="text-3xl font-black text-rose-300 mt-1">{summary.pendingCount || 0}</p>
          </div>
          <div className="cyber-card p-5 rounded-2xl border border-amber-500/40 bg-amber-950/20 shadow-lg">
            <p className="text-xs font-black text-amber-400 uppercase tracking-wider">Partial Payments</p>
            <p className="text-3xl font-black text-amber-300 mt-1">{summary.partialCount || 0}</p>
          </div>
          <div className="cyber-card p-5 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 shadow-lg">
            <p className="text-xs font-black text-emerald-400 uppercase tracking-wider">Completed Payments</p>
            <p className="text-3xl font-black text-emerald-300 mt-1">{summary.completedCount || 0}</p>
          </div>
        </div>
      )}

      <div className="cyber-card rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl">
        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
          <span>Recent System Notifications</span>
          <span className="text-gold">✦</span>
        </h3>
        <div className="space-y-4">
          {notifications.map((n, i) => (
            <div key={i} className={`p-5 rounded-2xl border ${n.type === 'warning' ? 'bg-amber-950/20 border-amber-500/40' : 'bg-slate-900/80 border-slate-800'}`}>
              <p className="font-black text-white text-lg">{n.title}</p>
              <p className="text-slate-300 text-sm mt-1">{n.message}</p>
              <p className="text-xs text-gold font-mono mt-2">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          ))}
          {notifications.length === 0 && <p className="text-slate-400 text-base font-medium">No new notifications right now.</p>}
        </div>
      </div>
    </div>
  );
}
