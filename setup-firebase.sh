#!/bin/bash

# Firebase Setup Script for A Pretty Girl Matter LLC
echo "Setting up Firebase connection for aprettygirlmatterllc project..."

# Create .env.local file
cat > .env.local << 'EOF'
# Firebase Configuration for aprettygirlmatterllc
# Replace the values below with your actual Firebase config values
# Get these from: https://console.firebase.google.com/u/0/project/aprettygirlmatterllc/settings/general

NEXT_PUBLIC_FIREBASE_API_KEY=XXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=aprettygirlmatterllc.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=aprettygirlmatterllc
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=aprettygirlmatterllc.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here

# Stripe Configuration (optional for now)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Email Configuration (optional for now)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# reCAPTCHA (optional for now)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
EOF

echo "✅ Created .env.local file"
echo ""
echo "📋 Next steps:"
echo "1. Go to: https://console.firebase.google.com/u/0/project/aprettygirlmatterllc/settings/general"
echo "2. Scroll down to 'Your apps' section"
echo "3. Add a web app if you haven't already (click the </> icon)"
echo "4. Copy the config values and replace the placeholders in .env.local"
echo "5. Enable Firestore Database in your Firebase console"
echo "6. Enable Authentication if you want user login"
echo "7. Restart your development server: npm run dev"
echo ""
echo "🔧 Required Firebase config values to replace:"
echo "- NEXT_PUBLIC_FIREBASE_API_KEY"
echo "- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" 
echo "- NEXT_PUBLIC_FIREBASE_APP_ID"
echo ""
echo "The other values are already set correctly for your project!"
