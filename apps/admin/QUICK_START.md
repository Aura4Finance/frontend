# OraFi Admin Dashboard - Quick Start Guide

## 🎯 What Has Been Done

### ✅ Completed Components

1. **API Integration Layer**
   - Created 6 comprehensive React Query hook files in `components/hooks/`:
     - `useDashboard.ts` - Dashboard stats and analytics
     - `useCustomers.ts` - Customer management
     - `useTransactions.ts` - Transaction monitoring
     - `useMerchants.ts` - Merchant management
     - `useSystemHealth.ts` - System monitoring
     - `useSettings.ts` - Admin settings

2. **Shared UI Components**
   - `Skeletons.tsx` - Loading states (KPICardSkeleton, TableRowSkeleton, ChartSkeleton, etc.)
   - `ErrorState.tsx` - Error handling and empty states

3. **Updated Pages**
   - ✅ `Overview.tsx` - Fully integrated with API hooks, loading states, and error handling
   - ⚠️ `Customers.tsx` - Imports updated, ready for full integration
   - ✅ `TransactionsNew.tsx` - Complete new implementation with charts and API integration

4. **Configuration**
   - `.env.example` - Environment variable template
   - `IMPLEMENTATION_GUIDE.md` - Comprehensive technical documentation

## 🚀 Next Steps to Complete

### 1. Update Component Files

Replace or update these components to use the API hooks:

#### Customers.tsx
```tsx
// Remove mock data at top
// Replace with:
import { useCustomers, useCustomer, type Customer } from "./hooks/useCustomers";
import { TableRowSkeleton } from "./shared/Skeletons";
import ErrorState, { EmptyState } from "./shared/ErrorState";

// In component, replace mockCustomers with:
const { data: customersResponse, isLoading, error } = useCustomers({
  page: currentPage,
  limit: itemsPerPage,
  search: searchValue,
  status: selectedFilter === "all" ? undefined : selectedFilter,
});

const customers = customersResponse?.data || [];
```

#### Transactions.tsx
Option A: Rename `TransactionsNew.tsx` to `Transactions.tsx` (recommended)
Option B: Copy the implementation from `TransactionsNew.tsx` to `Transactions.tsx`

#### Merchants.tsx
Add API integration:
```tsx
import {
  useMerchants,
  useMerchant,
  useMerchantLeaderboard,
  useMerchantModeDistribution,
  useMerchantOnboardingData,
} from "./hooks/useMerchants";
import { KPICardSkeleton, ChartSkeleton, TableRowSkeleton } from "./shared/Skeletons";
import ErrorState, { EmptyState } from "./shared/ErrorState";

// Replace mock data with API calls
const { data: merchantsResponse, isLoading, error } = useMerchants({
  page: currentPage,
  limit: itemsPerPage,
  search: searchValue,
  status: selectedFilter === "all" ? undefined : selectedFilter,
});

const { data: leaderboardData } = useMerchantLeaderboard(5);
const { data: modeDistribution } = useMerchantModeDistribution();
const { data: onboardingData } = useMerchantOnboardingData(8);
```

#### SystemHealth.tsx
```tsx
import {
  useSystemHealth,
  useSystemMetrics,
  useIncidents,
} from "./hooks/useSystemHealth";
import { CardSkeleton } from "./shared/Skeletons";
import ErrorState from "./shared/ErrorState";

const { data: services, isLoading, error } = useSystemHealth();
const { data: metrics } = useSystemMetrics();
const { data: incidents } = useIncidents(10);
```

#### Settings.tsx
```tsx
import {
  useAdminProfile,
  useNotificationPreferences,
  useSecuritySettings,
  useUpdateProfile,
  useUpdateNotificationPreferences,
  useUploadAvatar,
} from "./hooks/useSettings";

const { data: profile, isLoading } = useAdminProfile();
const { data: notifications } = useNotificationPreferences();
const { data: security } = useSecuritySettings();
const updateProfile = useUpdateProfile();
const updateNotifications = useUpdateNotificationPreferences();
```

### 2. Create .env File

```bash
cd apps/admin
cp .env.example .env
# Edit .env and set your VITE_BASE_URL
```

### 3. Test the Application

```bash
# From frontend root
pnpm dev

# Or specifically for admin app
cd apps/admin
pnpm dev
```

### 4. Verify API Endpoints

Make sure your backend has these endpoints implemented:

**Dashboard**
- GET `/admin/dashboard/stats`
- GET `/admin/dashboard/token-distribution`
- GET `/admin/dashboard/revenue-metrics?days=8`

**Customers**
- GET `/admin/customers?page=1&limit=10&search=...&status=...`
- GET `/admin/customers/:id`
- GET `/admin/customers/:id/transactions`
- PATCH `/admin/customers/:id/status`

**Transactions**
- GET `/admin/transactions?page=1&limit=10&search=...&status=...`
- GET `/admin/transactions/:id`
- GET `/admin/transactions/stats`
- GET `/admin/transactions/count-data?days=8`
- GET `/admin/transactions/volume-data?days=8`
- POST `/admin/transactions/:id/retry`
- POST `/admin/transactions/:id/refund`

**Merchants**
- GET `/admin/merchants?page=1&limit=10&search=...&status=...`
- GET `/admin/merchants/:id`
- GET `/admin/merchants/stats`
- GET `/admin/merchants/leaderboard?limit=5`
- GET `/admin/merchants/mode-distribution`
- GET `/admin/merchants/onboarding-data?days=8`
- PATCH `/admin/merchants/:id/status`
- POST `/admin/merchants/:id/approve`
- POST `/admin/merchants/:id/reject`

**System Health**
- GET `/admin/system-health/services`
- GET `/admin/system-health/metrics`
- GET `/admin/system-health/incidents?limit=10`
- POST `/admin/system-health/incidents`
- PATCH `/admin/system-health/incidents/:id`

**Settings**
- GET `/admin/profile`
- PATCH `/admin/profile`
- GET `/admin/settings/notifications`
- PATCH `/admin/settings/notifications`
- GET `/admin/settings/security`
- POST `/admin/settings/change-password`
- POST `/admin/settings/enable-2fa`
- POST `/admin/settings/disable-2fa`
- POST `/admin/profile/avatar`

## 📁 Files Created/Modified

### New Files
- `apps/admin/src/components/hooks/useDashboard.ts`
- `apps/admin/src/components/hooks/useCustomers.ts`
- `apps/admin/src/components/hooks/useTransactions.ts`
- `apps/admin/src/components/hooks/useMerchants.ts`
- `apps/admin/src/components/hooks/useSystemHealth.ts`
- `apps/admin/src/components/hooks/useSettings.ts`
- `apps/admin/src/components/shared/Skeletons.tsx`
- `apps/admin/src/components/shared/ErrorState.tsx`
- `apps/admin/src/components/TransactionsNew.tsx`
- `apps/admin/.env.example`
- `apps/admin/IMPLEMENTATION_GUIDE.md`
- `apps/admin/QUICK_START.md` (this file)

### Modified Files
- `apps/admin/src/components/Overview.tsx` - Full API integration
- `apps/admin/src/components/Customers.tsx` - Partial update (imports)

## 🎨 Design Patterns Used

### 1. React Query for Data Fetching
```tsx
const { data, isLoading, error, refetch } = useCustomers(params);
```

### 2. Loading States with Skeletons
```tsx
{isLoading ? <TableRowSkeleton columns={6} /> : <ActualTable />}
```

### 3. Error Handling
```tsx
{error && <ErrorState message="Failed" onRetry={refetch} />}
```

### 4. Empty States
```tsx
{!isLoading && items.length === 0 && (
  <EmptyState title="No data" message="..." />
)}
```

### 5. Pagination
```tsx
{pagination && pagination.totalPages > 1 && (
  <Pagination
    currentPage={currentPage}
    totalPages={pagination.totalPages}
    onPageChange={setCurrentPage}
  />
)}
```

## 🐛 Common Issues & Solutions

### Issue: API calls return 401
**Solution**: Check if token is being sent in Authorization header. Verify `client.ts` interceptor.

### Issue: CORS errors
**Solution**: Backend must allow your frontend origin. Check backend CORS configuration.

### Issue: Components not updating after mutation
**Solution**: Ensure `queryClient.invalidateQueries()` is called in mutation's `onSuccess`.

### Issue: Charts not displaying
**Solution**: 
1. Check data format matches expected structure
2. Verify Recharts is installed
3. Check console for errors

### Issue: TypeScript errors
**Solution**: 
1. Run `pnpm install` to ensure all types are installed
2. Check import paths are correct
3. Verify API response types match hook definitions

## 📝 TODO: Remaining Work

1. **Merchants.tsx** - Replace mock data with API hooks (similar to Customers pattern)
2. **SystemHealth.tsx** - Replace mock data with API hooks
3. **Settings.tsx** - Implement profile/notification/security API integration
4. **Add Debouncing** - Implement search debouncing (500ms) in FilterBar component
5. **Export Features** - Add CSV/PDF export for transactions and customers
6. **Bulk Actions** - Implement multi-select for batch operations
7. **Real-time Updates** - Add WebSocket for live updates (optional)
8. **Testing** - Add unit and E2E tests
9. **Audit Logs** - Create new page for admin action tracking
10. **Role Management** - Add admin roles and permissions management

## 📚 Additional Resources

- [Implementation Guide](./IMPLEMENTATION_GUIDE.md) - Detailed technical docs
- [React Query Docs](https://tanstack.com/query/latest) - TanStack Query documentation
- [Recharts Docs](https://recharts.org/) - Chart library docs
- [@orafi/ui Components](../../../packages/ui) - Shared UI components

## 🎉 Summary

You now have:
- ✅ 6 complete API hook files with full TypeScript types
- ✅ Reusable skeleton and error components
- ✅ Fully integrated Overview page
- ✅ New Transactions page with charts
- ✅ Environment configuration
- ✅ Comprehensive documentation

**Next**: Follow the "Next Steps to Complete" section above to finish integrating the remaining pages!
