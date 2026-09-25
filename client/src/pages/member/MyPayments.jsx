import { useState, useEffect } from 'react';
import api from '../../services/api';
import PaymentTable from '../../components/PaymentTable';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function MyPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data } = await api.get('/member/payments');
        setPayments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
          <span>My Payment History</span>
          <span className="text-gold text-2xl">💳</span>
        </h2>
        <p className="text-slate-300 font-medium mt-1">23-month scheduled breakdown with live payment statuses</p>
      </div>
      
      <PaymentTable payments={payments} />
    </div>
  );
}
