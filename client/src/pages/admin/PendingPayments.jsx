import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency } from '../../utils/currency';

export default function PendingPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const { data } = await api.get('/admin/payments/pending');
        setPayments(data);
      } catch (error) {
        console.error('Failed to fetch pending payments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-rose-950/60 p-6 md:p-8 rounded-3xl border-2 border-rose-500/40 gap-4 shadow-2xl cyber-card">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-2">
            <span>Pending & Partial Payments</span>
            <span className="text-2xl">⚠️</span>
          </h2>
          <p className="text-rose-300 mt-1 font-semibold text-sm">Members with outstanding amounts across all months</p>
        </div>
        <span className="bg-rose-600 text-white px-5 py-2.5 rounded-2xl font-black text-xl shadow-lg border border-rose-400/50">
          {payments.length} Due Records
        </span>
      </div>

      <div className="cyber-card rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-black text-slate-900 uppercase tracking-wider">Member</th>
                <th className="px-6 py-4 text-left text-sm font-black text-slate-900 uppercase tracking-wider">Month</th>
                <th className="px-6 py-4 text-right text-sm font-black text-slate-900 uppercase tracking-wider">Amount Due</th>
                <th className="px-6 py-4 text-right text-sm font-black text-slate-900 uppercase tracking-wider">Amount Paid</th>
                <th className="px-6 py-4 text-right text-sm font-black text-slate-900 uppercase tracking-wider">Remaining</th>
                <th className="px-6 py-4 text-center text-sm font-black text-slate-900 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-center text-sm font-black text-slate-900 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-amber-50/40">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-lg font-bold text-navy">{p.member_name}</p>
                    <p className="text-sm font-medium text-gray-500">ID: {p.member_code || `MCF${String(p.member_id).padStart(3, '0')}`}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-lg font-semibold text-gray-900">{p.month_label || `Month ${p.month_id}`}</p>
                    <p className="text-sm text-gray-500">{p.calendar_month}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-medium text-right text-gray-900">
                    {formatCurrency(p.amount_due)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-right text-green-600">
                    {formatCurrency(p.amount_paid)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-black text-right text-red-600">
                    {formatCurrency(p.remaining_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => navigate('/admin/payments', { state: { memberId: p.member_id, monthId: p.month_id } })}
                      className="gold-glow-button px-4 py-2 text-slate-950 rounded-xl font-black text-xs shadow-md"
                    >
                      Record Payment
                    </button>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-green-700 font-bold text-xl">
                    🎉 All payments are up to date! No pending dues.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
