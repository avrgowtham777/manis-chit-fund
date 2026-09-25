import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MonthNavigator({ currentMonth, totalMonths, onChange }) {
  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md mb-6">
      <button
        onClick={() => onChange(currentMonth - 1)}
        disabled={currentMonth <= 1}
        className="p-3 bg-gray-100 rounded-lg disabled:opacity-50 hover:bg-gray-200"
      >
        <ChevronLeft size={28} />
      </button>
      <div className="text-xl font-bold text-navy">
        Month {currentMonth} of {totalMonths}
      </div>
      <button
        onClick={() => onChange(currentMonth + 1)}
        disabled={currentMonth >= totalMonths}
        className="p-3 bg-gray-100 rounded-lg disabled:opacity-50 hover:bg-gray-200"
      >
        <ChevronRight size={28} />
      </button>
    </div>
  );
}
