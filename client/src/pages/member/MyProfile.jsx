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
      <h2 className="text-2xl md:text-3xl font-bold text-navy">My Profile</h2>

      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-navy mb-4 border-b pb-2">Member Information</h3>
        <div className="space-y-4 text-base">
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase">Full Name</p>
            <p className="text-2xl font-black text-navy">{member?.name}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase">Member ID</p>
              <p className="text-xl font-bold font-mono text-navy">{member?.member_code}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase">Phone Number</p>
              <p className="text-xl font-bold text-gray-800">{member?.phone || 'Not registered'}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase">Account Status</p>
            <p className="text-lg font-bold text-green-600">Active Member</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-navy mb-2">Change Password</h3>
        <p className="text-sm text-gray-500 mb-4">Set a new personal password for logging into your account.</p>

        {passMsg && <div className="mb-4 p-3 bg-green-50 text-green-700 font-bold rounded-lg">{passMsg}</div>}
        {passError && <div className="mb-4 p-3 bg-red-50 text-red-700 font-bold rounded-lg">{passError}</div>}

        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              placeholder="Enter current password"
              required
              value={passData.oldPassword}
              onChange={(e) => setPassData({...passData, oldPassword: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-navy focus:border-navy text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              placeholder="Enter new password (min 6 characters)"
              required
              value={passData.newPassword}
              onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-navy focus:border-navy text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              placeholder="Re-enter new password"
              required
              value={passData.confirmPassword}
              onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-navy focus:border-navy text-lg"
            />
          </div>

          <button 
            type="submit" 
            disabled={changingPass}
            className="w-full py-4 bg-navy text-gold font-bold rounded-xl text-lg hover:bg-navy-dark shadow disabled:opacity-50"
          >
            {changingPass ? 'UPDATING...' : 'UPDATE PASSWORD'}
          </button>
        </form>
      </div>

      <button 
        onClick={logout} 
        className="w-full py-4 bg-red-50 text-red-700 hover:bg-red-100 font-bold rounded-xl text-lg border border-red-200 transition-colors"
      >
        LOGOUT OF ACCOUNT
      </button>
    </div>
  );
}
