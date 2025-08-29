# API Key Management - Best Practices

## ✅ **New Centralized Approach**

We've eliminated the `.env.local` dependency with a centralized configuration system.

### **How It Works**

1. **Single Configuration File**: `src/lib/config.ts`
2. **No Environment Variables Required**: Keys are stored directly in code
3. **Automatic Environment Detection**: Test mode locally, live mode in production
4. **Simple Setup**: Just update one file with your actual keys

### **Setup Instructions**

1. **Get Your Stripe Keys**:
   - Go to https://dashboard.stripe.com/test/apikeys
   - Copy your **Publishable key** (starts with `pk_test_`)
   - Copy your **Secret key** (starts with `sk_test_`)

2. **Update Configuration**:
   - Open `src/lib/config.ts`
   - Replace `YOUR_ACTUAL_TEST_KEY_HERE` with your real keys:

```typescript
const STRIPE_KEYS = {
  test: {
    publishable: 'pk_test_51ABC123...', // Your actual test key
    secret: 'sk_test_51ABC123...'       // Your actual secret key
  },
  live: {
    publishable: 'pk_live_51ABC123...', // Your actual live key (when ready)
    secret: 'sk_live_51ABC123...'       // Your actual live secret key
  }
};
```

3. **That's It!** - No `.env.local` files, no environment variable setup needed.

### **Benefits**

- ✅ **No more `.env.local` issues**
- ✅ **Works immediately** after updating config file
- ✅ **Same code works** locally and in production
- ✅ **Automatic mode switching** (test locally, live in production)
- ✅ **Clear error messages** when keys are missing
- ✅ **Version controlled** configuration (keys are in code, not hidden files)

### **Security Notes**

- Test keys are safe to commit to version control
- For production, consider using environment variables for live keys
- The system automatically uses test mode in development

### **Troubleshooting**

If you see "Loading payment form...":
1. Check console logs for specific error messages
2. Verify your keys in `src/lib/config.ts` start with `pk_test_` or `pk_live_`
3. Make sure keys are copied completely without extra spaces

This approach eliminates the circular `.env.local` issues and provides a reliable, consistent way to manage API keys across all environments.
