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
        <h2 className="text-2xl md:text-3xl font-bold text-navy">Data Backup & System Reset</h2>
        <p className="text-gray-500 font-medium">Download database backups or reset all transactions back to starting point</p>
      </div>
      
      {/* Download Backup */}
      <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border-l-4 border-navy glow-card">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-navy mb-1.5">Download Complete Database Backup</h3>
            <p className="text-gray-600 text-base max-w-xl">
              Download a complete copy of all members, monthly payments, lift records, and audit logs. Store this backup safely.
            </p>
          </div>
          <button 
            onClick={handleBackup}
            className="flex items-center justify-center w-full md:w-auto px-6 py-3.5 bg-navy text-gold hover:bg-navy-dark font-black rounded-xl text-base shadow-md transition-all shrink-0"
          >
            <Download size={22} className="mr-2.5" /> DOWNLOAD BACKUP (.DB)
          </button>
        </div>
      </div>

      {/* Clean System Reset */}
      <div className="bg-red-50 rounded-2xl shadow-md p-6 md:p-8 border-2 border-red-300">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 text-red-700 rounded-xl shrink-0">
            <AlertTriangle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-red-900">
              Reset System to Starting State
            </h3>
            <p className="text-red-700 text-base font-medium leading-relaxed max-w-2xl">
              Use this when you are done testing and want to start fresh with real members:
            </p>
            <ul className="list-disc list-inside text-sm text-red-800 space-y-1 font-semibold pt-1">
              <li>Resets all 15 members to <span className="underline">NOT LIFTED</span>.</li>
              <li>Resets all 345 monthly payments back to <span className="underline">₹23,000 PENDING</span> (₹0 paid).</li>
              <li>Clears all test receipts and notifications.</li>
              <li>Restores default passwords (<code className="bg-red-100 px-1 py-0.5 rounded">Admin@123</code> & <code className="bg-red-100 px-1 py-0.5 rounded">Member@123</code>).</li>
              <li>Preserves Chit start date at <span className="underline">October 2026</span>.</li>
            </ul>

            <div className="pt-4">
              <button 
                onClick={() => setConfirmOpen(true)}
                disabled={resetting}
                className="flex items-center justify-center px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-base shadow-lg transition-all disabled:opacity-50"
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
