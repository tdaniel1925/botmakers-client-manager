"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function SeedPlansPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/admin/seed-plans", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "Failed to seed plans");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Seed Subscription Plans</CardTitle>
          <CardDescription>
            Initialize or update the default subscription plans in the database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Plans to be seeded:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Free - $0/month (100 minutes, 1 campaign)</li>
              <li>• Starter - $99/month (1,000 minutes, 5 campaigns)</li>
              <li>• Professional - $299/month (3,000 minutes, 20 campaigns)</li>
              <li>• Enterprise - $999/month (10,000 minutes, unlimited campaigns)</li>
            </ul>
          </div>

          <Button
            onClick={handleSeed}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Seeding Plans...
              </>
            ) : (
              "Seed Plans"
            )}
          </Button>

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Success!</h3>
              </div>
              <p className="text-sm text-green-800 mb-2">{result.message}</p>
              {result.results && (
                <ul className="text-sm text-green-700 space-y-1">
                  {result.results.map((r: any, i: number) => (
                    <li key={i}>
                      • {r.action === "created" ? "Created" : "Updated"}: {r.plan}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-red-900">Error</h3>
              </div>
              <p className="text-sm text-red-800 mt-1">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

