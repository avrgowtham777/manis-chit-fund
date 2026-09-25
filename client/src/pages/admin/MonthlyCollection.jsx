import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import MonthNavigator from '../../components/MonthNavigator';
import LoadingSpinner from '../../components/LoadingSpinner';
import CurrencyDisplay from '../../components/CurrencyDisplay';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency } from '../../utils/currency';

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
        <h2 className="text-2xl md:text-3xl font-bold text-navy">Monthly Collection Dashboard</h2>
        {currentMonthInfo && (
          <span className="text-lg font-bold text-gold bg-navy px-4 py-1.5 rounded-lg w-fit">
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
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <p className="text-sm font-bold text-gray-500 mb-1">Expected Collection</p>
          <p className="text-2xl font-black text-navy"><CurrencyDisplay amount={data.expected || 0} /></p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <p className="text-sm font-bold text-gray-500 mb-1">Collected</p>
          <p className="text-2xl font-black text-green-600"><CurrencyDisplay amount={data.collected || 0} /></p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
          <p className="text-sm font-bold text-gray-500 mb-1">Pending</p>
          <p className="text-2xl font-black text-red-600"><CurrencyDisplay amount={data.pending || 0} /></p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-gold">
          <p className="text-sm font-bold text-gray-500 mb-1">Paid Members</p>
          <p className="text-2xl font-black text-navy">{paidCount} / {totalCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-5 bg-gray-50 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-navy">Member Payments for Month {currentMonth}</h3>
          <span className="text-sm font-medium text-gray-500">Click a member to record/update payment</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-base font-bold text-gray-700">Member</th>
                <th className="px-6 py-4 text-left text-base font-bold text-gray-700">ID</th>
                <th className="px-6 py-4 text-right text-base font-bold text-gray-700">Due</th>
                <th className="px-6 py-4 text-right text-base font-bold text-gray-700">Paid</th>
                <th className="px-6 py-4 text-right text-base font-bold text-gray-700">Remaining</th>
                <th className="px-6 py-4 text-center text-base font-bold text-gray-700">Status</th>
                <th className="px-6 py-4 text-center text-base font-bold text-gray-700">Action</th>
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
                      className="px-4 py-2 bg-navy text-gold hover:bg-navy-dark rounded-lg font-bold text-sm shadow"
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
