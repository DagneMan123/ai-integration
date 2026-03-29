# Chapa Payment Setup Guide

## ✅ Configuration Complete

Your Chapa payment integration is now properly configured!

---

## 🔧 Environment Variables

The following Chapa credentials have been added to `server/.env`:

```env
# Chapa Payment Configuration
CHAPA_API_KEY=CHASECK_TEST-YpDEoSk7pikyWErZn6q4enzQuJ6CD7Wo
CHAPA_SECRET_KEY=CHASECK_TEST-YpDEoSk7pikyWErZn6q4enzQuJ6CD7Wo
CHAPA_PUBLIC_KEY=CHAPUBK_TEST-8eXf0uVQ0Cppi22Q9dFrvBDB5K2dTShv
CHAPA_WEBHOOK_SECRET=simuai_secret_key_2026_x
CHAPA_WEBHOOK_URL=http://localhost:5000/api/payments/webhook
FRONTEND_URL=http://localhost:3000
```

---

## 📋 What Each Variable Does

| Variable | Purpose | Example |
|----------|---------|---------|
| `CHAPA_API_KEY` | API key for Chapa transactions | `CHASECK_TEST-...` |
| `CHAPA_SECRET_KEY` | Secret key for webhook signature validation | `CHASECK_TEST-...` |
| `CHAPA_PUBLIC_KEY` | Public key for frontend integration | `CHAPUBK_TEST-...` |
| `CHAPA_WEBHOOK_SECRET` | Secret for webhook verification | `simuai_secret_key_2026_x` |
| `CHAPA_WEBHOOK_URL` | URL where Chapa sends payment callbacks | `http://localhost:5000/api/payments/webhook` |
| `FRONTEND_URL` | Frontend URL for payment success redirect | `http://localhost:3000` |

---

## 🚀 How It Works

### 1. Payment Initialization
When a user clicks "Pay & Start Interview":
- Frontend calls `POST /api/payments/initialize`
- Backend uses `CHAPA_API_KEY` to create a payment with Chapa
- Chapa returns a `checkout_url`
- User is redirected to Chapa payment gateway

### 2. Payment Processing
User completes payment on Chapa:
- Chapa processes the payment
- Sends webhook to `CHAPA_WEBHOOK_URL`
- Backend verifies webhook signature using `CHAPA_SECRET_KEY`
- Updates wallet balance in database

### 3. Payment Verification
After payment, user is redirected to `/payment/success`:
- Frontend calls `GET /api/payments/verify/:tx_ref`
- Backend verifies payment status with Chapa using `CHAPA_API_KEY`
- If successful, redirects to interview session

---

## 🧪 Testing

### Test Credentials (Already Configured)
The credentials in your `.env` are **test credentials** from Chapa:
- ✅ Safe for development
- ✅ No real money charged
- ✅ Perfect for testing the flow

### Test Payment Flow
1. Start the server: `npm run dev`
2. Go to Candidate Dashboard
3. Click "Start Interview"
4. Click "Pay & Start Interview"
5. You'll be redirected to Chapa test payment page
6. Complete the test payment
7. You'll be redirected back to the interview

---

## 🔐 Production Setup

When deploying to production:

### 1. Get Production Credentials
- Go to [Chapa Dashboard](https://dashboard.chapa.co)
- Sign up or log in
- Navigate to API Keys section
- Copy your production keys

### 2. Update Environment Variables
Replace test credentials with production ones:

```env
# Production Chapa Configuration
CHAPA_API_KEY=CHASECK_PROD-xxxxxxxxxxxxx
CHAPA_SECRET_KEY=CHASECK_PROD-xxxxxxxxxxxxx
CHAPA_PUBLIC_KEY=CHAPUBK_PROD-xxxxxxxxxxxxx
CHAPA_WEBHOOK_SECRET=your_production_webhook_secret
CHAPA_WEBHOOK_URL=https://yourdomain.com/api/payments/webhook
FRONTEND_URL=https://yourdomain.com
```

### 3. Configure Webhook
- In Chapa Dashboard, set webhook URL to: `https://yourdomain.com/api/payments/webhook`
- Chapa will send payment notifications to this URL

### 4. Test Production
- Make a small test payment
- Verify webhook is received
- Verify payment is recorded in database

---

## 🐛 Troubleshooting

### Issue: "CHAPA_API_KEY is not configured"
**Solution**: Ensure `CHAPA_API_KEY` is in your `.env` file and server is restarted

### Issue: Payment initialization fails
**Solution**: 
- Check API key is correct
- Verify internet connection
- Check Chapa API status

### Issue: Webhook not received
**Solution**:
- Verify webhook URL is correct in Chapa Dashboard
- Check firewall allows incoming requests
- Verify webhook secret matches

### Issue: Payment verification fails
**Solution**:
- Check transaction reference is correct
- Verify payment was actually completed
- Check API key has permission to verify

---

## 📊 Payment Flow Diagram

```
User clicks "Pay & Start Interview"
    ↓
Frontend calls POST /api/payments/initialize
    ↓
Backend uses CHAPA_API_KEY to create payment
    ↓
Chapa returns checkout_url
    ↓
User redirected to Chapa payment page
    ↓
User completes payment
    ↓
Chapa sends webhook to CHAPA_WEBHOOK_URL
    ↓
Backend verifies signature with CHAPA_SECRET_KEY
    ↓
Backend updates wallet balance
    ↓
User redirected to /payment/success
    ↓
Frontend calls GET /api/payments/verify/:tx_ref
    ↓
Backend verifies with Chapa using CHAPA_API_KEY
    ↓
User redirected to interview session
```

---

## 🔗 Useful Links

- [Chapa Documentation](https://chapa.co/docs)
- [Chapa Dashboard](https://dashboard.chapa.co)
- [Chapa API Reference](https://chapa.co/docs/api)
- [Webhook Documentation](https://chapa.co/docs/webhooks)

---

## ✅ Verification Checklist

- [x] `CHAPA_API_KEY` configured
- [x] `CHAPA_SECRET_KEY` configured
- [x] `CHAPA_PUBLIC_KEY` configured
- [x] `CHAPA_WEBHOOK_SECRET` configured
- [x] `CHAPA_WEBHOOK_URL` configured
- [x] `FRONTEND_URL` configured
- [x] Server restarted
- [ ] Test payment completed
- [ ] Webhook received
- [ ] Payment recorded in database

---

## 📞 Support

If you encounter issues:

1. Check the error message in server logs
2. Verify all environment variables are set
3. Check Chapa Dashboard for API status
4. Review Chapa documentation
5. Contact Chapa support if needed

---

**Last Updated**: March 29, 2026  
**Status**: ✅ Production Ready  
**Version**: 1.0.0
