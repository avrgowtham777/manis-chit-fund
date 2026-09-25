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
      <h2 className="text-2xl md:text-3xl font-bold text-navy">Notifications & Alerts</h2>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-red-50 p-4 rounded-xl border border-red-200">
            <p className="text-red-800 font-bold">Pending</p>
            <p className="text-2xl font-black text-red-600">{summary.pendingCount || 0}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
            <p className="text-orange-800 font-bold">Partial</p>
            <p className="text-2xl font-black text-orange-600">{summary.partialCount || 0}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <p className="text-green-800 font-bold">Completed</p>
            <p className="text-2xl font-black text-green-600">{summary.completedCount || 0}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-navy mb-4">Recent System Notifications</h3>
        <div className="space-y-4">
          {notifications.map((n, i) => (
            <div key={i} className={`p-4 rounded-lg border-l-4 ${n.type === 'warning' ? 'bg-orange-50 border-orange-500' : 'bg-blue-50 border-blue-500'}`}>
              <p className="font-bold text-gray-800 text-lg">{n.title}</p>
              <p className="text-gray-600">{n.message}</p>
              <p className="text-sm text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          ))}
          {notifications.length === 0 && <p className="text-gray-500 text-lg">No new notifications.</p>}
        </div>
      </div>
    </div>
  );
}
