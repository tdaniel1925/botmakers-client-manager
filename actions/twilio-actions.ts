"use server";

import { auth } from "@clerk/nextjs/server";
import { 
  getTwilioPhoneNumbers, 
  isTwilioConfigured,
  searchAvailableTwilioNumbers,
  purchaseTwilioNumber
} from "@/lib/twilio-client";

/**
 * Server action to fetch Twilio phone numbers
 */
export async function getTwilioPhoneNumbersAction() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { 
        isSuccess: false, 
        message: "Unauthorized",
        numbers: []
      };
    }

    if (!isTwilioConfigured()) {
      return {
        isSuccess: false,
        message: "Twilio is not configured. Please add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to your environment variables.",
        numbers: []
      };
    }

    const numbers = await getTwilioPhoneNumbers();
    
    return {
      isSuccess: true,
      message: `Found ${numbers.length} Twilio phone numbers`,
      numbers
    };
  } catch (error: any) {
    console.error("[TwilioAction] Error:", error);
    return {
      isSuccess: false,
      message: error.message || "Failed to fetch Twilio phone numbers",
      numbers: []
    };
  }
}

/**
 * Server action to search for available Twilio numbers
 */
export async function searchTwilioNumbersAction(areaCode?: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { 
        isSuccess: false, 
        message: "Unauthorized",
        numbers: []
      };
    }

    if (!isTwilioConfigured()) {
      return {
        isSuccess: false,
        message: "Twilio is not configured",
        numbers: []
      };
    }

    const numbers = await searchAvailableTwilioNumbers(areaCode);
    
    return {
      isSuccess: true,
      message: `Found ${numbers.length} available numbers`,
      numbers
    };
  } catch (error: any) {
    console.error("[TwilioAction] Search error:", error);
    return {
      isSuccess: false,
      message: error.message || "Failed to search for numbers",
      numbers: []
    };
  }
}

/**
 * Server action to purchase a Twilio number
 */
export async function purchaseTwilioNumberAction(
  phoneNumber: string,
  friendlyName?: string
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { 
        isSuccess: false, 
        message: "Unauthorized"
      };
    }

    if (!isTwilioConfigured()) {
      return {
        isSuccess: false,
        message: "Twilio is not configured"
      };
    }

    const purchasedNumber = await purchaseTwilioNumber(phoneNumber, friendlyName);
    
    return {
      isSuccess: true,
      message: `Successfully purchased ${phoneNumber}`,
      number: purchasedNumber
    };
  } catch (error: any) {
    console.error("[TwilioAction] Purchase error:", error);
    return {
      isSuccess: false,
      message: error.message || "Failed to purchase number"
    };
  }
}
