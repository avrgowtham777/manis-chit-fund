import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SearchBar({ value, onChange, placeholder = "Search..." }) {
  const [innerValue, setInnerValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(innerValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [innerValue, onChange]);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search size={22} className="text-slate-500" />
      </div>
      <input
        type="text"
        className="block w-full pl-12 pr-4 py-3.5 border-2 border-slate-300 rounded-xl text-base md:text-lg font-bold text-slate-900 bg-white placeholder:text-slate-400 focus:border-navy focus:ring-2 focus:ring-navy/20 shadow-sm transition-all"
        placeholder={placeholder}
        value={innerValue}
        onChange={(e) => setInnerValue(e.target.value)}
      />
    </div>
  );
}
