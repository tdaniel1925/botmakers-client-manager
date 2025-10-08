/**
 * Twilio Client - Fetch and manage Twilio phone numbers
 */

interface TwilioPhoneNumber {
  sid: string;
  phoneNumber: string;
  friendlyName: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
  };
}

/**
 * Fetch available phone numbers from Twilio account
 */
export async function getTwilioPhoneNumbers(): Promise<TwilioPhoneNumber[]> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.warn("[Twilio] Account SID or Auth Token not configured");
    return [];
  }

  try {
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Twilio API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.incoming_phone_numbers.map((num: any) => ({
      sid: num.sid,
      phoneNumber: num.phone_number,
      friendlyName: num.friendly_name || num.phone_number,
      capabilities: {
        voice: num.capabilities.voice,
        sms: num.capabilities.sms,
        mms: num.capabilities.mms,
      },
    }));
  } catch (error) {
    console.error("[Twilio] Failed to fetch phone numbers:", error);
    return [];
  }
}

/**
 * Search for available Twilio phone numbers to purchase
 */
export async function searchAvailableTwilioNumbers(
  areaCode?: string,
  country: string = "US"
): Promise<Array<{ phoneNumber: string; locality: string; region: string; }>> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials not configured");
  }

  try {
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    
    // Build search URL
    let searchUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/AvailablePhoneNumbers/${country}/Local.json?VoiceEnabled=true`;
    if (areaCode && areaCode.trim().length === 3) {
      searchUrl += `&AreaCode=${areaCode.trim()}`;
    }
    
    console.log("[Twilio] Searching for available numbers:", searchUrl);
    
    const response = await fetch(searchUrl, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Twilio API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.available_phone_numbers.slice(0, 20).map((num: any) => ({
      phoneNumber: num.phone_number,
      locality: num.locality,
      region: num.region,
    }));
  } catch (error) {
    console.error("[Twilio] Failed to search available numbers:", error);
    throw error;
  }
}

/**
 * Purchase a Twilio phone number
 */
export async function purchaseTwilioNumber(
  phoneNumber: string,
  friendlyName?: string
): Promise<TwilioPhoneNumber> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials not configured");
  }

  try {
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    
    const formData = new URLSearchParams();
    formData.append('PhoneNumber', phoneNumber);
    if (friendlyName) {
      formData.append('FriendlyName', friendlyName);
    }
    
    console.log("[Twilio] Purchasing number:", phoneNumber);
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Twilio API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log("[Twilio] Number purchased successfully:", data);
    
    return {
      sid: data.sid,
      phoneNumber: data.phone_number,
      friendlyName: data.friendly_name || data.phone_number,
      capabilities: {
        voice: data.capabilities.voice,
        sms: data.capabilities.sms,
        mms: data.capabilities.mms,
      },
    };
  } catch (error) {
    console.error("[Twilio] Failed to purchase number:", error);
    throw error;
  }
}

/**
 * Get Twilio phone number SID by phone number
 */
export async function getTwilioNumberSid(phoneNumber: string): Promise<string | null> {
  const phoneNumbers = await getTwilioPhoneNumbers();
  const found = phoneNumbers.find(num => num.phoneNumber === phoneNumber);
  return found?.sid || null;
}

/**
 * Get Twilio phone number details including webhook configuration
 */
export async function getTwilioNumberDetails(phoneNumberSid: string): Promise<{
  sid: string;
  phoneNumber: string;
  friendlyName: string;
  voiceUrl: string | null;
  voiceMethod: string | null;
} | null> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials not configured");
  }

  try {
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers/${phoneNumberSid}.json`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Twilio API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      sid: data.sid,
      phoneNumber: data.phone_number,
      friendlyName: data.friendly_name || data.phone_number,
      voiceUrl: data.voice_url || null,
      voiceMethod: data.voice_method || null,
    };
  } catch (error) {
    console.error("[Twilio] Failed to fetch number details:", error);
    return null;
  }
}

/**
 * Update Twilio phone number webhook configuration
 */
export async function updateTwilioNumberWebhook(
  phoneNumberSid: string,
  voiceUrl: string,
  voiceMethod: 'POST' | 'GET' = 'POST'
): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials not configured");
  }

  try {
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    
    const formData = new URLSearchParams();
    formData.append('VoiceUrl', voiceUrl);
    formData.append('VoiceMethod', voiceMethod);
    
    console.log(`[Twilio] Updating number ${phoneNumberSid} webhook to:`, voiceUrl);
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers/${phoneNumberSid}.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Twilio API error: ${response.statusText}`);
    }

    console.log(`[Twilio] Webhook updated successfully for ${phoneNumberSid}`);
  } catch (error) {
    console.error("[Twilio] Failed to update webhook:", error);
    throw error;
  }
}

/**
 * Check if Twilio is configured
 */
export function isTwilioConfigured(): boolean {
  return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
}
