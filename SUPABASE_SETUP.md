# Supabase PostgreSQL Setup Guide for M.K. Jewellers

Complete guide to set up and use Supabase PostgreSQL database for M.K. Jewellers project.

## Current Project Status

✅ **Database ORM**: Prisma  
✅ **Database Provider**: PostgreSQL (Supabase)  
✅ **Platforms**: Next.js Web App + React Native Mobile App  
✅ **Schema**: 12 models with complex relationships

---

## Phase 1: Supabase Account Setup (To Be Completed)

### 1.1 Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign in with **GitHub** (recommended) or email
4. Authorize Supabase to access your GitHub

### 1.2 Create New Project
1. Click **"New Project"**
2. Fill in project details:
   - **Name**: `m-k-jewellers` or `mk-jewellers-prod`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., Mumbai, Singapore)
   - **Pricing Plan**: Free (500MB database, 2GB storage)
3. Click **"Create new project"**
4. Wait 2-3 minutes for provisioning

### 1.3 Get Database Credentials
1. Go to **Project Settings** (gear icon in sidebar)
2. Click **"Database"** in the left menu
3. Scroll to **"Connection string"** section
4. Copy the **"URI"** connection string (it looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijklmnop.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual database password

### 1.4 Get API Keys (Optional - for future features)
1. Go to **Project Settings** → **API**
2. Copy these keys:
   - **Project URL**: `https://abcdefghijklmnop.supabase.co`
   - **anon public**: Your public API key
   - **service_role**: Your secret API key (keep secure!)

---

## Phase 2: Schema Migration ✅ COMPLETED

### What Changed
- ✅ Updated `prisma/schema.prisma` from MySQL to PostgreSQL
- ✅ Database provider changed to `postgresql`
- ✅ All existing models remain compatible

### PostgreSQL Compatibility
Your schema is fully compatible with PostgreSQL! No data type changes needed because:
- ✅ `String`, `Int`, `Float`, `Boolean`, `DateTime` work the same
- ✅ `@default(uuid())` works natively in PostgreSQL
- ✅ `@db.Timestamp(6)` is compatible
- ✅ `@db.Decimal(10, 2)` is compatible
- ✅ Enums work the same way
- ✅ Relations and indexes are identical

---

## Phase 3: Environment Configuration

### 3.1 Update `.env` File

**After completing Phase 1**, update your `.env` file:

```env
# Supabase PostgreSQL Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Optional: Supabase API Keys (for future features like Storage, Auth)
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Keep all your existing environment variables
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3.2 Mobile App Configuration
No changes needed! Your mobile app connects through your API, not directly to the database.

---

## Phase 4: Deploy Schema to Supabase

### 4.1 Generate Prisma Client
```bash
npx prisma generate
```

### 4.2 Create Initial Migration
```bash
npx prisma migrate dev --name supabase_initial_setup
```

This will:
- Create a new migration file
- Apply the migration to your Supabase database
- Create all 12 tables with proper relationships

### 4.3 Verify Migration Success
Check the output for:
- ✅ Migration created successfully
- ✅ All tables created
- ✅ No errors

---

## Phase 5: Testing & Verification

### 5.1 Test Database Connection
```bash
node scripts/test-supabase-connection.js
```

Expected output:
```
🔄 Testing Supabase PostgreSQL connection...
✅ Successfully connected to Supabase!

📊 Database Statistics:
──────────────────────────────────────────────────
👥 Total users: 0
📦 Total categories: 0
🛍️  Total products: 0
📋 Total orders: 0
──────────────────────────────────────────────────

✅ Connection test completed successfully!
```

### 5.2 Open Prisma Studio
```bash
npx prisma studio
```

This opens a GUI at `http://localhost:5555` to:
- View all tables
- Add/edit/delete records
- Test relationships

### 5.3 Test API Endpoints
Start your dev server:
```bash
npm run dev
```

Test these endpoints:
- ✅ `POST /api/auth/register` - Create user
- ✅ `POST /api/auth/login` - Login
- ✅ `GET /api/categories` - Fetch categories
- ✅ `GET /api/products` - Fetch products
- ✅ `POST /api/orders` - Create order

### 5.4 Test Mobile App
```bash
npm run mobile
```

Test:
- ✅ Login/Register
- ✅ Browse products
- ✅ Add to cart
- ✅ Checkout

---

## Phase 6: Supabase Dashboard Features

### 6.1 Table Editor
1. Go to **Table Editor** in Supabase dashboard
2. View all your tables
3. Add/edit data directly
4. Export data as CSV

### 6.2 SQL Editor
1. Go to **SQL Editor**
2. Run custom queries
3. Create views, functions, triggers

### 6.3 Database Backups (Paid Plans)
- Automatic daily backups
- Point-in-time recovery
- Manual backup triggers

### 6.4 Monitoring
- Real-time database metrics
- Query performance
- Connection pool status

---

## Data Migration (If Needed)

### If You Have Existing MySQL Data

#### Option 1: Export/Import via Prisma Studio
1. Open Prisma Studio with old MySQL connection
2. Export data as JSON
3. Switch to Supabase connection
4. Import data via Prisma Studio

#### Option 2: SQL Dump (Advanced)
```bash
# Export from MySQL
mysqldump -u root -p m_k_jewellers > mysql_backup.sql

# Convert MySQL to PostgreSQL syntax (manual editing required)
# Then import to Supabase via SQL Editor
```

#### Option 3: Start Fresh
- Create new admin account
- Add categories, products manually
- No migration needed for development

---

## Security Best Practices

### 1. Row Level Security (RLS)
Supabase supports RLS for fine-grained access control:
```sql
-- Example: Users can only see their own orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);
```

### 2. Connection Pooling
Supabase provides connection pooling automatically via:
- **Direct connection**: `5432` (for migrations, Prisma)
- **Pooled connection**: `6543` (for serverless functions)

For serverless/edge functions, use port `6543`:
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true
```

### 3. Environment Variables
- ✅ Never commit `.env` to Git
- ✅ Use Vercel/Railway environment variables in production
- ✅ Rotate database passwords regularly
- ✅ Keep `service_role` key secret (has admin access)

---

## Troubleshooting

### Issue: "Can't reach database server"
**Solution**: 
- Check if Supabase project is active
- Verify `DATABASE_URL` is correct
- Check internet connection

### Issue: Migration fails with "relation already exists"
**Solution**:
```bash
# Reset database (⚠️ DELETES ALL DATA)
npx prisma migrate reset

# Or drop all tables in Supabase SQL Editor and re-run migration
```

### Issue: "Password authentication failed"
**Solution**:
- Verify password in `DATABASE_URL` matches Supabase project password
- Reset password in Supabase dashboard if needed

### Issue: Prisma Client errors
**Solution**:
```bash
# Regenerate Prisma Client
npx prisma generate

# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

---

## Supabase vs Railway MySQL Comparison

| Feature | Supabase (PostgreSQL) | Railway (MySQL) |
|---------|----------------------|-----------------|
| **Free Tier** | 500MB DB, 2GB storage | $5/month minimum |
| **Database** | PostgreSQL | MySQL |
| **Built-in Auth** | ✅ Yes | ❌ No |
| **Built-in Storage** | ✅ Yes (2GB free) | ❌ No |
| **Realtime** | ✅ Yes | ❌ No |
| **Auto APIs** | ✅ REST + GraphQL | ❌ No |
| **Dashboard** | ✅ Excellent | ✅ Good |
| **Backups** | ✅ Paid plans | ✅ Paid plans |
| **Extensions** | ✅ PostGIS, pg_cron | ❌ Limited |

---

## Advanced Features (Future)

### 1. Supabase Auth
Replace your custom JWT auth with Supabase Auth:
- Email/password authentication
- OAuth providers (Google, GitHub, etc.)
- Magic links
- Phone authentication

### 2. Supabase Storage
Store product images in Supabase instead of Cloudinary:
- 2GB free storage
- Image transformations
- CDN delivery
- Access control

### 3. Realtime Subscriptions
Listen to database changes in real-time:
```javascript
supabase
  .from('orders')
  .on('INSERT', payload => {
    console.log('New order!', payload)
  })
  .subscribe()
```

### 4. Edge Functions
Deploy serverless functions alongside your database:
```bash
supabase functions deploy my-function
```

---

## Quick Reference Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Deploy migration
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Test connection
node scripts/test-supabase-connection.js

# Start dev server
npm run dev

# Start mobile app
npm run mobile
```

---

## Support & Resources

- 📚 [Supabase Documentation](https://supabase.com/docs)
- 📚 [Prisma + Supabase Guide](https://supabase.com/docs/guides/integrations/prisma)
- 💬 [Supabase Discord](https://discord.supabase.com)
- 🐛 [Supabase Status](https://status.supabase.com)
- 📺 [Supabase YouTube](https://www.youtube.com/c/supabase)

---

## Next Steps

1. ✅ Complete Phase 1 (Create Supabase account)
2. ✅ Update `.env` with Supabase credentials
3. ✅ Run `npx prisma generate`
4. ✅ Run `npx prisma migrate dev --name supabase_initial_setup`
5. ✅ Test connection with `node scripts/test-supabase-connection.js`
6. ✅ Test all API endpoints
7. ✅ Test mobile app
8. ✅ Deploy to production

---

**Created for M.K. Jewellers Project**  
**Database**: Supabase PostgreSQL  
**Last Updated**: January 2026
