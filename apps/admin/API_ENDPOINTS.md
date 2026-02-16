# OraFi Admin API Endpoints - Testing & Validation

## API Response Structure

Based on the existing auth endpoints, all responses follow this structure:

```typescript
{
  data: {
    // Actual data here
    accessToken?: string;
    // ... other fields
  },
  message?: string;
  success?: boolean;
}
```

Error responses:
```typescript
{
  message: string;
  error?: string;
  statusCode?: number;
}
```

## Authentication Endpoints ✅ (Already Implemented)

### POST `/auth/login`
**Request:**
```json
{
  "email": "admin@orafi.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "data": {
    "accessToken": "eyJhbGc..."
  }
}
```
**Status:** Implemented in `useLoginMutation.ts`

### POST `/auth/change-password`
**Request:**
```json
{
  "email": "admin@orafi.com",
  "oldPassword": "oldpass",
  "newPassword": "newpass"
}
```
**Response:**
```json
{
  "data": {
    "accessToken": "eyJhbGc..."
  }
}
```
**Status:** Implemented in `useChangePasswordMutation.ts`

---

## Dashboard Endpoints (useDashboard.ts)

### GET `/admin/dashboard/stats`
**Query Params:** None
**Expected Response:**
```json
{
  "data": {
    "totalTransactions": 12847,
    "totalCustomers": 3456,
    "totalMerchants": 128,
    "totalRevenue": 487250,
    "transactionsTrend": {
      "value": 12.5,
      "isPositive": true
    },
    "customersTrend": {
      "value": 8.2,
      "isPositive": true
    },
    "merchantsTrend": {
      "value": 5.1,
      "isPositive": true
    },
    "revenueTrend": {
      "value": 15.3,
      "isPositive": true
    }
  }
}
```

### GET `/admin/dashboard/token-distribution`
**Query Params:** None
**Expected Response:**
```json
{
  "data": [
    { "name": "USDC", "value": 45 },
    { "name": "USDT", "value": 30 },
    { "name": "SUI", "value": 15 },
    { "name": "ETH", "value": 10 }
  ]
}
```

### GET `/admin/dashboard/revenue-metrics`
**Query Params:** `?days=8`
**Expected Response:**
```json
{
  "data": [
    { "name": "Jan 8", "revenue": 32000, "date": "2026-01-08" },
    { "name": "Jan 9", "revenue": 28000, "date": "2026-01-09" },
    ...
  ]
}
```

### GET `/admin/dashboard/recent-activity`
**Query Params:** `?limit=10`
**Expected Response:**
```json
{
  "data": [
    {
      "id": "activity-1",
      "type": "transaction",
      "description": "New payment received",
      "timestamp": "2026-02-16T10:30:00Z"
    },
    ...
  ]
}
```

---

## Customer Endpoints (useCustomers.ts)

### GET `/admin/customers`
**Query Params:** 
- `page=1`
- `limit=10`
- `search=john`
- `status=Active`
- `sortBy=joinedDate`
- `sortOrder=desc`

**Expected Response:**
```json
{
  "data": [
    {
      "id": "CUS-001",
      "name": "John Doe",
      "email": "john@example.com",
      "walletAddress": "0x1234...5678",
      "totalTransactions": 45,
      "totalSpent": 2340.50,
      "status": "Active",
      "joinedDate": "2025-08-15T00:00:00Z",
      "phoneNumber": "+1234567890",
      "country": "USA",
      "lastActive": "2026-02-16T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### GET `/admin/customers/:id`
**Expected Response:**
```json
{
  "data": {
    "id": "CUS-001",
    "name": "John Doe",
    "email": "john@example.com",
    "walletAddress": "0x1234567890abcdef",
    "totalTransactions": 45,
    "totalSpent": 2340.50,
    "status": "Active",
    "joinedDate": "2025-08-15T00:00:00Z",
    "phoneNumber": "+1234567890",
    "country": "USA",
    "lastActive": "2026-02-16T10:00:00Z"
  }
}
```

### GET `/admin/customers/:id/transactions`
**Query Params:** `?page=1&limit=10`
**Expected Response:** Same structure as transactions endpoint

### PATCH `/admin/customers/:id/status`
**Request:**
```json
{
  "status": "Suspended"
}
```
**Expected Response:**
```json
{
  "data": {
    "id": "CUS-001",
    "status": "Suspended"
  }
}
```

### GET `/admin/customers/stats`
**Expected Response:**
```json
{
  "data": {
    "total": 3456,
    "active": 3200,
    "inactive": 200,
    "suspended": 56,
    "newThisMonth": 234
  }
}
```

---

## Transaction Endpoints (useTransactions.ts)

### GET `/admin/transactions`
**Query Params:**
- `page=1`
- `limit=10`
- `search=TXN-001`
- `status=Completed`
- `type=Payment`
- `token=USDC`
- `startDate=2026-01-01`
- `endDate=2026-02-16`
- `sortBy=date`
- `sortOrder=desc`

**Expected Response:**
```json
{
  "data": [
    {
      "id": "TXN-001",
      "customer": "John Doe",
      "customerId": "CUS-001",
      "email": "john@example.com",
      "amount": 250.00,
      "token": "USDC",
      "type": "Payment",
      "status": "Completed",
      "date": "2025-01-14T10:23:45Z",
      "merchant": "TechStore",
      "merchantId": "MER-001",
      "fee": 2.50,
      "hash": "0xabcdef123456",
      "network": "SUI"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 12847,
    "totalPages": 1285
  }
}
```

### GET `/admin/transactions/:id`
**Expected Response:**
```json
{
  "data": {
    "id": "TXN-001",
    "customer": "John Doe",
    "customerId": "CUS-001",
    "email": "john@example.com",
    "amount": 250.00,
    "token": "USDC",
    "type": "Payment",
    "status": "Completed",
    "date": "2025-01-14T10:23:45Z",
    "merchant": "TechStore",
    "merchantId": "MER-001",
    "fee": 2.50,
    "hash": "0xabcdef123456",
    "network": "SUI",
    "metadata": {
      "ip": "192.168.1.1",
      "userAgent": "Mozilla/5.0..."
    }
  }
}
```

### GET `/admin/transactions/stats`
**Expected Response:**
```json
{
  "data": {
    "total": 12847,
    "successful": 12000,
    "pending": 500,
    "failed": 347,
    "volume": 1500000
  }
}
```

### GET `/admin/transactions/count-data`
**Query Params:** `?days=8`
**Expected Response:**
```json
{
  "data": [
    {
      "date": "Jan 7",
      "all": 145,
      "successful": 130,
      "pending": 10,
      "failed": 5
    },
    ...
  ]
}
```

### GET `/admin/transactions/volume-data`
**Query Params:** `?days=8`
**Expected Response:**
```json
{
  "data": [
    {
      "date": "Jan 7",
      "ngn": 4500000,
      "usdc": 12500,
      "usdt": 8000,
      "sui": 3000
    },
    ...
  ]
}
```

### POST `/admin/transactions/:id/retry`
**Expected Response:**
```json
{
  "data": {
    "id": "TXN-001",
    "status": "Processing",
    "message": "Transaction retry initiated"
  }
}
```

### POST `/admin/transactions/:id/refund`
**Request:**
```json
{
  "reason": "Customer requested refund"
}
```
**Expected Response:**
```json
{
  "data": {
    "id": "TXN-001",
    "refundId": "REF-001",
    "status": "Refunded",
    "message": "Refund processed successfully"
  }
}
```

---

## Merchant Endpoints (useMerchants.ts)

### GET `/admin/merchants`
**Query Params:**
- `page=1`
- `limit=10`
- `search=TechStore`
- `status=Live`
- `category=Electronics`
- `sortBy=totalRevenue`
- `sortOrder=desc`

**Expected Response:**
```json
{
  "data": [
    {
      "id": "MER-001",
      "name": "TechStore Pro",
      "email": "contact@techstore.com",
      "category": "Electronics",
      "status": "Live",
      "onboarded": "2025-03-15T00:00:00Z",
      "totalRevenue": 125000,
      "totalTransactions": 1245,
      "apiKey": "pk_live_abc123",
      "webhookUrl": "https://techstore.com/webhook",
      "logo": "https://cdn.orafi.com/logos/techstore.png",
      "website": "https://techstore.com"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 128,
    "totalPages": 13
  }
}
```

### GET `/admin/merchants/:id`
**Expected Response:** Same as single merchant object above

### GET `/admin/merchants/stats`
**Expected Response:**
```json
{
  "data": {
    "total": 128,
    "live": 100,
    "test": 20,
    "pending": 8,
    "newThisMonth": 15
  }
}
```

### GET `/admin/merchants/leaderboard`
**Query Params:** `?limit=5`
**Expected Response:**
```json
{
  "data": [
    {
      "rank": 1,
      "name": "TechStore Pro",
      "merchantId": "MER-001",
      "revenue": 125000,
      "transactions": 1245,
      "growth": 23.5
    },
    ...
  ]
}
```

### GET `/admin/merchants/mode-distribution`
**Expected Response:**
```json
{
  "data": [
    { "name": "Live", "value": 100 },
    { "name": "Test", "value": 20 },
    { "name": "Pending", "value": 8 }
  ]
}
```

### GET `/admin/merchants/onboarding-data`
**Query Params:** `?days=8`
**Expected Response:**
```json
{
  "data": [
    { "date": "Jan 7", "count": 3 },
    { "date": "Jan 8", "count": 5 },
    ...
  ]
}
```

### PATCH `/admin/merchants/:id/status`
**Request:**
```json
{
  "status": "Suspended"
}
```

### POST `/admin/merchants/:id/approve`
**Expected Response:**
```json
{
  "data": {
    "id": "MER-001",
    "status": "Live",
    "message": "Merchant approved successfully"
  }
}
```

### POST `/admin/merchants/:id/reject`
**Request:**
```json
{
  "reason": "Incomplete documentation"
}
```

### POST `/admin/merchants/:id/regenerate-api-key`
**Expected Response:**
```json
{
  "data": {
    "apiKey": "pk_live_new123",
    "message": "API key regenerated successfully"
  }
}
```

---

## System Health Endpoints (useSystemHealth.ts)

### GET `/admin/system-health/services`
**Expected Response:**
```json
{
  "data": [
    {
      "name": "API Gateway",
      "status": "operational",
      "uptime": 99.98,
      "responseTime": 45,
      "lastChecked": "2026-02-16T12:00:00Z"
    },
    {
      "name": "Database",
      "status": "operational",
      "uptime": 99.95,
      "responseTime": 12,
      "lastChecked": "2026-02-16T12:00:00Z"
    },
    ...
  ]
}
```

### GET `/admin/system-health/metrics`
**Expected Response:**
```json
{
  "data": {
    "cpu": 45.5,
    "memory": 62.3,
    "disk": 35.8,
    "network": {
      "incoming": 1024,
      "outgoing": 2048
    }
  }
}
```

### GET `/admin/system-health/incidents`
**Query Params:** `?limit=10`
**Expected Response:**
```json
{
  "data": [
    {
      "id": "INC-001",
      "title": "Payment Processor High Latency",
      "status": "investigating",
      "severity": "warning",
      "time": "2026-02-16T11:45:00Z",
      "description": "Increased response times detected",
      "updates": [
        {
          "time": "2026-02-16T11:50:00Z",
          "message": "Team is investigating the issue"
        }
      ]
    },
    ...
  ]
}
```

### POST `/admin/system-health/incidents`
**Request:**
```json
{
  "title": "Database Connection Issues",
  "severity": "critical",
  "description": "Unable to connect to primary database"
}
```

### PATCH `/admin/system-health/incidents/:id`
**Request:**
```json
{
  "status": "resolved",
  "message": "Issue has been fixed"
}
```

### GET `/admin/system-health/logs`
**Query Params:**
- `?service=API Gateway`
- `?level=error`
- `?limit=50`

**Expected Response:**
```json
{
  "data": [
    {
      "id": "log-1",
      "service": "API Gateway",
      "level": "error",
      "message": "Connection timeout",
      "timestamp": "2026-02-16T12:00:00Z",
      "metadata": {}
    },
    ...
  ]
}
```

---

## Settings Endpoints (useSettings.ts)

### GET `/admin/profile`
**Expected Response:**
```json
{
  "data": {
    "id": "admin-001",
    "name": "Admin User",
    "email": "admin@orafi.com",
    "role": "Super Admin",
    "avatar": "https://cdn.orafi.com/avatars/admin.png",
    "phoneNumber": "+1234567890",
    "lastLogin": "2026-02-16T10:00:00Z",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

### PATCH `/admin/profile`
**Request:**
```json
{
  "name": "Admin User Updated",
  "email": "newemail@orafi.com",
  "phoneNumber": "+0987654321"
}
```

### GET `/admin/settings/notifications`
**Expected Response:**
```json
{
  "data": {
    "emailAlerts": true,
    "transactionAlerts": true,
    "systemAlerts": true,
    "marketingEmails": false,
    "securityAlerts": true,
    "weeklyReports": true
  }
}
```

### PATCH `/admin/settings/notifications`
**Request:**
```json
{
  "emailAlerts": false,
  "transactionAlerts": true
}
```

### GET `/admin/settings/security`
**Expected Response:**
```json
{
  "data": {
    "twoFactorEnabled": false,
    "lastPasswordChange": "2025-12-01T00:00:00Z",
    "sessions": [
      {
        "id": "sess-001",
        "device": "Chrome on MacOS",
        "location": "Lagos, Nigeria",
        "lastActive": "2026-02-16T12:00:00Z",
        "current": true
      }
    ]
  }
}
```

### POST `/admin/settings/change-password`
**Request:**
```json
{
  "currentPassword": "oldpass",
  "newPassword": "newpass",
  "confirmPassword": "newpass"
}
```

### POST `/admin/settings/enable-2fa`
**Expected Response:**
```json
{
  "data": {
    "qrCode": "data:image/png;base64,...",
    "secret": "JBSWY3DPEHPK3PXP",
    "backupCodes": ["123456", "789012", ...]
  }
}
```

### POST `/admin/settings/disable-2fa`
**Request:**
```json
{
  "code": "123456"
}
```

### POST `/admin/profile/avatar`
**Request:** `multipart/form-data` with `avatar` field
**Expected Response:**
```json
{
  "data": {
    "avatar": "https://cdn.orafi.com/avatars/admin-new.png"
  }
}
```

### DELETE `/admin/settings/sessions/:id`
**Expected Response:**
```json
{
  "data": {
    "message": "Session terminated successfully"
  }
}
```

### POST `/admin/logout`
**Expected Response:**
```json
{
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

## Testing Checklist

### Authentication ✅
- [x] Login endpoint working
- [x] Change password endpoint working
- [x] Token persistence in sessionStorage
- [x] Token sent in Authorization header

### To Test
- [ ] Dashboard stats API
- [ ] Token distribution API
- [ ] Revenue metrics API
- [ ] Customers list API with pagination
- [ ] Customer details API
- [ ] Customer status update API
- [ ] Transactions list API with filters
- [ ] Transaction details API
- [ ] Transaction stats and charts APIs
- [ ] Merchants list API
- [ ] Merchant details and approval APIs
- [ ] System health monitoring APIs
- [ ] Admin profile and settings APIs

## Environment Setup

Ensure your `.env` file has:
```env
VITE_BASE_URL=http://localhost:3000/api
# OR your actual API URL
# VITE_BASE_URL=https://api.orafi.com
```

## Common Issues & Solutions

1. **401 Unauthorized**
   - Check if token is valid
   - Verify Authorization header is being sent
   - Check token expiration

2. **CORS Errors**
   - Backend must allow your frontend origin
   - Check `withCredentials: true` is set

3. **404 Not Found**
   - Verify endpoint paths match backend routes
   - Check if `/admin` prefix is required
   - Confirm endpoint exists in backend

4. **Data Format Mismatch**
   - Check response structure matches `response.data.data`
   - Verify TypeScript types match API responses
   - Use browser dev tools to inspect actual responses

## Next Steps

1. Start backend server
2. Test login endpoint first
3. Get valid token
4. Test each endpoint category one by one
5. Update types if response structure differs
6. Document any API changes needed
