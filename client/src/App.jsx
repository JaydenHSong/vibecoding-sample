// Design Ref: §11 — React Router setup with Customer/Admin layouts
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';

// Customer pages (lazy loaded)
const HomePage = lazy(() => import('./pages/customer/HomePage'));
const ProductListPage = lazy(() => import('./pages/customer/ProductListPage'));
const ProductDetailPage = lazy(() => import('./pages/customer/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/customer/CartPage'));
const CheckoutPage = lazy(() => import('./pages/customer/CheckoutPage'));
const OrderCompletePage = lazy(() => import('./pages/customer/OrderCompletePage'));
const LoginPage = lazy(() => import('./pages/customer/LoginPage'));
const RegisterPage = lazy(() => import('./pages/customer/RegisterPage'));
const WelcomePage = lazy(() => import('./pages/customer/WelcomePage'));
const MyPage = lazy(() => import('./pages/customer/MyPage'));
const SearchPage = lazy(() => import('./pages/customer/SearchPage'));
const SupportPage = lazy(() => import('./pages/customer/SupportPage'));
const TermsPage = lazy(() => import('./pages/customer/TermsPage'));

// Admin pages (lazy loaded — separate chunk)
const AdminSidebar = lazy(() => import('./components/common/AdminSidebar'));
const AdminHeader = lazy(() => import('./components/common/AdminHeader'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminProductFormPage = lazy(() => import('./pages/admin/AdminProductFormPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminOrderDetailPage = lazy(() => import('./pages/admin/AdminOrderDetailPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminBannersPage = lazy(() => import('./pages/admin/AdminBannersPage'));
const AdminReviewsPage = lazy(() => import('./pages/admin/AdminReviewsPage'));
const AdminInquiriesPage = lazy(() => import('./pages/admin/AdminInquiriesPage'));
const AdminStatsPage = lazy(() => import('./pages/admin/AdminStatsPage'));

import './styles/global.css';
import './styles/customer-layout.css';
import './styles/admin-layout.css';

// Customer layout wrapper
function CustomerLayout() {
  return (
    <div className="customer-layout">
      <Header />
      <main className="customer-layout__main">
        <div className="customer-layout__content">
          <Suspense fallback={<LoadingSpinner />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Admin layout wrapper
function AdminLayout() {
  return (
    <div className="admin-layout">
      <Suspense fallback={<LoadingSpinner />}>
        <AdminSidebar />
        <div className="admin-layout__body">
          <AdminHeader />
          <div className="admin-layout__content">
            <Outlet />
          </div>
        </div>
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer Pages */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-complete/:id" element={<OrderCompletePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/terms/:type" element={<TermsPage />} />
        </Route>

        {/* Admin Pages */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/new" element={<AdminProductFormPage />} />
          <Route path="products/:id/edit" element={<AdminProductFormPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:id" element={<AdminOrderDetailPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="banners" element={<AdminBannersPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="inquiries" element={<AdminInquiriesPage />} />
          <Route path="stats" element={<AdminStatsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
