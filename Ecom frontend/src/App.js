import React, { useState } from 'react';
import {
  BrowserRouter as BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import ManageUsersPage from './components/ManageUsersPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import Product from './components/Product';
import ProductDetail from './components/ProductDetail';
import AdminProductPage from './components/AdminProductPage';
import Footer from './components/Footer';
import FAQPage from './components/FAQPage';
import ContactPage from './components/ContactPage';
import TermsPage from './components/TermsPage';
import HomePage from './components/HomePage';
import CartPage from './components/CartPage';
import AdminNavbar from './components/NavBarAdmin';
import CustomNavbarLogin from './components/NavBarLogin';
import CustomNavbarLogout from './components/NavBarLogout';
import CartDrawer from './components/CartDrawer';
import ScrollToTop from './components/ScrollToTop';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import UserProfilePage from './components/UserProfilePage';
import MyAddressesPage from './components/MyAddressesPage';
import UserDetailAdminPage from './components/UserDetailAdminPage';
import ChangePasswordPage from './components/ChangePasswordPage';
import AdminDashboard from './components/AdminDashboard';
import CartCheckout from './components/CartCheckout';
import GoBackButton from './components/GoBackButton';
import StartPayment from './components/StartPayment';
import CODOrderSummary from './components/CODOrderSummary';
import FinalizeOrder from './components/FinalizeOrder';
import UpdatePaymentStatus from './components/UpdatePaymentStatus';
import OrdersPage from './components/OrdersPage';
import AdminPanel from './components/AdminPanel';
import ProductFrequencyChart from './components/ProductFrequencyChart';
import OrderDetailsPage from './components/OrderDetailsPage';
import FeedbackPage from './components/FeedbackPage';
import AdminReport from './components/AdminReport'; 


// 🔒 Authenticated route
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Loading authentication...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// 🔐 Admin-specific route
const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <div>Loading authentication...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  const hasRole = user?.roles?.some((role) => allowedRoles.includes(role));
  return hasRole ? children : <Navigate to="/products" />;
};

// 🧠 App layout with navbar logic
const AppLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [isCartOpen, setCartOpen] = useState(false);

  const hideNavbarRoutes = [
    '/login',
    '/register',
    '/forgotpassword',
    '/resetpassword',
  ];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar &&
        (user?.roles?.includes('ADMIN') ? (
          <AdminNavbar onCartClick={() => setCartOpen(true)} />
        ) : isAuthenticated ? (
          <CustomNavbarLogin onCartClick={() => setCartOpen(true)} />
        ) : (
          <CustomNavbarLogout />
        ))}

      {isAuthenticated && (
        <CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
      )}

      <Routes>
      <Route
  path="/"
  element={
    user?.roles?.includes('ADMIN') ? (
      <AdminDashboard />
    ) : (
      <HomePage />
    )
  }
/>

<Route
  path="/update-payment-status/:paymentId"
  element={
    <PrivateRoute>
      <UpdatePaymentStatus />
    </PrivateRoute>
  }
/>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/products" element={<Product />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cartpage" element={<CartPage />} />
        <Route path="/forgotpassword" element={<ForgotPasswordPage />} />
        <Route path="/resetpassword" element={<ResetPasswordPage />} />
        <Route path="/userprofile" element={<UserProfilePage />} />
        <Route path="/addresses" element={<MyAddressesPage />} />
        <Route path="/changepassword" element={<ChangePasswordPage/>}/>
        <Route path="/goback" element={<GoBackButton />} />
        {/* <Route path="/startpayment" element={<StartPayment/>} /> */}




        <Route
          path="manageusers"
          element={
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <ManageUsersPage />
            </RoleBasedRoute>
          }
        />

          <Route
            path="/admin/users/:userId"
            element={
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <UserDetailAdminPage />
              </RoleBasedRoute>
            }
          />

          <Route
            path="/adminproduct"
            element={
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <AdminProductPage />
              </RoleBasedRoute>
            }
          />
          <Route
  path="/admin/report"
  element={
    <RoleBasedRoute allowedRoles={['ADMIN']}>
      <AdminReport />
    </RoleBasedRoute>
  }
/>


<Route
  path="/cartcheckout"
  element={
    <PrivateRoute>
      <CartCheckout />
    </PrivateRoute>
  }
/>

<Route path="/startpayment/" element={<PrivateRoute><StartPayment /></PrivateRoute>} />


<Route
  path="/cod-order-summary/:orderId"
  element={
    <PrivateRoute>
      <CODOrderSummary />
    </PrivateRoute>
  }
/>

<Route
  path="/finalize-order/:paymentId"
  element={
    <PrivateRoute>
      <FinalizeOrder />
    </PrivateRoute>
  }
/>

<Route
  path="/orders"
  element={
    <PrivateRoute>
      <OrdersPage />
    </PrivateRoute>
  }
/>

<Route
  path="/admin"
  element={
    <RoleBasedRoute allowedRoles={['ADMIN']}>
      <AdminPanel />
    </RoleBasedRoute>
  }
/>

<Route
  path="/admin/product-frequency"
  element={
    <RoleBasedRoute allowedRoles={['ADMIN']}>
      <ProductFrequencyChart />
    </RoleBasedRoute>
  }
/>



<Route
  path="/user/orders/:orderId"
  element={
    <PrivateRoute>
      <OrderDetailsPage />
    </PrivateRoute>
  }
/>

<Route
  path="/feedback/:productId"
  element={
    <PrivateRoute>
      <FeedbackPage />
    </PrivateRoute>
  }
/>


        <Route path="/faq" element={<FAQPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/termscondition" element={<TermsPage />} />

        <Route path="*" element={<Navigate to="/products" />} />
      </Routes>

      {!hideNavbarRoutes.includes(location.pathname) && <Footer />}
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
