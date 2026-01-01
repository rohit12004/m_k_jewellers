# Refresh Token Implementation Plan

## Overview

Implement industry-standard refresh token authentication for both **Web** and **Mobile** applications.

**Goal:** Replace long-lived tokens (30 days) with:
- **Access Token:** 30 minutes (for API calls)
- **Refresh Token:** 30 days (to get new access tokens)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Flow                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User Login                                              │
│     ↓                                                        │
│  2. Backend generates:                                      │
│     • Access Token (15 min)                                 │
│     • Refresh Token (30 days)                               │
│     ↓                                                        │
│  3. Client stores both tokens                               │
│     • Web: Cookies (httpOnly)                               │
│     • Mobile: SecureStore                                   │
│     ↓                                                        │
│  4. API Requests use Access Token                           │
│     ↓                                                        │
│  5. Access Token expires (after 15 min)                     │
│     ↓                                                        │
│  6. Client detects 401 error                                │
│     ↓                                                        │
│  7. Client sends Refresh Token to /api/auth/refresh         │
│     ↓                                                        │
│  8. Backend validates Refresh Token                         │
│     ↓                                                        │
│  9. Backend generates new Access Token                      │
│     ↓                                                        │
│  10. Client retries original request                        │
│     ↓                                                        │
│  11. Success! ✅                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Database Schema

### 1.1 Create Refresh Tokens Table

**File:** `prisma/schema.prisma`

```prisma
model RefreshToken {
  id           String   @id @default(cuid())
  token        String   @unique
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt    DateTime
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  // Optional: Track device/session info
  userAgent    String?
  ipAddress    String?
  
  @@index([userId])
  @@index([token])
  @@map("refresh_tokens")
}

// Update User model to add relation
model User {
  // ... existing fields
  refreshTokens RefreshToken[]
}
```

**Migration Command:**
```bash
npx prisma migrate dev --name add_refresh_tokens
```

---

## Phase 2: Backend Implementation

### 2.1 Create Refresh Token Service

**File:** `lib/refreshToken.service.js` (NEW)

```javascript
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * Generate a secure refresh token
 */
export function generateRefreshToken() {
    return crypto.randomBytes(64).toString('hex');
}

/**
 * Save refresh token to database
 */
export async function saveRefreshToken(userId, token, expiresAt, userAgent = null, ipAddress = null) {
    return await prisma.refreshToken.create({
        data: {
            token,
            userId,
            expiresAt,
            userAgent,
            ipAddress,
        },
    });
}

/**
 * Find refresh token by token string
 */
export async function findRefreshToken(token) {
    return await prisma.refreshToken.findUnique({
        where: { token },
        include: { user: true },
    });
}

/**
 * Delete refresh token (logout)
 */
export async function deleteRefreshToken(token) {
    return await prisma.refreshToken.delete({
        where: { token },
    });
}

/**
 * Delete all refresh tokens for a user (logout all devices)
 */
export async function deleteAllUserRefreshTokens(userId) {
    return await prisma.refreshToken.deleteMany({
        where: { userId },
    });
}

/**
 * Delete expired refresh tokens (cleanup job)
 */
export async function deleteExpiredRefreshTokens() {
    return await prisma.refreshToken.deleteMany({
        where: {
            expiresAt: {
                lt: new Date(),
            },
        },
    });
}

/**
 * Rotate refresh token (security best practice)
 */
export async function rotateRefreshToken(oldToken) {
    const oldRefreshToken = await findRefreshToken(oldToken);
    
    if (!oldRefreshToken) {
        return null;
    }

    // Delete old token
    await deleteRefreshToken(oldToken);

    // Generate new token
    const newToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Save new token
    await saveRefreshToken(
        oldRefreshToken.userId,
        newToken,
        expiresAt,
        oldRefreshToken.userAgent,
        oldRefreshToken.ipAddress
    );

    return newToken;
}
```

---

### 2.2 Update Login Endpoint

**File:** `app/api/auth/verify-otp/route.js`

```javascript
import { generateRefreshToken, saveRefreshToken } from "@/lib/refreshToken.service";

export async function POST(request) {
    try {
        // ... existing validation code ...

        const loggedInUserData = {
            id: getUser.id,
            role: getUser.role,
            name: getUser.name,
            email: getUser.email,
            phone: getUser.phone,
            address: getUser.address,
            avatarUrl: getUser.avatarUrl,
        };

        const secret = new TextEncoder().encode(process.env.SECRET_KEY);

        // Generate Access Token (15 minutes)
        const accessToken = await new SignJWT(loggedInUserData)
            .setIssuedAt()
            .setExpirationTime('15m') // Short-lived
            .setProtectedHeader({ alg: 'HS256' })
            .sign(secret);

        // Generate Refresh Token (30 days)
        const refreshToken = generateRefreshToken();
        const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        // Get user agent and IP for tracking
        const userAgent = request.headers.get('user-agent');
        const ipAddress = request.headers.get('x-forwarded-for') || request.ip;

        // Save refresh token to database
        await saveRefreshToken(
            getUser.id,
            refreshToken,
            refreshTokenExpiry,
            userAgent,
            ipAddress
        );

        const cookieStore = await cookies();

        // Set access token cookie (web)
        cookieStore.set({
            name: "access_token",
            value: accessToken,
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60, // 15 minutes
        });

        // Set refresh token cookie (web)
        cookieStore.set({
            name: "refresh_token",
            value: refreshToken,
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60, // 30 days
        });

        // Remove OTP
        await deleteOTPByEmail(email);

        // Return both tokens for mobile
        return response(true, 200, "Login successfully", {
            ...loggedInUserData,
            accessToken,
            refreshToken, // Mobile will store this
        });

    } catch (error) {
        return catchError(error);
    }
}
```

---

### 2.3 Create Refresh Token Endpoint

**File:** `app/api/auth/refresh/route.js` (NEW)

```javascript
import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { findRefreshToken, rotateRefreshToken } from "@/lib/refreshToken.service";
import { response, catchError } from "@/lib/helperFunction";

export async function POST(request) {
    try {
        let refreshToken;

        // Get refresh token from cookie (web) or body (mobile)
        const cookieStore = await cookies();
        if (cookieStore.has('refresh_token')) {
            refreshToken = cookieStore.get('refresh_token').value;
        } else {
            const body = await request.json();
            refreshToken = body.refreshToken;
        }

        if (!refreshToken) {
            return response(false, 401, "Refresh token required");
        }

        // Find refresh token in database
        const tokenData = await findRefreshToken(refreshToken);

        if (!tokenData) {
            return response(false, 401, "Invalid refresh token");
        }

        // Check if token is expired
        if (new Date() > tokenData.expiresAt) {
            return response(false, 401, "Refresh token expired");
        }

        // Get user data
        const user = tokenData.user;

        const userData = {
            id: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            avatarUrl: user.avatarUrl,
        };

        // Generate new access token (15 minutes)
        const secret = new TextEncoder().encode(process.env.SECRET_KEY);
        const newAccessToken = await new SignJWT(userData)
            .setIssuedAt()
            .setExpirationTime('15m')
            .setProtectedHeader({ alg: 'HS256' })
            .sign(secret);

        // Rotate refresh token (security best practice)
        const newRefreshToken = await rotateRefreshToken(refreshToken);

        // Update cookies (web)
        cookieStore.set({
            name: "access_token",
            value: newAccessToken,
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60, // 15 minutes
        });

        cookieStore.set({
            name: "refresh_token",
            value: newRefreshToken,
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60, // 30 days
        });

        // Return new tokens for mobile
        return response(true, 200, "Token refreshed successfully", {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });

    } catch (error) {
        return catchError(error);
    }
}
```

---

### 2.4 Update Logout Endpoint

**File:** `app/api/auth/logout/route.js`

```javascript
import { deleteRefreshToken, deleteAllUserRefreshTokens } from "@/lib/refreshToken.service";
import { getUserSession } from "@/lib/authentication";

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        let refreshToken;

        // Get refresh token from cookie (web) or body (mobile)
        if (cookieStore.has('refresh_token')) {
            refreshToken = cookieStore.get('refresh_token').value;
        } else {
            const body = await request.json();
            refreshToken = body.refreshToken;
        }

        // Delete specific refresh token
        if (refreshToken) {
            await deleteRefreshToken(refreshToken);
        }

        // Optional: Delete all refresh tokens for user (logout all devices)
        const body = await request.json();
        if (body.logoutAllDevices) {
            const user = await getUserSession();
            if (user) {
                await deleteAllUserRefreshTokens(user.userId);
            }
        }

        // Clear cookies (web)
        cookieStore.delete('access_token');
        cookieStore.delete('refresh_token');

        return response(true, 200, "Logged out successfully");

    } catch (error) {
        return catchError(error);
    }
}
```

---

### 2.5 Update Middleware

**File:** `middleware.js`

```javascript
// Update token verification to handle 15-minute tokens
// Middleware should allow refresh endpoint without valid access token

export async function middleware(request) {
    const pathname = request.nextUrl.pathname;

    // Allow refresh endpoint without valid access token
    if (pathname === '/api/auth/refresh') {
        return addCorsHeaders(NextResponse.next(), request);
    }

    // ... rest of existing middleware code ...
}
```

---

## Phase 3: Mobile Implementation

### 3.1 Update Mobile API Service

**File:** `mobile/services/api.js`

```javascript
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../constants/routes";
import { store } from "../store";
import { logout } from "../store/slices/authSlice";
import { showToast } from "../utils/toast";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor - Add access token
api.interceptors.request.use(async (config) => {
    const accessToken = await SecureStore.getItemAsync("access_token");
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// Response interceptor - Handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and haven't retried yet, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Get refresh token
                const refreshToken = await SecureStore.getItemAsync("refresh_token");

                if (!refreshToken) {
                    throw new Error("No refresh token");
                }

                // Call refresh endpoint
                const response = await axios.post(
                    `${API_BASE_URL}/api/auth/refresh`,
                    { refreshToken }
                );

                if (response.data.success) {
                    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                    // Store new tokens
                    await SecureStore.setItemAsync("access_token", accessToken);
                    await SecureStore.setItemAsync("refresh_token", newRefreshToken);

                    // Update original request with new token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                    // Retry original request
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed - logout user
                await SecureStore.deleteItemAsync("access_token");
                await SecureStore.deleteItemAsync("refresh_token");
                store.dispatch(logout());
                showToast("error", "Session Expired", "Please login again");
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
```

---

### 3.2 Update Mobile Login

**File:** `mobile/app/(auth)/verify-otp.jsx`

```javascript
const verifyOtpMutation = useMutation({
    mutationFn: async (otpString) => {
        const response = await api.post(API_ROUTES.VERIFY_OTP, { email, otp: otpString });
        return response.data;
    },
    onSuccess: async (response) => {
        if (response.success && response.data?.accessToken) {
            // Store both tokens
            await SecureStore.setItemAsync("access_token", response.data.accessToken);
            await SecureStore.setItemAsync("refresh_token", response.data.refreshToken);
            
            dispatch(login(response.data));
        } else {
            showToast("error", "Error", response.message || "Invalid OTP");
        }
    },
});
```

---

### 3.3 Update Mobile Logout

**File:** `mobile/app/(tabs)/home.jsx`

```javascript
const handleLogout = async () => {
    try {
        // Get refresh token
        const refreshToken = await SecureStore.getItemAsync("refresh_token");

        // Call logout endpoint to invalidate refresh token
        if (refreshToken) {
            await api.post(API_ROUTES.LOGOUT, { refreshToken });
        }
    } catch (error) {
        console.error("Logout error:", error);
    } finally {
        // Clear all local data
        await persistor.purge();
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("refresh_token");
        dispatch(logout());
        router.replace(ROUTES.LOGIN);
    }
};
```

---

## Phase 4: Web Implementation

### 4.1 Update Web API Service

**File:** `lib/api.js` (if exists) or create axios instance

```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '',
    withCredentials: true, // Send cookies
});

// Response interceptor for token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Call refresh endpoint (cookies sent automatically)
                const response = await axios.post(
                    '/api/auth/refresh',
                    {},
                    { withCredentials: true }
                );

                if (response.data.success) {
                    // Retry original request
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed - redirect to login
                window.location.href = '/auth/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
```

---

## Phase 5: Testing Plan

### 5.1 Backend Tests

```javascript
// Test refresh token generation
// Test refresh token validation
// Test refresh token rotation
// Test refresh token expiration
// Test logout (single device)
// Test logout (all devices)
```

### 5.2 Mobile Tests

```
1. Login → Verify both tokens stored
2. Make API call → Verify access token used
3. Wait 16 minutes → Make API call → Verify auto-refresh
4. Logout → Verify both tokens cleared
5. Login on Device A → Login on Device B → Logout Device A → Verify Device B still works
```

### 5.3 Web Tests

```
1. Login → Verify cookies set
2. Make API call → Verify access token cookie sent
3. Wait 16 minutes → Make API call → Verify auto-refresh
4. Logout → Verify cookies cleared
```

---

## Phase 6: Security Considerations

### 6.1 Refresh Token Rotation

✅ **Implemented:** New refresh token generated on each refresh
✅ **Benefit:** Prevents token reuse attacks

### 6.2 Refresh Token Storage

✅ **Mobile:** SecureStore (encrypted)
✅ **Web:** httpOnly cookies (XSS protection)

### 6.3 Token Revocation

✅ **Implemented:** Logout deletes refresh token from database
✅ **Benefit:** Immediate revocation

### 6.4 Cleanup Job

**Create cron job to delete expired tokens:**

```javascript
// app/api/cron/cleanup-tokens/route.js
import { deleteExpiredRefreshTokens } from "@/lib/refreshToken.service";

export async function GET(request) {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
    }

    const deleted = await deleteExpiredRefreshTokens();
    return Response.json({ success: true, deleted });
}
```

**Set up Vercel Cron:**
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/cleanup-tokens",
    "schedule": "0 0 * * *"
  }]
}
```

---

## Implementation Checklist

### Backend
- [ ] Create `RefreshToken` model in Prisma schema
- [ ] Run migration: `npx prisma migrate dev`
- [ ] Create `lib/refreshToken.service.js`
- [ ] Update `app/api/auth/verify-otp/route.js`
- [ ] Update `app/api/auth/verify-email/route.js`
- [ ] Update `app/api/user/update-profile/route.js`
- [ ] Create `app/api/auth/refresh/route.js`
- [ ] Update `app/api/auth/logout/route.js`
- [ ] Update `middleware.js`
- [ ] Create `app/api/cron/cleanup-tokens/route.js`
- [ ] Add `CRON_SECRET` to `.env`

### Mobile
- [ ] Update `mobile/services/api.js` (add refresh interceptor)
- [ ] Update `mobile/app/(auth)/verify-otp.jsx` (store both tokens)
- [ ] Update `mobile/app/(tabs)/home.jsx` (logout both tokens)
- [ ] Update `mobile/app/(admin)/dashboard.jsx` (logout both tokens)
- [ ] Add `LOGOUT` route to `mobile/constants/routes.js`

### Web
- [ ] Create/update `lib/api.js` (add refresh interceptor)
- [ ] Update all API calls to use new api instance
- [ ] Update logout to call logout endpoint

### Testing
- [ ] Test login flow (both web & mobile)
- [ ] Test token refresh (wait 16 min or mock)
- [ ] Test logout (single device)
- [ ] Test logout (all devices)
- [ ] Test expired refresh token
- [ ] Test concurrent requests during refresh

---

## Environment Variables

Add to `.env`:

```env
# Existing
SECRET_KEY=your-secret-key

# New
CRON_SECRET=your-cron-secret-for-cleanup-job
```

---

## Estimated Timeline

| Phase | Time | Complexity |
|-------|------|------------|
| Database Schema | 30 min | ⭐ Easy |
| Backend Services | 1 hour | ⭐⭐ Medium |
| Backend Endpoints | 1.5 hours | ⭐⭐⭐ Medium |
| Mobile Integration | 1 hour | ⭐⭐ Medium |
| Web Integration | 1 hour | ⭐⭐ Medium |
| Testing | 1 hour | ⭐⭐⭐ Medium |
| **Total** | **6 hours** | ⭐⭐⭐ Medium |

---

## Benefits After Implementation

✅ **Security:** Short-lived access tokens (15 min)
✅ **User Experience:** Seamless token refresh (no re-login)
✅ **Industry Standard:** Same as Google, Instagram, WhatsApp
✅ **Token Revocation:** Logout works immediately
✅ **Multi-Device:** Track and manage sessions per device
✅ **Audit Trail:** Know when/where users logged in

---

## Rollback Plan

If issues occur:

1. Revert backend token expiration to 30 days
2. Remove refresh token interceptors
3. Keep refresh token table (for future use)
4. No data loss (backward compatible)

---

## Next Steps

1. Review this plan
2. Approve implementation
3. I'll implement phase by phase
4. Test each phase before moving to next
5. Deploy to production

**Ready to start?** Let me know and I'll begin with Phase 1! 🚀
