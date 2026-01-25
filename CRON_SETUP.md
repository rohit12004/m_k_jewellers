# 🔧 Cron Job Setup Guide

## Problem Fixed

**Issue:** Cron job was imported in `layout.js`, causing multiple instances to run simultaneously (20+ at once).

**Solution:** Moved to API route that can be triggered by external cron services.

---

## How to Use

### Option 1: Manual Trigger (Testing)
Visit this URL in your browser or use curl:
```
http://localhost:3000/api/cron/cleanup-otp
```

### Option 2: Vercel Cron Jobs (Production - Recommended)
1. Create `vercel.json` in your project root:
```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-otp",
      "schedule": "0 * * * *"
    }
  ]
}
```

2. Add to `.env`:
```
CRON_SECRET=your-secret-key-here
```

3. Deploy to Vercel - cron will run automatically every hour

### Option 3: External Cron Service
Use services like:
- **cron-job.org**
- **EasyCron**
- **GitHub Actions**

Set them to call:
```
GET https://yourdomain.com/api/cron/cleanup-otp
Authorization: Bearer your-secret-key
```

---

## Security

The endpoint is protected with a secret key. Add to your `.env`:
```
CRON_SECRET=generate-a-random-secret-here
```

Without this, anyone can trigger the cleanup job.

---

## What It Does

- Runs every hour (configurable)
- Deletes expired OTPs from database
- Logs the number of deleted OTPs
- Returns JSON response with results

---

## Response Format

```json
{
  "success": true,
  "message": "Deleted 5 expired OTP(s)",
  "deletedCount": 5,
  "timestamp": "2026-01-25T15:30:00.000Z"
}
```

---

## Why This Fix Matters

**Before:**
- ❌ 20+ cron jobs running simultaneously
- ❌ Database spam
- ❌ Memory leaks
- ❌ Unpredictable behavior

**After:**
- ✅ Single cron job instance
- ✅ Controlled execution
- ✅ Proper error handling
- ✅ Secure endpoint
