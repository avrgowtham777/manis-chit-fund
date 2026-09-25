import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatCurrency } from '../../utils/currency';

export default function MyChit() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChit = async () => {
      try {
        const res = await api.get('/member/chit');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChit();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="text-red-500 font-bold p-4">Could not load chit details.</div>;

  const { member, settings, liftMonth, currentPayment } = data;
  const isLifted = member.lift_status === 'lifted';

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-navy">My Chit Details</h2>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
        <div className="p-6 bg-navy text-white border-b-4 border-gold">
          <p className="text-gold font-bold text-base mb-1">Chit Fund Value</p>
          <p className="text-4xl font-black">{formatCurrency(settings?.chit_value || 500000)}</p>
          <p className="text-gray-300 font-medium mt-1">{settings?.name || "MANI'S CHIT FUND"}</p>
        </div>
        
        <div className="p-6 space-y-4 divide-y divide-gray-100">
          <div className="flex justify-between items-center py-3">
            <span className="text-gray-600 font-bold text-lg">Total Duration</span>
            <span className="text-xl font-bold text-navy">{settings?.duration || 23} Months</span>
          </div>
          
          <div className="flex justify-between items-center py-3">
            <span className="text-gray-600 font-bold text-lg">Lift Status</span>
            <span className={`text-xl font-black ${isLifted ? 'text-green-600' : 'text-orange-600'}`}>
              {isLifted ? '🟢 LIFTED' : '🟠 NOT YET LIFTED'}
            </span>
          </div>

          {isLifted && (
            <>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600 font-bold text-lg">Lift Month</span>
                <span className="text-xl font-bold text-navy">
                  {liftMonth ? `${liftMonth.month_label} (${liftMonth.calendar_month})` : `Month ${member.lift_month_id}`}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600 font-bold text-lg">Receivable Amount</span>
                <span className="text-2xl font-black text-gold">
                  {formatCurrency(member.receivable_amount)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600 font-bold text-lg">Lift Date</span>
                <span className="text-xl font-bold text-navy">{member.lift_date || '—'}</span>
              </div>
            </>
          )}

          <div className="flex justify-between items-center py-3 bg-gray-50 -mx-6 px-6 mt-4">
            <div>
              <span className="text-gray-600 font-bold text-lg block">Current Monthly Payment</span>
              <span className="text-xs text-gray-500 font-medium">
                {isLifted ? 'Post-lift rate applied' : 'Pre-lift rate applied'}
              </span>
            </div>
            <span className="text-2xl font-black text-navy">{formatCurrency(currentPayment)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
