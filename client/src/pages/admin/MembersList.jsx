import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import SearchBar from '../../components/SearchBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { Users, Edit3, X, Save } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export default function MembersList() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, archived
  const [editingMember, setEditingMember] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const navigate = useNavigate();

  const openQuickEdit = (member) => {
    setEditingMember(member);
    setEditName(member.name || '');
    setEditPhone(member.phone || '');
    setEditNotes(member.notes || '');
  };

  const handleSaveQuickEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      alert('Member name cannot be empty');
      return;
    }
    setSavingEdit(true);
    try {
      await api.put(`/admin/members/${editingMember.id}`, {
        name: editName.trim(),
        phone: editPhone.trim(),
        notes: editNotes.trim(),
        status: editingMember.status
      });
      setEditingMember(null);
      await fetchMembers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update member');
    } finally {
      setSavingEdit(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data } = await api.get('/admin/members');
      setMembers(data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      m.member_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone?.includes(searchTerm);
    const matchesFilter = filter === 'all' ? true : (filter === 'archived' ? m.status === 'archived' : m.status !== 'archived');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <span>All Chit Fund Members</span>
            <span className="text-gold text-2xl font-mono">({members.length})</span>
          </h2>
          <p className="text-slate-300 font-medium mt-1">Manage members, view lifetime records, and track chit lifts</p>
        </div>
        <button
          onClick={() => navigate('/admin/members/add')}
          className="gold-glow-button px-6 py-3.5 rounded-2xl font-black text-base shadow-xl flex items-center justify-center gap-2 tracking-wide uppercase"
        >
          <span>✨ ADD NEW MEMBER</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="🔍 Search by Name, Member ID, or Phone..." />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full md:w-64 px-4 py-3.5 border-2 border-gold/40 rounded-2xl text-base font-bold text-slate-900 bg-white shadow-lg focus:ring-2 focus:ring-gold"
        >
          <option value="all">All Members ({members.length})</option>
          <option value="active">Active Members ({members.filter(m => m.status === 'active').length})</option>
          <option value="archived">Archived Members ({members.filter(m => m.status === 'archived').length})</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredMembers.length === 0 ? (
        <EmptyState icon={Users} message="No members found matching your search." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              onClick={() => navigate(`/admin/members/${member.id}`)}
              className="cyber-card rounded-3xl p-6 border border-slate-700/80 cursor-pointer transition-all duration-300 group hover:border-gold/60"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-black text-white group-hover:text-gold transition-colors">{member.name}</h3>
                  <span className="inline-block mt-1 font-mono font-black text-xs bg-gold/20 text-gold px-2.5 py-1 rounded-lg border border-gold/30">
                    {member.member_code}
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-xl text-xs font-black tracking-wider uppercase ${member.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-700 text-slate-300'}`}>
                  {member.status}
                </span>
              </div>

              <div className="space-y-3 mt-4 text-sm bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-medium">Phone:</span>
                  <span className="font-bold text-white font-mono">{member.phone || '—'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-medium">Lift Status:</span>
                  <span className={`font-black text-xs px-2.5 py-1 rounded-lg ${member.lift_status === 'lifted' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-amber-950 text-amber-300 border border-amber-500/30'}`}>
                    {member.lift_status === 'lifted' ? '🟢 LIFTED' : '🟠 NOT LIFTED'}
                  </span>
                </div>
                {member.lift_status === 'lifted' && member.receivable_amount && (
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="font-medium">Lift Amount:</span>
                    <span className="font-black text-gold text-base">{formatCurrency(member.receivable_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-medium">Current Monthly:</span>
                  <span className="font-black text-white text-base">
                    {member.lift_status === 'lifted' ? '₹25,000' : '₹23,000'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 flex justify-between items-center border-t border-slate-800">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openQuickEdit(member);
                  }}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-gold text-xs font-black rounded-xl border border-gold/40 flex items-center gap-1.5 uppercase transition-colors"
                >
                  <Edit3 size={13} /> Edit
                </button>
                <span className="text-gold font-black text-xs tracking-wider uppercase group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  View Profile &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="cyber-card w-full max-w-lg rounded-3xl p-6 md:p-8 border border-gold/40 shadow-2xl relative">
            <button
              onClick={() => setEditingMember(null)}
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
                <p className="text-sm font-semibold text-slate-400 font-mono">{editingMember.member_code}</p>
              </div>
            </div>

            <form onSubmit={handleSaveQuickEdit} className="space-y-4">
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
                  onClick={() => setEditingMember(null)}
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
