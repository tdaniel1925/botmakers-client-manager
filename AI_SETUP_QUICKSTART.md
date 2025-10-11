# AI Email Assistant - Quick Setup Guide

## 🚀 Get Started in 3 Steps

### Step 1: Get OpenAI API Key

1. Go to https://platform.openai.com
2. Sign up or log in
3. Go to **API Keys** section
4. Click **"Create new secret key"**
5. Copy the key (starts with `sk-...`)

### Step 2: Add to Environment Variables

Add this line to your `.env.local` file:

```bash
OPENAI_API_KEY=sk-your-actual-key-here
```

**Important:** Replace `sk-your-actual-key-here` with your real key!

### Step 3: Restart Development Server

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

## ✅ Test It Works

1. Open the email client: http://localhost:3001/platform/emails
2. Click the **AI Copilot** button (bottom-right or right panel)
3. Select an email
4. Try asking: **"Summarize this email"**

If you get a response, it's working! 🎉

## 💰 Cost Management

### Set OpenAI Usage Limits

1. Go to https://platform.openai.com/account/billing/limits
2. Set a **hard limit** (e.g., $50/month)
3. Set a **soft limit email** alert (e.g., $25/month)

### Estimated Costs

**With GPT-4 Turbo:**
- Per conversation: ~$0.05
- 100 conversations: ~$5
- Monthly (heavy use): $100-200

**Switch to GPT-3.5 for Lower Costs:**

Edit `app/api/email/ai/chat/route.ts`, change:
```typescript
model: 'gpt-4-turbo-preview'
```
to:
```typescript
model: 'gpt-3.5-turbo'
```

**GPT-3.5 Costs:**
- Per conversation: ~$0.002
- 100 conversations: ~$0.20
- Monthly (heavy use): $5-15

## 🔧 Troubleshooting

### Error: "Unauthorized" or "Invalid API key"
- ✅ Check that `OPENAI_API_KEY` is in `.env.local`
- ✅ Verify the key starts with `sk-`
- ✅ Make sure you restarted the server after adding the key

### Error: "Rate limit exceeded"
- ✅ You've hit the 20 requests/minute limit
- ✅ Wait 1 minute and try again
- ✅ Or increase the limit in `route.ts` (line 16)

### Error: "Insufficient quota"
- ✅ You need to add a payment method to OpenAI
- ✅ Go to https://platform.openai.com/account/billing
- ✅ Add a credit card

### AI Responses Are Slow
- ✅ Normal! GPT-4 takes 2-4 seconds
- ✅ Switch to GPT-3.5 for faster responses (1-2 seconds)
- ✅ Future: streaming responses will show progress

## 🎯 What to Ask the AI

### Email Management
- "Summarize this email"
- "Draft a professional reply"
- "Extract action items"
- "Is this email urgent?"
- "What's the sentiment of this message?"

### Inbox Overview
- "What's in my inbox?"
- "Show me unread important emails"
- "Who emails me the most?"
- "Summarize today's emails"

### Search & Find
- "Find all emails about the project deadline"
- "Search for emails from john@company.com"
- "Show me emails with attachments"
- "Find conversations about marketing"

### Organization
- "Which emails need follow-up?"
- "What are my pending tasks?"
- "Prioritize my inbox"
- "Find unanswered emails"

## 📊 Monitor Usage

Check your OpenAI usage:
1. Go to https://platform.openai.com/usage
2. View daily/monthly token usage
3. See costs per day
4. Export usage reports

## 🔐 Security Best Practices

### API Key Security
- ✅ **NEVER** commit `.env.local` to git
- ✅ Keep your API key private
- ✅ Regenerate if exposed
- ✅ Use separate keys for dev/production

### Usage Monitoring
- ✅ Set spending alerts
- ✅ Monitor for unusual activity
- ✅ Review API logs regularly
- ✅ Revoke unused keys

## 🎉 You're Ready!

Your AI Email Assistant now has:
- ✅ Full knowledge of all your emails
- ✅ Real GPT-4 intelligence
- ✅ Advanced email management capabilities
- ✅ Conversation memory
- ✅ Smart search and discovery

Start chatting and let the AI help you manage your inbox! 🚀

---

**Questions or Issues?**
Check the full documentation: `AI_EMAIL_ASSISTANT_COMPLETE.md`


