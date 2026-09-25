import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { ShieldCheck, Sparkles, Lock, User, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const [tab, setTab] = useState('member'); // 'member' | 'admin'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(username, password, tab);
      
      // DRAMATIC CONFETTI EXPLOSION ON LOGIN!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d4a843', '#1e3a5f', '#10B981', '#F59E0B']
      });

      setTimeout(() => {
        if (user.role === 'admin') navigate('/admin');
        else navigate('/member');
      }, 500);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      {/* Background Animated Floating Blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-gold/15 rounded-full blur-3xl animate-float pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-navy-light/30 rounded-full blur-3xl animate-pulse-gold pointer-events-none"></div>

      {/* Dramatic Ticker */}
      <div className="absolute top-0 left-0 right-0 bg-navy-dark/80 backdrop-blur-md border-b border-gold/30 text-gold py-2 overflow-hidden z-20">
        <div className="marquee-container text-sm font-black tracking-wider uppercase flex items-center">
          <span className="marquee-content flex items-center gap-8">
            <span>✨ MANI'S CHIT FUND 2026–2028</span>
            <span>⭐ STARTING OCTOBER 2026</span>
            <span>💰 TOTAL CHIT VALUE: ₹5,00,000</span>
            <span>🏆 23 MONTHS HIGH RETURNS</span>
            <span>🔒 BANK-GRADE SECURITY & ISOLATION</span>
            <span>⚡ FAST INSTANT RECEIPT GENERATION</span>
          </span>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 mt-8">
        <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-gold to-amber-600 rounded-2xl shadow-xl shadow-gold/20 mb-4 animate-float">
          <ShieldCheck size={48} className="text-slate-950" />
        </div>
        <h2 className="text-4xl font-black text-white tracking-tight shimmer-text">
          MANI'S CHIT FUND
        </h2>
        <p className="mt-2 text-lg text-gold font-bold flex items-center justify-center gap-1.5">
          <Sparkles size={18} /> Premium Secure Chit Management <Sparkles size={18} />
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-dramatic">
        <div className="bg-slate-800/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-700/80 shadow-navy-dark/50">
          <div className="flex border-b border-slate-700 mb-8 p-1 bg-slate-900/60 rounded-xl">
            <button
              className={`flex-1 py-3 text-base font-black rounded-lg transition-all flex items-center justify-center gap-2 ${
                tab === 'member'
                  ? 'bg-gradient-to-r from-gold to-amber-500 text-slate-950 shadow-lg shadow-gold/20 scale-[1.02]'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => { setTab('member'); setError(''); }}
            >
              <User size={18} /> MEMBER LOGIN
            </button>
            <button
              className={`flex-1 py-3 text-base font-black rounded-lg transition-all flex items-center justify-center gap-2 ${
                tab === 'admin'
                  ? 'bg-gradient-to-r from-navy to-navy-light text-white shadow-lg shadow-navy/40 scale-[1.02] border border-blue-400/30'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => { setTab('admin'); setError(''); }}
            >
              <Lock size={18} /> ORGANISER
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-base font-bold text-gray-200 mb-1.5 flex items-center gap-2">
                <User size={16} className="text-gold" />
                {tab === 'member' ? 'Member ID / Username' : 'Organiser Username'}
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  placeholder={tab === 'member' ? 'e.g. mcf001' : 'e.g. admin'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-4 py-3.5 bg-slate-900/80 border border-slate-600 rounded-xl shadow-inner placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-lg font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-base font-bold text-gray-200 mb-1.5 flex items-center gap-2">
                <KeyRound size={16} className="text-gold" /> Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3.5 bg-slate-900/80 border border-slate-600 rounded-xl shadow-inner placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-lg font-medium transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-base bg-red-950/60 border border-red-800 p-4 rounded-xl font-bold flex items-center gap-2 animate-shake">
                <span>⚠️</span> {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-xl text-xl font-black text-slate-950 bg-gradient-to-r from-gold via-amber-400 to-yellow-500 hover:brightness-110 active:scale-98 transition-all disabled:opacity-50"
              >
                {loading ? 'LOGGING IN...' : 'LOGIN TO CHIT FUND 🚀'}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700/60 text-center text-xs text-gray-400">
            <p>Demo Admin: <span className="text-gold font-mono font-bold">admin / Admin@123</span></p>
            <p className="mt-1">Demo Member: <span className="text-gold font-mono font-bold">mcf001 / Member@123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
