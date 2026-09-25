import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import StatusBadge from '../../components/StatusBadge';
import { User, Phone, IndianRupee, Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export default function MemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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
                    <button
                      onClick={() => navigate('/admin/payments', { state: { memberId: member.id, monthId: p.month_id } })}
                      className="px-4 py-1.5 bg-slate-900 text-gold hover:bg-black hover:text-amber-300 rounded-xl font-black text-xs uppercase tracking-wider border border-gold/40 shadow"
                    >
                      Record
                    </button>
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
    </div>
  );
}
