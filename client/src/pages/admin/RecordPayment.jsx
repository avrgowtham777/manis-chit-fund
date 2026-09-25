import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import confetti from 'canvas-confetti';
import { formatCurrency } from '../../utils/currency';
import StatusBadge from '../../components/StatusBadge';
import { CheckCircle2, IndianRupee, User, Calendar, CreditCard, FileCheck, ArrowRight, Sparkles } from 'lucide-react';

export default function RecordPayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [months, setMonths] = useState([]);
  
  const [selectedMemberId, setSelectedMemberId] = useState(location.state?.memberId || '');
  const [selectedMonthId, setSelectedMonthId] = useState(location.state?.monthId || '');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');

  const [currentPayment, setCurrentPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [mRes, monthsRes] = await Promise.all([
          api.get('/admin/members'),
          api.get('/admin/settings/months')
        ]);
        setMembers(mRes.data.filter(m => m.status === 'active'));
        setMonths(monthsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDropdowns();
  }, []);

  // Fetch current payment status when member and month are selected
  useEffect(() => {
    const fetchPaymentStatus = async () => {
      if (selectedMemberId && selectedMonthId) {
        try {
          const { data } = await api.get('/admin/payments', {
            params: { memberId: selectedMemberId, monthId: selectedMonthId }
          });
          if (data.length > 0) {
            const payment = data[0];
            setCurrentPayment(payment);
            const remaining = payment.amount_due - payment.amount_paid;
            setAmountPaid(remaining > 0 ? remaining.toString() : '');
          } else {
            setCurrentPayment(null);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchPaymentStatus();
  }, [selectedMemberId, selectedMonthId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setReceipt(null);
    try {
      const { data } = await api.post('/admin/payments', {
        memberId: Number(selectedMemberId),
        monthId: Number(selectedMonthId),
        amountPaid: Number(amountPaid),
        paymentDate,
        paymentMethod,
        transactionReference: transactionRef,
        notes
      });
      setReceipt(data);
      // DRAMATIC CONFETTI EXPLOSION!
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10B981', '#d4a843', '#1e3a5f', '#F59E0B']
        });
      } catch (_) {}
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const amountDue = currentPayment?.amount_due || 0;
  const previouslyPaid = currentPayment?.amount_paid || 0;
  const remainingAfterPayment = Math.max(0, amountDue - previouslyPaid - Number(amountPaid || 0));

  // Receipt view after successful payment
  if (receipt) {
    const payment = receipt.payment;
    const member = receipt.member;
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-dramatic">
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border-4 border-gold relative overflow-hidden glow-card">
          <div className="text-center mb-6">
            <span className="inline-block px-4 py-1.5 bg-green-100 text-green-900 rounded-full font-black text-sm tracking-wider uppercase mb-2">
              ✅ Payment Successfully Confirmed
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-navy">MANI'S CHIT FUND</h2>
            <p className="text-gold font-bold text-lg">OFFICIAL PAYMENT RECEIPT</p>
          </div>
          
          <div className="border-t-2 border-dashed border-gray-300 pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 font-bold text-sm">Member</p>
                <p className="text-xl font-bold text-navy">{member?.name}</p>
              </div>
              <div>
                <p className="text-gray-500 font-bold text-sm">Member ID</p>
                <p className="text-xl font-bold text-gray-900">{member?.member_code}</p>
              </div>
              <div>
                <p className="text-gray-500 font-bold text-sm">Month</p>
                <p className="text-lg font-bold text-gray-900">{payment?.month_label}</p>
              </div>
              <div>
                <p className="text-gray-500 font-bold text-sm">Receipt Number</p>
                <p className="text-xl font-black text-gold">{receipt.receipt_number}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5 grid grid-cols-2 gap-4 mt-4 border border-gray-200">
              <div>
                <p className="text-gray-500 font-bold text-sm">Amount Due</p>
                <p className="text-2xl font-black text-gray-900">{formatCurrency(payment?.amount_due)}</p>
              </div>
              <div>
                <p className="text-gray-500 font-bold text-sm">Amount Paid</p>
                <p className="text-2xl font-black text-green-600">{formatCurrency(payment?.amount_paid)}</p>
              </div>
              <div>
                <p className="text-gray-500 font-bold text-sm">Remaining</p>
                <p className="text-2xl font-black text-red-600">{formatCurrency(payment?.remaining_amount)}</p>
              </div>
              <div>
                <p className="text-gray-500 font-bold text-sm">Status</p>
                <StatusBadge status={payment?.status} />
              </div>
              <div>
                <p className="text-gray-500 font-bold text-sm">Payment Date</p>
                <p className="text-base font-bold text-gray-800">{payment?.payment_date || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500 font-bold text-sm">Method</p>
                <p className="text-base font-bold text-gray-800 capitalize">{payment?.payment_method?.replace('_', ' ') || '—'}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                setReceipt(null);
                setAmountPaid('');
                setNotes('');
                setTransactionRef('');
                setCurrentPayment(null);
              }}
              className="flex-1 py-4 bg-navy text-gold font-black rounded-xl text-lg hover:bg-navy-dark shadow-md"
            >
              RECORD ANOTHER PAYMENT
            </button>
            <button
              onClick={() => navigate('/admin/collection')}
              className="flex-1 py-4 bg-gray-200 text-navy font-bold rounded-xl text-lg hover:bg-gray-300"
            >
              VIEW COLLECTION
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2">
          <span>Record Member Payment</span>
          <Sparkles className="text-gold" size={26} />
        </h2>
        <p className="text-gold font-bold text-sm mt-1">Select a member and month to record an official payment receipt</p>
      </div>

      <div className="cyber-card rounded-3xl p-6 md:p-10 border border-gold/30 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            {/* Member Selector */}
            <div>
              <label className="block text-base font-black text-white mb-2 flex items-center gap-2">
                <User size={18} className="text-gold" />
                Select Member *
              </label>
              <select
                required
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gold/50 bg-white text-slate-950 focus:border-gold focus:ring-4 focus:ring-gold/20 text-lg font-black shadow-md transition-all"
              >
                <option value="">-- Choose Member --</option>
                {members.map(m => (
                  <option key={m.id} value={m.id} className="text-slate-900 py-1">
                    {m.name} ({m.member_code})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Month Selector */}
              <div>
                <label className="block text-base font-black text-white mb-2 flex items-center gap-2">
                  <Calendar size={18} className="text-gold" />
                  Select Month *
                </label>
                <select
                  required
                  value={selectedMonthId}
                  onChange={(e) => setSelectedMonthId(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-gold/50 bg-white text-slate-950 focus:border-gold focus:ring-4 focus:ring-gold/20 text-base font-black shadow-md transition-all"
                >
                  <option value="">-- Select Month --</option>
                  {months.map(m => (
                    <option key={m.id} value={m.id} className="text-slate-900 py-1">
                      {m.month_label} — {m.calendar_month}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-base font-black text-white mb-2 flex items-center gap-2">
                  <Calendar size={18} className="text-gold" />
                  Payment Date *
                </label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-gold/50 bg-white text-slate-950 focus:border-gold focus:ring-4 focus:ring-gold/20 text-base font-black shadow-md transition-all"
                />
              </div>
            </div>
          </div>

          {/* Member Monthly Due Summary Card */}
          {currentPayment && (
            <div className="bg-slate-950/90 p-5 rounded-2xl border border-slate-800 grid grid-cols-3 gap-4 shadow-inner">
              <div>
                <p className="text-slate-400 font-black text-xs uppercase tracking-wider mb-1">Amount Due</p>
                <p className="text-2xl font-black text-white">{formatCurrency(amountDue)}</p>
              </div>
              <div>
                <p className="text-slate-400 font-black text-xs uppercase tracking-wider mb-1">Previously Paid</p>
                <p className="text-2xl font-black text-emerald-400">{formatCurrency(previouslyPaid)}</p>
              </div>
              <div>
                <p className="text-slate-400 font-black text-xs uppercase tracking-wider mb-1">Status</p>
                <StatusBadge status={currentPayment.status} />
              </div>
            </div>
          )}

          {/* Amount and Remaining */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-base font-black text-white mb-2 flex items-center gap-2">
                <IndianRupee size={18} className="text-emerald-400" />
                Amount Paying Now (₹) *
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 23000"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border-2 border-emerald-500 bg-white text-slate-950 focus:border-gold focus:ring-4 focus:ring-gold/20 text-2xl font-black shadow-lg"
              />
            </div>

            <div className="flex flex-col justify-center bg-slate-950/90 p-5 rounded-2xl border border-slate-800">
              <p className="text-slate-400 font-black text-xs uppercase tracking-wider">Remaining Balance After Payment</p>
              <p className={`text-3xl font-black mt-1 ${remainingAfterPayment > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {formatCurrency(remainingAfterPayment)}
              </p>
            </div>

            <div>
              <label className="block text-base font-black text-white mb-2 flex items-center gap-2">
                <CreditCard size={18} className="text-gold" />
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gold/50 bg-white text-slate-950 focus:border-gold focus:ring-4 focus:ring-gold/20 text-base font-black shadow-md"
              >
                <option value="cash" className="text-slate-900">💵 Cash</option>
                <option value="upi" className="text-slate-900">📱 UPI / GPay / PhonePe</option>
                <option value="bank_transfer" className="text-slate-900">🏦 Bank Transfer (NEFT/IMPS)</option>
                <option value="other" className="text-slate-900">📝 Other</option>
              </select>
            </div>

            <div>
              <label className="block text-base font-black text-white mb-2">
                Transaction Reference (Optional)
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gold/50 bg-white text-slate-950 focus:border-gold focus:ring-4 focus:ring-gold/20 text-base font-bold shadow-md"
                placeholder="e.g. UPI Ref / GPay Transaction ID"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-base font-black text-white mb-2">
                Notes / Remarks (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gold/50 bg-white text-slate-950 focus:border-gold focus:ring-4 focus:ring-gold/20 text-base font-medium shadow-md"
                placeholder="Any special remarks..."
              />
            </div>
          </div>

          {/* Big Confirm Button */}
          <div className="pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={loading || !selectedMemberId || !selectedMonthId || !amountPaid}
              className="w-full py-5 rounded-2xl gold-glow-button text-slate-950 font-black text-xl shadow-[0_0_35px_rgba(212,168,67,0.45)] transition-all disabled:opacity-40 flex items-center justify-center gap-2 border-2 border-gold/80"
            >
              <span>{loading ? 'RECORDING PAYMENT...' : 'CONFIRM & SAVE PAYMENT 🚀'}</span>
              <ArrowRight size={22} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
