import { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, MessageSquare, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { formatCurrency } from '../utils/currency';
import StatusBadge from './StatusBadge';
import { getPaymentWhatsAppShare } from '../utils/messaging';

export default function EditPaymentModal({ isOpen, payment, onClose, onSaved }) {
  if (!isOpen || !payment) return null;

  const [amountDue, setAmountDue] = useState(payment.amount_due || 23000);
  const [amountPaid, setAmountPaid] = useState(payment.amount_paid || 0);
  const [paymentDate, setPaymentDate] = useState(payment.payment_date || new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState(payment.payment_method || 'cash');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState(payment.notes || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedPayment, setSavedPayment] = useState(null);

  useEffect(() => {
    if (payment) {
      setAmountDue(payment.amount_due || 23000);
      setAmountPaid(payment.amount_paid || 0);
      setPaymentDate(payment.payment_date || new Date().toISOString().split('T')[0]);
      setPaymentMethod(payment.payment_method || 'cash');
      setNotes(payment.notes || '');
      setReason('');
      setError('');
      setSavedPayment(null);
    }
  }, [payment]);

  const numDue = Number(amountDue) || 0;
  const numPaid = Number(amountPaid) || 0;
  const newRemaining = Math.max(0, numDue - numPaid);
  let newStatus = 'pending';
  if (newRemaining <= 0 && numPaid > 0) newStatus = 'paid';
  else if (numPaid > 0) newStatus = 'partial';

  const handleSave = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason for editing this payment (e.g. "Typo correction: entered 20,000 instead of 10,000")');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const { data } = await api.put(`/admin/payments/${payment.id}`, {
        amount_due: numDue,
        amount_paid: numPaid,
        payment_date: paymentDate,
        payment_method: paymentMethod,
        notes: notes.trim(),
        reason: reason.trim()
      });
      setSavedPayment(data.payment);
      if (onSaved) onSaved(data.payment);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update payment');
    } finally {
      setSaving(false);
    }
  };

  const handleSendCorrectedWhatsApp = () => {
    if (!savedPayment) return;
    const share = getPaymentWhatsAppShare({
      memberName: savedPayment.member_name || payment.member_name,
      phone: savedPayment.phone || payment.phone,
      monthLabel: savedPayment.month_label || payment.month_label,
      calendarMonth: savedPayment.calendar_month || payment.calendar_month,
      amountDue: savedPayment.amount_due,
      amountPaid: savedPayment.amount_paid,
      remainingAmount: savedPayment.remaining_amount,
      status: savedPayment.status,
      receiptNumber: savedPayment.receipt_number || payment.receipt_number,
      paymentDate: savedPayment.payment_date
    });
    window.open(share.whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="cyber-card w-full max-w-xl rounded-3xl p-6 md:p-8 border border-gold/40 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-500/20 text-gold rounded-2xl border border-gold/30">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">Correct / Edit Payment</h3>
            <p className="text-sm font-semibold text-slate-300">
              <span className="text-gold font-bold">{payment.member_name}</span> ({payment.member_code}) — {payment.month_label}
            </p>
          </div>
        </div>

        {savedPayment ? (
          /* Success Screen with WhatsApp Button */
          <div className="space-y-6 animate-dramatic text-center py-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-3xl">
              ✅
            </div>
            <div>
              <h4 className="text-2xl font-black text-white">Payment Corrected Successfully!</h4>
              <p className="text-slate-300 text-sm mt-1">Audit log updated and database synced.</p>
            </div>

            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">New Amount Paid:</span>
                <span className="text-emerald-400 font-black">{formatCurrency(savedPayment.amount_paid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">New Remaining Due:</span>
                <span className="text-rose-400 font-black">{formatCurrency(savedPayment.remaining_amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">New Status:</span>
                <StatusBadge status={savedPayment.status} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleSendCorrectedWhatsApp}
                className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 uppercase tracking-wider shadow-lg"
              >
                <MessageSquare size={16} /> Send Corrected WhatsApp
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3.5 px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-sm rounded-xl uppercase tracking-wider"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Edit Form */
          <form onSubmit={handleSave} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-300 text-xs font-bold">
                ⚠️ {error}
              </div>
            )}

            {/* Current vs New comparison alert */}
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between items-center text-slate-400">
                <span>Previously Recorded:</span>
                <span className="font-bold text-slate-200">
                  Paid: <strong className="text-amber-400">{formatCurrency(payment.amount_paid)}</strong> | Remaining: {formatCurrency(payment.remaining_amount)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-emerald-400 font-bold">
                <span>New Value After Correction:</span>
                <span>
                  Paid: <strong className="text-emerald-300">{formatCurrency(numPaid)}</strong> | Remaining: <strong className="text-rose-300">{formatCurrency(newRemaining)}</strong>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1.5">
                  Amount Due (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={amountDue}
                  onChange={(e) => setAmountDue(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-2xl text-white font-bold text-base focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1.5">
                  Correct Amount Paid (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="e.g. 10000"
                  className="w-full px-4 py-3 bg-slate-900 border-2 border-emerald-500/60 rounded-2xl text-emerald-400 font-black text-lg focus:border-gold focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1.5">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-2xl text-white font-bold text-sm focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1.5">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-2xl text-white font-bold text-sm focus:border-gold focus:outline-none"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI / GPay / PhonePe</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Mandatory Reason for audit trail */}
            <div>
              <label className="block text-xs font-black text-amber-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Reason for Correction * (Mandatory for Audit Trail)</span>
                <span className="text-slate-400 text-2xs lowercase font-normal">will be permanently logged</span>
              </label>
              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Typo mistake: entered 20,000 instead of 10,000"
                className="w-full px-4 py-3 bg-slate-950 border-2 border-amber-500/50 rounded-2xl text-white font-bold text-sm focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1.5">
                Notes / Remarks (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..."
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:border-gold focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-sm uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 gold-glow-button py-3 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 uppercase tracking-wider shadow-xl disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? 'Saving Correction...' : 'Save Correction'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
