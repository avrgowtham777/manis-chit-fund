import { useState, useEffect } from 'react';
import api from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner';
import confetti from 'canvas-confetti';
import { formatCurrency } from '../../utils/currency';
import { Sparkles } from 'lucide-react';

export default function ChitLifting() {
  const [members, setMembers] = useState([]);
  const [months, setMonths] = useState([]);
  const [lifts, setLifts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    monthId: '',
    memberId: '',
    liftDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [conflictMessage, setConflictMessage] = useState('');
  const [selectedReceivable, setSelectedReceivable] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [mRes, lRes, moRes] = await Promise.all([
        api.get('/admin/members'),
        api.get('/admin/chit-lift'),
        api.get('/admin/settings/months')
      ]);
      setMembers(mRes.data.filter(m => m.status !== 'archived'));
      setLifts(lRes.data);
      setMonths(moRes.data);
      if (moRes.data.length > 0 && !formData.monthId) {
        setFormData(prev => ({ ...prev, monthId: moRes.data[0].id }));
        setSelectedReceivable(moRes.data[0].receivable_amount);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (e) => {
    const mId = Number(e.target.value);
    setFormData(prev => ({ ...prev, monthId: mId }));
    const foundMonth = months.find(m => m.id === mId);
    if (foundMonth) {
      setSelectedReceivable(foundMonth.receivable_amount);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.memberId || !formData.monthId) return;
    setConfirmOpen(true);
  };

  const executeLift = async (force = false) => {
    try {
      await api.post('/admin/chit-lift', {
        monthId: Number(formData.monthId),
        memberId: Number(formData.memberId),
        liftDate: formData.liftDate,
        notes: formData.notes,
        force
      });
      setConfirmOpen(false);
      setConflictModalOpen(false);
      setFormData(prev => ({ ...prev, memberId: '', notes: '' }));
      // MEGA CELEBRATION CONFETTI CANNON
      try {
        const count = 200;
        const defaults = { origin: { y: 0.7 } };
        function fire(particleRatio, opts) {
          confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
        }
        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
      } catch (_) {}
      alert('🎉 CHIT LIFT CELEBRATION! Lifter has been officially assigned!');
      fetchData();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 409) {
        setConfirmOpen(false);
        const data = err.response.data;
        if (data.existingLifter) {
          const existing = members.find(m => m.id === data.existingLifter);
          const name = existing ? existing.name : 'Another member';
          setConflictMessage(`This month is already assigned to ${name}. Do you want to overwrite and assign this month to the new member?`);
        } else if (data.existingMonth) {
          const m = months.find(mo => mo.id === data.existingMonth);
          const mLabel = m ? m.month_label : `Month ${data.existingMonth}`;
          setConflictMessage(`This member has already lifted a chit in ${mLabel}. Do you want to override and assign again?`);
        } else {
          setConflictMessage('There is a conflict with this lift assignment. Do you want to override?');
        }
        setConflictModalOpen(true);
      } else {
        alert(err.response?.data?.error || 'Failed to mark lift');
      }
    }
  };

  const removeLift = async (monthId) => {
    if (!window.confirm('Are you sure you want to remove this lift assignment? This will revert the member status and dues.')) {
      return;
    }
    try {
      await api.delete(`/admin/chit-lift/${monthId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove lift');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2">
          <span>Chit Lifting Assignment</span>
          <Sparkles className="text-gold" size={26} />
        </h2>
        <p className="text-gold font-bold text-sm mt-1">Assign each month's chit auction winner and update receivable payouts</p>
      </div>

      <div className="cyber-card rounded-3xl p-6 md:p-8 border border-gold/30 shadow-2xl">
        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
          <span className="text-gold">✦</span> Assign Monthly Lifter
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-base font-black text-white mb-2">Select Month *</label>
              <select
                required
                value={formData.monthId}
                onChange={handleMonthChange}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gold/40 bg-white text-slate-950 focus:border-gold focus:ring-4 focus:ring-gold/20 text-base font-black shadow-md transition-all"
              >
                {months.map(m => (
                  <option key={m.id} value={m.id} className="text-slate-900 py-1">
                    {m.month_label} — {m.calendar_month}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-base font-black text-white mb-2">Select Member *</label>
              <select
                required
                value={formData.memberId}
                onChange={(e) => setFormData(prev => ({ ...prev, memberId: e.target.value }))}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gold/40 bg-white text-slate-950 focus:border-gold focus:ring-4 focus:ring-gold/20 text-base font-black shadow-md transition-all"
              >
                <option value="">-- Choose Member --</option>
                {members.map(m => (
                  <option key={m.id} value={m.id} className="text-slate-900 py-1">
                    {m.name} ({m.member_code}) {m.lift_status === 'lifted' ? '— [Already Lifted]' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-base font-black text-white mb-2">Receivable Chit Amount</label>
              <div className="px-5 py-3.5 bg-slate-950/90 border border-gold/40 rounded-xl text-3xl font-black text-gold shadow-inner">
                {formatCurrency(selectedReceivable)}
              </div>
            </div>

            <div>
              <label className="block text-base font-black text-white mb-2">Lift Date *</label>
              <input
                type="date"
                required
                value={formData.liftDate}
                onChange={(e) => setFormData(prev => ({ ...prev, liftDate: e.target.value }))}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gold/40 bg-white text-slate-950 focus:border-gold focus:ring-4 focus:ring-gold/20 text-base font-black shadow-md transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-base font-black text-white mb-2">Notes / Remarks</label>
              <input
                type="text"
                placeholder="Optional notes or remarks..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gold/40 bg-white text-slate-950 focus:border-gold focus:ring-4 focus:ring-gold/20 text-base font-medium shadow-md transition-all"
              />
            </div>
          </div>

          <div className="pt-4 text-right">
            <button
              type="submit"
              disabled={!formData.memberId || !formData.monthId}
              className="gold-glow-button px-8 py-4 text-slate-950 font-black rounded-2xl text-lg shadow-xl border-2 border-gold/80 transition-all disabled:opacity-40"
            >
              CONFIRM CHIT LIFT 🏆
            </button>
          </div>
        </form>
      </div>

      <div className="cyber-card rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        <h3 className="text-xl font-black text-white p-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <span>23-Month Chit Lift Schedule</span>
          <span className="text-xs text-gold font-bold">Progressive Chit Value</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-black text-slate-900 uppercase tracking-wider">Month</th>
                <th className="px-6 py-4 text-left text-sm font-black text-slate-900 uppercase tracking-wider">Calendar</th>
                <th className="px-6 py-4 text-right text-sm font-black text-slate-900 uppercase tracking-wider">Receivable Amount</th>
                <th className="px-6 py-4 text-left text-sm font-black text-slate-900 uppercase tracking-wider">Lifter (Member)</th>
                <th className="px-6 py-4 text-left text-sm font-black text-slate-900 uppercase tracking-wider">Lift Date</th>
                <th className="px-6 py-4 text-center text-sm font-black text-slate-900 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lifts.map((l) => (
                <tr key={l.month_id} className={l.member_name ? "bg-amber-50/40 hover:bg-amber-50" : "hover:bg-gray-50"}>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-navy">{l.month_label}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{l.calendar_month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-right text-navy">{formatCurrency(l.receivable_amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg font-semibold text-gray-900">
                    {l.member_name ? (
                      <span className="inline-flex items-center gap-2">
                        <span>{l.member_name}</span>
                        <span className="text-sm font-normal text-gray-500">({l.member_code})</span>
                      </span>
                    ) : (
                      <span className="text-gray-400 font-normal italic">Not yet assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{l.lift_date || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {l.member_name ? (
                      <button
                        onClick={() => removeLift(l.month_id)}
                        className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded font-bold text-sm"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setFormData(prev => ({ ...prev, monthId: l.month_id }));
                          setSelectedReceivable(l.receivable_amount);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-3 py-1.5 bg-navy/10 text-navy hover:bg-navy/20 rounded font-bold text-sm"
                      >
                        Assign
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Confirm Chit Lift"
        message="Are you sure you want to mark this member as the chit lifter? Their monthly payment will automatically become ₹25,000 from this month onwards."
        onConfirm={() => executeLift(false)}
        onCancel={() => setConfirmOpen(false)}
      />

      <ConfirmDialog
        isOpen={conflictModalOpen}
        title="⚠️ Overwrite / Conflict Confirmation"
        message={conflictMessage}
        onConfirm={() => executeLift(true)}
        onCancel={() => setConflictModalOpen(false)}
      />
    </div>
  );
}
