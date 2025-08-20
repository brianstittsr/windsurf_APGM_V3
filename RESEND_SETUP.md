# Resend Email Service Setup for Vercel

## Why Resend?
Resend is a modern email API that works perfectly with Vercel serverless functions, providing reliable email delivery without SMTP connection issues.

## Setup Steps:

### 1. Create Resend Account
- Go to https://resend.com
- Sign up for a free account (100 emails/day free tier)
- Verify your account

### 2. Add Domain (Recommended)
- Add `aprettygirlmatter.com` domain to Resend
- Follow DNS verification steps
- This allows sending from `contact@aprettygirlmatter.com`

### 3. Get API Key
- Go to API Keys section in Resend dashboard
- Create a new API key
- Copy the key (starts with `re_`)

### 4. Add to Vercel Environment Variables
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Add: `RESEND_API_KEY` = `your_resend_api_key_here`
- Redeploy the application

### 5. Alternative: Use Resend's Default Domain
If you don't want to verify your domain immediately:
- Change `from: 'contact@aprettygirlmatter.com'` 
- To: `from: 'onboarding@resend.dev'` in the API code
- This works immediately but emails come from Resend's domain

## Benefits:
- ✅ Works reliably on Vercel serverless functions
- ✅ No SMTP connection issues
- ✅ Built-in email analytics
- ✅ High deliverability rates
- ✅ Simple HTTP API (no complex SMTP setup)

## Cost:
- Free: 100 emails/day, 3,000/month
- Paid: $20/month for 50,000 emails

The contact form will work immediately once the API key is added to Vercel.
