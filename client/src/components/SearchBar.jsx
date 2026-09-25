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
    <div className="relative mb-6">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search size={24} className="text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg text-lg focus:ring-navy focus:border-navy"
        placeholder={placeholder}
        value={innerValue}
        onChange={(e) => setInnerValue(e.target.value)}
      />
    </div>
  );
}
