// Payment Provider Factory
// Get the appropriate payment provider instance

import { BasePaymentProvider } from "./base-provider";
import { StripePaymentProvider } from "./stripe-provider";
import { SquarePaymentProvider } from "./square-provider";
import { PayPalPaymentProvider } from "./paypal-provider";

type PaymentProviderType = "stripe" | "square" | "paypal";

const providers = new Map<PaymentProviderType, BasePaymentProvider>();

/**
 * Get payment provider instance (singleton pattern)
 */
export function getPaymentProvider(providerName: PaymentProviderType): BasePaymentProvider {
  // Check if provider already instantiated
  if (providers.has(providerName)) {
    return providers.get(providerName)!;
  }
  
  // Create new instance
  let provider: BasePaymentProvider;
  
  switch (providerName) {
    case "stripe":
      provider = new StripePaymentProvider();
      break;
    case "square":
      provider = new SquarePaymentProvider();
      break;
    case "paypal":
      provider = new PayPalPaymentProvider();
      break;
    default:
      throw new Error(`Unknown payment provider: ${providerName}`);
  }
  
  // Cache for future use
  providers.set(providerName, provider);
  
  return provider;
}

/**
 * Get all available payment providers
 */
export function getAvailableProviders(): Array<{
  name: PaymentProviderType;
  displayName: string;
  enabled: boolean;
}> {
  return [
    {
      name: "stripe",
      displayName: "Stripe",
      enabled: !!process.env.STRIPE_SECRET_KEY,
    },
    {
      name: "square",
      displayName: "Square",
      enabled: !!process.env.SQUARE_ACCESS_TOKEN,
    },
    {
      name: "paypal",
      displayName: "PayPal",
      enabled: !!process.env.PAYPAL_CLIENT_SECRET,
    },
  ];
}
