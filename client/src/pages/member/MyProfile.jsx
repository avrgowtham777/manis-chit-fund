import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function MyProfile() {
  const { logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passData, setPassData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passMsg, setPassMsg] = useState('');
  const [passError, setPassError] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/member/profile');
      setProfileData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPassMsg('');
    setPassError('');
    if (passData.newPassword !== passData.confirmPassword) {
      setPassError('New passwords do not match');
      return;
    }
    if (passData.newPassword.length < 6) {
      setPassError('Password must be at least 6 characters long');
      return;
    }

    setChangingPass(true);
    try {
      await api.post('/auth/change-password', {
        oldPassword: passData.oldPassword,
        newPassword: passData.newPassword
      });
      setPassMsg('Password updated successfully!');
      setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setChangingPass(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!profileData) return null;

  const { member } = profileData;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
          <span>My Profile & Security</span>
          <span className="text-gold text-2xl">👤</span>
        </h2>
        <p className="text-slate-300 font-medium mt-1">Manage your member profile information and login password</p>
      </div>

      <div className="cyber-card rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl">
        <h3 className="text-xl font-black text-white mb-6 border-b border-slate-800 pb-3 flex items-center gap-2">
          <span>Member Information</span>
          <span className="text-gold text-sm font-mono">● VERIFIED</span>
        </h3>
        <div className="space-y-4 text-base">
          <div>
            <p className="text-xs font-black text-gold uppercase tracking-wider">Full Name</p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-0.5">{member?.name}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Member ID</p>
              <p className="text-xl font-black font-mono text-gold mt-0.5">{member?.member_code}</p>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Phone Number</p>
              <p className="text-lg font-black text-white mt-0.5">{member?.phone || 'Not registered'}</p>
            </div>
          </div>
          <div className="pt-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Account Status</p>
            <span className="inline-block mt-1 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-black tracking-wider uppercase">
              ● Active Member
            </span>
          </div>
        </div>
      </div>

      <div className="cyber-card rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl">
        <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
          <span>Change Password</span>
          <span className="text-gold">✦</span>
        </h3>
        <p className="text-sm text-slate-300 mb-6">Set a new personal password for logging into your member account.</p>

        {passMsg && <div className="mb-4 p-3 bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold rounded-xl">{passMsg}</div>}
        {passError && <div className="mb-4 p-3 bg-rose-950 text-rose-300 border border-rose-500/40 font-bold rounded-xl">{passError}</div>}

        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-gold uppercase tracking-wider mb-2">Current Password</label>
            <input
              type="password"
              placeholder="Enter current password"
              required
              value={passData.oldPassword}
              onChange={(e) => setPassData({...passData, oldPassword: e.target.value})}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-gold/40 focus:ring-2 focus:ring-gold text-base font-bold text-slate-900 bg-white shadow-lg transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gold uppercase tracking-wider mb-2">New Password</label>
            <input
              type="password"
              placeholder="Enter new password (min 6 characters)"
              required
              value={passData.newPassword}
              onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-gold/40 focus:ring-2 focus:ring-gold text-base font-bold text-slate-900 bg-white shadow-lg transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gold uppercase tracking-wider mb-2">Confirm New Password</label>
            <input
              type="password"
              placeholder="Re-enter new password"
              required
              value={passData.confirmPassword}
              onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-gold/40 focus:ring-2 focus:ring-gold text-base font-bold text-slate-900 bg-white shadow-lg transition-all"
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={changingPass}
              className="gold-glow-button w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl disabled:opacity-50 transition-all"
            >
              {changingPass ? 'UPDATING...' : 'UPDATE PASSWORD'}
            </button>
          </div>
        </form>
      </div>

      <button 
        onClick={logout} 
        className="w-full py-4 bg-rose-950/70 text-rose-300 hover:bg-rose-900 font-black rounded-2xl text-sm border border-rose-600/50 shadow-xl uppercase tracking-wider transition-all"
      >
        LOGOUT OF ACCOUNT
      </button>
    </div>
  );
}
