export default function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-lg shadow-sm border border-gray-200">
      {Icon && <Icon size={64} className="text-gray-300 mb-4" />}
      <p className="text-xl font-medium text-gray-500">{message}</p>
    </div>
  );
}
