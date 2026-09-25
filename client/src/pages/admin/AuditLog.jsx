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
          <h2 className="text-2xl md:text-3xl font-bold text-navy">Activity & Audit Log</h2>
          <p className="text-gray-500 font-medium">Permanent tamper-evident audit history of all modifications</p>
        </div>
        <div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-base font-semibold focus:ring-navy focus:border-navy bg-white shadow-sm"
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
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Timestamp</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">User</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Action</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Old Value</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">New Value</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Reason / Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-xs">
                      {log.created_at}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-navy">
                      {log.username || 'System'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-navy/10 text-navy font-mono px-2.5 py-1 rounded-full font-bold text-xs uppercase">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate font-mono text-xs">
                      {formatJson(log.old_value)}
                    </td>
                    <td className="px-6 py-4 text-gray-800 font-medium max-w-xs truncate font-mono text-xs">
                      {formatJson(log.new_value)}
                    </td>
                    <td className="px-6 py-4 text-gray-600 italic">
                      {log.reason || '—'}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500 font-bold text-base">
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
