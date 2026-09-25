import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import SearchBar from '../../components/SearchBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { Users } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export default function MembersList() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, archived
  const navigate = useNavigate();

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

              <div className="mt-4 pt-3 flex justify-end items-center">
                <span className="text-gold font-black text-xs tracking-wider uppercase group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  View Full Profile &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
