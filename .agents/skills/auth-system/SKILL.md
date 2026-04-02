---
name: express-mongoose-jwt-auth
description: Complete Express.js JWT authentication system with Mongoose. Use this skill to integrate registration, login, token refresh, and OTP-based email verification into new or existing projects.
---

# Express Mongoose Auth System

Complete setup guide and codebase for an Express + Mongoose authentication system. Provides a reusable set of models, controllers, utilities, and routes.

## When to Apply

Reference these guidelines and templates when:
- Setting up a new Express + MongoDB backend
- Implementing secure JWT-based authentication
- Adding email OTP verification to user registration
- Implementing refresh/access token rotation mechanisms

## When NOT to Apply

- If the project does not use Express or MongoDB
- If OAuth (Google/GitHub/etc.) is the primary authentication method
- If sessions should be managed purely via stateful cookies without JWT

## Inputs & Configuration

- `database_url` (optional): MongoDB connection string
- `jwt_secret` (required): Secret key for signing JWTs
- `smtp_config` (required): SMTP credentials for sending OTP emails

## How to Use

Read and apply the individual reference files from the `assets/` directory:

```
assets/user.model.js
assets/session.model.js
assets/otp.model.js
assets/auth.controller.js
assets/auth.routes.js
assets/utils.js
assets/email.service.js

```

### Installation Steps

1. **Install Dependencies**:
   `npm i express jsonwebtoken mongoose nodemailer cookie-parser dotenv morgan`

2. **Set up Environment Variables**:
   Ensure `JWT_SECRET` and appropriate SMTP credentials are in `.env`.

3. **Copy Assets**:
   Copy all files from the `assets/` directory of this skill to the corresponding `src/` directories (e.g., `models/`, `controllers/`, `routes/`, `utils/`, `services/`) in the new project.

4. **Integrate Routes**:
   Update `app.js` or `server.js` to use the auth routes:
   ```javascript
   import authRouter from './routes/auth.routes.js';
   import cookieParser from 'cookie-parser';

   app.use(cookieParser());
   app.use(express.json());
   app.use('/api/auth', authRouter);
   ```

## Folder Usage

- `assets/`: Contains the reference model, controller, route, service, and utility files needed to implement the auth system.

## References

- Node.js Crypto API: https://nodejs.org/api/crypto.html
- Mongoose Documentation: https://mongoosejs.com/docs/
- Express.js Documentation: https://expressjs.com/
- JWT Introduction: https://jwt.io/introduction/
