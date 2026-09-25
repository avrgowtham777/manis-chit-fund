import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import MemberLayout from './layouts/MemberLayout';

// Pages
import LoginPage from './pages/LoginPage';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import MembersList from './pages/admin/MembersList';
import AddMember from './pages/admin/AddMember';
import MemberProfile from './pages/admin/MemberProfile';
import RecordPayment from './pages/admin/RecordPayment';
import PendingPayments from './pages/admin/PendingPayments';
import MonthlyCollection from './pages/admin/MonthlyCollection';
import ChitLifting from './pages/admin/ChitLifting';
import Reports from './pages/admin/Reports';
import AuditLog from './pages/admin/AuditLog';
import AdminNotifications from './pages/admin/AdminNotifications';
import Settings from './pages/admin/Settings';
import Backup from './pages/admin/Backup';

// Member Pages
import MemberDashboard from './pages/member/Dashboard';
import MyPayments from './pages/member/MyPayments';
import MyChit from './pages/member/MyChit';
import MyReceipts from './pages/member/MyReceipts';
import MemberNotifications from './pages/member/MemberNotifications';
import MyProfile from './pages/member/MyProfile';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />

          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="members" element={<MembersList />} />
            <Route path="members/add" element={<AddMember />} />
            <Route path="members/:id" element={<MemberProfile />} />
            <Route path="payments" element={<RecordPayment />} />
            <Route path="payments/pending" element={<PendingPayments />} />
            <Route path="collection/:monthId?" element={<MonthlyCollection />} />
            <Route path="chit-lift" element={<ChitLifting />} />
            <Route path="reports" element={<Reports />} />
            <Route path="audit" element={<AuditLog />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="settings" element={<Settings />} />
            <Route path="backup" element={<Backup />} />
          </Route>

          {/* Member Routes */}
          <Route path="/member/*" element={
            <ProtectedRoute allowedRole="member">
              <MemberLayout />
            </ProtectedRoute>
          }>
            <Route index element={<MemberDashboard />} />
            <Route path="payments" element={<MyPayments />} />
            <Route path="chit" element={<MyChit />} />
            <Route path="receipts" element={<MyReceipts />} />
            <Route path="notifications" element={<MemberNotifications />} />
            <Route path="profile" element={<MyProfile />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
