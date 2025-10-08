# BYOK Messaging Guide: Bring Your Own Keys

## Overview

ClientFlow now supports **Bring Your Own Keys (BYOK)** for messaging services, allowing organizations to use their own Twilio and Resend accounts for SMS and email messaging. This gives you more control, dedicated rate limits, and the ability to manage messaging costs directly.

## What is BYOK?

By default, ClientFlow uses platform-wide messaging credentials for all SMS and email communications. With BYOK, your organization can configure its own:

- **Twilio Account** - For sending SMS messages
- **Resend Account** - For sending emails

When configured, all campaign messaging and workflow-triggered communications for your organization will use your credentials instead of the platform's shared credentials.

## Benefits of BYOK

### 1. **Dedicated Rate Limits**
- No competition with other organizations for sending capacity
- Higher throughput for your campaigns
- Better reliability during peak times

### 2. **Cost Control**
- Pay directly for what you use
- No markup on messaging costs
- Choose your own pricing plans with providers

### 3. **Full Transparency**
- View detailed logs in your Twilio/Resend dashboards
- Monitor usage and costs in real-time
- Access to provider-specific analytics

### 4. **Compliance & White-labeling**
- Use your own verified domains for email
- Register your own 10DLC campaign with carriers (Twilio)
- Full control over sender reputation

## Setting Up Twilio SMS

### Step 1: Get Your Twilio Credentials

1. **Create or Log Into Twilio Account**
   - Go to [twilio.com](https://www.twilio.com)
   - Sign up for a new account or log into your existing account

2. **Find Your Credentials**
   - Navigate to the [Twilio Console](https://console.twilio.com/)
   - Find your **Account SID** and **Auth Token** on the dashboard
   - Copy both values (you'll need these later)

3. **Get a Phone Number**
   - Go to Phone Numbers → Manage → Buy a number
   - Choose a number with SMS capability
   - Purchase the number
   - Copy the phone number (format: +1234567890)

### Step 2: Configure in ClientFlow

1. **Navigate to Settings**
   - Go to Dashboard → Settings
   - Click on the **Messaging** tab

2. **Enable Custom Twilio**
   - Toggle on "Use Custom Twilio Account"

3. **Enter Your Credentials**
   - **Account SID**: Paste your Account SID from Twilio
   - **Auth Token**: Paste your Auth Token from Twilio
   - **Phone Number**: Enter your Twilio phone number with country code (+1234567890)

4. **Test & Save**
   - Click **"Save & Test Credentials"**
   - ClientFlow will verify your credentials by making a test API call
   - If successful, you'll see a green "Verified ✓" badge

### Twilio Pricing

- **Phone Number**: ~$1.00/month
- **SMS**: ~$0.0079 per message (US)
- Prices vary by country and provider

## Setting Up Resend Email

### Step 1: Get Your Resend Credentials

1. **Create or Log Into Resend Account**
   - Go to [resend.com](https://resend.com)
   - Sign up for a new account or log into your existing account

2. **Create an API Key**
   - Go to [API Keys](https://resend.com/api-keys)
   - Click "Create API Key"
   - Give it a name (e.g., "ClientFlow Production")
   - Select "Sending access" permission
   - Copy the API key (starts with `re_`)

3. **Verify Your Domain**
   - Go to [Domains](https://resend.com/domains)
   - Click "Add Domain"
   - Enter your domain name
   - Follow the DNS setup instructions
   - Wait for verification (usually takes a few minutes)

### Step 2: Configure in ClientFlow

1. **Navigate to Settings**
   - Go to Dashboard → Settings
   - Click on the **Messaging** tab

2. **Enable Custom Email Service**
   - Toggle on "Use Custom Email Service"

3. **Enter Your Credentials**
   - **API Key**: Paste your Resend API key (re_xxxxxxxxxxxx)
   - **From Email**: Enter the email address you want to send from (must be from your verified domain)

4. **Test & Save**
   - Click **"Save & Test Credentials"**
   - ClientFlow will verify your credentials and check domain verification
   - If successful, you'll see a green "Verified ✓" badge
   - **Note**: You may see a warning if your domain is not fully verified yet

### Resend Pricing

- **Free Tier**: 3,000 emails/month
- **Pro Plan**: $20/month (50,000 emails/month)
- Prices vary by plan and volume

## Using BYOK Credentials

### Automatic Usage

Once configured and verified, your credentials are automatically used for:

1. **Campaign Messaging**
   - SMS and email follow-ups in voice campaigns
   - Automated messages based on call outcomes

2. **Workflow Actions**
   - SMS actions in post-call workflows
   - Email actions in post-call workflows

3. **All Organization Communications**
   - Any messaging triggered by your campaigns or projects

### Platform Fallback

If you haven't configured BYOK credentials (or if you disable them), ClientFlow will automatically use the platform's shared credentials. There's no interruption in service.

## Managing Your Credentials

### Testing Connection

You can test your credentials at any time:

1. Go to Settings → Messaging
2. Click **"Test Connection"** for Twilio or Resend
3. ClientFlow will verify that your credentials are still valid

### Updating Credentials

To update your credentials:

1. Go to Settings → Messaging
2. Re-enter the Auth Token (Twilio) or API Key (Resend)
3. Click **"Save & Test Credentials"**

**Note**: For security, you'll need to re-enter the secret values (auth tokens/API keys) when making changes.

### Reverting to Platform Credentials

To stop using your own credentials and revert to platform credentials:

1. Go to Settings → Messaging
2. Click **"Revert to Platform Credentials"**
3. Confirm the action

Your credentials will be deleted from ClientFlow, and the platform credentials will be used again.

## Troubleshooting

### Twilio Issues

**Error: "Invalid Twilio credentials"**
- Double-check your Account SID and Auth Token
- Make sure you copied the entire values without extra spaces
- Verify you're using credentials from the correct Twilio project

**Error: "Phone number not found"**
- Make sure the phone number is purchased in your Twilio account
- Verify the number format includes the country code (+1 for US)
- Ensure the number has SMS capability enabled

**SMS not being delivered**
- Check your Twilio balance
- Verify the recipient's phone number is valid
- Review Twilio's error logs in your console
- Ensure you're compliant with 10DLC requirements (for US numbers)

### Resend Issues

**Error: "Invalid Resend API key"**
- Double-check your API key
- Make sure the key has "Sending access" permission
- Verify the key hasn't been revoked

**Error: "Domain not verified"**
- Go to Resend Domains page and check verification status
- Make sure all DNS records are properly configured
- Wait a few minutes and try again (DNS changes can take time)

**Emails not being delivered**
- Check your Resend dashboard for delivery logs
- Verify your "From Email" matches your verified domain
- Check recipient spam folders
- Review your domain's sender reputation

### General Issues

**Credentials show as "Not Verified"**
- Re-test your credentials using the "Test Connection" button
- Make sure you've saved the credentials with "Save & Test Credentials"
- Check the "Last tested" timestamp

**Cannot save credentials**
- Check that all required fields are filled
- Verify your credentials with the provider directly
- Try copying and pasting again (watch for extra spaces)

## Security & Best Practices

### Credential Security

✅ **Do:**
- Use API keys with minimal required permissions
- Rotate API keys regularly (every 90 days)
- Monitor usage in provider dashboards
- Set up billing alerts with providers

❌ **Don't:**
- Share your API keys with anyone
- Commit API keys to version control
- Use production keys for testing

### Cost Management

- Set up spending limits in Twilio
- Monitor usage in Resend dashboard
- Review costs monthly
- Set up billing alerts

### Compliance

- Register your 10DLC campaign with carriers (Twilio, required for US SMS)
- Verify your email domain (Resend)
- Follow CAN-SPAM Act requirements for emails
- Comply with TCPA regulations for SMS

## Support

### Getting Help

If you encounter issues with BYOK:

1. **Check Provider Status**
   - [Twilio Status](https://status.twilio.com/)
   - [Resend Status](https://status.resend.com/)

2. **Review Provider Documentation**
   - [Twilio Docs](https://www.twilio.com/docs)
   - [Resend Docs](https://resend.com/docs)

3. **Contact ClientFlow Support**
   - Email: support@clientflow.com
   - Include: Organization ID, error messages, and what you've tried

### Additional Resources

- [Twilio Console](https://console.twilio.com/)
- [Twilio Error Codes](https://www.twilio.com/docs/api/errors)
- [Resend Dashboard](https://resend.com/overview)
- [Resend API Reference](https://resend.com/docs/api-reference)

---

**Last Updated**: October 2025  
**Version**: 1.0

