import { Navigate, createBrowserRouter } from 'react-router-dom'

import { AppShell } from '@/layouts/AdminLayout'
import { VendorShell } from '@/layouts/VendorLayout'
import { ShopLayout } from '@/layouts/CustomerLayout'
import { AuthLayout } from '@/layouts/AuthLayout'

import { AdminLoginPage } from '@/features/auth/pages/AdminLoginPage'
import { VendorLoginPage } from '@/features/auth/pages/VendorLoginPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'

import { DashboardPage } from '@/features/admin/dashboard/DashboardPage'
import { CategoriesPage } from '@/features/admin/categories/CategoriesPage'
import { SubCategoriesPage } from '@/features/admin/subcategories/SubCategoriesPage'
import { ProductsPage } from '@/features/admin/products/ProductsPage'
import { ProductApprovalPage } from '@/features/admin/products/ProductApprovalPage'
import { ProductVariantsPage } from '@/features/admin/variants/VariantsPage'
import { PricingOptionsPage } from '@/features/admin/pricing/PricingPage'
import { VendorsPage } from '@/features/admin/vendors/VendorsPage'
import { VendorDetailsPage } from '@/features/admin/vendors/VendorDetailsPage'
import { OrdersPage } from '@/features/admin/orders/OrdersPage'
import { OrderDetailsPage } from '@/features/admin/orders/OrderDetailsPage'
import { PaymentsPage } from '@/features/admin/payments/PaymentsPage'
import { ShipmentsPage } from '@/features/admin/shipping/ShippingPage'
import { SettlementsPage } from '@/features/admin/settlements/SettlementsPage'
import { SettlementDetailsPage } from '@/features/admin/settlements/SettlementDetailsPage'
import { ReportsPage } from '@/features/admin/reports/ReportsPage'
import { NotificationsPage } from '@/features/admin/notifications/NotificationsPage'
import { SettingsPage } from '@/features/admin/settings/SettingsPage'
import { AdminProfilePage } from '@/features/admin/profile/ProfilePage'
import { NotFoundPage } from '@/features/admin/not-found/NotFoundPage'

import { VendorDashboardPage } from '@/features/vendor/dashboard/DashboardPage'
import { VendorProductsPage } from '@/features/vendor/products/ProductsPage'
import { VendorAddProductPage } from '@/features/vendor/products/AddProductPage'
import { VendorEditProductPage } from '@/features/vendor/products/EditProductPage'
import { VendorProductVariantsPage } from '@/features/vendor/variants/VariantsPage'
import { VendorInventoryPage } from '@/features/vendor/inventory/InventoryPage'
import { VendorOrdersPage } from '@/features/vendor/orders/OrdersPage'
import { VendorOrderDetailsPage } from '@/features/vendor/orders/OrderDetailsPage'
import { VendorShippingPage } from '@/features/vendor/shipping/ShippingPage'
import { VendorEarningsPage } from '@/features/vendor/earnings/EarningsPage'
import { VendorSettlementsPage } from '@/features/vendor/settlements/SettlementsPage'
import { VendorSettlementDetailsPage } from '@/features/vendor/settlements/SettlementDetailsPage'
import { VendorProfilePage } from '@/features/vendor/profile/ProfilePage'

import { StoreHomePage } from '@/features/customer/home/HomePage'
import { CategoriesPage as StoreCategoriesPage } from '@/features/customer/categories/CategoriesPage'
import { CollectionPage } from '@/features/customer/products/CollectionPage'
import { ProductDetailsPage } from '@/features/customer/products/ProductDetailsPage'
import { SearchPage } from '@/features/customer/search/SearchPage'
import { CartPage } from '@/features/customer/cart/CartPage'
import { CheckoutPage } from '@/features/customer/checkout/CheckoutPage'
import { PaymentSuccessPage } from '@/features/customer/checkout/PaymentSuccessPage'
import { PaymentFailedPage } from '@/features/customer/checkout/PaymentFailedPage'
import { OrderSuccessPage } from '@/features/customer/checkout/OrderSuccessPage'
import { MyOrdersPage } from '@/features/customer/orders/MyOrdersPage'
import { OrderDetailsPage as CustomerOrderDetailsPage } from '@/features/customer/orders/OrderDetailsPage'
import { TrackOrderPage } from '@/features/customer/orders/TrackOrderPage'
import { ProfilePage } from '@/features/customer/profile/ProfilePage'
import { AddressesPage } from '@/features/customer/profile/AddressesPage'
import { StoreNotificationsPage } from '@/features/customer/notifications/NotificationsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'sub-categories', element: <SubCategoriesPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'product-approval', element: <ProductApprovalPage /> },
      { path: 'product-variants', element: <ProductVariantsPage /> },
      { path: 'pricing-options', element: <PricingOptionsPage /> },
      { path: 'vendors', element: <VendorsPage /> },
      { path: 'vendors/:id', element: <VendorDetailsPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'orders/:id', element: <OrderDetailsPage /> },
      { path: 'payments', element: <PaymentsPage /> },
      { path: 'shipments', element: <ShipmentsPage /> },
      { path: 'settlements', element: <SettlementsPage /> },
      { path: 'settlements/:id', element: <SettlementDetailsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'profile', element: <AdminProfilePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/vendor',
    element: <VendorShell />,
    children: [
      { index: true, element: <VendorDashboardPage /> },
      { path: 'products', element: <VendorProductsPage /> },
      { path: 'products/add', element: <VendorAddProductPage /> },
      { path: 'products/:id/edit', element: <VendorEditProductPage /> },
      { path: 'product-variants', element: <VendorProductVariantsPage /> },
      { path: 'inventory', element: <VendorInventoryPage /> },
      { path: 'orders', element: <VendorOrdersPage /> },
      { path: 'orders/:id', element: <VendorOrderDetailsPage /> },
      { path: 'shipping', element: <VendorShippingPage /> },
      { path: 'earnings', element: <VendorEarningsPage /> },
      { path: 'settlements', element: <VendorSettlementsPage /> },
      { path: 'settlements/:id', element: <VendorSettlementDetailsPage /> },
      { path: 'profile', element: <VendorProfilePage /> },
      { path: '*', element: <Navigate to="/vendor" replace /> },
    ],
  },
  {
    path: '/shop',
    element: <ShopLayout />,
    children: [
      { index: true, element: <StoreHomePage /> },
      { path: 'categories', element: <StoreCategoriesPage /> },
      { path: 'collections', element: <CollectionPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'products/:id', element: <ProductDetailsPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'payment/success', element: <PaymentSuccessPage /> },
      { path: 'payment/failed', element: <PaymentFailedPage /> },
      { path: 'order/success', element: <OrderSuccessPage /> },
      { path: 'orders/mine', element: <MyOrdersPage /> },
      { path: 'orders/:id', element: <CustomerOrderDetailsPage /> },
      { path: 'orders/:id/track', element: <TrackOrderPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'addresses', element: <AddressesPage /> },
      { path: 'notifications', element: <StoreNotificationsPage /> },
      { path: '*', element: <Navigate to="/shop" replace /> },
    ],
  },
  {
    path: '/login',
    element: <AuthLayout />,
    children: [{ index: true, element: <AdminLoginPage /> }],
  },
  {
    path: '/vendor/login',
    element: <AuthLayout />,
    children: [{ index: true, element: <VendorLoginPage /> }],
  },
  {
    path: '/shop/login',
    element: <AuthLayout />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    path: '/shop/register',
    element: <AuthLayout />,
    children: [{ index: true, element: <RegisterPage /> }],
  },
  {
    path: '/shop/forgot-password',
    element: <AuthLayout />,
    children: [{ index: true, element: <ForgotPasswordPage /> }],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])