import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function AddMember() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    username: '',
    password: '',
    joiningMonth: 1,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updates = { [name]: value };
    
    // Auto-suggest username from name
    if (name === 'name' && !formData.username) {
      updates.username = value.toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let pwd = '';
    for (let i=0; i<6; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    setFormData(prev => ({ ...prev, password: pwd }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/admin/members', formData);
      navigate('/admin/members');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to add member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-navy">Add New Member</h2>

      <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
        {error && <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg font-medium text-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-base font-black text-slate-900 mb-1.5">Full Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:ring-2 focus:ring-navy focus:border-navy text-lg font-bold text-slate-900 bg-white shadow-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-base font-black text-slate-900 mb-1.5">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:ring-2 focus:ring-navy focus:border-navy text-lg font-bold text-slate-900 bg-white shadow-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-base font-black text-slate-900 mb-1.5">Login Username *</label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:ring-2 focus:ring-navy focus:border-navy text-lg font-bold text-slate-900 bg-white shadow-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-base font-black text-slate-900 mb-1.5">Initial Password *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-300 focus:ring-2 focus:ring-navy focus:border-navy text-lg font-bold text-slate-900 bg-white shadow-sm transition-all"
                />
                <button
                  type="button"
                  onClick={generatePassword}
                  className="px-5 py-3 bg-slate-200 text-slate-900 font-black rounded-xl hover:bg-slate-300 text-sm shadow-sm"
                >
                  GENERATE
                </button>
              </div>
            </div>
            <div>
              <label className="block text-base font-black text-slate-900 mb-1.5">Joining Month (1-23)</label>
              <input
                type="number"
                name="joiningMonth"
                min="1"
                max="23"
                value={formData.joiningMonth}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:ring-2 focus:ring-navy focus:border-navy text-lg font-bold text-slate-900 bg-white shadow-sm transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-base font-black text-slate-900 mb-1.5">Notes (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 focus:ring-2 focus:ring-navy focus:border-navy text-lg font-bold text-slate-900 bg-white shadow-sm transition-all"
              ></textarea>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/members')}
              className="px-8 py-3.5 bg-slate-200 text-slate-800 font-bold rounded-xl text-base hover:bg-slate-300 shadow-sm"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-navy text-gold hover:bg-navy-dark font-black rounded-xl text-base shadow-md disabled:opacity-70 transition-all"
            >
              {loading ? 'SAVING...' : 'SAVE MEMBER'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
