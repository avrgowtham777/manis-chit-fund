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
    <div className="cyber-card rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-black text-slate-900 uppercase tracking-wider">Month</th>
              <th className="px-6 py-4 text-right text-sm font-black text-slate-900 uppercase tracking-wider">Due</th>
              <th className="px-6 py-4 text-right text-sm font-black text-slate-900 uppercase tracking-wider">Paid</th>
              <th className="px-6 py-4 text-right text-sm font-black text-slate-900 uppercase tracking-wider">Remaining</th>
              <th className="px-6 py-4 text-center text-sm font-black text-slate-900 uppercase tracking-wider">Status</th>
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
                  className={onRowClick ? "cursor-pointer hover:bg-amber-50/50 transition-colors" : "hover:bg-slate-50 transition-colors"}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-base font-black text-slate-900">{label}</span>
                    {calendar && <span className="block text-xs font-bold text-slate-500">{calendar}</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-right font-bold text-slate-800">{formatCurrency(due)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-right font-black text-emerald-600">{formatCurrency(paid)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-right font-black text-rose-600">{formatCurrency(remaining)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center"><StatusBadge status={p.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile-Friendly Card View (Large text & touch targets for 35+ users) */}
      <div className="md:hidden divide-y divide-slate-800 p-4 space-y-4">
        {payments.map((p, i) => {
          const due = p.amount_due != null ? p.amount_due : (p.due != null ? p.due : 0);
          const paid = p.amount_paid != null ? p.amount_paid : (p.paid != null ? p.paid : 0);
          const remaining = p.remaining_amount != null ? p.remaining_amount : (due - paid);
          const label = p.month_label || p.monthLabel || (p.month_number ? `Month ${p.month_number}` : `Month ${p.month_id || p.month || (i + 1)}`);
          const calendar = p.calendar_month || '';

          return (
            <div 
              key={p.id || i} 
              className={`p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md ${onRowClick ? 'cursor-pointer active:scale-95 transition-transform' : ''}`} 
              onClick={() => onRowClick && onRowClick(p)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xl font-black text-white">{label}</span>
                  {calendar && <span className="block text-xs font-bold text-gold">{calendar}</span>}
                </div>
                <StatusBadge status={p.status} />
              </div>
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <div>
                  <span className="block text-[11px] font-black text-slate-400 uppercase">DUE</span>
                  <span className="text-sm font-bold text-white">{formatCurrency(due)}</span>
                </div>
                <div>
                  <span className="block text-[11px] font-black text-emerald-400 uppercase">PAID</span>
                  <span className="text-sm font-black text-emerald-300">{formatCurrency(paid)}</span>
                </div>
                <div>
                  <span className="block text-[11px] font-black text-rose-400 uppercase">PENDING</span>
                  <span className="text-sm font-black text-rose-300">{formatCurrency(remaining)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
