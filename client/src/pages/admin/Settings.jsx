import { useState, useEffect } from 'react';
import api from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatCurrency } from '../../utils/currency';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingMonth, setEditingMonth] = useState(null);
  const [monthForm, setMonthForm] = useState({ calendar_month: '', receivable_amount: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sRes, mRes] = await Promise.all([
        api.get('/admin/settings/settings'),
        api.get('/admin/settings/months')
      ]);
      setSettings(sRes.data);
      setMonths(mRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ 
      ...prev, 
      [name]: ['name', 'start_month'].includes(name) ? value : Number(value) 
    }));
  };

  const saveSettings = async () => {
    try {
      await api.put('/admin/settings/settings', settings);
      setConfirmOpen(false);
      alert('Settings saved successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to save settings');
    }
  };

  const startEditMonth = (m) => {
    setEditingMonth(m);
    setMonthForm({
      calendar_month: m.calendar_month,
      receivable_amount: m.receivable_amount
    });
  };

  const saveMonth = async (e) => {
    e.preventDefault();
    if (!editingMonth) return;
    try {
      await api.put(`/admin/settings/months/${editingMonth.id}`, {
        calendar_month: monthForm.calendar_month,
        receivable_amount: Number(monthForm.receivable_amount)
      });
      setEditingMonth(null);
      alert('Month configuration updated successfully!');
      fetchData();
    } catch (err) {
      alert('Failed to update month configuration');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
          <span>Settings & Configuration</span>
          <span className="text-gold text-2xl">⚙️</span>
        </h2>
        <p className="text-slate-300 font-medium mt-1">Configure chit fund rules, payments, and 23-month receivable values</p>
      </div>

      {/* Chit Configuration */}
      <div className="cyber-card rounded-3xl p-6 md:p-8 border border-slate-800">
        <h3 className="text-xl font-black text-white mb-6 pb-4 border-b border-slate-800 flex items-center gap-2">
          <span>Chit Fund Parameters</span>
          <span className="text-gold">✦</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-black text-gold uppercase tracking-wider mb-2">Chit Fund Name</label>
            <input
              type="text"
              name="name"
              value={settings?.name || ''}
              onChange={handleSettingsChange}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-gold/40 focus:ring-2 focus:ring-gold text-lg font-bold text-slate-900 bg-white shadow-lg transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gold uppercase tracking-wider mb-2">Total Chit Value (₹)</label>
            <input
              type="number"
              name="chit_value"
              value={settings?.chit_value || ''}
              onChange={handleSettingsChange}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-gold/40 focus:ring-2 focus:ring-gold text-lg font-black text-slate-900 bg-white shadow-lg transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gold uppercase tracking-wider mb-2">Monthly Payment Before Lifting (₹)</label>
            <input
              type="number"
              name="pre_lift_payment"
              value={settings?.pre_lift_payment || ''}
              onChange={handleSettingsChange}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-gold/40 focus:ring-2 focus:ring-gold text-lg font-black text-slate-900 bg-white shadow-lg transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gold uppercase tracking-wider mb-2">Monthly Payment After Lifting (₹)</label>
            <input
              type="number"
              name="post_lift_payment"
              value={settings?.post_lift_payment || ''}
              onChange={handleSettingsChange}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-gold/40 focus:ring-2 focus:ring-gold text-lg font-black text-slate-900 bg-white shadow-lg transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gold uppercase tracking-wider mb-2">Starting Month</label>
            <input
              type="text"
              name="start_month"
              value={settings?.start_month || ''}
              onChange={handleSettingsChange}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-gold/40 focus:ring-2 focus:ring-gold text-lg font-bold text-slate-900 bg-white shadow-lg transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gold uppercase tracking-wider mb-2">Starting Year</label>
            <input
              type="number"
              name="start_year"
              value={settings?.start_year || ''}
              onChange={handleSettingsChange}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-gold/40 focus:ring-2 focus:ring-gold text-lg font-bold text-slate-900 bg-white shadow-lg transition-all"
            />
          </div>
        </div>
        
        <div className="mt-8 text-right">
          <button
            onClick={() => setConfirmOpen(true)}
            className="gold-glow-button px-8 py-3.5 rounded-2xl font-black text-base shadow-xl uppercase tracking-wider"
          >
            💾 SAVE CONFIGURATION
          </button>
        </div>
      </div>

      {/* 23 Months Config */}
      <div className="cyber-card rounded-3xl p-6 md:p-8 border border-slate-800">
        <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
          <span>Monthly Receivable Amounts (23 Months)</span>
          <span className="text-gold">✦</span>
        </h3>
        <p className="text-slate-300 font-medium text-sm mb-6">Each month has a predefined receivable chit amount. All updates are logged in the audit trail.</p>

        {editingMonth && (
          <form onSubmit={saveMonth} className="mb-6 p-6 bg-slate-900/90 rounded-2xl border-2 border-gold/50 shadow-2xl">
            <h4 className="font-black text-white text-lg mb-4 flex items-center gap-2">
              <span>Edit {editingMonth.month_label}</span>
              <span className="text-gold text-sm font-mono">({editingMonth.calendar_month})</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gold uppercase tracking-wider mb-1.5">Calendar Label</label>
                <input
                  type="text"
                  required
                  value={monthForm.calendar_month}
                  onChange={(e) => setMonthForm(prev => ({ ...prev, calendar_month: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gold/40 rounded-xl font-bold text-slate-900 bg-white shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gold uppercase tracking-wider mb-1.5">Receivable Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={monthForm.receivable_amount}
                  onChange={(e) => setMonthForm(prev => ({ ...prev, receivable_amount: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gold/40 rounded-xl font-black text-slate-900 bg-white shadow-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <button
                type="button"
                onClick={() => setEditingMonth(null)}
                className="px-5 py-2.5 bg-slate-800 text-slate-200 rounded-xl font-bold hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="gold-glow-button px-6 py-2.5 rounded-xl font-black text-sm uppercase tracking-wider"
              >
                Save Month
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto rounded-2xl overflow-hidden border border-slate-700 shadow-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-black text-slate-900 uppercase tracking-wider">Month</th>
                <th className="px-6 py-4 text-left text-sm font-black text-slate-900 uppercase tracking-wider">Calendar Month</th>
                <th className="px-6 py-4 text-right text-sm font-black text-slate-900 uppercase tracking-wider">Receivable Amount</th>
                <th className="px-6 py-4 text-center text-sm font-black text-slate-900 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {months.map((m) => (
                <tr key={m.id} className="hover:bg-amber-50/50 transition-colors">
                  <td className="px-6 py-4 font-black text-slate-900 whitespace-nowrap text-base">{m.month_label}</td>
                  <td className="px-6 py-4 text-slate-700 font-bold whitespace-nowrap text-sm">{m.calendar_month}</td>
                  <td className="px-6 py-4 text-right font-black text-gold text-lg whitespace-nowrap">{formatCurrency(m.receivable_amount)}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => startEditMonth(m)}
                      className="px-4 py-1.5 bg-slate-900 text-gold hover:bg-black hover:text-amber-300 rounded-xl font-black text-xs uppercase tracking-wider border border-gold/40 shadow transition-colors"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="⚠️ Save Settings Confirmation"
        message="Changing core chit fund settings will be recorded in the audit log. Are you sure you want to proceed?"
        isWarn={true}
        onConfirm={saveSettings}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
