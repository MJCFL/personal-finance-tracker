# Deployment Guide for Personal Finance Tracker

This guide will help you deploy your Personal Finance Tracker application to a production environment.

## Prerequisites

Before deploying, ensure you have:

1. A MongoDB Atlas account with a configured cluster
2. Google OAuth credentials from Google Cloud Console
3. A Vercel account (recommended for Next.js applications)

## Environment Variables

The following environment variables need to be configured in your production environment:

```
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# NextAuth Configuration
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Optional: Alpha Vantage API for stock data (if using)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
```

## Deployment Steps for Vercel

1. **Push your code to GitHub**
   - Ensure your code is in a GitHub repository
   - Make sure `.env.local` is in your `.gitignore` file

2. **Connect to Vercel**
   - Sign up or log in to [Vercel](https://vercel.com)
   - Click "Import Project" and select your GitHub repository
   - Select the "Next.js" framework preset

3. **Configure Environment Variables**
   - In the Vercel project settings, add all the environment variables listed above
   - Make sure to use your production MongoDB URI and OAuth redirect URIs

4. **Deploy**
   - Click "Deploy" and wait for the build to complete
   - Vercel will automatically build and deploy your application

5. **Update Google OAuth Redirect URIs**
   - Go to the Google Cloud Console
   - Update the authorized redirect URIs to include your production domain:
     - `https://your-production-domain.com/api/auth/callback/google`

## Post-Deployment Verification

After deploying, verify the following:

1. User authentication works correctly
2. Assets can be created, read, updated, and deleted
3. User-specific data is properly scoped (users can only see their own assets)
4. Stock price fetching works in the production environment

## Troubleshooting

If you encounter issues:

1. Check Vercel build logs for any errors
2. Verify all environment variables are correctly set
3. Ensure MongoDB connection string is correct and the IP is whitelisted
4. Check that Google OAuth redirect URIs are properly configured

## Security Considerations

- Regularly rotate your `NEXTAUTH_SECRET` and other API keys
- Consider implementing rate limiting for API routes
- Monitor your application for unusual activity
- Keep all dependencies updated to patch security vulnerabilities

## Scaling Considerations

As your application grows:

1. Consider implementing database indexing for faster queries
2. Add caching for frequently accessed data
3. Implement pagination for large asset lists
4. Consider serverless functions for background processing tasks

## Backup Strategy

Implement a regular backup strategy for your MongoDB database:

1. Use MongoDB Atlas automated backups
2. Consider additional manual backups for critical data
3. Test restoration procedures periodically
