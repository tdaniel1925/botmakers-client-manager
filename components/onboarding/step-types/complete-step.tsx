/**
 * Complete Step Component
 * Final confirmation and thank you message
 */

"use client";

import { CheckCircle, Mail, Calendar } from "lucide-react";

interface CompleteStepProps {
  step: any;
}

export function CompleteStep({ step }: CompleteStepProps) {
  return (
    <div className="space-y-6 text-center py-8">
      <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          You're All Set!
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {step.description || "Thank you for completing the onboarding! We have all the information we need to get started on your project."}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto mt-8">
        <div className="bg-blue-50 p-6 rounded-lg">
          <Mail className="h-6 w-6 text-blue-600 mx-auto mb-3" />
          <h4 className="font-medium text-gray-900 mb-2">Check Your Email</h4>
          <p className="text-sm text-gray-600">
            We've sent a confirmation email with next steps
          </p>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg">
          <Calendar className="h-6 w-6 text-purple-600 mx-auto mb-3" />
          <h4 className="font-medium text-gray-900 mb-2">What's Next</h4>
          <p className="text-sm text-gray-600">
            We'll review your information and reach out within 24-48 hours
          </p>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-3" />
          <h4 className="font-medium text-gray-900 mb-2">Stay in Touch</h4>
          <p className="text-sm text-gray-600">
            Feel free to contact us if you have any questions
          </p>
        </div>
      </div>

      <div className="pt-6">
        <p className="text-sm text-gray-500">
          You can safely close this window. We'll be in touch soon!
        </p>
      </div>
    </div>
  );
}
