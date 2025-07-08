import { BrowserRouter, Routes, Route ,Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Unauthorized from './pages/Unauthorized';
import AdminPage from './pages/admin/Dashboard';
import UsersPage from './pages/admin/UsersPage';
import AdminRoute from './components/admin/AdminRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
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
        
        {/*<Route path="/admin/donations" element={
          <AdminRoute>
            <AdminDonations />
          </AdminRoute>
        } />
        
        <Route path="/admin/posts" element={
          <AdminRoute>
            <AdminPosts />
          </AdminRoute>
        } /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;