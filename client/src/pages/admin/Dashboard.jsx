import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, IndianRupee, FileClock, PlusCircle, Calendar } from 'lucide-react';
import api from '../../services/api';
import CurrencyDisplay from '../../components/CurrencyDisplay';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, notifRes, settingsRes, monthsRes] = await Promise.all([
          api.get('/admin/members').catch(() => ({ data: [] })),
          api.get('/admin/notifications/summary').catch(() => ({ data: { pending: 0, partial: 0, completed: 0 }})),
          api.get('/admin/settings/settings').catch(() => ({ data: { chit_value: 500000, duration: 23 }})),
          api.get('/admin/settings/months').catch(() => ({ data: [] }))
        ]);
        
        const members = membersRes.data || [];
        const liftedCount = members.filter(m => m.lift_status === 'lifted').length;
        const settings = settingsRes.data || {};
        const summary = notifRes.data || {};

        // Find current month (first month with no payment recorded or use month 1)
        const months = monthsRes.data || [];
        const currentMonthNum = months.length > 0 ? 1 : 1;

        setData({
          totalMembers: members.filter(m => m.status === 'active').length,
          liftedMembers: liftedCount,
          notYetLifted: members.filter(m => m.status === 'active').length - liftedCount,
          currentMonth: currentMonthNum,
          chitValue: settings.chit_value || 500000,
          duration: settings.duration || 23,
          collected: summary.collectedAmount || 0,
          pending: summary.pendingAmount || 0,
          pendingCount: summary.pending || 0,
          partialCount: summary.partial || 0,
          completedCount: summary.completed || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="text-red-500 text-xl font-bold p-6">Failed to load dashboard data.</div>;

  const summaryCards = [
    { title: 'TOTAL MEMBERS', value: data.totalMembers, icon: Users, color: 'bg-blue-100 text-blue-800' },
    { title: 'CURRENT MONTH', value: `Month ${data.currentMonth}`, icon: Calendar, color: 'bg-indigo-100 text-indigo-800' },
    { title: 'CHIT VALUE', value: <CurrencyDisplay amount={data.chitValue} />, icon: IndianRupee, color: 'bg-purple-100 text-purple-800' },
    { title: 'TOTAL DURATION', value: `${data.duration} Months`, icon: FileClock, color: 'bg-pink-100 text-pink-800' },
    { title: 'PAID THIS MONTH', value: <CurrencyDisplay amount={data.collected} />, icon: IndianRupee, color: 'bg-green-100 text-green-800' },
    { title: 'PENDING THIS MONTH', value: <CurrencyDisplay amount={data.pending} />, icon: FileClock, color: 'bg-red-100 text-red-800' },
    { title: 'MEMBERS WHO LIFTED', value: data.liftedMembers, icon: Users, color: 'bg-orange-100 text-orange-800' },
    { title: 'MEMBERS YET TO LIFT', value: data.notYetLifted, icon: Users, color: 'bg-teal-100 text-teal-800' },
  ];

  const quickActions = [
    { to: '/admin/members/add', label: 'ADD MEMBER', icon: PlusCircle },
    { to: '/admin/payments', label: 'RECORD PAYMENT', icon: IndianRupee },
    { to: '/admin/chit-lift', label: 'MARK CHIT LIFT', icon: FileText },
    { to: '/admin/members', label: 'VIEW MEMBERS', icon: Users },
    { to: '/admin/collection', label: 'CURRENT MONTH', icon: Calendar },
    { to: '/admin/payments/pending', label: 'PENDING PAYMENTS', icon: FileClock },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-navy">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {summaryCards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 mb-1">{card.title}</p>
              <p className="text-2xl font-black text-navy">{card.value}</p>
            </div>
            <div className={`p-4 rounded-full ${card.color}`}>
              <card.icon size={32} />
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-xl md:text-2xl font-bold text-navy mt-10 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action, i) => (
          <Link
            key={i}
            to={action.to}
            className="flex items-center justify-center p-6 bg-navy text-gold rounded-xl shadow-md hover:bg-navy-dark transition-colors font-bold text-lg group"
          >
            <action.icon size={28} className="mr-3 group-hover:scale-110 transition-transform" />
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
