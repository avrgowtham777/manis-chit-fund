import { Download, UploadCloud } from 'lucide-react';
import api from '../../services/api';

export default function Backup() {

  const handleBackup = async () => {
    try {
      const response = await api.get('/admin/backup/download', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `chit-fund-backup-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Backup failed or not available yet.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-navy">Data Backup & Restore</h2>
      
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border-l-4 border-navy">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-navy mb-2">Download Database Backup</h3>
            <p className="text-gray-600 text-lg">Download a complete copy of all members, payments, and settings. Keep this file safe.</p>
          </div>
          <button 
            onClick={handleBackup}
            className="flex items-center justify-center w-full md:w-auto px-8 py-4 bg-navy text-white font-bold rounded-lg text-lg hover:bg-navy-dark shadow-md"
          >
            <Download size={24} className="mr-3" /> DOWNLOAD BACKUP
          </button>
        </div>
      </div>

      <div className="bg-red-50 rounded-xl shadow-md p-6 md:p-8 border border-red-200 mt-6">
        <h3 className="text-xl font-bold text-red-800 mb-2 flex items-center">
          <UploadCloud size={24} className="mr-2" /> Restore Database
        </h3>
        <p className="text-red-700 text-lg mb-6">Warning: Restoring will overwrite all current data. Only do this if you know what you are doing.</p>
        <button disabled className="px-6 py-3 bg-red-200 text-red-800 font-bold rounded-lg text-lg opacity-50 cursor-not-allowed">
          Restore Feature Disabled
        </button>
      </div>
    </div>
  );
}
