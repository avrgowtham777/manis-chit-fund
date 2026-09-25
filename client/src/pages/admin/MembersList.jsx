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
          <h2 className="text-2xl md:text-3xl font-bold text-navy">All Members</h2>
          <p className="text-gray-500 font-medium">Manage chit fund members and view account details</p>
        </div>
        <button
          onClick={() => navigate('/admin/members/add')}
          className="bg-navy text-gold px-6 py-3.5 rounded-lg font-bold text-lg hover:bg-navy-dark shadow-md flex items-center justify-center gap-2"
        >
          + ADD NEW MEMBER
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="🔍 Search by Name, Member ID, or Phone..." />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full md:w-64 px-4 py-3.5 border-2 border-slate-300 rounded-xl text-base font-bold text-slate-900 bg-white shadow-sm focus:ring-2 focus:ring-navy"
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
              className="bg-white rounded-xl shadow-md p-6 border border-gray-200 cursor-pointer hover:border-navy hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold text-navy">{member.name}</h3>
                  <span className="inline-block mt-1 font-mono font-bold text-sm bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                    {member.member_code}
                  </span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                  {member.status?.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2 mt-4 text-base">
                <div className="flex justify-between text-gray-600">
                  <span>Phone:</span>
                  <span className="font-semibold text-gray-900">{member.phone || '—'}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Lift Status:</span>
                  <span className={`font-bold ${member.lift_status === 'lifted' ? 'text-green-600' : 'text-orange-600'}`}>
                    {member.lift_status === 'lifted' ? '🟢 LIFTED' : '🟠 NOT YET LIFTED'}
                  </span>
                </div>
                {member.lift_status === 'lifted' && member.receivable_amount && (
                  <div className="flex justify-between text-gray-600">
                    <span>Lift Amount:</span>
                    <span className="font-bold text-navy">{formatCurrency(member.receivable_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Applicable Monthly:</span>
                  <span className="font-bold text-navy">
                    {member.lift_status === 'lifted' ? '₹25,000' : '₹23,000'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 text-right">
                <span className="text-navy font-bold text-sm hover:underline">
                  View Full History &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
