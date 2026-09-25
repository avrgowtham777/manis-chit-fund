export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, isWarn }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onCancel}></div>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full z-10 p-6 flex flex-col gap-4">
        <h3 className={`text-2xl font-bold ${isWarn ? 'text-red-600' : 'text-navy'}`}>{title}</h3>
        <p className="text-lg text-gray-700">{message}</p>
        <div className="flex gap-4 mt-4">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-lg font-bold text-gray-700 bg-gray-50 hover:bg-gray-100"
          >
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 px-4 rounded-lg text-lg font-bold text-white ${isWarn ? 'bg-red-600 hover:bg-red-700' : 'bg-navy hover:bg-navy-dark'}`}
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
}
