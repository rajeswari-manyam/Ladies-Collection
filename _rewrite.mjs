import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const ROOT = process.cwd()

const REWRITES = [
  ['@/features/admin/shell/command-palette', '@/layouts/AdminCommandPalette'],
  ['@/features/admin/shell/notification-panel', '@/layouts/AdminNotificationPanel'],
  ['@/features/admin/shell/app-shell', '@/layouts/AdminLayout'],
  ['@/features/admin/shell/page-header', '@/layouts/PageHeader'],
  ['@/features/admin/shell/sidebar', '@/layouts/AdminSidebar'],
  ['@/features/admin/shell/topbar', '@/layouts/AdminTopbar'],
  ['@/features/admin/shell/navigation', '@/layouts/admin-navigation'],
  ['@/features/admin/shell/admin-store', '@/store/appStore'],
  ['@/features/vendor/shell/vendor-navigation', '@/layouts/vendor-navigation'],
  ['@/features/vendor/shell/notification-panel', '@/layouts/VendorNotificationPanel'],
  ['@/features/vendor/shell/vendor-shell', '@/layouts/VendorLayout'],
  ['@/features/vendor/shell/vendor-store', '@/store/appStore'],
  ['@/features/customer/layout/store-layout', '@/layouts/CustomerLayout'],
  ['@/features/customer/layout/auth-layout', '@/layouts/AuthLayout'],
  ['@/features/customer/layout/store-header', '@/layouts/CustomerHeader'],
  ['@/features/customer/layout/store-footer', '@/layouts/CustomerFooter'],
  ['@/store/ui-store', '@/store/uiStore'],
  ['@/hooks/query-client', '@/config/queryClient'],
  ['@/app/App', '@/App'],
  ['@/app/router', '@/routes'],
  ['@/components/artwork', '@/components/common/artwork'],
  ['@/components/stat-card', '@/components/common/stat-card'],
  ['@/components/state', '@/components/common/state'],
  ['@/components/status-badge', '@/components/common/status-badge'],
  ['@/features/admin/api/queries', '@/features/admin/hooks'],
  ['@/features/vendor/api/vendor-queries', '@/features/vendor/hooks'],
  ['@/features/vendor/api/vendor-portal', '@/features/vendor/data/vendor-portal'],
  ['@/features/customer/auth/auth-store', '@/store/appStore'],
  ['@/features/customer/cart/cart-store', '@/store/appStore'],
  ['@/features/customer/catalog/wishlist-store', '@/store/appStore'],
  ['@/features/customer/account/profile-page', '@/features/customer/profile/ProfilePage'],
  ['@/features/customer/account/addresses-page', '@/features/customer/profile/AddressesPage'],
  ['@/features/customer/account/account', '@/features/customer/data/account'],
  ['@/features/customer/catalog/categories-page', '@/features/customer/categories/CategoriesPage'],
  ['@/features/customer/catalog/search-page', '@/features/customer/search/SearchPage'],
  ['@/features/customer/catalog/collection-page', '@/features/customer/products/CollectionPage'],
  ['@/features/customer/catalog/size-guide-dialog', '@/features/customer/products/components/size-guide-dialog'],
  ['@/features/customer/catalog/product-explorer', '@/features/customer/products/components/product-explorer'],
  ['@/features/customer/catalog/product-grid', '@/features/customer/products/components/product-grid'],
  ['@/features/customer/catalog/product-card', '@/features/customer/products/components/product-card'],
  ['@/features/customer/catalog/product-art', '@/features/customer/products/components/product-art'],
  ['@/features/customer/catalog/rating-stars', '@/features/customer/products/components/rating-stars'],
  ['@/features/customer/catalog/catalog', '@/features/customer/products/data/products'],
  ['@/features/customer/product/product-details-page', '@/features/customer/products/ProductDetailsPage'],
  ['@/features/customer/cart/use-cart-totals', '@/features/customer/cart/hooks/use-cart-totals'],
  ['@/features/customer/cart/qty-stepper', '@/features/customer/cart/components/qty-stepper'],
  ['@/features/customer/orders/store-status-badge', '@/features/customer/orders/components/store-status-badge'],
  ['@/features/customer/orders/my-orders-page', '@/features/customer/orders/MyOrdersPage'],
  ['@/features/customer/orders/order-details-page', '@/features/customer/orders/OrderDetailsPage'],
  ['@/features/customer/orders/track-order-page', '@/features/customer/orders/TrackOrderPage'],
  ['@/features/customer/notifications/store-notifications-page', '@/features/customer/notifications/NotificationsPage'],
  ['@/features/customer/checkout/checkout-page', '@/features/customer/checkout/CheckoutPage'],
  ['@/features/customer/checkout/order-success-page', '@/features/customer/checkout/OrderSuccessPage'],
  ['@/features/customer/checkout/payment-success-page', '@/features/customer/checkout/PaymentSuccessPage'],
  ['@/features/customer/checkout/payment-failed-page', '@/features/customer/checkout/PaymentFailedPage'],
  ['@/features/customer/home/home-page', '@/features/customer/home/HomePage'],
  ['@/features/customer/auth/login-page', '@/features/auth/pages/LoginPage'],
  ['@/features/customer/auth/register-page', '@/features/auth/pages/RegisterPage'],
  ['@/features/customer/auth/forgot-password-page', '@/features/auth/pages/ForgotPasswordPage'],
  ['@/features/admin/products/product-variants-page', '@/features/admin/variants/VariantsPage'],
  ['@/features/admin/orders/shipments-page', '@/features/admin/shipping/ShippingPage'],
  ['@/features/admin/settings/pricing-options-page', '@/features/admin/pricing/PricingPage'],
  ['@/features/admin/categories/sub-categories-page', '@/features/admin/subcategories/SubCategoriesPage'],
  ['@/features/admin/approvals/product-approval-page', '@/features/admin/products/ProductApprovalPage'],
  ['@/features/vendor/products/product-variants-page', '@/features/vendor/variants/VariantsPage'],
  ['@/features/vendor/products/add-product-page', '@/features/vendor/products/AddProductPage'],
  ['@/features/vendor/products/edit-product-page', '@/features/vendor/products/EditProductPage'],
  ['@/features/vendor/products/inventory-page', '@/features/vendor/inventory/InventoryPage'],
  ['@/features/vendor/products/products-page', '@/features/vendor/products/ProductsPage'],
  ['@/features/vendor/finance/earnings-page', '@/features/vendor/earnings/EarningsPage'],
  ['@/features/vendor/finance/settlements-page', '@/features/vendor/settlements/SettlementsPage'],
  ['@/features/vendor/finance/settlement-details-page', '@/features/vendor/settlements/SettlementDetailsPage'],
  ['@/features/vendor/dashboard/dashboard-page', '@/features/vendor/dashboard/DashboardPage'],
  ['@/features/vendor/orders/orders-page', '@/features/vendor/orders/OrdersPage'],
  ['@/features/vendor/orders/order-details-page', '@/features/vendor/orders/OrderDetailsPage'],
  ['@/features/vendor/orders/shipping-page', '@/features/vendor/shipping/ShippingPage'],
  ['@/features/vendor/profile/profile-page', '@/features/vendor/profile/ProfilePage'],
  ['@/features/admin/dashboard/dashboard-page', '@/features/admin/dashboard/DashboardPage'],
  ['@/features/admin/categories/categories-page', '@/features/admin/categories/CategoriesPage'],
  ['@/features/admin/notifications/notifications-page', '@/features/admin/notifications/NotificationsPage'],
  ['@/features/admin/orders/orders-page', '@/features/admin/orders/OrdersPage'],
  ['@/features/admin/orders/order-details-page', '@/features/admin/orders/OrderDetailsPage'],
  ['@/features/admin/payments/payments-page', '@/features/admin/payments/PaymentsPage'],
  ['@/features/admin/products/products-page', '@/features/admin/products/ProductsPage'],
  ['@/features/admin/products/inventory-page', '@/features/admin/products/InventoryPage'],
  ['@/features/admin/reports/reports-page', '@/features/admin/reports/ReportsPage'],
  ['@/features/admin/settings/settings-page', '@/features/admin/settings/SettingsPage'],
  ['@/features/admin/settlements/settlements-page', '@/features/admin/settlements/SettlementsPage'],
  ['@/features/admin/settlements/settlement-details-page', '@/features/admin/settlements/SettlementDetailsPage'],
  ['@/features/admin/vendors/vendors-page', '@/features/admin/vendors/VendorsPage'],
  ['@/features/admin/vendors/vendor-details-page', '@/features/admin/vendors/VendorDetailsPage'],
  ['@/features/admin/customers/customers-page', '@/features/admin/customers/CustomersPage'],
  ['@/features/admin/not-found/not-found-page', '@/features/admin/not-found/NotFoundPage'],
  ['@/features/admin/about/about-page', '@/features/admin/about/AboutPage'],
  ['@/features/admin/auth/admin-login-page', '@/features/auth/pages/AdminLoginPage'],
  ['@/features/vendor/auth/login-page', '@/features/auth/pages/VendorLoginPage'],
].sort((a, b) => b[0].length - a[0].length)

const allFiles = []
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (/\.(ts|tsx)$/.test(entry.name)) allFiles.push(full)
  }
}
walk(join(ROOT, 'src'))

let rewritten = 0
for (const file of allFiles) {
  const rel = relative(ROOT, file).split(sep).join('/')
  let content = readFileSync(file, 'utf8')
  let changed = false
  for (const [from, to] of REWRITES) {
    if (content.includes(from)) {
      content = content.split(from).join(to)
      changed = true
    }
  }
  if (changed) {
    writeFileSync(file, content, 'utf8')
    rewritten++
    console.log(`rewrote ${rel}`)
  }
}
console.log(`\n${rewritten} files rewritten`)
console.log('DONE')