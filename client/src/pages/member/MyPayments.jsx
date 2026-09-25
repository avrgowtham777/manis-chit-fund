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
      <h2 className="text-2xl font-bold text-navy">My Payment History</h2>
      
      <PaymentTable payments={payments} />
    </div>
  );
}
