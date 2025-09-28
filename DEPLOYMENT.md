# Deployment Guide

This guide will help you deploy your Ayuda CRM to Vercel and connect it to your Google Forms.

## Prerequisites

- GitHub account
- Vercel account
- Supabase project (already set up)

## Step 1: Push to GitHub

1. **Initialize Git repository** (if not already done):
   ```bash
   cd /Users/mehulkapadia/ayuda-crm-v1/my-app
   git init
   ```

2. **Add all files**:
   ```bash
   git add .
   ```

3. **Commit your changes**:
   ```bash
   git commit -m "Initial commit: Ayuda CRM with Google Forms integration"
   ```

4. **Create GitHub repository**:
   - Go to [GitHub.com](https://github.com)
   - Click "New repository"
   - Name it `ayuda-crm` (or your preferred name)
   - Don't initialize with README
   - Click "Create repository"

5. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/ayuda-crm.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

1. **Go to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import your project**:
   - Click "New Project"
   - Select your `ayuda-crm` repository
   - Click "Import"

3. **Configure environment variables**:
   - In the Vercel dashboard, go to your project settings
   - Navigate to "Environment Variables"
   - Add the following variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for the deployment to complete
   - Your app will be available at `https://your-app-name.vercel.app`

## Step 3: Update Google Forms Integration

1. **Get your webhook URL**:
   - Your webhook will be: `https://ayuda-crm-na24.vercel.app/api/webhooks/google-forms`

2. **Update Google Apps Script**:
   - Open your Google Form
   - Go to Script Editor
   - Update the `webhookUrl` variable in the script:

   ```javascript
   const webhookUrl = 'https://ayuda-crm-na24.vercel.app/api/webhooks/google-forms';
   ```

3. **Test the integration**:
   - Submit a test form
   - Check your CRM dashboard for the new lead

## Step 4: Configure Custom Domain (Optional)

1. **Add custom domain in Vercel**:
   - Go to your project settings
   - Navigate to "Domains"
   - Add your custom domain
   - Follow the DNS configuration instructions

2. **Update webhook URL**:
   - Update the Google Apps Script with your custom domain
   - Example: `https://crm.ayuda.com/api/webhooks/google-forms`

## Environment Variables

Make sure to set these in Vercel:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

## Troubleshooting

### Common Issues

1. **Build fails**:
   - Check that all environment variables are set
   - Verify your Supabase connection
   - Check the build logs in Vercel

2. **Webhook not working**:
   - Verify the webhook URL is correct
   - Check Vercel function logs
   - Test the endpoint manually

3. **Database connection issues**:
   - Verify Supabase environment variables
   - Check Supabase project status
   - Verify database tables exist

### Debugging

- **Vercel logs**: Check function logs in Vercel dashboard
- **Supabase logs**: Check your Supabase project logs
- **Browser console**: Check for client-side errors

## Post-Deployment Checklist

- [ ] App is accessible at your Vercel URL
- [ ] Database connection is working
- [ ] Google Forms webhook is configured
- [ ] Test form submission creates a lead
- [ ] Lead appears in CRM dashboard
- [ ] Activity is logged for form submission

## Security Considerations

- Environment variables are encrypted in Vercel
- Supabase has built-in security features
- Consider adding authentication to your webhook endpoint
- Monitor for unusual activity

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Review Vercel and Supabase documentation
3. Check the Google Apps Script execution logs
4. Test each component individually

Your Ayuda CRM is now ready for production use! 🚀
