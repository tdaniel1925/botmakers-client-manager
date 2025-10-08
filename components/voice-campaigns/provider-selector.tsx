"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Zap, Phone, Globe, Code } from "lucide-react";
import { getAvailableProviders, getConfiguredProviders } from "@/lib/voice-providers/provider-factory";

interface ProviderSelectorProps {
  selectedProvider: string | null;
  onSelect: (provider: "vapi" | "autocalls" | "synthflow" | "retell") => void;
}

export function ProviderSelector({ selectedProvider, onSelect }: ProviderSelectorProps) {
  const [providers, setProviders] = useState<ReturnType<typeof getAvailableProviders>>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // In production, this would check which providers are actually configured
    const availableProviders = getAvailableProviders();
    setProviders(availableProviders);
    setLoading(false);
  }, []);
  
  if (loading) {
    return <div className="text-center py-8">Loading providers...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Choose Your Voice AI Provider</h2>
        <p className="text-gray-600">
          Select the platform you want to use for your voice campaign
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map((provider) => {
          const isSelected = selectedProvider === provider.value;
          const isAvailable = provider.status === "available";
          
          return (
            <Card
              key={provider.value}
              className={`relative cursor-pointer transition-all hover:shadow-lg ${
                isSelected 
                  ? "ring-2 ring-blue-500 border-blue-500" 
                  : "hover:border-gray-400"
              } ${!isAvailable ? "opacity-60" : ""}`}
              onClick={() => isAvailable && onSelect(provider.value)}
            >
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="bg-blue-500 rounded-full p-1">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-xl">{provider.label}</CardTitle>
                  {provider.status === "beta" && (
                    <Badge variant="outline" className="text-xs">Beta</Badge>
                  )}
                  {provider.status === "coming_soon" && (
                    <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                  )}
                </div>
                <CardDescription className="text-sm">
                  {provider.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Features */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Key Features
                  </p>
                  <ul className="space-y-1">
                    {provider.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm">
                        <span className="text-green-500 mr-2 mt-0.5">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Pricing */}
                <div className="pt-2 border-t">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Pricing</p>
                  <p className="text-sm text-gray-700">{provider.pricing}</p>
                </div>
                
                {/* Select Button */}
                <Button
                  className="w-full"
                  variant={isSelected ? "default" : "outline"}
                  disabled={!isAvailable}
                  onClick={(e) => {
                    e.stopPropagation();
                    isAvailable && onSelect(provider.value);
                  }}
                >
                  {isSelected ? "Selected" : isAvailable ? "Select Provider" : "Coming Soon"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Provider Icons Legend */}
      <div className="bg-gray-50 rounded-lg p-4 mt-8">
        <p className="text-sm font-medium mb-3">What makes each provider unique?</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="flex items-start gap-2">
            <Zap className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Vapi:</strong> Best for advanced features and GPT-4 integration
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Phone className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Autocalls:</strong> Best for outbound campaigns and lead management
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Globe className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Synthflow:</strong> Best for multi-language and no-code workflows
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Code className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Retell:</strong> Best for developers and custom integrations
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
