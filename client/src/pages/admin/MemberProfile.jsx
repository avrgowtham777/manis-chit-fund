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
            className="text-gray-500 font-bold hover:text-navy text-sm mb-1"
          >
            &larr; Back to All Members
          </button>
          <h2 className="text-2xl md:text-3xl font-bold text-navy">{member.name}</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 bg-gray-100 text-gray-800 font-bold rounded-lg hover:bg-gray-200 text-sm"
          >
            Reset Password
          </button>
          {member.status === 'active' ? (
            <button
              onClick={() => setShowArchiveConfirm(true)}
              className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200 text-sm"
            >
              Archive Member
            </button>
          ) : (
            <button
              onClick={handleReactivate}
              className="px-4 py-2 bg-green-100 text-green-700 font-bold rounded-lg hover:bg-green-200 text-sm"
            >
              Reactivate Member
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <User size={32} className="text-navy" />
            <div>
              <p className="text-sm font-bold text-gray-500">Member ID</p>
              <p className="text-xl font-bold text-navy">{member.member_code}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <Phone size={32} className="text-navy" />
            <div>
              <p className="text-sm font-bold text-gray-500">Phone</p>
              <p className="text-xl font-bold text-navy">{member.phone || 'Not recorded'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <Calendar size={32} className="text-navy" />
            <div>
              <p className="text-sm font-bold text-gray-500">Lift Status</p>
              <p className={`text-xl font-bold ${member.lift_status === 'lifted' ? 'text-green-600' : 'text-orange-600'}`}>
                {member.lift_status === 'lifted' ? `Lifted (M${member.lift_month_id})` : 'Not Lifted'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <IndianRupee size={32} className="text-navy" />
            <div>
              <p className="text-sm font-bold text-gray-500">Current Monthly</p>
              <p className="text-xl font-bold text-navy">
                {member.lift_status === 'lifted' ? '₹25,000' : '₹23,000'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm font-bold text-green-700">Total Amount Paid</p>
            <p className="text-2xl font-black text-green-800">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm font-bold text-red-700">Total Pending Dues</p>
            <p className="text-2xl font-black text-red-800">{formatCurrency(totalPending)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-5 bg-gray-50 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-navy">Payment History (23 Months)</h3>
          <span className="text-sm text-gray-500 font-medium">Click Record to record/update payment</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-base font-bold text-gray-700">Month</th>
                <th className="px-6 py-4 text-left text-base font-bold text-gray-700">Calendar</th>
                <th className="px-6 py-4 text-right text-base font-bold text-gray-700">Due</th>
                <th className="px-6 py-4 text-right text-base font-bold text-gray-700">Paid</th>
                <th className="px-6 py-4 text-right text-base font-bold text-gray-700">Remaining</th>
                <th className="px-6 py-4 text-center text-base font-bold text-gray-700">Status</th>
                <th className="px-6 py-4 text-center text-base font-bold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-navy">{p.month_label}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{p.calendar_month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-medium text-right text-gray-900">{formatCurrency(p.amount_due)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-right text-green-600">{formatCurrency(p.amount_paid)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-right text-red-600">{formatCurrency(p.remaining_amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => navigate('/admin/payments', { state: { memberId: member.id, monthId: p.month_id } })}
                      className="px-3 py-1.5 bg-navy text-gold hover:bg-navy-dark rounded font-bold text-sm"
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
