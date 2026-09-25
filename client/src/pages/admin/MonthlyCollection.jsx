import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import MonthNavigator from '../../components/MonthNavigator';
import LoadingSpinner from '../../components/LoadingSpinner';
import CurrencyDisplay from '../../components/CurrencyDisplay';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency } from '../../utils/currency';
import { Sparkles } from 'lucide-react';

export default function MonthlyCollection() {
  const { monthId } = useParams();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(monthId ? parseInt(monthId) : 1);
  const [months, setMonths] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonths = async () => {
      try {
        const res = await api.get('/admin/settings/months');
        setMonths(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMonths();
  }, []);

  useEffect(() => {
    const fetchMonthData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/admin/payments/month/${currentMonth}`);
        setData(data);
        window.history.replaceState(null, '', `/admin/collection/${currentMonth}`);
      } catch (error) {
        console.error('Failed to fetch month data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMonthData();
  }, [currentMonth]);

  if (loading && !data) return <LoadingSpinner />;
  if (!data) return <div className="p-6 text-red-500 font-bold">Failed to load data.</div>;

  const currentMonthInfo = months.find(m => m.id === currentMonth);
  const paidCount = data.payments.filter(p => p.status === 'paid').length;
  const totalCount = data.payments.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2">
          <span>Monthly Collection Dashboard</span>
          <Sparkles className="text-gold" size={24} />
        </h2>
        {currentMonthInfo && (
          <span className="text-base font-black text-gold bg-slate-900 border border-gold/40 px-4 py-2 rounded-xl shadow-lg w-fit">
            {currentMonthInfo.month_label} — {currentMonthInfo.calendar_month}
          </span>
        )}
      </div>

      <MonthNavigator 
        currentMonth={currentMonth} 
        totalMonths={23} 
        onChange={setCurrentMonth} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="cyber-card rounded-3xl p-6 border border-blue-500/30">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Expected Collection</p>
          <p className="text-3xl font-black text-white"><CurrencyDisplay amount={data.expected || 0} /></p>
        </div>
        <div className="cyber-card rounded-3xl p-6 border border-emerald-500/40">
          <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">Total Collected</p>
          <p className="text-3xl font-black text-emerald-400"><CurrencyDisplay amount={data.collected || 0} /></p>
        </div>
        <div className="cyber-card rounded-3xl p-6 border border-rose-500/40">
          <p className="text-xs font-black text-rose-400 uppercase tracking-widest mb-1">Total Pending</p>
          <p className="text-3xl font-black text-rose-400"><CurrencyDisplay amount={data.pending || 0} /></p>
        </div>
        <div className="cyber-card rounded-3xl p-6 border border-gold/40">
          <p className="text-xs font-black text-gold uppercase tracking-widest mb-1">Paid Members</p>
          <p className="text-3xl font-black text-gold">{paidCount} / {totalCount}</p>
        </div>
      </div>

      <div className="cyber-card rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        <div className="p-5 bg-slate-900/90 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-xl font-black text-white">Member Payments for Month {currentMonth}</h3>
          <span className="text-xs text-gold font-bold">Click Record Payment to update ledger</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-black text-slate-900 uppercase tracking-wider">Member</th>
                <th className="px-6 py-4 text-left text-sm font-black text-slate-900 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-right text-sm font-black text-slate-900 uppercase tracking-wider">Due</th>
                <th className="px-6 py-4 text-right text-sm font-black text-slate-900 uppercase tracking-wider">Paid</th>
                <th className="px-6 py-4 text-right text-sm font-black text-slate-900 uppercase tracking-wider">Remaining</th>
                <th className="px-6 py-4 text-center text-sm font-black text-slate-900 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-center text-sm font-black text-slate-900 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.payments.map((p) => (
                <tr 
                  key={p.id}
                  className={`hover:bg-gray-50 transition-colors ${p.status === 'paid' ? 'bg-green-50/20' : p.status === 'partial' ? 'bg-orange-50/20' : 'bg-red-50/20'}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-navy">{p.member_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base font-semibold text-gray-500">{p.member_code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-medium text-right text-gray-900">{formatCurrency(p.amount_due)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-right text-green-600">{formatCurrency(p.amount_paid)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-right text-red-600">{formatCurrency(p.remaining_amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => navigate('/admin/payments', { state: { memberId: p.member_id, monthId: currentMonth } })}
                      className="gold-glow-button px-4 py-2 text-slate-950 rounded-xl font-black text-xs shadow-md"
                    >
                      Record Payment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
