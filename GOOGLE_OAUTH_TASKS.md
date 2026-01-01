# Google OAuth Integration Task Breakdown

## Phase 1: Database Setup
- [ ] Update Prisma schema with Account and Session models
- [ ] Make password field optional in User model
- [ ] Add emailVerified DateTime field
- [ ] Run database migration
- [ ] Verify schema changes

## Phase 2: Google OAuth Credentials
- [ ] Create Google Cloud Project
- [ ] Enable Google OAuth API
- [ ] Configure OAuth consent screen
- [ ] Create OAuth 2.0 credentials
- [ ] Add authorized redirect URIs
- [ ] Copy Client ID and Secret to .env

## Phase 3: NextAuth Configuration
- [ ] Install next-auth and @auth/prisma-adapter packages
- [ ] Create auth.config.js with Google provider
- [ ] Implement signIn callback for account linking
- [ ] Implement JWT and session callbacks
- [ ] Create [...nextauth] API route
- [ ] Add environment variables

## Phase 4: Service Layer Updates
- [ ] Update createUser to handle optional password
- [ ] Update loginUser to include accounts relation
- [ ] Create auth.helper.js for unified session handling
- [ ] Update comparePassword to handle null passwords

## Phase 5: UI Integration
- [ ] Add "Sign in with Google" button to login page
- [ ] Add "Sign in with Google" button to register page
- [ ] Add visual separator ("Or continue with")
- [ ] Import and configure next-auth client
- [ ] Handle OAuth loading states

## Phase 6: Middleware & Protection
- [ ] Create middleware.js for route protection
- [ ] Update protected routes to support both auth methods
- [ ] Test session persistence

## Phase 7: Testing
- [ ] Test new user signup with Google
- [ ] Test existing user login with Google (account linking)
- [ ] Test email/password flow still works
- [ ] Test OTP is skipped for Google users
- [ ] Test role-based redirects
- [ ] Test logout functionality

## Phase 8: Documentation
- [ ] Document OAuth setup process
- [ ] Update README with new auth methods
- [ ] Add troubleshooting guide
