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
        <h2 className="text-2xl md:text-3xl font-bold text-navy">Notifications</h2>
        <span className="text-sm font-semibold text-gray-500">
          {notifications.filter(n => !n.is_read).length} unread
        </span>
      </div>

      <div className="space-y-4">
        {notifications.map((n) => {
          const isRead = n.is_read === 1;
          return (
            <div 
              key={n.id} 
              onClick={() => !isRead && markRead(n.id)}
              className={`p-5 rounded-2xl border transition-all ${
                isRead 
                  ? 'bg-gray-50 border-gray-200' 
                  : 'bg-blue-50/70 border-blue-300 shadow-sm cursor-pointer hover:bg-blue-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {n.type === 'payment' ? '💳' : n.type === 'lift' ? '🎉' : '🔔'}
                  </span>
                  <h3 className={`text-xl ${isRead ? 'text-gray-700 font-bold' : 'text-navy font-black'}`}>
                    {n.title}
                  </h3>
                </div>
                {!isRead && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    NEW
                  </span>
                )}
              </div>
              <p className="text-gray-800 text-base mt-2 font-medium leading-relaxed">{n.message}</p>
              <div className="flex justify-between items-center mt-3 text-xs text-gray-400 font-medium">
                <span>{n.created_at}</span>
                {!isRead && <span className="text-blue-600 font-bold">Tap to mark as read</span>}
              </div>
            </div>
          );
        })}
        {notifications.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center shadow border border-gray-100">
            <p className="text-3xl mb-2">🔔</p>
            <p className="text-gray-500 font-bold text-lg">No notifications right now.</p>
            <p className="text-gray-400 text-sm mt-1">Updates on your chit fund payments and lifts will be posted here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
