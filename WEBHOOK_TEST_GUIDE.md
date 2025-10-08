# Webhook Testing Guide

## Quick Test with curl

### 1. Create a Webhook First
1. Go to `/platform/projects/{project_id}/webhooks`
2. Click "Add New Webhook"
3. Name it "Test Webhook"
4. Optionally enable API key
5. Copy the webhook URL and API key (if enabled)

### 2. Send a Test Call

**Without API Key:**
```bash
curl -X POST http://localhost:3000/api/webhooks/calls/wh_YOUR_TOKEN_HERE \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "Hi, I am calling to inquire about your pricing plans. Could you tell me what packages you offer? Also, do you have any discounts for annual subscriptions?",
    "caller": {
      "name": "John Doe",
      "phone": "+1234567890"
    },
    "duration": 180,
    "timestamp": "2025-10-06T15:30:00Z",
    "audio_url": "https://example.com/recording.mp3"
  }'
```

**With API Key:**
```bash
curl -X POST http://localhost:3000/api/webhooks/calls/wh_YOUR_TOKEN_HERE \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_YOUR_API_KEY_HERE" \
  -d '{
    "transcript": "Hi, I am calling to inquire about your pricing plans. Could you tell me what packages you offer? Also, do you have any discounts for annual subscriptions?",
    "caller": {
      "name": "John Doe",
      "phone": "+1234567890"
    },
    "duration": 180,
    "timestamp": "2025-10-06T15:30:00Z",
    "audio_url": "https://example.com/recording.mp3"
  }'
```

### 3. Expected Response

**Success (200):**
```json
{
  "success": true,
  "call_id": "uuid-here",
  "message": "Call received and queued for analysis"
}
```

**Invalid Webhook (401):**
```json
{
  "error": "Invalid or inactive webhook"
}
```

**Invalid API Key (401):**
```json
{
  "error": "Unauthorized: Invalid API key"
}
```

**Missing Transcript (400):**
```json
{
  "error": "Missing required field: transcript"
}
```

### 4. Verify the Call Was Received

1. Go to `/platform/projects/{project_id}/calls`
2. You should see your test call in the list
3. Wait ~5-10 seconds for AI analysis to complete
4. Status badge will change from "pending" to "completed"
5. Click the call to view full AI analysis

### 5. Check AI Analysis Results

The AI should extract:
- **Topic:** "Pricing inquiry" or similar
- **Summary:** Brief description of the call
- **Questions:** 
  - "What packages do you offer?"
  - "Do you have any discounts for annual subscriptions?"
- **Sentiment:** Likely "positive" or "neutral"
- **Rating:** Between 5-8 (depending on clarity)
- **Follow-up:** May flag as needed if pricing questions weren't answered

---

## Testing Different Scenarios

### Test 1: Simple Inquiry (No Follow-up Needed)
```json
{
  "transcript": "Hi, I just wanted to confirm my appointment for tomorrow at 2 PM. Thanks!",
  "caller": { "name": "Jane Smith", "phone": "+1987654321" },
  "duration": 60
}
```

Expected:
- Topic: "Appointment confirmation"
- Sentiment: Positive
- Follow-up: false

### Test 2: Urgent Issue (Follow-up Required)
```json
{
  "transcript": "My account has been locked and I cannot access critical data. This is very urgent as I have a deadline today. Please help me resolve this immediately!",
  "caller": { "name": "Bob Johnson", "phone": "+1555999888" },
  "duration": 120
}
```

Expected:
- Topic: "Account locked"
- Sentiment: Negative
- Follow-up: true
- Urgency: urgent or high

### Test 3: Multiple Questions
```json
{
  "transcript": "I have several questions about your service. First, what is the cancellation policy? Second, do you offer customer support 24/7? Third, can I upgrade my plan at any time? And lastly, are there any setup fees?",
  "caller": { "name": "Alice Brown", "phone": "+1444333222" },
  "duration": 200
}
```

Expected:
- Topic: "Service questions"
- Questions: List of 4 questions
- Follow-up: Likely true (unanswered questions)

---

## Verifying Webhook Stats

1. Go to `/platform/projects/{project_id}/webhooks`
2. Find your webhook
3. Check that "calls received" count increases
4. Check "Last" timestamp updates

---

## Testing with Postman

1. **Create new request:**
   - Method: POST
   - URL: `http://localhost:3000/api/webhooks/calls/wh_YOUR_TOKEN`

2. **Add Headers:**
   - `Content-Type: application/json`
   - `X-API-Key: sk_YOUR_KEY` (if API key enabled)

3. **Add Body (raw JSON):**
   ```json
   {
     "transcript": "Your call transcript here...",
     "caller": {
       "name": "Test User",
       "phone": "+1234567890"
     },
     "duration": 120
   }
   ```

4. **Send** and verify 200 response

---

## Troubleshooting

### Call not appearing in UI
- Check server logs for errors
- Verify webhook token is correct
- Confirm project ID matches
- Check if webhook is active

### AI analysis stuck on "pending"
- Check OPENAI_API_KEY is set
- Look for errors in server console
- Analysis typically takes 3-10 seconds

### Webhook returns 401
- Verify webhook token is correct
- If using API key, check X-API-Key header
- Confirm webhook is active (not disabled)

### AI analysis incomplete or incorrect
- Verify transcript has sufficient content
- Check OpenAI API quota/billing
- Review server logs for API errors

---

## Production Webhook URLs

When deploying to production, your webhook URL will be:

```
https://yourdomain.com/api/webhooks/calls/wh_YOUR_TOKEN
```

Make sure to:
1. Set `NEXT_PUBLIC_APP_URL` environment variable
2. Use HTTPS (required by most AI platforms)
3. Enable API key authentication for security
4. Test with actual AI voice agent platform before going live
