"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Phone, Loader2, CheckCircle2, AlertCircle, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { testCampaignAction } from "@/actions/voice-campaign-actions";

interface CampaignTestWidgetProps {
  campaignId: string;
  phoneNumber: string;
  provider: string;
}

export function CampaignTestWidget({ campaignId, phoneNumber, provider }: CampaignTestWidgetProps) {
  const [testPhoneNumber, setTestPhoneNumber] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    callId?: string;
    message: string;
  } | null>(null);
  
  const handleTestCall = async () => {
    if (!testPhoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }
    
    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(testPhoneNumber.replace(/[\s\-\(\)]/g, ""))) {
      toast.error("Please enter a valid phone number (e.g., +1-555-123-4567)");
      return;
    }
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await testCampaignAction(campaignId, testPhoneNumber);
      
      if (result.error) {
        setTestResult({
          success: false,
          message: result.error
        });
        toast.error(result.error);
      } else {
        setTestResult({
          success: true,
          callId: result.callId,
          message: "Test call initiated successfully! You should receive a call shortly."
        });
        toast.success("Test call initiated!");
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || "Failed to initiate test call"
      });
      toast.error("Failed to initiate test call");
    } finally {
      setIsTesting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-blue-500" />
          <CardTitle>Test Your Voice Agent</CardTitle>
        </div>
        <CardDescription>
          Test your agent before going live to ensure everything works perfectly
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Inbound Testing */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Option 1: Call the Agent (Recommended)</h4>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-blue-900">Call this number:</p>
                <p className="text-2xl font-mono font-bold text-blue-600 my-2">
                  {phoneNumber}
                </p>
                <p className="text-sm text-blue-800">
                  Use your phone to call this number and test the voice agent in action.
                  The agent will answer and you can have a real conversation.
                </p>
              </div>
            </div>
          </div>
          
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-900 text-sm">
              <strong>Note:</strong> Make sure you're calling from a real phone number. 
              The agent may not answer calls from blocked or invalid numbers.
            </AlertDescription>
          </Alert>
        </div>
        
        {/* Outbound Testing (if supported) */}
        {provider === "vapi" && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Option 2: Have the Agent Call You</h4>
              <p className="text-sm text-gray-600">
                Enter your phone number and we'll have the agent call you for testing.
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="test-phone">Your Phone Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="test-phone"
                    type="tel"
                    placeholder="+1-555-123-4567"
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                    disabled={isTesting}
                    className="flex-1"
                  />
                  <Button onClick={handleTestCall} disabled={isTesting || !testPhoneNumber}>
                    {isTesting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Calling...
                      </>
                    ) : (
                      <>
                        <Phone className="h-4 w-4 mr-2" />
                        Call Me
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {testResult && (
                <Alert variant={testResult.success ? "default" : "destructive"}>
                  {testResult.success ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {testResult.message}
                    {testResult.callId && (
                      <div className="text-xs mt-1 opacity-75">
                        Call ID: {testResult.callId}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </>
        )}
        
        {/* Testing Tips */}
        <div className="bg-gray-50 rounded-lg p-4 border">
          <h4 className="font-semibold text-sm mb-3">Testing Tips</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Listen for the first message and verify it sounds correct</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Ask questions to test the agent's knowledge and responses</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Try providing the data the agent is configured to collect</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Test edge cases like saying "I don't know" or being unclear</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Check if the agent handles interruptions gracefully</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
