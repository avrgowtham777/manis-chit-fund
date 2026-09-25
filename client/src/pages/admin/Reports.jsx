import { useState, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';
import api from '../../services/api';

export default function Reports() {
  const [months, setMonths] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [downloading, setDownloading] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moRes, memRes] = await Promise.all([
          api.get('/admin/settings/months'),
          api.get('/admin/members')
        ]);
        setMonths(moRes.data);
        if (moRes.data.length > 0) setSelectedMonth(moRes.data[0].id);
        setMembers(memRes.data);
        if (memRes.data.length > 0) setSelectedMember(memRes.data[0].id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleDownload = async (type, format) => {
    const key = `${type}-${format}`;
    setDownloading(key);
    try {
      let params = {};
      if (type === 'monthly') params.monthId = selectedMonth;
      if (type === 'member') params.memberId = selectedMember;

      const response = await api.get(`/admin/reports/download/${format}/${type}`, { 
        params,
        responseType: 'blob' 
      });

      const extension = format === 'excel' ? 'xlsx' : 'pdf';
      const mimeType = format === 'excel' 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        : 'application/pdf';

      const url = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_report.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Report download failed. Please verify the selections and try again.');
    } finally {
      setDownloading('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
          <span>Reports & Financial Statements</span>
          <span className="text-gold text-2xl">📊</span>
        </h2>
        <p className="text-slate-300 font-medium mt-1">Generate official PDF statements and Excel exports for records</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Monthly Collection Report */}
        <div className="cyber-card rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-start mb-4">
              <div className="p-3 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-2xl mr-4 shadow-lg">
                <FileText size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Monthly Collection Report</h3>
                <p className="text-slate-300 text-sm font-medium">Expected vs collected amounts and per-member status</p>
              </div>
            </div>

            <div className="my-4">
              <label className="block text-xs font-black text-gold uppercase tracking-wider mb-2">Select Month:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-3.5 border-2 border-gold/40 rounded-2xl font-bold text-base text-slate-900 bg-white shadow-lg focus:ring-2 focus:ring-gold"
              >
                {months.map(m => (
                  <option key={m.id} value={m.id}>{m.month_label} — {m.calendar_month}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 border-t border-slate-800/80 pt-4 mt-2">
            <button
              disabled={downloading === 'monthly-pdf'}
              onClick={() => handleDownload('monthly', 'pdf')}
              className="flex-1 flex items-center justify-center py-3 bg-rose-950/60 text-rose-300 font-black rounded-2xl hover:bg-rose-900/80 border border-rose-500/40 transition-all disabled:opacity-50 text-sm tracking-wider uppercase shadow-lg"
            >
              <Download size={18} className="mr-2" /> {downloading === 'monthly-pdf' ? 'Generating...' : 'PDF'}
            </button>
            <button
              disabled={downloading === 'monthly-excel'}
              onClick={() => handleDownload('monthly', 'excel')}
              className="flex-1 flex items-center justify-center py-3 bg-emerald-950/60 text-emerald-300 font-black rounded-2xl hover:bg-emerald-900/80 border border-emerald-500/40 transition-all disabled:opacity-50 text-sm tracking-wider uppercase shadow-lg"
            >
              <Download size={18} className="mr-2" /> {downloading === 'monthly-excel' ? 'Generating...' : 'EXCEL'}
            </button>
          </div>
        </div>

        {/* 2. Member Statement */}
        <div className="cyber-card rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-start mb-4">
              <div className="p-3 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-2xl mr-4 shadow-lg">
                <FileText size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Member Payment Statement</h3>
                <p className="text-slate-300 text-sm font-medium">Complete 23-month ledger for an individual member</p>
              </div>
            </div>

            <div className="my-4">
              <label className="block text-xs font-black text-gold uppercase tracking-wider mb-2">Select Member:</label>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full px-4 py-3.5 border-2 border-gold/40 rounded-2xl font-bold text-base text-slate-900 bg-white shadow-lg focus:ring-2 focus:ring-gold"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.member_code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 border-t border-slate-800/80 pt-4 mt-2">
            <button
              disabled={downloading === 'member-pdf'}
              onClick={() => handleDownload('member', 'pdf')}
              className="flex-1 flex items-center justify-center py-3 bg-rose-950/60 text-rose-300 font-black rounded-2xl hover:bg-rose-900/80 border border-rose-500/40 transition-all disabled:opacity-50 text-sm tracking-wider uppercase shadow-lg"
            >
              <Download size={18} className="mr-2" /> {downloading === 'member-pdf' ? 'Generating...' : 'PDF'}
            </button>
            <button
              disabled={downloading === 'member-excel'}
              onClick={() => handleDownload('member', 'excel')}
              className="flex-1 flex items-center justify-center py-3 bg-emerald-950/60 text-emerald-300 font-black rounded-2xl hover:bg-emerald-900/80 border border-emerald-500/40 transition-all disabled:opacity-50 text-sm tracking-wider uppercase shadow-lg"
            >
              <Download size={18} className="mr-2" /> {downloading === 'member-excel' ? 'Generating...' : 'EXCEL'}
            </button>
          </div>
        </div>

        {/* 3. Pending Payments Report */}
        <div className="cyber-card rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-start mb-4">
              <div className="p-3 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-2xl mr-4 shadow-lg">
                <FileText size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Pending Payments Report</h3>
                <p className="text-slate-300 text-sm font-medium">All pending and partial payments across all months</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 border-t border-slate-800/80 pt-4 mt-4">
            <button
              disabled={downloading === 'pending-pdf'}
              onClick={() => handleDownload('pending', 'pdf')}
              className="flex-1 flex items-center justify-center py-3 bg-rose-950/60 text-rose-300 font-black rounded-2xl hover:bg-rose-900/80 border border-rose-500/40 transition-all disabled:opacity-50 text-sm tracking-wider uppercase shadow-lg"
            >
              <Download size={18} className="mr-2" /> {downloading === 'pending-pdf' ? 'Generating...' : 'PDF'}
            </button>
            <button
              disabled={downloading === 'pending-excel'}
              onClick={() => handleDownload('pending', 'excel')}
              className="flex-1 flex items-center justify-center py-3 bg-emerald-950/60 text-emerald-300 font-black rounded-2xl hover:bg-emerald-900/80 border border-emerald-500/40 transition-all disabled:opacity-50 text-sm tracking-wider uppercase shadow-lg"
            >
              <Download size={18} className="mr-2" /> {downloading === 'pending-excel' ? 'Generating...' : 'EXCEL'}
            </button>
          </div>
        </div>

        {/* 4. Chit Lift Report */}
        <div className="cyber-card rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-start mb-4">
              <div className="p-3 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-2xl mr-4 shadow-lg">
                <FileText size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Chit Lift Report</h3>
                <p className="text-slate-300 text-sm font-medium">Schedule of 23 months with lifter name and receivable amount</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 border-t border-slate-800/80 pt-4 mt-4">
            <button
              disabled={downloading === 'lifts-pdf'}
              onClick={() => handleDownload('lifts', 'pdf')}
              className="flex-1 flex items-center justify-center py-3 bg-rose-950/60 text-rose-300 font-black rounded-2xl hover:bg-rose-900/80 border border-rose-500/40 transition-all disabled:opacity-50 text-sm tracking-wider uppercase shadow-lg"
            >
              <Download size={18} className="mr-2" /> {downloading === 'lifts-pdf' ? 'Generating...' : 'PDF'}
            </button>
            <button
              disabled={downloading === 'lifts-excel'}
              onClick={() => handleDownload('lifts', 'excel')}
              className="flex-1 flex items-center justify-center py-3 bg-emerald-950/60 text-emerald-300 font-black rounded-2xl hover:bg-emerald-900/80 border border-emerald-500/40 transition-all disabled:opacity-50 text-sm tracking-wider uppercase shadow-lg"
            >
              <Download size={18} className="mr-2" /> {downloading === 'lifts-excel' ? 'Generating...' : 'EXCEL'}
            </button>
          </div>
        </div>

        {/* 5. Complete 23-Month Report */}
        <div className="cyber-card rounded-3xl p-6 border border-slate-800 flex flex-col justify-between md:col-span-2">
          <div>
            <div className="flex items-start mb-4">
              <div className="p-3 bg-gold/20 text-gold border border-gold/40 rounded-2xl mr-4 shadow-lg">
                <FileText size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">Complete 23-Month Chit Fund Master Report</h3>
                <p className="text-slate-300 text-sm font-medium">Master ledger containing all member payments, lift status, and fund summary</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 border-t border-slate-800/80 pt-4 mt-2">
            <button
              disabled={downloading === 'complete-pdf'}
              onClick={() => handleDownload('complete', 'pdf')}
              className="flex-1 flex items-center justify-center py-3.5 bg-rose-950/80 text-rose-200 font-black rounded-2xl hover:bg-rose-900 border border-rose-500/50 transition-all disabled:opacity-50 text-sm tracking-wider uppercase shadow-xl"
            >
              <Download size={18} className="mr-2" /> {downloading === 'complete-pdf' ? 'Generating...' : 'DOWNLOAD FULL PDF REPORT'}
            </button>
            <button
              disabled={downloading === 'complete-excel'}
              onClick={() => handleDownload('complete', 'excel')}
              className="flex-1 flex items-center justify-center py-3.5 bg-emerald-950/80 text-emerald-200 font-black rounded-2xl hover:bg-emerald-900 border border-emerald-500/50 transition-all disabled:opacity-50 text-sm tracking-wider uppercase shadow-xl"
            >
              <Download size={18} className="mr-2" /> {downloading === 'complete-excel' ? 'Generating...' : 'DOWNLOAD FULL EXCEL SHEET'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
