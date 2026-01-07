# Clerk Authentication Setup Guide

This guide explains how to set up Clerk authentication for the Smart Attendance System.

## Prerequisites

1. A Clerk account (sign up at [clerk.com](https://clerk.com))
2. Node.js and npm installed
3. The Smart Attendance frontend running

## Step 1: Create a Clerk Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Click "Add Application"
3. Give it a name (e.g., "Smart Attendance")
4. Choose your authentication methods:
   - **Email**: Enable email/password authentication
   - **Google**: Enable Google OAuth for social login
5. Click "Create Application"

## Step 2: Get Your Clerk Keys

After creating your application:

1. Navigate to "API Keys" in the Clerk Dashboard
2. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)
3. You'll also see your **Secret Key** (keep this private, only for backend if needed)

## Step 3: Configure Frontend Environment Variables

1. Navigate to the `frontend` directory
2. Create a `.env` file (or `.env.local`) based on `.env.example`:

```bash
cd frontend
cp .env.example .env
```

3. Edit the `.env` file and add your Clerk Publishable Key:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
VITE_API_URL=http://localhost:8000
```

## Step 4: Configure Google OAuth (Optional but Recommended)

To enable Google authentication in Clerk:

1. Go to your Clerk Dashboard
2. Navigate to "SSO & Social" → "Google"
3. Click "Enable Google"
4. You have two options:

   **Option A: Use Clerk's Shared OAuth Credentials (Quick Setup)**
   - Simply toggle "Use shared OAuth credentials"
   - This uses Clerk's pre-configured Google OAuth app

   **Option B: Use Your Own Google OAuth Credentials (Production Recommended)**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable "Google+ API"
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized redirect URIs from Clerk (shown in Clerk Dashboard)
   - Copy Client ID and Client Secret
   - Paste them into Clerk's Google OAuth settings

5. Click "Save"

## Step 5: Configure User Metadata for Roles

To support Teacher and Student roles:

1. In Clerk Dashboard, go to "User & Authentication" → "Metadata"
2. You can store role information in:
   - **Public Metadata**: Accessible to frontend (recommended for role)
   - **Private Metadata**: Only accessible server-side

3. When users sign up, you can set their role using Clerk's API or webhooks

### Example: Setting Role via Public Metadata

In your application, after a user signs up, you can update their metadata:

```javascript
// This would typically be done server-side
await clerkClient.users.updateUserMetadata(userId, {
  publicMetadata: {
    role: "teacher" // or "student"
  }
});
```

## Step 6: Install and Run the Application

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. The application should now be running at `http://localhost:5173`

## Step 7: Test Authentication

1. Navigate to `http://localhost:5173`
2. You should be redirected to `/login`
3. Try signing up with:
   - Email and password
   - Google OAuth (click "Continue with Google")
4. After successful sign-in, you should be redirected to the dashboard

## Features Enabled

✅ Email/Password Authentication
✅ Google OAuth (Social Login)
✅ Secure session management
✅ User profile management
✅ Sign out functionality
✅ Protected routes
✅ Customizable UI appearance

## Customization

### Customize Clerk UI Appearance

The authentication UI can be customized in the component files:

**Login.jsx** and **Register.jsx**:
```javascript
appearance={{
  elements: {
    rootBox: "w-full",
    card: "shadow-none",
    headerTitle: "text-3xl font-bold text-gray-900",
    formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 rounded-xl",
    // Add more custom styles
  }
}}
```

### Add More Social Providers

Clerk supports many OAuth providers:
- Facebook
- Twitter (X)
- GitHub
- Microsoft
- Apple
- LinkedIn
- And more...

Enable them in the Clerk Dashboard under "SSO & Social".

## Backend Integration (Optional)

If you need to verify Clerk sessions in your backend:

1. Install Clerk SDK for your backend:
```bash
pip install clerk-backend-api  # Python
```

2. Use Clerk's webhook feature to sync user data to your database
3. Verify session tokens on protected API endpoints

## Troubleshooting

### Issue: "Missing Clerk Publishable Key"
- Ensure your `.env` file has `VITE_CLERK_PUBLISHABLE_KEY` set
- Restart the development server after adding environment variables

### Issue: Google OAuth not working
- Check that Google OAuth is enabled in Clerk Dashboard
- Verify authorized redirect URIs are set correctly in Google Cloud Console
- Make sure you're using the correct Clerk redirect URI

### Issue: Users can't sign in
- Check browser console for errors
- Verify network requests are reaching Clerk API
- Ensure Clerk application is not in "Development" mode restrictions

## Security Notes

- **Never** commit your `.env` file to version control
- Use different Clerk applications for development and production
- In production, use `pk_live_` keys instead of `pk_test_` keys
- Consider adding email verification for production
- Set up webhooks to sync user data securely

## Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk React SDK](https://clerk.com/docs/references/react/overview)
- [Clerk Dashboard](https://dashboard.clerk.com)

## Support

For issues specific to Clerk integration:
- Check [Clerk's Discord Community](https://clerk.com/discord)
- Review [Clerk's GitHub Discussions](https://github.com/clerkinc/javascript/discussions)

For issues with the Smart Attendance app:
- Open an issue on the GitHub repository
- Contact the development team
