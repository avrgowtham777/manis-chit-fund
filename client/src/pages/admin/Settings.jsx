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
        <h2 className="text-2xl md:text-3xl font-bold text-navy">Settings & Configuration</h2>
        <p className="text-gray-500 font-medium">Configure chit fund rules, payments, and 23-month receivable values</p>
      </div>

      {/* Chit Configuration */}
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
        <h3 className="text-xl font-bold text-navy mb-6 pb-4 border-b">Chit Fund Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-base font-bold text-gray-700 mb-2">Chit Fund Name</label>
            <input
              type="text"
              name="name"
              value={settings?.name || ''}
              onChange={handleSettingsChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-navy focus:border-navy text-lg"
            />
          </div>
          <div>
            <label className="block text-base font-bold text-gray-700 mb-2">Total Chit Value (₹)</label>
            <input
              type="number"
              name="chit_value"
              value={settings?.chit_value || ''}
              onChange={handleSettingsChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-navy focus:border-navy text-lg font-bold"
            />
          </div>
          <div>
            <label className="block text-base font-bold text-gray-700 mb-2">Monthly Payment Before Lifting (₹)</label>
            <input
              type="number"
              name="pre_lift_payment"
              value={settings?.pre_lift_payment || ''}
              onChange={handleSettingsChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-navy focus:border-navy text-lg font-bold text-green-700"
            />
          </div>
          <div>
            <label className="block text-base font-bold text-gray-700 mb-2">Monthly Payment After Lifting (₹)</label>
            <input
              type="number"
              name="post_lift_payment"
              value={settings?.post_lift_payment || ''}
              onChange={handleSettingsChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-navy focus:border-navy text-lg font-bold text-navy"
            />
          </div>
          <div>
            <label className="block text-base font-bold text-gray-700 mb-2">Starting Month</label>
            <input
              type="text"
              name="start_month"
              value={settings?.start_month || ''}
              onChange={handleSettingsChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-navy focus:border-navy text-lg"
            />
          </div>
          <div>
            <label className="block text-base font-bold text-gray-700 mb-2">Starting Year</label>
            <input
              type="number"
              name="start_year"
              value={settings?.start_year || ''}
              onChange={handleSettingsChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-navy focus:border-navy text-lg"
            />
          </div>
        </div>
        
        <div className="mt-8 text-right">
          <button
            onClick={() => setConfirmOpen(true)}
            className="px-8 py-3.5 bg-navy text-gold font-bold rounded-lg text-lg hover:bg-navy-dark shadow-md"
          >
            SAVE CONFIGURATION
          </button>
        </div>
      </div>

      {/* 23 Months Config */}
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
        <h3 className="text-xl font-bold text-navy mb-4">Monthly Receivable Amounts (23 Months)</h3>
        <p className="text-gray-500 text-sm mb-6">Each month has a predefined receivable chit amount. All updates are logged in the audit trail.</p>

        {editingMonth && (
          <form onSubmit={saveMonth} className="mb-6 p-5 bg-amber-50 rounded-xl border border-amber-300">
            <h4 className="font-bold text-navy text-lg mb-3">Edit {editingMonth.month_label}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Calendar Label</label>
                <input
                  type="text"
                  required
                  value={monthForm.calendar_month}
                  onChange={(e) => setMonthForm(prev => ({ ...prev, calendar_month: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Receivable Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={monthForm.receivable_amount}
                  onChange={(e) => setMonthForm(prev => ({ ...prev, receivable_amount: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg font-bold"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <button
                type="button"
                onClick={() => setEditingMonth(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-navy text-gold rounded font-bold"
              >
                Save Month
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Month</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Calendar Month</th>
                <th className="px-6 py-3 text-right text-sm font-bold text-gray-700">Receivable Amount</th>
                <th className="px-6 py-3 text-center text-sm font-bold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {months.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3.5 font-bold text-navy whitespace-nowrap">{m.month_label}</td>
                  <td className="px-6 py-3.5 text-gray-700 whitespace-nowrap">{m.calendar_month}</td>
                  <td className="px-6 py-3.5 text-right font-black text-navy whitespace-nowrap">{formatCurrency(m.receivable_amount)}</td>
                  <td className="px-6 py-3.5 text-center whitespace-nowrap">
                    <button
                      onClick={() => startEditMonth(m)}
                      className="px-3 py-1 bg-navy/10 text-navy hover:bg-navy/20 rounded font-bold text-sm"
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
