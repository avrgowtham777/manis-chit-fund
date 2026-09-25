import StatusBadge from './StatusBadge';
import { formatCurrency } from '../utils/currency';

export default function PaymentTable({ payments, onRowClick }) {
  if (!payments || payments.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500 font-bold text-lg">
        No payment records found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-base font-bold text-gray-700">Month</th>
              <th className="px-6 py-4 text-right text-base font-bold text-gray-700">Due</th>
              <th className="px-6 py-4 text-right text-base font-bold text-gray-700">Paid</th>
              <th className="px-6 py-4 text-right text-base font-bold text-gray-700">Remaining</th>
              <th className="px-6 py-4 text-center text-base font-bold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((p, i) => {
              const due = p.amount_due != null ? p.amount_due : (p.due != null ? p.due : 0);
              const paid = p.amount_paid != null ? p.amount_paid : (p.paid != null ? p.paid : 0);
              const remaining = p.remaining_amount != null ? p.remaining_amount : (due - paid);
              const label = p.month_label || p.monthLabel || (p.month_number ? `Month ${p.month_number}` : `Month ${p.month_id || p.month || (i + 1)}`);
              const calendar = p.calendar_month || '';

              return (
                <tr 
                  key={p.id || i} 
                  onClick={() => onRowClick && onRowClick(p)} 
                  className={onRowClick ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-bold text-navy">{label}</span>
                    {calendar && <span className="block text-sm text-gray-500">{calendar}</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-right font-medium text-gray-900">{formatCurrency(due)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-right font-bold text-green-600">{formatCurrency(paid)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg text-right font-black text-red-600">{formatCurrency(remaining)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center"><StatusBadge status={p.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile-Friendly Card View (Large text & touch targets for 35+ users) */}
      <div className="md:hidden divide-y divide-gray-200">
        {payments.map((p, i) => {
          const due = p.amount_due != null ? p.amount_due : (p.due != null ? p.due : 0);
          const paid = p.amount_paid != null ? p.amount_paid : (p.paid != null ? p.paid : 0);
          const remaining = p.remaining_amount != null ? p.remaining_amount : (due - paid);
          const label = p.month_label || p.monthLabel || (p.month_number ? `Month ${p.month_number}` : `Month ${p.month_id || p.month || (i + 1)}`);
          const calendar = p.calendar_month || '';

          return (
            <div 
              key={p.id || i} 
              className={`p-5 ${onRowClick ? 'cursor-pointer active:bg-gray-100' : ''}`} 
              onClick={() => onRowClick && onRowClick(p)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xl font-black text-navy">{label}</span>
                  {calendar && <span className="block text-sm font-semibold text-gray-500">{calendar}</span>}
                </div>
                <StatusBadge status={p.status} />
              </div>
              <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-lg text-center">
                <div>
                  <span className="block text-xs font-bold text-gray-500">DUE</span>
                  <span className="text-base font-bold text-gray-900">{formatCurrency(due)}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-500">PAID</span>
                  <span className="text-base font-bold text-green-600">{formatCurrency(paid)}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-500">PENDING</span>
                  <span className="text-base font-bold text-red-600">{formatCurrency(remaining)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
