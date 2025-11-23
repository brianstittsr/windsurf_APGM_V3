# Vercel Project Setup - windsurf-apgm-v3

## ✅ Fixed: Project Now Linked Correctly

Your project is now linked to: **windsurf-apgm-v3**

## What Was Done

1. **Removed old link** to "permanent-makeup-website"
2. **Linked to correct project** "windsurf-apgm-v3"
3. **Deployed to production** successfully

## Production URL

Your site is now deployed at:
- **Primary:** https://www.aprettygirlmatter.com
- **Vercel URL:** https://windsurf-apgm-v3-jh08mzyud-tdaent.vercel.app

## Set Up Automatic Deployments from GitHub

To ensure future GitHub pushes automatically deploy to the correct project:

### Step 1: Connect GitHub in Vercel Dashboard

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/tdaent/windsurf-apgm-v3

2. **Go to Settings:**
   - Click "Settings" tab
   - Click "Git" in the sidebar

3. **Connect GitHub Repository:**
   - Click "Connect Git Repository"
   - Select your GitHub account
   - Choose repository: `brianstittsr/windsurf_APGM_V3`
   - Click "Connect"

4. **Configure Branch:**
   - Production Branch: `main`
   - Enable "Automatically deploy new commits"

### Step 2: Verify Auto-Deploy

1. **Make a small change** (e.g., update a comment in code)
2. **Commit and push** to GitHub
3. **Check Vercel Dashboard** → Deployments tab
4. Should see automatic deployment triggered

## Manual Deployment

If you need to deploy manually:

```bash
# From your project directory
vercel --prod
```

This will now deploy to the correct project: **windsurf-apgm-v3**

## Verify Current Link

To check which project you're linked to:

```bash
vercel ls
```

Should show: `windsurf-apgm-v3`

## If You Need to Relink

If the link gets messed up again:

```bash
# Remove current link
Remove-Item -Path ".vercel" -Recurse -Force

# Link to correct project
vercel link --project windsurf-apgm-v3 --yes

# Deploy
vercel --prod
```

## Environment Variables

Make sure all environment variables are set in Vercel Dashboard:

1. Go to: https://vercel.com/tdaent/windsurf-apgm-v3/settings/environment-variables

2. Required variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
   - `GHL_API_KEY` (optional, can be set in admin dashboard)
   - `GHL_LOCATION_ID` (optional, can be set in admin dashboard)
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `RESEND_API_KEY`
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASSWORD`

3. Set for: **Production**, **Preview**, and **Development**

## Domain Configuration

Your custom domain should be configured in Vercel:

1. Go to: https://vercel.com/tdaent/windsurf-apgm-v3/settings/domains

2. Verify these domains are added:
   - `www.aprettygirlmatter.com` (primary)
   - `aprettygirlmatter.com` (redirect to www)

## Troubleshooting

### If deployments go to wrong project:
```bash
Remove-Item -Path ".vercel" -Recurse -Force
vercel link --project windsurf-apgm-v3 --yes
vercel --prod
```

### If auto-deploy not working:
1. Check GitHub connection in Vercel Settings → Git
2. Verify webhook exists in GitHub repo settings
3. Manually trigger deployment to test

### If build fails:
1. Check Vercel dashboard → Functions → Logs
2. Verify all environment variables are set
3. Check for build errors in deployment logs

## Summary

✅ **Project:** windsurf-apgm-v3  
✅ **Deployment:** Successful  
✅ **URL:** https://www.aprettygirlmatter.com  
✅ **Next Step:** Set up GitHub auto-deploy in Vercel dashboard  

All future deployments will now go to the correct project!
