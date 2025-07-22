import { BrowserRouter, Routes, Route ,Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DonationPage from './pages/user/DonationPage';
import UserDonations from './pages/user/UserDonations';
import SubscriptionPage from './pages/user/SubscriptionPage';
import UserSubscription from './pages/user/UserSubscription';
import UserEvents from './pages/user/UserEvents';
import Unauthorized from './pages/Unauthorized';
import AdminPage from './pages/admin/Dashboard';
import UsersPage from './pages/admin/UsersPage';
import EditUserForm from './pages/admin/EditUserForm';
import AddUserForm from './pages/admin/AddUserForm';
import AdminDonationsPage from './pages/admin/AdminDonationsPage';
import AdminSubscriptionsPage from './pages/admin/AdminSubscriptionsPage';
import AdminEvents from './pages/admin/AdminEvents';
import AdminRoute from './components/admin/AdminRoute';
import Profile from './pages/user/Profile';
import withAuth from './components/auth/withAuth';
function App() {
  const AuthProfile = withAuth(Profile);
  const AuthDonationPage = withAuth(DonationPage);
  const AuthSubscriptionPage = withAuth(SubscriptionPage);

  const AuthUserDonations = withAuth(UserDonations);
  const AuthUserSubscription = withAuth(UserSubscription);
  const AuthUserEvents = withAuth(UserEvents);

  return (


    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/account" element={<Navigate to="/account/profile" replace />} />
          <Route path="/account/profile" element={<AuthProfile />} />
          <Route path="/account/donations" element={<AuthUserDonations />} />
          <Route path="/account/donations/new" element={<AuthDonationPage />} />
          <Route path="/account/subscription" element={<AuthUserSubscription />} />
          <Route path="/account/subscription/new" element={<AuthSubscriptionPage />} />
          <Route path="/account/events" element={<AuthUserEvents />} />
          



          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          } />
           <Route path="/admin/users" element={
            <AdminRoute>
              <UsersPage />
            </AdminRoute>
          } />
          
          <Route path="/admin/users/edit/:id" element={
            <AdminRoute>
              <EditUserForm />
            </AdminRoute>
          } />
          
          <Route path="/admin/users/add" element={
            <AdminRoute>
              <AddUserForm />
            </AdminRoute>
          } />
          
          <Route path="/admin/donations" element={
            <AdminRoute>
              <AdminDonationsPage />
            </AdminRoute>
          } />

          <Route path="/admin/subscriptions" element={
            <AdminRoute>
              <AdminSubscriptionsPage />
            </AdminRoute>
          } />

          <Route path="/admin/events" element={
            <AdminRoute>
              <AdminEvents />
            </AdminRoute>
          } />
          
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;