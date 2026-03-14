# Fix OpenAI Quota Error - Complete Guide

## ❌ Problem

You're seeing this error:
```
429 You exceeded your current quota, please check your plan and billing details.
```

This means your OpenAI API account has run out of credits or hit its usage limit.

---

## ✅ Solution

### Option 1: Add Credits to OpenAI Account (Recommended)

1. **Go to OpenAI Dashboard**
   - Visit: https://platform.openai.com/account/billing/overview

2. **Check Your Usage**
   - Click "Usage" in the left menu
   - See how much you've used

3. **Add Payment Method**
   - Click "Billing" → "Payment methods"
   - Add a credit card

4. **Set Usage Limits**
   - Click "Billing" → "Usage limits"
   - Set a monthly budget (e.g., $20/month)

5. **Wait a Few Minutes**
   - OpenAI may take a few minutes to reset your quota
   - Then try again

### Option 2: Use Fallback Mode (Temporary)

The system now has a **fallback mode** that works without OpenAI API calls:

**What happens:**
- AI features still work
- Uses cached/default responses
- No API calls made
- No additional costs

**How it works:**
- Status check returns: `"mode": "fallback"`
- Questions are generated from templates
- Responses are evaluated using rules
- Reports are generated from patterns

### Option 3: Use Free Trial Credits

If you're new to OpenAI:

1. **Check for Free Trial**
   - Visit: https://platform.openai.com/account/billing/overview
   - Look for "Free trial credits"

2. **Use Trial Credits**
   - Free trial usually includes $5-$18 in credits
   - Valid for 3 months
   - Use for testing

---

## 🔧 How to Check Your Status

### Check API Status
```bash
curl http://localhost:5000/api/ai/status
```

**Response if quota exceeded:**
```json
{
  "available": true,
  "mode": "fallback",
  "message": "AI service is operational (fallback mode - using cached responses)",
  "warning": "OpenAI API quota exceeded. Using fallback responses."
}
```

**Response if working:**
```json
{
  "available": true,
  "mode": "live",
  "model": "gpt-3.5-turbo",
  "message": "AI service is operational"
}
```

---

## 💰 OpenAI Pricing

### Pay-As-You-Go
- GPT-3.5-turbo: $0.50 per 1M input tokens, $1.50 per 1M output tokens
- GPT-4: $30 per 1M input tokens, $60 per 1M output tokens

### Typical Costs
- Generate 10 questions: ~$0.05
- Evaluate 10 responses: ~$0.10
- Analyze resume: ~$0.03
- Generate cover letter: ~$0.05

**Total for full interview: ~$0.25**

### Budget Recommendations
- Testing: $5-10/month
- Small production: $20-50/month
- Medium production: $50-200/month
- Large production: $200+/month

---

## 🚀 Steps to Fix

### Step 1: Check Current Status
```bash
# Terminal
curl http://localhost:5000/api/ai/status
```

### Step 2: Add Credits (if needed)
1. Go to https://platform.openai.com/account/billing/overview
2. Add payment method
3. Set usage limits
4. Wait 5 minutes

### Step 3: Verify Fix
```bash
# Terminal
curl http://localhost:5000/api/ai/status
```

Should show `"mode": "live"` if fixed.

### Step 4: Test Features
1. Visit: http://localhost:3000/ai-demo
2. Click "Check AI Service Status"
3. Try generating questions

---

## 📊 Monitor Your Usage

### Check Usage Dashboard
1. Visit: https://platform.openai.com/account/usage/overview
2. See daily/monthly usage
3. Check costs

### Set Alerts
1. Go to: https://platform.openai.com/account/billing/limits
2. Set "Hard limit" (stops API when reached)
3. Set "Soft limit" (sends email warning)

### Example Limits
- Hard limit: $50/month
- Soft limit: $40/month

---

## 🔄 Fallback Mode Details

### What Works in Fallback Mode

✅ **Generate Questions**
- Uses template-based questions
- Customized to job title
- Includes difficulty levels
- No API calls

✅ **Evaluate Responses**
- Uses keyword matching
- Calculates scores based on content
- Provides feedback from rules
- No API calls

✅ **Analyze Resume**
- Uses skill matching
- Calculates match score
- Identifies gaps
- No API calls

✅ **Generate Cover Letter**
- Uses templates
- Personalizes with candidate info
- Professional format
- No API calls

### Limitations in Fallback Mode

⚠️ **Less Intelligent**
- Responses are template-based
- Less nuanced analysis
- Pattern matching instead of AI
- May miss context

⚠️ **Limited Customization**
- Fewer variations
- Less personalization
- Standard templates
- Predictable responses

---

## 🎯 Best Practices

### 1. Set Usage Limits
```
Hard limit: $50/month
Soft limit: $40/month
```

### 2. Monitor Regularly
- Check usage weekly
- Review costs
- Adjust limits if needed

### 3. Optimize Prompts
- Use shorter prompts
- Batch requests
- Cache responses

### 4. Use Fallback Mode
- For testing
- For development
- When quota exceeded

---

## 📞 Support

### OpenAI Support
- Website: https://platform.openai.com/docs
- Help: https://help.openai.com
- Status: https://status.openai.com

### Common Issues

**"Invalid API key"**
- Check key in `server/.env`
- Regenerate key if needed
- Restart server

**"Rate limit exceeded"**
- Wait a few minutes
- Reduce request frequency
- Upgrade plan

**"Quota exceeded"**
- Add credits
- Use fallback mode
- Check usage limits

---

## ✅ Verification Checklist

- [ ] Checked OpenAI dashboard
- [ ] Added payment method
- [ ] Set usage limits
- [ ] Waited 5 minutes
- [ ] Tested API status
- [ ] Verified mode is "live"
- [ ] Tested AI features
- [ ] All working

---

## 🎉 You're Fixed!

Once you add credits:
1. OpenAI quota resets
2. API calls work again
3. AI features fully operational
4. No more fallback mode

---

## 📝 Quick Reference

| Issue | Solution |
|-------|----------|
| 429 Quota Error | Add credits to OpenAI |
| Invalid API Key | Check key in .env |
| Rate Limited | Wait or upgrade plan |
| Fallback Mode | Add credits to switch to live |
| High Costs | Set usage limits |

---

**Status**: ✅ Fallback mode active  
**Next Step**: Add credits to OpenAI  
**Time to Fix**: 5 minutes

---

For more help, visit:
- OpenAI Docs: https://platform.openai.com/docs
- Billing: https://platform.openai.com/account/billing/overview
- Usage: https://platform.openai.com/account/usage/overview
