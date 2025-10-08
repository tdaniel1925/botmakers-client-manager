"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Phone, RefreshCw, AlertCircle, CheckCircle2, ShoppingCart, Search } from "lucide-react";
import { toast } from "sonner";
import { getTwilioPhoneNumbersAction, searchTwilioNumbersAction, purchaseTwilioNumberAction } from "@/actions/twilio-actions";

export interface PhoneNumberSelection {
  source: "vapi" | "twilio";
  twilioNumber?: string;
  areaCode?: string;
}

interface PhoneNumberSelectorProps {
  value: PhoneNumberSelection;
  onChange: (selection: PhoneNumberSelection) => void;
  provider: string;
}

export function PhoneNumberSelector({ value, onChange, provider }: PhoneNumberSelectorProps) {
  const [twilioNumbers, setTwilioNumbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [twilioConfigured, setTwilioConfigured] = useState(false);
  
  // Buy number dialog state
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [searchAreaCode, setSearchAreaCode] = useState("");
  const [availableNumbers, setAvailableNumbers] = useState<any[]>([]);
  const [searchingNumbers, setSearchingNumbers] = useState(false);
  const [purchasingNumber, setPurchasingNumber] = useState<string | null>(null);

  useEffect(() => {
    loadTwilioNumbers();
  }, []);

  const loadTwilioNumbers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getTwilioPhoneNumbersAction();
      
      if (result.isSuccess) {
        setTwilioNumbers(result.numbers);
        setTwilioConfigured(true);
      } else {
        setError(result.message);
        setTwilioConfigured(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load Twilio numbers");
      setTwilioConfigured(false);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearchNumbers = async () => {
    setSearchingNumbers(true);
    setAvailableNumbers([]);
    
    try {
      const result = await searchTwilioNumbersAction(searchAreaCode);
      
      if (result.isSuccess) {
        setAvailableNumbers(result.numbers);
        if (result.numbers.length === 0) {
          toast.info("No numbers found. Try a different area code.");
        } else {
          toast.success(`Found ${result.numbers.length} available numbers`);
        }
      } else {
        toast.error(result.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to search numbers");
    } finally {
      setSearchingNumbers(false);
    }
  };
  
  const handlePurchaseNumber = async (phoneNumber: string) => {
    setPurchasingNumber(phoneNumber);
    
    try {
      const result = await purchaseTwilioNumberAction(phoneNumber, "Campaign Phone Number");
      
      if (result.isSuccess) {
        toast.success(`Successfully purchased ${phoneNumber}!`);
        
        // Reload Twilio numbers to show the new one
        await loadTwilioNumbers();
        
        // Auto-select the newly purchased number
        onChange({ ...value, twilioNumber: phoneNumber });
        
        // Close dialog
        setShowBuyDialog(false);
        setAvailableNumbers([]);
        setSearchAreaCode("");
      } else {
        toast.error(result.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to purchase number");
    } finally {
      setPurchasingNumber(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Phone Number Source</h3>
        <p className="text-sm text-gray-600 mb-4">
          Choose where to get the phone number for this campaign
        </p>
      </div>

      <RadioGroup
        value={value.source}
        onValueChange={(source: "vapi" | "twilio") => onChange({ ...value, source })}
        className="space-y-4"
      >
        {/* Vapi Auto-Buy Number */}
        <div className="flex items-start space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
          <RadioGroupItem value="vapi" id="vapi" className="mt-1" />
          <div className="flex-1">
            <Label htmlFor="vapi" className="cursor-pointer">
              <div className="flex items-center gap-2 mb-1">
                <Phone className="h-4 w-4" />
                <span className="font-semibold">Auto-Purchase Phone Number (Recommended)</span>
              </div>
              <p className="text-sm text-gray-600 font-normal">
                Automatically provision a new phone number. Quick setup, fully managed. Takes 30-60 seconds.
              </p>
            </Label>
            
            {value.source === "vapi" && (
              <div className="mt-3 space-y-2">
                <Label htmlFor="areaCode" className="text-sm">
                  Preferred Area Code (Optional)
                </Label>
                <Input
                  id="areaCode"
                  placeholder="e.g., 415"
                  maxLength={3}
                  value={value.areaCode || ""}
                  onChange={(e) => onChange({ ...value, areaCode: e.target.value.replace(/\D/g, "") })}
                  className="max-w-[120px]"
                />
                <p className="text-xs text-gray-500">
                  Leave blank for any available number
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Twilio BYO Number */}
        <div className="flex items-start space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
          <RadioGroupItem value="twilio" id="twilio" className="mt-1" disabled={!twilioConfigured} />
          <div className="flex-1">
            <Label htmlFor="twilio" className={`cursor-pointer ${!twilioConfigured ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-2 mb-1">
                <Phone className="h-4 w-4" />
                <span className="font-semibold">Use My Twilio Number</span>
                {twilioConfigured && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              </div>
              <p className="text-sm text-gray-600 font-normal">
                Use an existing phone number from your Twilio account. Number is available immediately!
              </p>
            </Label>
            
            {!twilioConfigured && (
              <Alert className="mt-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Twilio is not configured. Add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to your environment variables.
                </AlertDescription>
              </Alert>
            )}
            
            {twilioConfigured && value.source === "twilio" && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="twilioNumber" className="text-sm">
                    Select Twilio Number
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={loadTwilioNumbers}
                      disabled={loading}
                    >
                      <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBuyDialog(true)}
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Buy New
                    </Button>
                  </div>
                </div>
                
                {loading ? (
                  <div className="text-sm text-gray-500">Loading numbers...</div>
                ) : error ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">{error}</AlertDescription>
                  </Alert>
                ) : twilioNumbers.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      No Twilio phone numbers found. Purchase a number in your Twilio dashboard first.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Select
                    value={value.twilioNumber}
                    onValueChange={(num) => onChange({ ...value, twilioNumber: num })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a phone number..." />
                    </SelectTrigger>
                    <SelectContent>
                      {twilioNumbers.map((num) => (
                        <SelectItem key={num.sid} value={num.phoneNumber}>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            <span>{num.phoneNumber}</span>
                            {num.friendlyName !== num.phoneNumber && (
                              <span className="text-xs text-gray-500">({num.friendlyName})</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {twilioNumbers.length > 0 && (
                  <p className="text-xs text-gray-500">
                    Found {twilioNumbers.length} available Twilio number{twilioNumbers.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </RadioGroup>
      
      {/* Buy New Number Dialog */}
      <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Buy New Twilio Number</DialogTitle>
            <DialogDescription>
              Search for and purchase a new phone number from Twilio
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Area code (optional, e.g. 415)"
                  value={searchAreaCode}
                  onChange={(e) => setSearchAreaCode(e.target.value)}
                  maxLength={3}
                />
              </div>
              <Button
                onClick={handleSearchNumbers}
                disabled={searchingNumbers}
              >
                {searchingNumbers ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
            
            {/* Available Numbers List */}
            {availableNumbers.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Available Numbers ({availableNumbers.length})
                </Label>
                <div className="max-h-[400px] overflow-y-auto space-y-2 border rounded-lg p-2">
                  {availableNumbers.map((num) => (
                    <div
                      key={num.phoneNumber}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-mono font-medium">{num.phoneNumber}</div>
                          <div className="text-xs text-gray-500">
                            {num.locality}, {num.region}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handlePurchaseNumber(num.phoneNumber)}
                        disabled={purchasingNumber !== null}
                      >
                        {purchasingNumber === num.phoneNumber ? (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                            Purchasing...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            Buy
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {availableNumbers.length === 0 && !searchingNumbers && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Click "Search" to find available phone numbers. Leave the area code blank to see numbers from any area.
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowBuyDialog(false);
                setAvailableNumbers([]);
                setSearchAreaCode("");
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
