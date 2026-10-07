import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDateTime } from '../../utils/date';
import { 
  FileText, 
  LogIn, 
  Shield, 
  User, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Edit3, 
  Globe, 
  RefreshCw,
  Search
} from 'lucide-react';

export default function AuditLog() {
  const [activeTab, setActiveTab] = useState('changes'); // 'changes' | 'logins'
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [loginStatusFilter, setLoginStatusFilter] = useState(''); // 'all' | 'success' | 'failed'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [activeTab, actionFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        category: activeTab,
        limit: 150
      };
      if (activeTab === 'changes' && actionFilter) {
        params.action = actionFilter;
      }
      const { data } = await api.get('/admin/audit', { params });
      setLogs(data || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const parseJsonSafe = (val) => {
    if (!val) return null;
    if (typeof val === 'object') return val;
    try {
      return JSON.parse(val);
    } catch {
      return null;
    }
  };

  const formatJson = (val) => {
    if (!val) return '—';
    const parsed = parseJsonSafe(val);
    if (!parsed) return String(val);

    return Object.entries(parsed)
      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
      .join(', ');
  };

  const getLogUsername = (log) => {
    if (log.username) return log.username;
    const parsed = parseJsonSafe(log.new_value);
    if (parsed?.username) return parsed.username;
    return 'Unknown';
  };

  const getLogRole = (log) => {
    if (log.user_role) return log.user_role;
    const parsed = parseJsonSafe(log.new_value);
    if (parsed?.role) return parsed.role;
    return '—';
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'edit_payment':
        return { label: 'Payment Edit', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'record_payment':
        return { label: 'Payment Recorded', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'assign_lift':
        return { label: 'Chit Lift Assigned', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' };
      case 'remove_lift':
        return { label: 'Chit Lift Removed', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      case 'update_member':
      case 'create':
        return { label: 'Member Profile', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
      case 'archive':
        return { label: 'Member Archived', color: 'bg-slate-700 text-slate-300 border-slate-600' };
      case 'reactivate':
        return { label: 'Member Reactivated', color: 'bg-teal-500/20 text-teal-300 border-teal-500/40' };
      case 'update_settings':
      case 'update_month':
        return { label: 'System Settings', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      default:
        return { label: action.replace('_', ' ').toUpperCase(), color: 'bg-slate-800 text-gold border-gold/30' };
    }
  };

  // Filter logs locally by search or login status
  const filteredLogs = logs.filter((log) => {
    if (activeTab === 'logins') {
      if (loginStatusFilter === 'success' && log.action !== 'login_success' && log.action !== 'login') {
        return false;
      }
      if (loginStatusFilter === 'failed' && log.action !== 'login_failed') {
        return false;
      }
    }

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const username = getLogUsername(log).toLowerCase();
    const memberName = (log.member_name || '').toLowerCase();
    const action = (log.action || '').toLowerCase();
    const reason = (log.reason || '').toLowerCase();
    const ip = (log.ip_address || '').toLowerCase();
    const oldVal = (typeof log.old_value === 'string' ? log.old_value : JSON.stringify(log.old_value || '')).toLowerCase();
    const newVal = (typeof log.new_value === 'string' ? log.new_value : JSON.stringify(log.new_value || '')).toLowerCase();

    return (
      username.includes(term) ||
      memberName.includes(term) ||
      action.includes(term) ||
      reason.includes(term) ||
      ip.includes(term) ||
      oldVal.includes(term) ||
      newVal.includes(term)
    );
  });

  // Login metrics
  const totalLogins = logs.length;
  const successLogins = logs.filter(l => l.action === 'login_success' || l.action === 'login').length;
  const failedLogins = logs.filter(l => l.action === 'login_failed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Activity & Audit Trail</span>
            <span className="text-gold text-2xl">🛡️</span>
          </h2>
          <p className="text-slate-300 font-medium mt-1">
            Independent, tamper-evident audit history of system updates and member/admin logins
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="self-start md:self-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-gold rounded-xl font-black text-xs uppercase tracking-wider border border-gold/30 flex items-center gap-2 shadow-lg transition-all"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 border-b border-slate-800 pb-4">
        <button
          onClick={() => { setActiveTab('changes'); setActionFilter(''); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all ${
            activeTab === 'changes'
              ? 'bg-gold text-slate-950 shadow-lg shadow-gold/20 scale-105'
              : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Edit3 size={16} />
          <span>📝 System Changes & Corrections</span>
        </button>

        <button
          onClick={() => { setActiveTab('logins'); setLoginStatusFilter(''); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all ${
            activeTab === 'logins'
              ? 'bg-gold text-slate-950 shadow-lg shadow-gold/20 scale-105'
              : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <LogIn size={16} />
          <span>🔐 Login Activity History</span>
        </button>
      </div>

      {/* Login Tab Summary Cards */}
      {activeTab === 'logins' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="cyber-card p-4 rounded-2xl border border-slate-700/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Total Recorded Logins</p>
              <p className="text-2xl font-black text-white mt-1">{totalLogins}</p>
            </div>
            <div className="p-3 bg-slate-800 text-slate-300 rounded-xl">
              <Clock size={20} />
            </div>
          </div>

          <div className="cyber-card p-4 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-emerald-400 uppercase tracking-wider">Successful Logins</p>
              <p className="text-2xl font-black text-emerald-300 mt-1">{successLogins}</p>
            </div>
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <CheckCircle size={20} />
            </div>
          </div>

          <div className="cyber-card p-4 rounded-2xl border border-rose-500/30 flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-rose-400 uppercase tracking-wider">Failed Attempts</p>
              <p className="text-2xl font-black text-rose-300 mt-1">{failedLogins}</p>
            </div>
            <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl">
              <AlertTriangle size={20} />
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user, member, reason, IP or action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-2xl text-white font-medium text-sm focus:border-gold focus:outline-none transition-colors"
          />
        </div>

        {activeTab === 'changes' ? (
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gold/40 rounded-2xl text-sm font-bold text-slate-900 bg-white shadow-lg focus:ring-2 focus:ring-gold"
          >
            <option value="">All Change Types</option>
            <option value="edit_payment">✏️ Payment Edits & Corrections</option>
            <option value="record_payment">💵 Payment Recorded</option>
            <option value="assign_lift">🏆 Chit Lift Assigned</option>
            <option value="remove_lift">❌ Chit Lift Removed</option>
            <option value="update_member">👤 Member Profile Updates</option>
            <option value="create">➕ Member Creations</option>
            <option value="archive">📦 Member Archives</option>
            <option value="reactivate">🔄 Member Reactivations</option>
            <option value="update_settings">⚙️ Settings Updates</option>
            <option value="update_month">📅 Month Updates</option>
          </select>
        ) : (
          <select
            value={loginStatusFilter}
            onChange={(e) => setLoginStatusFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gold/40 rounded-2xl text-sm font-bold text-slate-900 bg-white shadow-lg focus:ring-2 focus:ring-gold"
          >
            <option value="">All Login Statuses</option>
            <option value="success">🟢 Only Successful Logins</option>
            <option value="failed">🔴 Only Failed Attempts</option>
          </select>
        )}
      </div>

      {/* Log Table */}
      <div className="cyber-card rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        {loading ? (
          <LoadingSpinner />
        ) : activeTab === 'changes' ? (
          /* CHANGES TABLE */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-black text-slate-900 uppercase tracking-wider">Timestamp</th>
                  <th className="px-5 py-4 text-left text-xs font-black text-slate-900 uppercase tracking-wider">Modified By</th>
                  <th className="px-5 py-4 text-left text-xs font-black text-slate-900 uppercase tracking-wider">Action</th>
                  <th className="px-5 py-4 text-left text-xs font-black text-slate-900 uppercase tracking-wider">Previous Value</th>
                  <th className="px-5 py-4 text-left text-xs font-black text-slate-900 uppercase tracking-wider">New Value</th>
                  <th className="px-5 py-4 text-left text-xs font-black text-slate-900 uppercase tracking-wider">Reason / Audit Note</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm">
                {filteredLogs.map((log) => {
                  const badge = getActionLabel(log.action);
                  return (
                    <tr key={log.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap text-slate-600 font-mono text-xs font-semibold">
                        {formatDateTime(log.created_at) || log.created_at}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-slate-900">{log.username || 'Admin'}</span>
                          {log.user_role === 'admin' ? (
                            <span className="px-1.5 py-0.5 text-[10px] font-black uppercase rounded bg-amber-100 text-amber-800 border border-amber-300">
                              Admin
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-600">
                              {log.member_name || log.member_code || 'User'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`border font-mono px-2.5 py-1 rounded-xl font-black text-xs uppercase shadow-sm ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 max-w-xs truncate font-mono text-xs bg-slate-50/50">
                        {formatJson(log.old_value)}
                      </td>
                      <td className="px-5 py-4 text-slate-900 font-bold max-w-xs truncate font-mono text-xs bg-emerald-50/30">
                        {formatJson(log.new_value)}
                      </td>
                      <td className="px-5 py-4 text-slate-800 font-bold max-w-sm">
                        {log.reason ? (
                          <div className="inline-block px-2.5 py-1 rounded-lg bg-amber-100/70 border border-amber-300 text-amber-950 font-semibold text-xs">
                            💬 {log.reason}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-normal italic">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-bold text-base">
                      No system change records found matching the filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* LOGINS TABLE */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-black text-slate-900 uppercase tracking-wider">Timestamp</th>
                  <th className="px-5 py-4 text-left text-xs font-black text-slate-900 uppercase tracking-wider">Username</th>
                  <th className="px-5 py-4 text-left text-xs font-black text-slate-900 uppercase tracking-wider">Role</th>
                  <th className="px-5 py-4 text-left text-xs font-black text-slate-900 uppercase tracking-wider">Associated Member</th>
                  <th className="px-5 py-4 text-left text-xs font-black text-slate-900 uppercase tracking-wider">IP Address</th>
                  <th className="px-5 py-4 text-left text-xs font-black text-slate-900 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-left text-xs font-black text-slate-900 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm">
                {filteredLogs.map((log) => {
                  const isSuccess = log.action === 'login_success' || log.action === 'login';
                  const username = getLogUsername(log);
                  const role = getLogRole(log);

                  return (
                    <tr key={log.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap text-slate-600 font-mono text-xs font-semibold">
                        {formatDateTime(log.created_at) || log.created_at}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap font-black text-slate-900 font-mono">
                        {username}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                            <Shield size={12} />
                            Admin
                          </span>
                        ) : role === 'member' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black bg-cyan-100 text-cyan-900 border border-cyan-300">
                            <User size={12} />
                            Member
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap font-bold text-slate-800">
                        {log.member_name ? (
                          <span>{log.member_name} <span className="text-slate-400 font-mono text-xs">({log.member_code})</span></span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-slate-600 font-mono text-xs flex items-center gap-1 mt-1">
                        <Globe size={12} className="text-slate-400" />
                        <span>{log.ip_address || '—'}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {isSuccess ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle size={12} />
                            Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
                            <AlertTriangle size={12} />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-medium text-xs">
                        {log.reason || (isSuccess ? 'Login Successful' : 'Authentication Failed')}
                      </td>
                    </tr>
                  );
                })}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500 font-bold text-base">
                      No login activity records found matching the filter.
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
