import { useState } from 'react';
import { Download, RotateCcw, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function Backup() {
  const [resetting, setResetting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

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
      <div className="cyber-card rounded-3xl p-6 md:p-8 border-2 border-rose-500/50 bg-rose-950/20 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-2xl shrink-0 shadow-lg">
            <AlertTriangle size={32} />
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-black text-rose-300 flex items-center gap-2">
              <span>Reset System to Starting State</span>
              <span className="text-xl">⚠️</span>
            </h3>
            <p className="text-rose-200 text-base font-medium leading-relaxed max-w-2xl">
              Use this when you are done testing and want to start fresh with real members:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1.5 font-semibold pt-1">
              <li>Resets all 15 members to <span className="text-amber-400 font-bold">NOT LIFTED</span>.</li>
              <li>Resets all 345 monthly payments back to <span className="text-amber-400 font-bold">₹23,000 PENDING</span> (₹0 paid).</li>
              <li>Clears all test receipts and notifications.</li>
              <li>Restores default passwords (<code className="bg-slate-800 text-gold px-1.5 py-0.5 rounded border border-slate-700">Admin@123</code> & <code className="bg-slate-800 text-gold px-1.5 py-0.5 rounded border border-slate-700">Member@123</code>).</li>
              <li>Preserves Chit start date at <span className="text-gold font-bold">October 2026</span>.</li>
            </ul>

            <div className="pt-4">
              <button 
                onClick={() => setConfirmOpen(true)}
                disabled={resetting}
                className="flex items-center justify-center px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl text-base shadow-xl transition-all disabled:opacity-50 tracking-wider uppercase"
              >
                <RotateCcw size={20} className="mr-2" />
                {resetting ? 'RESETTING SYSTEM...' : 'RESET ALL DATA TO STARTING POINT'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="⚠️ DANGER: Reset Entire Chit Fund?"
        message="This will permanently delete all test payments, lift assignments, receipts, and notifications. All 15 member accounts will be reset to fresh starting status for October 2026. Do you want to proceed?"
        isWarn={true}
        onConfirm={handleReset}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
