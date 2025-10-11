"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
// TODO: Recreate profiles system and restore this import
// import { checkPaymentFailedAction } from "@/actions/profiles-actions";

/**
 * Payment status alert component that uses server actions to check payment status
 * Only shows when payment has failed and user is not on the pricing page
 * 
 * TEMPORARILY DISABLED: Profiles system needs to be recreated
 */
export function PaymentStatusAlert() {
  // TEMPORARY: Return null until profiles system is restored
  return null;
  
  /* ORIGINAL CODE - restore when profiles system is ready
  
  // The following code is commented out until profiles system is recreated:
  const [hasPaymentFailed, setHasPaymentFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const { userId } = useAuth();
  
  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Don't show on pricing page to avoid redundancy
  const isVisible = pathname !== "/pricing";
  
  // Check payment status on initial load and set up a less frequent check
  useEffect(() => {
    if (!userId || !isVisible) return;
    
    const checkPaymentStatus = async () => {
      try {
        setIsLoading(true);
        // Use server action (more efficient than API route)
        const { paymentFailed } = await checkPaymentFailedAction();
        setHasPaymentFailed(paymentFailed);
      } catch (error) {
        console.error("Error checking payment status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Initial check
    checkPaymentStatus();
    
    // Set up a less frequent check (every 5 minutes instead of every minute)
    const intervalId = setInterval(checkPaymentStatus, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [userId, isVisible]);
  
  // Prevent hydration mismatch - don't render until mounted on client
  if (!isMounted) {
    return null;
  }
  
  // Show nothing while loading or if no payment issues
  if (isLoading || !hasPaymentFailed || !isVisible) {
    return null;
  }
  
  return (
    <Alert variant="destructive" className="mb-4 container mx-auto mt-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Payment Failed</AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          Your subscription payment has failed. Your account has been temporarily downgraded to the free plan.
        </div>
        <div className="flex-shrink-0">
          <Button variant="outline" asChild>
            <Link href="/pricing">
              Update Payment Method
            </Link>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
} 