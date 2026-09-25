import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function MemberNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/member/notifications');
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/member/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Notifications</span>
            <span className="text-gold text-2xl">🔔</span>
          </h2>
          <p className="text-slate-300 font-medium mt-1">Live updates on chit lifts, payment verifications, and reminders</p>
        </div>
        <span className="text-xs font-black text-gold bg-gold/20 px-3 py-1.5 rounded-xl border border-gold/40">
          {notifications.filter(n => !n.is_read).length} UNREAD
        </span>
      </div>

      <div className="space-y-4">
        {notifications.map((n) => {
          const isRead = n.is_read === 1;
          return (
            <div 
              key={n.id} 
              onClick={() => !isRead && markRead(n.id)}
              className={`cyber-card p-5 rounded-3xl border transition-all ${
                isRead 
                  ? 'border-slate-800 bg-slate-900/60 opacity-80' 
                  : 'border-gold/50 bg-slate-900/90 shadow-2xl cursor-pointer hover:border-gold'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">
                    {n.type === 'payment' ? '💳' : n.type === 'lift' ? '🎉' : '🔔'}
                  </span>
                  <h3 className={`text-lg sm:text-xl font-black ${isRead ? 'text-slate-300' : 'text-white'}`}>
                    {n.title}
                  </h3>
                </div>
                {!isRead && (
                  <span className="bg-gold text-slate-950 text-xs px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider shadow">
                    NEW
                  </span>
                )}
              </div>
              <p className="text-slate-200 text-sm sm:text-base mt-2 font-medium leading-relaxed">{n.message}</p>
              <div className="flex justify-between items-center mt-3 text-xs text-slate-400 font-bold">
                <span>{n.created_at}</span>
                {!isRead && <span className="text-gold">Tap to mark as read</span>}
              </div>
            </div>
          );
        })}
        {notifications.length === 0 && (
          <div className="cyber-card rounded-3xl p-10 text-center border border-slate-800 shadow-xl">
            <p className="text-3xl mb-2">🔔</p>
            <p className="text-white font-black text-xl">No notifications right now.</p>
            <p className="text-slate-400 text-sm mt-1">Updates on your chit fund payments and lifts will be posted here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
