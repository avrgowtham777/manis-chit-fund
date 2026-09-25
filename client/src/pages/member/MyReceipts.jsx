import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { Download } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export default function MyReceipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const { data } = await api.get('/member/receipts');
      setReceipts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async (paymentId, receiptNumber) => {
    try {
      const response = await api.get(`/member/receipts/${paymentId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${receiptNumber || paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Receipt download failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
          <span>My Payment Receipts</span>
          <span className="text-gold text-2xl">🧾</span>
        </h2>
        <p className="text-slate-300 font-medium mt-1">Download official PDF receipts for your payment records</p>
      </div>
      
      <div className="space-y-4">
        {receipts.map((r) => (
          <div key={r.id} className="cyber-card rounded-3xl p-6 border border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-3">
                <p className="font-black text-white text-xl">{r.month_label}</p>
                <StatusBadge status={r.status} />
              </div>
              <p className="text-gold font-bold text-xs mt-1 uppercase tracking-wider">{r.calendar_month}</p>
              
              <div className="mt-3 flex flex-wrap gap-4 text-sm bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-slate-400 text-xs font-bold uppercase block">Receipt</span>
                  <span className="font-mono font-black text-gold text-sm">{r.receipt_number}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs font-bold uppercase block">Date</span>
                  <span className="font-semibold text-slate-200 text-sm">{r.payment_date || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs font-bold uppercase block">Paid</span>
                  <span className="font-black text-emerald-400 text-base">{formatCurrency(r.amount_paid)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => downloadReceipt(r.id, r.receipt_number)}
              className="gold-glow-button flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shrink-0"
            >
              <Download size={18} />
              DOWNLOAD PDF
            </button>
          </div>
        ))}
        {receipts.length === 0 && (
          <div className="cyber-card rounded-3xl p-10 text-center border border-slate-800 shadow-xl">
            <p className="text-white font-black text-xl">No payment receipts available yet.</p>
            <p className="text-slate-400 text-sm mt-1">Once payments are recorded by the organiser, your official receipts will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
