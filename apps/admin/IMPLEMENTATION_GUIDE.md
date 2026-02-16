# OraFi Admin Dashboard - Implementation Guide

## Overview
This guide documents the updated admin dashboard with full API integration using React Query, proper error handling, loading states, and improved UX.

## Architecture

### Tech Stack
- **React 19** with TypeScript
- **Wouter** for routing
- **TanStack Query (React Query)** for data fetching & caching
- **Zustand** for state management
- **Axios** for HTTP client
- **Recharts** for data visualization
- **Tailwind CSS** for styling
- **@orafi/ui** for shared UI components
- **Sonner** for toast notifications

### Project Structure
```
apps/admin/src/
├── components/
│   ├── hooks/               # React Query hooks for API
│   │   ├── useDashboard.ts
│   │   ├── useCustomers.ts
│   │   ├── useTransactions.ts
│   │   ├── useMerchants.ts
│   │   ├── useSystemHealth.ts
│   │   ├── useSettings.ts
│   │   ├── useLoginMutation.ts
│   │   └── useChangePasswordMutation.ts
│   ├── shared/              # Reusable components
│   │   ├── KPICard.tsx
│   │   ├── FilterBar.tsx
│   │   ├── Pagination.tsx
│   │   ├── Modal.tsx
│   │   ├── Skeletons.tsx    # Loading states
│   │   └── ErrorState.tsx   # Error & empty states
│   ├── layout/
│   │   ├── DashboardWrapper.tsx
│   │   └── LeftBar.tsx
│   ├── auth/                # Authentication components
│   ├── client/
│   │   └── client.ts        # Axios instance & token management
│   ├── Overview.tsx         # ✅ Updated with API
│   ├── Customers.tsx        # ⚠️ Partially updated
│   ├── TransactionsNew.tsx  # ✅ New component with full API
│   ├── Merchants.tsx        # ⚠️ Needs API integration
│   ├── SystemHealth.tsx     # ⚠️ Needs API integration
│   └── Settings.tsx         # ⚠️ Needs API integration
└── store/
    ├── activeTab.ts
    └── changePassword.ts
```

## API Hooks

### Authentication
- `useLoginMutation()` - Login with email/password
- `useChangePasswordMutation()` - Change password
- `useLogout()` - Logout and clear session

### Dashboard (/admin/dashboard/*)
- `useDashboardStats()` - KPI metrics (transactions, customers, merchants, revenue)
- `useTokenDistribution()` - Token usage distribution chart data
- `useRevenueMetrics(days)` - Revenue trends over time
- `useRecentActivity(limit)` - Recent activity feed

### Customers (/admin/customers/*)
- `useCustomers(params)` - Paginated customer list with search/filter
- `useCustomer(id)` - Single customer details
- `useCustomerTransactions(id, params)` - Customer's transaction history
- `useUpdateCustomerStatus()` - Update customer status
- `useCustomerStats()` - Customer analytics

### Transactions (/admin/transactions/*)
- `useTransactions(params)` - Paginated transaction list
- `useTransaction(id)` - Single transaction details
- `useTransactionStats()` - Transaction statistics
- `useTransactionCountData(days)` - Transaction count trends
- `useTransactionVolumeData(days)` - Transaction volume trends
- `useRetryTransaction()` - Retry failed transaction
- `useRefundTransaction()` - Process refund

### Merchants (/admin/merchants/*)
- `useMerchants(params)` - Paginated merchant list
- `useMerchant(id)` - Single merchant details
- `useMerchantStats()` - Merchant statistics
- `useMerchantLeaderboard(limit)` - Top merchants by revenue
- `useMerchantModeDistribution()` - Live/Test mode distribution
- `useMerchantOnboardingData(days)` - Onboarding trends
- `useMerchantTransactions(id, params)` - Merchant transactions
- `useUpdateMerchantStatus()` - Update merchant status
- `useApproveMerchant()` - Approve pending merchant
- `useRejectMerchant()` - Reject merchant application
- `useRegenerateApiKey()` - Regenerate merchant API key

### System Health (/admin/system-health/*)
- `useSystemHealth()` - Service health status
- `useSystemMetrics()` - System metrics (CPU, memory, disk)
- `useIncidents(limit)` - Recent incidents
- `useIncident(id)` - Single incident details
- `useCreateIncident()` - Create new incident
- `useUpdateIncident()` - Update incident status
- `useSystemLogs(params)` - System logs

### Settings (/admin/*)
- `useAdminProfile()` - Admin profile data
- `useUpdateProfile()` - Update profile
- `useNotificationPreferences()` - Get notification settings
- `useUpdateNotificationPreferences()` - Update notifications
- `useSecuritySettings()` - Security settings & sessions
- `useChangePasswordSettings()` - Change password (in settings)
- `useEnable2FA()` - Enable two-factor authentication
- `useDisable2FA()` - Disable two-factor authentication
- `useUploadAvatar()` - Upload profile avatar
- `useTerminateSession()` - Terminate active session

## Component Patterns

### Data Fetching Pattern
```tsx
const { data, isLoading, error, refetch } = useCustomers({
  page: currentPage,
  limit: itemsPerPage,
  search: searchValue,
  status: selectedFilter === "all" ? undefined : selectedFilter,
});

// Handle loading
if (isLoading) return <Skeleton />;

// Handle error
if (error) return <ErrorState onRetry={refetch} />;

// Render data
const customers = data?.data || [];
```

### Mutation Pattern
```tsx
const updateStatus = useUpdateCustomerStatus();

const handleStatusChange = (customerId: string, status: string) => {
  updateStatus.mutate({ customerId, status });
};
```

### Empty State Pattern
```tsx
{!isLoading && items.length === 0 && (
  <EmptyState
    icon={<FiUsers className="w-12 h-12" />}
    title="No items found"
    message="Try adjusting your search or filters."
  />
)}
```

## Environment Variables

Create `.env` file in `apps/admin/`:
```env
VITE_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=OraFi Admin
VITE_APP_VERSION=1.0.0
```

## API Response Format

Expected API response structure:
```typescript
// Success response
{
  data: T | T[],
  message?: string,
  pagination?: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}

// Error response
{
  message: string,
  errors?: Record<string, string[]>
}
```

## Implementation Steps

### 1. Update App.tsx Routes
No changes needed - routes are already configured.

### 2. Replace Old Components
Replace these files with their updated versions:
- `Customers.tsx` - Use API hooks
- `Transactions.tsx` → Use `TransactionsNew.tsx` or update existing
- `Merchants.tsx` - Add API integration
- `SystemHealth.tsx` - Add API integration
- `Settings.tsx` - Add API integration

### 3. Testing Checklist

#### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Change password flow
- [ ] Logout functionality
- [ ] Token persistence across refresh
- [ ] Auto-redirect to login when token expires

#### Overview Dashboard
- [ ] KPI cards load correctly
- [ ] Token distribution chart displays
- [ ] Revenue metrics chart displays
- [ ] Loading skeletons show during fetch
- [ ] Error states display on API failure
- [ ] Retry button works

#### Customers
- [ ] Customer list loads with pagination
- [ ] Search filters customers
- [ ] Status filter works
- [ ] Click customer row opens modal
- [ ] Modal shows complete customer details
- [ ] Empty state displays when no results

#### Transactions
- [ ] Transaction list loads with pagination
- [ ] Search and filters work
- [ ] Transaction count chart displays
- [ ] Transaction volume chart displays
- [ ] Chart filter buttons work (all/successful/pending/failed)
- [ ] Volume mode toggle works (USDC/NGN)
- [ ] Click transaction opens detail modal
- [ ] KPI cards show correct stats

#### Merchants
- [ ] Merchant list loads correctly
- [ ] Leaderboard displays top merchants
- [ ] Mode distribution chart shows
- [ ] Onboarding trend chart displays
- [ ] Search and filters work
- [ ] Status update works
- [ ] Approve/reject actions work

#### System Health
- [ ] Service status cards display
- [ ] System metrics show correctly
- [ ] Incidents list loads
- [ ] Create incident works
- [ ] Update incident status works
- [ ] Real-time refresh works

#### Settings
- [ ] Profile loads and displays
- [ ] Profile update works
- [ ] Notification preferences load
- [ ] Notification toggle works
- [ ] Security settings display
- [ ] Change password works
- [ ] 2FA enable/disable works
- [ ] Avatar upload works
- [ ] Active sessions display
- [ ] Terminate session works

## Error Handling

### Network Errors
All hooks include automatic retry (2 attempts) and error states.

### Authentication Errors
- 401: Redirect to login
- 403: Show unauthorized message
- 406: Force password change

### Validation Errors
Display field-specific errors using toast notifications.

## Performance Optimizations

### React Query Caching
- Dashboard stats: 5 minutes stale time
- Customer/Transaction lists: 3 minutes
- System health: 1 minute (auto-refetch every 2 min)
- Charts: 10 minutes

### Pagination
- Default: 10 items per page
- Backend pagination to reduce payload

### Debouncing
- Search inputs: 500ms debounce recommended (implement in components)

## Future Enhancements

1. **Real-time Updates**: Add WebSocket for live transaction/system health updates
2. **Export Functionality**: CSV/PDF export for transactions and reports
3. **Advanced Filtering**: Date range pickers, multi-select filters
4. **Bulk Actions**: Select multiple items for batch operations
5. **Audit Logs**: Track admin actions
6. **Role Management**: Add admin roles and permissions
7. **Analytics Dashboard**: More detailed analytics and insights
8. **Notifications Center**: In-app notification system
9. **Dark Mode**: Theme toggle
10. **Mobile App**: React Native version

## Troubleshooting

### Issue: API calls fail with CORS error
**Solution**: Ensure backend has CORS configured for frontend origin

### Issue: Token not persisting
**Solution**: Check sessionStorage implementation in tokenStore

### Issue: Charts not rendering
**Solution**: Verify Recharts is installed and data format matches expected structure

### Issue: Infinite loading state
**Solution**: Check API response format matches expected structure

## Support & Documentation

- Backend API Documentation: [Add link]
- Postman Collection: [Add link]
- Component Storybook: [If available]
- Design System: @orafi/ui package

## Notes

- All dates should be ISO 8601 format from backend
- Money amounts in cents/smallest unit
- Wallet addresses should be validated
- Transaction hashes should link to blockchain explorer
- Always show loading states for better UX
- Use optimistic updates where appropriate
