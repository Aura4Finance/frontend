# Postman Testing Guide - OraFi Admin API

## 🎯 Overview

This guide helps you test all OraFi Admin API endpoints using Postman. Follow the steps in order to ensure proper authentication and data flow.

## 📋 Prerequisites

1. **Backend Server Running** - Ensure your backend is running (typically `http://localhost:3000`)
2. **Postman Installed** - Download from https://postman.com
3. **OraFi Collection** - Import or access the OraFi collection in Postman

## 🔐 Step 1: Authentication Setup

### 1.1 Login to Get Access Token

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "admin@orafi.com",
  "password": "yourpassword"
}
```

**Expected Response:**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Action:** Copy the `accessToken` value

### 1.2 Set Up Environment Variable

1. Click on "Environments" in Postman
2. Create/Select "Development" environment
3. Add variable:
   - **Variable:** `accessToken`
   - **Initial Value:** (paste token here)
   - **Current Value:** (paste token here)
4. Save environment
5. Select "Development" environment from dropdown

### 1.3 Configure Authorization for All Requests

**For the entire collection:**
1. Click on "OraFi" collection
2. Go to "Authorization" tab
3. Select "Bearer Token"
4. Token: `{{accessToken}}`
5. Save

OR **For individual requests:**
1. Open request
2. Go to "Authorization" tab
3. Select "Bearer Token"
4. Token: `{{accessToken}}`

## 📊 Step 2: Test Dashboard Endpoints

### 2.1 Dashboard Stats

**Endpoint:** `GET /admin/dashboard/stats`

**Headers:**
- Authorization: `Bearer {{accessToken}}`

**Expected Fields:**
- `totalTransactions` (number)
- `totalCustomers` (number)
- `totalMerchants` (number)
- `totalRevenue` (number)
- `transactionsTrend` (object with value, isPositive)
- `customersTrend` (object)
- `merchantsTrend` (object)
- `revenueTrend` (object)

**Validation:**
- ✅ Status code: 200
- ✅ Response has `data` object
- ✅ All trend values are numbers
- ✅ `isPositive` is boolean

### 2.2 Token Distribution

**Endpoint:** `GET /admin/dashboard/token-distribution`

**Expected Structure:**
```json
{
  "data": [
    { "name": "USDC", "value": 45 },
    { "name": "USDT", "value": 30 }
  ]
}
```

**Validation:**
- ✅ Array of objects
- ✅ Each has `name` and `value`
- ✅ Values are percentages (sum ~100)

### 2.3 Revenue Metrics

**Endpoint:** `GET /admin/dashboard/revenue-metrics?days=8`

**Query Params:**
- `days`: 8 (or 7, 30, 90)

**Expected Structure:**
```json
{
  "data": [
    {
      "name": "Jan 8",
      "revenue": 32000,
      "date": "2026-01-08"
    }
  ]
}
```

**Validation:**
- ✅ Array length matches days parameter
- ✅ Each has name, revenue, date
- ✅ Dates are in chronological order

## 👥 Step 3: Test Customer Endpoints

### 3.1 Get Customers List

**Endpoint:** `GET /admin/customers?page=1&limit=10`

**Query Params:**
- `page`: 1
- `limit`: 10
- `search`: (optional) "john"
- `status`: (optional) "Active"
- `sortBy`: (optional) "joinedDate"
- `sortOrder`: (optional) "desc"

**Expected Structure:**
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
      "joinedDate": "2025-08-15T00:00:00Z"
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

**Tests to Run:**
```javascript
// In Postman Tests tab
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has data array", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.be.an('array');
});

pm.test("Response has pagination", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.pagination).to.be.an('object');
    pm.expect(jsonData.pagination.page).to.equal(1);
});
```

### 3.2 Get Customer Details

**Endpoint:** `GET /admin/customers/:id`

**Example:** `GET /admin/customers/CUS-001`

**Validation:**
- ✅ Returns single customer object
- ✅ Has all fields from list + phone, country, lastActive

### 3.3 Get Customer Transactions

**Endpoint:** `GET /admin/customers/:id/transactions?page=1&limit=10`

**Validation:**
- ✅ Returns transaction array
- ✅ Has pagination
- ✅ Each transaction has customer info

### 3.4 Update Customer Status

**Endpoint:** `PATCH /admin/customers/:id/status`

**Request Body:**
```json
{
  "status": "Suspended"
}
```

**Validation:**
- ✅ Status code: 200
- ✅ Returns updated customer
- ✅ Status reflects change

## 💰 Step 4: Test Transaction Endpoints

### 4.1 Get Transactions List

**Endpoint:** `GET /admin/transactions?page=1&limit=10`

**Query Params (all optional):**
- `page`: 1
- `limit`: 10
- `search`: "TXN-001"
- `status`: "Completed"
- `type`: "Payment"
- `token`: "USDC"
- `startDate`: "2026-01-01"
- `endDate`: "2026-02-16"
- `sortBy`: "date"
- `sortOrder`: "desc"

**Test Different Filter Combinations:**
1. No filters (all transactions)
2. Status filter only
3. Date range only
4. Search by ID
5. Multiple filters combined

**Validation:**
- ✅ Filters applied correctly
- ✅ Pagination works
- ✅ Sort order correct

### 4.2 Transaction Stats

**Endpoint:** `GET /admin/transactions/stats`

**Expected Fields:**
- `total` - Total transaction count
- `successful` - Successful count
- `pending` - Pending count
- `failed` - Failed count
- `volume` - Total transaction volume

### 4.3 Transaction Count Data (Chart)

**Endpoint:** `GET /admin/transactions/count-data?days=8`

**Validation:**
- ✅ Array length = days + 1
- ✅ Each object has: date, all, successful, pending, failed
- ✅ Dates in order

### 4.4 Transaction Volume Data (Chart)

**Endpoint:** `GET /admin/transactions/volume-data?days=8`

**Validation:**
- ✅ Array length = days + 1
- ✅ Each object has: date, ngn, usdc, usdt, sui
- ✅ Values are numbers

### 4.5 Retry Transaction

**Endpoint:** `POST /admin/transactions/:id/retry`

**Test with Failed Transaction ID**

**Validation:**
- ✅ Status updated to "Processing"
- ✅ Success message returned

### 4.6 Refund Transaction

**Endpoint:** `POST /admin/transactions/:id/refund`

**Request Body:**
```json
{
  "reason": "Customer requested refund"
}
```

**Validation:**
- ✅ Refund ID generated
- ✅ Status updated
- ✅ Success message

## 🏪 Step 5: Test Merchant Endpoints

### 5.1 Get Merchants List

**Endpoint:** `GET /admin/merchants?page=1&limit=10`

**Query Params:**
- `search`: "TechStore"
- `status`: "Live"
- `category`: "Electronics"
- `sortBy`: "totalRevenue"
- `sortOrder`: "desc"

### 5.2 Merchant Leaderboard

**Endpoint:** `GET /admin/merchants/leaderboard?limit=5`

**Expected:**
- Top 5 merchants by revenue
- Includes rank, name, revenue, transactions, growth

### 5.3 Merchant Mode Distribution

**Endpoint:** `GET /admin/merchants/mode-distribution`

**Expected:**
```json
{
  "data": [
    { "name": "Live", "value": 100 },
    { "name": "Test", "value": 20 },
    { "name": "Pending", "value": 8 }
  ]
}
```

### 5.4 Approve Merchant

**Endpoint:** `POST /admin/merchants/:id/approve`

**Validation:**
- ✅ Status changed to "Live"
- ✅ API key generated

### 5.5 Reject Merchant

**Endpoint:** `POST /admin/merchants/:id/reject`

**Request Body:**
```json
{
  "reason": "Incomplete documentation"
}
```

### 5.6 Regenerate API Key

**Endpoint:** `POST /admin/merchants/:id/regenerate-api-key`

**Validation:**
- ✅ New API key returned
- ✅ Different from old key

## 🏥 Step 6: Test System Health Endpoints

### 6.1 Service Status

**Endpoint:** `GET /admin/system-health/services`

**Expected:**
- Array of services
- Each has: name, status, uptime, responseTime, lastChecked

### 6.2 System Metrics

**Endpoint:** `GET /admin/system-health/metrics`

**Expected:**
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

### 6.3 Get Incidents

**Endpoint:** `GET /admin/system-health/incidents?limit=10`

### 6.4 Create Incident

**Endpoint:** `POST /admin/system-health/incidents`

**Request Body:**
```json
{
  "title": "Test Incident",
  "severity": "warning",
  "description": "Testing incident creation"
}
```

### 6.5 Update Incident

**Endpoint:** `PATCH /admin/system-health/incidents/:id`

**Request Body:**
```json
{
  "status": "resolved",
  "message": "Issue has been fixed"
}
```

## ⚙️ Step 7: Test Settings Endpoints

### 7.1 Get Admin Profile

**Endpoint:** `GET /admin/profile`

**Expected:**
- id, name, email, role, avatar
- phoneNumber, lastLogin, createdAt

### 7.2 Update Profile

**Endpoint:** `PATCH /admin/profile`

**Request Body:**
```json
{
  "name": "Updated Name",
  "phoneNumber": "+1234567890"
}
```

### 7.3 Get Notification Preferences

**Endpoint:** `GET /admin/settings/notifications`

**Expected:**
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

### 7.4 Update Notification Preferences

**Endpoint:** `PATCH /admin/settings/notifications`

**Request Body:**
```json
{
  "emailAlerts": false,
  "marketingEmails": true
}
```

### 7.5 Get Security Settings

**Endpoint:** `GET /admin/settings/security`

**Expected:**
- twoFactorEnabled (boolean)
- lastPasswordChange (date)
- sessions (array)

### 7.6 Change Password

**Endpoint:** `POST /admin/settings/change-password`

**Request Body:**
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass123",
  "confirmPassword": "newpass123"
}
```

### 7.7 Enable 2FA

**Endpoint:** `POST /admin/settings/enable-2fa`

**Expected:**
- qrCode (base64 image)
- secret (string)
- backupCodes (array)

### 7.8 Upload Avatar

**Endpoint:** `POST /admin/profile/avatar`

**Request Type:** `multipart/form-data`

**Body:**
- Select "form-data"
- Key: `avatar` (type: File)
- Value: Select image file

**Expected:**
```json
{
  "data": {
    "avatar": "https://cdn.orafi.com/avatars/admin-new.png"
  }
}
```

## 🧪 Test Scenarios

### Scenario 1: Complete Customer Journey
1. Login as admin ✅
2. Get dashboard stats ✅
3. Search for customer "John" ✅
4. View customer details ✅
5. View customer transactions ✅
6. Suspend customer ✅
7. Verify status updated ✅

### Scenario 2: Transaction Management
1. Get all transactions ✅
2. Filter by status "Failed" ✅
3. Get failed transaction details ✅
4. Retry failed transaction ✅
5. Verify transaction stats updated ✅

### Scenario 3: Merchant Approval
1. Get pending merchants ✅
2. View merchant details ✅
3. Approve merchant ✅
4. Verify API key generated ✅
5. Check merchant leaderboard ✅

### Scenario 4: System Monitoring
1. Check service status ✅
2. Get system metrics ✅
3. Create test incident ✅
4. Update incident status ✅
5. Verify incident list ✅

## 🔍 Common Issues & Solutions

### Issue 1: 401 Unauthorized
**Cause:** Invalid or expired token
**Solution:**
1. Login again to get fresh token
2. Update `{{accessToken}}` environment variable
3. Check Authorization header is set

### Issue 2: 404 Not Found
**Cause:** Endpoint doesn't exist or incorrect path
**Solution:**
1. Verify endpoint path in API_ENDPOINTS.md
2. Check if `/admin` prefix is required
3. Confirm backend route exists

### Issue 3: 422 Validation Error
**Cause:** Invalid request body or params
**Solution:**
1. Check request body structure
2. Verify required fields
3. Validate data types (string vs number)

### Issue 4: CORS Error
**Cause:** Backend not allowing frontend origin
**Solution:**
1. Check backend CORS configuration
2. Add frontend URL to allowed origins
3. Verify `withCredentials` setting

### Issue 5: 500 Internal Server Error
**Cause:** Backend error
**Solution:**
1. Check backend logs
2. Verify database connection
3. Test with simpler data
4. Check backend error details

## 📝 Postman Test Scripts

### Global Test Script (Add to Collection)
```javascript
// Add to Collection > Pre-request Script
pm.environment.set("baseUrl", "http://localhost:3000/api");

// Add to Collection > Tests
pm.test("Status code is successful", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201, 204]);
});

pm.test("Response time is acceptable", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

pm.test("Response has data property", function () {
    if (pm.response.code === 200) {
        const jsonData = pm.response.json();
        pm.expect(jsonData).to.have.property('data');
    }
});
```

### Individual Request Tests

**For List Endpoints:**
```javascript
pm.test("Response is array", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.be.an('array');
});

pm.test("Has pagination", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.pagination).to.be.an('object');
    pm.expect(jsonData.pagination).to.have.property('total');
});
```

**For Detail Endpoints:**
```javascript
pm.test("Response is object", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.be.an('object');
});

pm.test("Has required fields", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('id');
    pm.expect(jsonData.data).to.have.property('name');
});
```

**For Mutation Endpoints:**
```javascript
pm.test("Mutation successful", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

pm.test("Has success message", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('message');
});
```

## 🎯 Testing Checklist

### Authentication ✅
- [ ] Login returns token
- [ ] Token saved to environment
- [ ] Token sent in requests
- [ ] 401 on invalid token
- [ ] Change password works

### Dashboard ✅
- [ ] Stats endpoint returns KPIs
- [ ] Token distribution returns array
- [ ] Revenue metrics returns time series
- [ ] Recent activity returns list

### Customers ✅
- [ ] List returns paginated data
- [ ] Search filters results
- [ ] Status filter works
- [ ] Details returns full customer
- [ ] Transactions returns customer txns
- [ ] Status update works
- [ ] Stats returns counts

### Transactions ✅
- [ ] List returns paginated data
- [ ] All filters work correctly
- [ ] Date range filters
- [ ] Details returns full transaction
- [ ] Stats returns counts/volume
- [ ] Count data for charts
- [ ] Volume data for charts
- [ ] Retry works on failed tx
- [ ] Refund processes correctly

### Merchants ✅
- [ ] List returns paginated data
- [ ] Search and filters work
- [ ] Details returns full merchant
- [ ] Leaderboard returns top merchants
- [ ] Mode distribution returns pie data
- [ ] Onboarding data returns time series
- [ ] Approve works
- [ ] Reject works with reason
- [ ] Regenerate API key works
- [ ] Status update works

### System Health ✅
- [ ] Services returns status array
- [ ] Metrics returns CPU/memory/disk
- [ ] Incidents returns list
- [ ] Create incident works
- [ ] Update incident works
- [ ] Logs returns filtered logs

### Settings ✅
- [ ] Profile returns admin info
- [ ] Update profile works
- [ ] Notification prefs returns settings
- [ ] Update prefs works
- [ ] Security settings returns data
- [ ] Change password works
- [ ] Enable 2FA returns QR code
- [ ] Disable 2FA works
- [ ] Avatar upload works
- [ ] Logout works
- [ ] Terminate session works

## 🚀 Running Full Test Suite

1. Open Postman Collection Runner
2. Select "OraFi" collection
3. Select "Development" environment
4. Click "Run OraFi"
5. Review test results
6. Check for failed tests
7. Debug any issues
8. Re-run until all pass

## 📊 Expected Results

- **Total Requests:** 40+
- **Expected Pass Rate:** 100%
- **Average Response Time:** < 500ms
- **Failed Tests:** 0

## 🎉 Success Criteria

✅ All endpoints return 200/201 status
✅ All required fields present in responses
✅ Pagination works correctly
✅ Filters apply correctly
✅ Mutations update data
✅ Error handling works
✅ Authentication flow works
✅ Token refresh works (if implemented)

---

**Note:** Save this collection in Postman and share with your team for consistent API testing!
