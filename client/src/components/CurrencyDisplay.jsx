import { formatCurrency } from '../utils/currency';

export default function CurrencyDisplay({ amount, className = '' }) {
  return (
    <span className={`font-bold ${className}`}>
      {formatCurrency(amount)}
    </span>
  );
}
