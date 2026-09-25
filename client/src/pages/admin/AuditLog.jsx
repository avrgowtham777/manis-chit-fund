import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/audit', {
        params: { action: actionFilter || undefined }
      });
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatJson = (str) => {
    if (!str) return '—';
    try {
      const parsed = typeof str === 'string' ? JSON.parse(str) : str;
      return Object.entries(parsed)
        .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
        .join(', ');
    } catch (e) {
      return String(str);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Activity & Audit Log</span>
            <span className="text-gold text-2xl">📜</span>
          </h2>
          <p className="text-slate-300 font-medium mt-1">Permanent tamper-evident audit history of all ledger modifications</p>
        </div>
        <div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-3.5 border-2 border-gold/40 rounded-2xl text-base font-bold text-slate-900 bg-white shadow-lg focus:ring-2 focus:ring-gold"
          >
            <option value="">All Actions</option>
            <option value="record_payment">Payments Recorded</option>
            <option value="edit_payment">Payment Edits</option>
            <option value="assign_lift">Chit Lifts Assigned</option>
            <option value="remove_lift">Chit Lifts Removed</option>
            <option value="update_settings">Settings Updates</option>
            <option value="update_month">Month Updates</option>
            <option value="create">Member Creations</option>
            <option value="archive">Member Archives</option>
            <option value="login">User Logins</option>
          </select>
        </div>
      </div>
      
      <div className="cyber-card rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-black text-slate-900 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 text-left text-sm font-black text-slate-900 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-sm font-black text-slate-900 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-left text-sm font-black text-slate-900 uppercase tracking-wider">Old Value</th>
                  <th className="px-6 py-4 text-left text-sm font-black text-slate-900 uppercase tracking-wider">New Value</th>
                  <th className="px-6 py-4 text-left text-sm font-black text-slate-900 uppercase tracking-wider">Reason / Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-amber-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-mono text-xs font-semibold">
                      {log.created_at}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-black text-slate-900">
                      {log.username || 'System'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-slate-900 text-gold border border-gold/30 font-mono px-2.5 py-1 rounded-xl font-bold text-xs uppercase shadow-sm">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate font-mono text-xs">
                      {formatJson(log.old_value)}
                    </td>
                    <td className="px-6 py-4 text-slate-800 font-bold max-w-xs truncate font-mono text-xs">
                      {formatJson(log.new_value)}
                    </td>
                    <td className="px-6 py-4 text-slate-700 italic font-medium">
                      {log.reason || '—'}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-slate-500 font-bold text-base">
                      No audit records found matching the filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
