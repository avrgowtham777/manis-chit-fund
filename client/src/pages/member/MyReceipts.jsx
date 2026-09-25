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
      <h2 className="text-2xl md:text-3xl font-bold text-navy">My Payment Receipts</h2>
      
      <div className="space-y-4">
        {receipts.map((r) => (
          <div key={r.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <p className="font-black text-navy text-xl">{r.month_label}</p>
                <StatusBadge status={r.status} />
              </div>
              <p className="text-gray-500 font-medium text-sm mt-0.5">{r.calendar_month}</p>
              
              <div className="mt-2 flex flex-wrap gap-4 text-base">
                <div>
                  <span className="text-gray-500 text-sm">Receipt: </span>
                  <span className="font-mono font-bold text-navy">{r.receipt_number}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Date: </span>
                  <span className="font-semibold text-gray-700">{r.payment_date || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Paid: </span>
                  <span className="font-black text-green-600">{formatCurrency(r.amount_paid)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => downloadReceipt(r.id, r.receipt_number)}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-navy text-gold hover:bg-navy-dark font-bold text-base rounded-xl shadow transition-all shrink-0"
            >
              <Download size={20} />
              DOWNLOAD PDF
            </button>
          </div>
        ))}
        {receipts.length === 0 && (
          <div className="bg-white rounded-xl p-10 text-center shadow">
            <p className="text-gray-500 font-bold text-lg">No payment receipts available yet.</p>
            <p className="text-gray-400 text-sm mt-1">Once payments are recorded by the organiser, your official receipts will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
