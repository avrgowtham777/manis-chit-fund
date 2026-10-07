import { useState, useEffect } from 'react';
import { Download, RotateCcw, AlertTriangle, Cloud, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function Backup() {
  const [resetting, setResetting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cloudStatus, setCloudStatus] = useState(null);
  const [syncingCloud, setSyncingCloud] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  const fetchCloudStatus = async () => {
    try {
      const { data } = await api.get('/admin/backup/cloud-status');
      setCloudStatus(data);
    } catch (e) {
      console.error('Failed to get cloud sync status', e);
    }
  };

  useEffect(() => {
    fetchCloudStatus();
  }, []);

  const handleManualSync = async () => {
    setSyncingCloud(true);
    setSyncMsg('');
    try {
      const { data } = await api.post('/admin/backup/cloud-sync');
      setCloudStatus(data.status);
      setSyncMsg('✅ Synced to cloud successfully!');
      setTimeout(() => setSyncMsg(''), 4000);
    } catch (err) {
      setSyncMsg('❌ ' + (err.response?.data?.error || 'Sync failed'));
    } finally {
      setSyncingCloud(false);
    }
  };

  const handleBackup = async () => {
    try {
      const response = await api.get('/admin/backup/download', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `chit-fund-backup-${new Date().toISOString().split('T')[0]}.db`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Backup failed or not available.');
    }
  };

  const handleReset = async () => {
    setResetting(true);
    setConfirmOpen(false);
    try {
      const { data } = await api.post('/admin/backup/reset');
      alert(data.message || 'System has been reset cleanly to the starting state!');
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reset system.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
          <span>Data Backup & System Reset</span>
          <span className="text-gold text-2xl">🛡️</span>
        </h2>
        <p className="text-slate-300 font-medium mt-1">Download database backups or reset all transactions back to starting point</p>
      </div>
      
      {/* Cloud Persistence Card */}
      <div className={`cyber-card rounded-3xl p-6 md:p-8 border shadow-2xl transition-all ${
        cloudStatus?.enabled 
          ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 via-slate-900/60 to-slate-900/80' 
          : 'border-amber-500/40 bg-gradient-to-br from-amber-950/20 via-slate-900/60 to-slate-900/80'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className={`p-2.5 rounded-2xl border ${
                cloudStatus?.enabled ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
              }`}>
                <Cloud size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white flex items-center gap-2">
                  <span>Cloud Persistence & Auto-Sync</span>
                  <span className="text-gold text-lg">✦</span>
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {cloudStatus?.enabled ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Active & Protected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                      Local Mode (Ephemeral)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-slate-300 text-base max-w-2xl leading-relaxed">
              {cloudStatus?.enabled ? (
                <>
                  Every time you add a member, collect a payment, or assign a chit lift, your data is <strong className="text-emerald-300">automatically synchronized to private cloud storage</strong>. Your mother's records will never be lost when Render sleeps!
                </>
              ) : (
                <>
                  Render Free Web Services spin down after 15 minutes of inactivity and reset their temporary disk. To make your data permanent forever, set <code className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded border border-slate-700">GITHUB_TOKEN</code> in your Render Environment Variables.
                </>
              )}
            </p>

            {cloudStatus?.enabled && (
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400 pt-1">
                <span className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  Last Synced: <strong className="text-slate-200">{cloudStatus.lastSyncedAt ? new Date(cloudStatus.lastSyncedAt).toLocaleString('en-IN') : 'On next write'}</strong>
                </span>
                {cloudStatus.gistId && (
                  <span className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                    Storage ID: <strong className="text-slate-200">{cloudStatus.gistId.slice(0, 10)}...</strong>
                  </span>
                )}
                {syncMsg && (
                  <span className="text-sm font-bold text-emerald-400 animate-fade-in">{syncMsg}</span>
                )}
              </div>
            )}
          </div>

          {cloudStatus?.enabled && (
            <button
              onClick={handleManualSync}
              disabled={syncingCloud}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm shadow-xl tracking-wider uppercase shrink-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={18} className={syncingCloud ? 'animate-spin' : ''} />
              {syncingCloud ? 'Syncing...' : 'Sync Cloud Now'}
            </button>
          )}
        </div>
      </div>

      {/* Download Backup */}
      <div className="cyber-card rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
              <span>Download Complete Database Backup</span>
              <span className="text-gold text-lg">✦</span>
            </h3>
            <p className="text-slate-300 text-base max-w-xl">
              Download a complete snapshot of all members, monthly payments, lift records, and audit logs. Store this backup safely.
            </p>
          </div>
          <button 
            onClick={handleBackup}
            className="gold-glow-button flex items-center justify-center w-full md:w-auto px-6 py-3.5 rounded-2xl font-black text-base shadow-xl tracking-wider uppercase shrink-0"
          >
            <Download size={20} className="mr-2" /> DOWNLOAD BACKUP (.DB)
          </button>
        </div>
      </div>

      {/* Clean System Reset */}
      {/* Clean System Reset */}
      <div className="cyber-card rounded-3xl p-6 md:p-8 border-2 border-rose-500/50 bg-rose-950/20 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-2xl shrink-0 shadow-lg">
            <AlertTriangle size={32} />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-black text-rose-300 flex items-center gap-2">
              <span>Reset Transactions to Month 1 (October 2026)</span>
              <span className="text-xl">⚠️</span>
            </h3>
            <p className="text-rose-200 text-base font-medium leading-relaxed max-w-2xl">
              Use this when you are done testing payments and want to start fresh:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1.5 font-semibold pt-1">
              <li><strong className="text-emerald-400">🛡️ PRESERVES ALL MEMBERS:</strong> Any members you have added are safely kept!</li>
              <li>Resets all monthly payments back to <span className="text-amber-400 font-bold">₹23,000 PENDING</span> (₹0 paid).</li>
              <li>Resets all member accounts back to <span className="text-amber-400 font-bold">NOT LIFTED</span>.</li>
              <li>Clears test receipts and notifications.</li>
              <li>Preserves Chit start date at <span className="text-gold font-bold">October 2026</span>.</li>
            </ul>

            <div className="pt-4">
              <button 
                onClick={() => setConfirmOpen(true)}
                disabled={resetting}
                className="flex items-center justify-center px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl text-base shadow-xl transition-all disabled:opacity-50 tracking-wider uppercase"
              >
                <RotateCcw size={20} className="mr-2" />
                {resetting ? 'RESETTING TRANSACTIONS...' : 'RESET TRANSACTIONS (KEEP ALL MEMBERS)'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="⚠️ Reset All Payment Transactions?"
        message="This will reset all payments back to ₹0 paid / pending and clear test lift assignments. ALL your members (including newly added members) will be safely preserved. Do you want to proceed?"
        isWarn={true}
        onConfirm={handleReset}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
