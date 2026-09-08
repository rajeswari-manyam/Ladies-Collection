import { mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'

const ROOT = process.cwd()

const MOVES = [
  // components -> common
  ['src/components/artwork.tsx', 'src/components/common/artwork.tsx'],
  ['src/components/stat-card.tsx', 'src/components/common/stat-card.tsx'],
  ['src/components/state.tsx', 'src/components/common/state.tsx'],
  ['src/components/status-badge.tsx', 'src/components/common/status-badge.tsx'],
  // app -> root
  ['src/app/App.tsx', 'src/App.tsx'],
  ['src/app/main.tsx', 'src/main.tsx'],
  ['src/app/index.css', 'src/index.css'],
  // admin shell -> layouts
  ['src/features/admin/shell/app-shell.tsx', 'src/layouts/AdminLayout.tsx'],
  ['src/features/admin/shell/page-header.tsx', 'src/layouts/PageHeader.tsx'],
  ['src/features/admin/shell/sidebar.tsx', 'src/layouts/AdminSidebar.tsx'],
  ['src/features/admin/shell/topbar.tsx', 'src/layouts/AdminTopbar.tsx'],
  ['src/features/admin/shell/command-palette.tsx', 'src/layouts/AdminCommandPalette.tsx'],
  ['src/features/admin/shell/notification-panel.tsx', 'src/layouts/AdminNotificationPanel.tsx'],
  ['src/features/admin/shell/navigation.ts', 'src/layouts/admin-navigation.ts'],
  // vendor shell -> layouts
  ['src/features/vendor/shell/vendor-shell.tsx', 'src/layouts/VendorLayout.tsx'],
  ['src/features/vendor/shell/vendor-navigation.ts', 'src/layouts/vendor-navigation.ts'],
  ['src/features/vendor/shell/notification-panel.tsx', 'src/layouts/VendorNotificationPanel.tsx'],
  // customer layout -> layouts
  ['src/features/customer/layout/auth-layout.tsx', 'src/layouts/AuthLayout.tsx'],
  ['src/features/customer/layout/store-layout.tsx', 'src/layouts/CustomerLayout.tsx'],
  ['src/features/customer/layout/store-header.tsx', 'src/layouts/CustomerHeader.tsx'],
  ['src/features/customer/layout/store-footer.tsx', 'src/layouts/CustomerFooter.tsx'],
  // admin pages (PascalCase; sub-categories/variants/shipping/pricing -> own features; approvals -> products)
  ['src/features/admin/about/about-page.tsx', 'src/features/admin/about/AboutPage.tsx'],
  ['src/features/admin/auth/admin-login-page.tsx', 'src/features/auth/pages/AdminLoginPage.tsx'],
  ['src/features/admin/categories/categories-page.tsx', 'src/features/admin/categories/CategoriesPage.tsx'],
  ['src/features/admin/categories/sub-categories-page.tsx', 'src/features/admin/subcategories/SubCategoriesPage.tsx'],
  ['src/features/admin/customers/customers-page.tsx', 'src/features/admin/customers/CustomersPage.tsx'],
  ['src/features/admin/dashboard/dashboard-page.tsx', 'src/features/admin/dashboard/DashboardPage.tsx'],
  ['src/features/admin/not-found/not-found-page.tsx', 'src/features/admin/not-found/NotFoundPage.tsx'],
  ['src/features/admin/notifications/notifications-page.tsx', 'src/features/admin/notifications/NotificationsPage.tsx'],
  ['src/features/admin/orders/order-details-page.tsx', 'src/features/admin/orders/OrderDetailsPage.tsx'],
  ['src/features/admin/orders/orders-page.tsx', 'src/features/admin/orders/OrdersPage.tsx'],
  ['src/features/admin/orders/shipments-page.tsx', 'src/features/admin/shipping/ShippingPage.tsx'],
  ['src/features/admin/payments/payments-page.tsx', 'src/features/admin/payments/PaymentsPage.tsx'],
  ['src/features/admin/products/inventory-page.tsx', 'src/features/admin/products/InventoryPage.tsx'],
  ['src/features/admin/products/product-variants-page.tsx', 'src/features/admin/variants/VariantsPage.tsx'],
  ['src/features/admin/products/products-page.tsx', 'src/features/admin/products/ProductsPage.tsx'],
  ['src/features/admin/approvals/product-approval-page.tsx', 'src/features/admin/products/ProductApprovalPage.tsx'],
  ['src/features/admin/reports/reports-page.tsx', 'src/features/admin/reports/ReportsPage.tsx'],
  ['src/features/admin/settings/pricing-options-page.tsx', 'src/features/admin/pricing/PricingPage.tsx'],
  ['src/features/admin/settings/settings-page.tsx', 'src/features/admin/settings/SettingsPage.tsx'],
  ['src/features/admin/settlements/settlement-details-page.tsx', 'src/features/admin/settlements/SettlementDetailsPage.tsx'],
  ['src/features/admin/settlements/settlements-page.tsx', 'src/features/admin/settlements/SettlementsPage.tsx'],
  ['src/features/admin/vendors/vendor-details-page.tsx', 'src/features/admin/vendors/VendorDetailsPage.tsx'],
  ['src/features/admin/vendors/vendors-page.tsx', 'src/features/admin/vendors/VendorsPage.tsx'],
  // admin data
  ['src/features/admin/approvals/data/product-approvals.ts', 'src/features/admin/products/data/product-approvals.ts'],
  // vendor pages + data
  ['src/features/vendor/auth/login-page.tsx', 'src/features/auth/pages/VendorLoginPage.tsx'],
  ['src/features/vendor/dashboard/dashboard-page.tsx', 'src/features/vendor/dashboard/DashboardPage.tsx'],
  ['src/features/vendor/finance/earnings-page.tsx', 'src/features/vendor/earnings/EarningsPage.tsx'],
  ['src/features/vendor/finance/settlement-details-page.tsx', 'src/features/vendor/settlements/SettlementDetailsPage.tsx'],
  ['src/features/vendor/finance/settlements-page.tsx', 'src/features/vendor/settlements/SettlementsPage.tsx'],
  ['src/features/vendor/orders/order-details-page.tsx', 'src/features/vendor/orders/OrderDetailsPage.tsx'],
  ['src/features/vendor/orders/orders-page.tsx', 'src/features/vendor/orders/OrdersPage.tsx'],
  ['src/features/vendor/orders/shipping-page.tsx', 'src/features/vendor/shipping/ShippingPage.tsx'],
  ['src/features/vendor/products/add-product-page.tsx', 'src/features/vendor/products/AddProductPage.tsx'],
  ['src/features/vendor/products/edit-product-page.tsx', 'src/features/vendor/products/EditProductPage.tsx'],
  ['src/features/vendor/products/inventory-page.tsx', 'src/features/vendor/inventory/InventoryPage.tsx'],
  ['src/features/vendor/products/product-variants-page.tsx', 'src/features/vendor/variants/VariantsPage.tsx'],
  ['src/features/vendor/products/products-page.tsx', 'src/features/vendor/products/ProductsPage.tsx'],
  ['src/features/vendor/profile/profile-page.tsx', 'src/features/vendor/profile/ProfilePage.tsx'],
  ['src/features/vendor/api/vendor-portal.ts', 'src/features/vendor/data/vendor-portal.ts'],
  // customer auth -> features/auth
  ['src/features/customer/auth/login-page.tsx', 'src/features/auth/pages/LoginPage.tsx'],
  ['src/features/customer/auth/register-page.tsx', 'src/features/auth/pages/RegisterPage.tsx'],
  ['src/features/customer/auth/forgot-password-page.tsx', 'src/features/auth/pages/ForgotPasswordPage.tsx'],
  // customer pages
  ['src/features/customer/home/home-page.tsx', 'src/features/customer/home/HomePage.tsx'],
  ['src/features/customer/catalog/categories-page.tsx', 'src/features/customer/categories/CategoriesPage.tsx'],
  ['src/features/customer/catalog/search-page.tsx', 'src/features/customer/search/SearchPage.tsx'],
  ['src/features/customer/catalog/collection-page.tsx', 'src/features/customer/products/CollectionPage.tsx'],
  ['src/features/customer/product/product-details-page.tsx', 'src/features/customer/products/ProductDetailsPage.tsx'],
  ['src/features/customer/catalog/catalog.ts', 'src/features/customer/products/data/products.ts'],
  ['src/features/customer/catalog/product-art.tsx', 'src/features/customer/products/components/product-art.tsx'],
  ['src/features/customer/catalog/product-card.tsx', 'src/features/customer/products/components/product-card.tsx'],
  ['src/features/customer/catalog/product-explorer.tsx', 'src/features/customer/products/components/product-explorer.tsx'],
  ['src/features/customer/catalog/product-grid.tsx', 'src/features/customer/products/components/product-grid.tsx'],
  ['src/features/customer/catalog/rating-stars.tsx', 'src/features/customer/products/components/rating-stars.tsx'],
  ['src/features/customer/catalog/size-guide-dialog.tsx', 'src/features/customer/products/components/size-guide-dialog.tsx'],
  ['src/features/customer/cart/cart-page.tsx', 'src/features/customer/cart/CartPage.tsx'],
  ['src/features/customer/cart/qty-stepper.tsx', 'src/features/customer/cart/components/qty-stepper.tsx'],
  ['src/features/customer/cart/use-cart-totals.ts', 'src/features/customer/cart/hooks/use-cart-totals.ts'],
  ['src/features/customer/checkout/checkout-page.tsx', 'src/features/customer/checkout/CheckoutPage.tsx'],
  ['src/features/customer/checkout/order-success-page.tsx', 'src/features/customer/checkout/OrderSuccessPage.tsx'],
  ['src/features/customer/checkout/payment-success-page.tsx', 'src/features/customer/checkout/PaymentSuccessPage.tsx'],
  ['src/features/customer/checkout/payment-failed-page.tsx', 'src/features/customer/checkout/PaymentFailedPage.tsx'],
  ['src/features/customer/orders/my-orders-page.tsx', 'src/features/customer/orders/MyOrdersPage.tsx'],
  ['src/features/customer/orders/order-details-page.tsx', 'src/features/customer/orders/OrderDetailsPage.tsx'],
  ['src/features/customer/orders/track-order-page.tsx', 'src/features/customer/orders/TrackOrderPage.tsx'],
  ['src/features/customer/orders/store-status-badge.tsx', 'src/features/customer/orders/components/store-status-badge.tsx'],
  ['src/features/customer/notifications/store-notifications-page.tsx', 'src/features/customer/notifications/NotificationsPage.tsx'],
  ['src/features/customer/account/profile-page.tsx', 'src/features/customer/profile/ProfilePage.tsx'],
  ['src/features/customer/account/addresses-page.tsx', 'src/features/customer/profile/AddressesPage.tsx'],
  ['src/features/customer/account/account.ts', 'src/features/customer/data/account.ts'],
  // customer type barrel stays; storefront types untouched
]

const DELETES = [
  'src/features/admin/api/api.ts',
  'src/features/admin/api/queries.ts',
  'src/features/vendor/api/api.ts',
  'src/features/vendor/api/vendor-queries.ts',
  'src/features/admin/shell/require-admin.tsx',
  'src/features/vendor/shell/require-vendor.tsx',
  'src/features/admin/shell/admin-store.ts',
  'src/features/vendor/shell/vendor-store.ts',
  'src/features/customer/auth/auth-store.ts',
  'src/features/customer/cart/cart-store.ts',
  'src/features/customer/catalog/wishlist-store.ts',
  'src/app/data/categories.ts',
  'src/app/router.tsx',
  'src/hooks/query-client.ts',
  'src/store/ui-store.ts',
]

// specifier rewrites, longest first
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

let moved = 0
for (const [from, to] of MOVES) {
  const srcPath = join(ROOT, from)
  if (!existsSync(srcPath)) {
    console.error(`MISSING SOURCE: ${from}`)
    process.exitCode = 1
    continue
  }
  const dstPath = join(ROOT, to)
  mkdirSync(dirname(dstPath), { recursive: true })
  renameSync(srcPath, dstPath)
  if (!existsSync(dstPath)) {
    console.error(`MOVE FAILED VERIFY: ${from} -> ${to}`)
    process.exitCode = 1
    continue
  }
  moved++
  console.log(`moved ${from}`)
}

console.log(`\n${moved}/${MOVES.length} files moved`)

let deleted = 0
for (const p of DELETES) {
  const full = join(ROOT, p)
  if (existsSync(full)) {
    rmSync(full, { force: true })
    deleted++
    console.log(`deleted ${p}`)
  }
}
console.log(`${deleted}/${DELETES.length} deleted`)

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
console.log(process.exitCode ? 'EXIT WITH ERRORS' : 'DONE')