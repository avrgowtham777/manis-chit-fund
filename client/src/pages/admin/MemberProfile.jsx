import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import StatusBadge from '../../components/StatusBadge';
import { User, Phone, IndianRupee, Calendar, Edit3, X, Save, MessageSquare } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { getPaymentWhatsAppShare, getReminderWhatsAppShare } from '../../utils/messaging';

export default function MemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchMemberData();
  }, [id]);

  const fetchMemberData = async () => {
    try {
      const res = await api.get(`/admin/members/${id}`);
      setMember(res.data.member);
      setPayments(res.data.payments);
    } catch (error) {
      console.error('Failed to fetch member:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    try {
      await api.put(`/admin/members/${id}/archive`);
      setShowArchiveConfirm(false);
      fetchMemberData();
    } catch (error) {
      console.error('Failed to archive:', error);
      alert('Failed to archive member');
    }
  };

  const handleReactivate = async () => {
    try {
      await api.put(`/admin/members/${id}/reactivate`);
      fetchMemberData();
    } catch (error) {
      console.error('Failed to reactivate:', error);
      alert('Failed to reactivate member');
    }
  };

  const handleResetPassword = async () => {
    try {
      await api.post(`/admin/members/${id}/reset-password`);
      setShowResetConfirm(false);
      alert('Password has been reset to default (Member@123)');
    } catch (error) {
      alert('Failed to reset password');
    }
  };

  const openEditModal = () => {
    setEditName(member.name || '');
    setEditPhone(member.phone || '');
    setEditNotes(member.notes || '');
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      alert('Member name cannot be empty');
      return;
    }
    setSavingEdit(true);
    try {
      await api.put(`/admin/members/${id}`, {
        name: editName.trim(),
        phone: editPhone.trim(),
        notes: editNotes.trim(),
        status: member.status
      });
      setIsEditOpen(false);
      await fetchMemberData();
      alert('Member details updated successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update member');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleSendWhatsApp = (p) => {
    let phone = member?.phone;
    if (!phone) {
      phone = window.prompt(`Enter 10-digit mobile number for ${member.name} to send WhatsApp:`);
      if (!phone || !phone.trim()) return;
      api.put(`/admin/members/${member.id}`, {
        phone: phone.trim(),
        name: member.name
      }).then(() => fetchMemberData()).catch(() => {});
    }

    if (p.status === 'paid') {
      const share = getPaymentWhatsAppShare({
        memberName: member.name,
        phone,
        monthLabel: p.month_label,
        calendarMonth: p.calendar_month,
        amountDue: p.amount_due,
        amountPaid: p.amount_paid,
        remainingAmount: p.remaining_amount,
        status: p.status,
        receiptNumber: p.receipt_number,
        paymentDate: p.payment_date
      });
      window.open(share.whatsappUrl, '_blank');
    } else {
      const share = getReminderWhatsAppShare({
        memberName: member.name,
        phone,
        monthLabel: p.month_label,
        calendarMonth: p.calendar_month,
        amountDue: p.amount_due,
        remainingAmount: p.remaining_amount
      });
      window.open(share.whatsappUrl, '_blank');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!member) return <div className="text-red-500 text-xl font-bold">Member not found</div>;

  const totalPaid = payments.reduce((s, p) => s + p.amount_paid, 0);
  const totalPending = payments.reduce((s, p) => s + p.remaining_amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <button 
            onClick={() => navigate('/admin/members')}
            className="text-gold font-bold hover:text-amber-300 text-sm mb-2 flex items-center gap-1 transition-colors"
          >
            &larr; Back to All Members
          </button>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <span>{member.name}</span>
            <span className="text-sm font-mono bg-gold/20 text-gold px-3 py-1 rounded-xl border border-gold/40">
              {member.member_code}
            </span>
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={openEditModal}
            className="gold-glow-button px-4 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 shadow-lg tracking-wide uppercase"
          >
            <Edit3 size={16} /> Edit Member
          </button>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2.5 bg-slate-800 text-slate-200 font-bold rounded-xl border border-slate-700 hover:bg-slate-700 text-sm transition-all"
          >
            🔑 Reset Password
          </button>
          {member.status === 'active' ? (
            <button
              onClick={() => setShowArchiveConfirm(true)}
              className="px-4 py-2.5 bg-rose-950/80 text-rose-300 font-bold rounded-xl border border-rose-700 hover:bg-rose-900 text-sm transition-all"
            >
              Archive Member
            </button>
          ) : (
            <button
              onClick={handleReactivate}
              className="px-4 py-2.5 bg-emerald-950/80 text-emerald-300 font-bold rounded-xl border border-emerald-700 hover:bg-emerald-900 text-sm transition-all"
            >
              Reactivate Member
            </button>
          )}
        </div>
      </div>

      <div className="cyber-card rounded-3xl p-6 border border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
            <User size={32} className="text-gold" />
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Member ID</p>
              <p className="text-xl font-black text-white font-mono">{member.member_code}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
            <Phone size={32} className="text-gold" />
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Phone</p>
              <p className="text-xl font-black text-white font-mono">{member.phone || 'Not recorded'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
            <Calendar size={32} className="text-gold" />
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Lift Status</p>
              <p className={`text-lg font-black ${member.lift_status === 'lifted' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {member.lift_status === 'lifted' ? `🟢 Lifted (M${member.lift_month_id})` : '🟠 Not Lifted'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
            <IndianRupee size={32} className="text-gold" />
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Current Monthly</p>
              <p className="text-xl font-black text-white">
                {member.lift_status === 'lifted' ? '₹25,000' : '₹23,000'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="p-5 bg-emerald-950/40 rounded-2xl border border-emerald-500/30">
            <p className="text-xs font-black text-emerald-400 uppercase tracking-wider">Total Amount Paid</p>
            <p className="text-3xl font-black text-emerald-300 mt-1">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="p-5 bg-rose-950/40 rounded-2xl border border-rose-500/30">
            <p className="text-xs font-black text-rose-400 uppercase tracking-wider">Total Pending Dues</p>
            <p className="text-3xl font-black text-rose-300 mt-1">{formatCurrency(totalPending)}</p>
          </div>
        </div>
      </div>

      <div className="cyber-card rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        <div className="p-5 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Payment History (23 Months)</span>
            <span className="text-gold text-lg">✦</span>
          </h3>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">October 2026 - August 2028</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-black text-slate-900 uppercase tracking-wider">Month</th>
                <th className="px-6 py-4 text-left text-sm font-black text-slate-900 uppercase tracking-wider">Calendar</th>
                <th className="px-6 py-4 text-right text-sm font-black text-slate-900 uppercase tracking-wider">Due</th>
                <th className="px-6 py-4 text-right text-sm font-black text-slate-900 uppercase tracking-wider">Paid</th>
                <th className="px-6 py-4 text-right text-sm font-black text-slate-900 uppercase tracking-wider">Remaining</th>
                <th className="px-6 py-4 text-center text-sm font-black text-slate-900 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-center text-sm font-black text-slate-900 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-amber-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-base font-black text-slate-900">{p.month_label}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-600">{p.calendar_month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-right text-slate-800">{formatCurrency(p.amount_due)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base font-black text-right text-emerald-600">{formatCurrency(p.amount_paid)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base font-black text-right text-rose-600">{formatCurrency(p.remaining_amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate('/admin/payments', { state: { memberId: member.id, monthId: p.month_id } })}
                        className="px-3.5 py-1.5 bg-slate-900 text-gold hover:bg-black hover:text-amber-300 rounded-xl font-black text-xs uppercase tracking-wider border border-gold/40 shadow"
                      >
                        Record
                      </button>
                      <button
                        onClick={() => handleSendWhatsApp(p)}
                        title={p.status === 'paid' ? 'Send WhatsApp Receipt' : 'Send WhatsApp Reminder'}
                        className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow ${
                          p.status === 'paid'
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                        }`}
                      >
                        <span>📲</span>
                        <span>{p.status === 'paid' ? 'Receipt' : 'Remind'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showArchiveConfirm}
        title="Archive Member"
        message={`Are you sure you want to archive ${member.name}? Their financial history is fully preserved, but they will be marked inactive.`}
        isWarn={true}
        onConfirm={handleArchive}
        onCancel={() => setShowArchiveConfirm(false)}
      />

      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Password"
        message={`Are you sure you want to reset the login password for ${member.name}? New password will be: Member@123`}
        onConfirm={handleResetPassword}
        onCancel={() => setShowResetConfirm(false)}
      />

      {/* Edit Member Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="cyber-card w-full max-w-lg rounded-3xl p-6 md:p-8 border border-gold/40 shadow-2xl relative">
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gold/20 text-gold rounded-2xl border border-gold/30">
                <Edit3 size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">Edit Member Details</h3>
                <p className="text-sm font-semibold text-slate-400 font-mono">{member.member_code}</p>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Siromani, Mani Mallika..."
                  className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-2xl text-white font-bold text-base focus:border-gold focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-2xl text-white font-bold text-base focus:border-gold focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-1.5">
                  Notes / Details
                </label>
                <textarea
                  rows="3"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Optional notes, address, or relationship..."
                  className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 rounded-2xl text-white font-medium text-sm focus:border-gold focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-sm transition-colors uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 gold-glow-button py-3 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 uppercase tracking-wider shadow-xl disabled:opacity-50"
                >
                  <Save size={16} />
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
