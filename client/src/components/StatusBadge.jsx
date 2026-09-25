export default function StatusBadge({ status }) {
  const badges = {
    paid: { text: '🟢 PAID', bg: 'bg-green-100', color: 'text-green-800' },
    partial: { text: '🟠 PARTIAL', bg: 'bg-orange-100', color: 'text-orange-800' },
    pending: { text: '🔴 PENDING', bg: 'bg-red-100', color: 'text-red-800' },
  };

  const b = badges[status.toLowerCase()] || badges.pending;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-base font-bold ${b.bg} ${b.color}`}>
      {b.text}
    </span>
  );
}
