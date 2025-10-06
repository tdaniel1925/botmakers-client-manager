/**
 * Welcome Step Component
 * Introductory step with project overview
 */

"use client";

import { Clock, CheckCircle, Rocket } from "lucide-react";
import Image from "next/image";

interface WelcomeStepProps {
  step: any;
}

export function WelcomeStep({ step }: WelcomeStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        {/* Centered Botmakers Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-removebg-preview%20(6)-g1KNX9rs5vhkLkPUQzTLfKANbCNcSI.png"
            alt="Botmakers Logo"
            width={300}
            height={90}
            priority
            className="h-20 w-auto"
          />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Let's Get Started!
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {step.description}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <h4 className="font-medium text-gray-900 mb-1">Quick & Easy</h4>
          <p className="text-sm text-gray-600">
            Takes just {step.estimatedMinutes || "a few"} minutes
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg text-center">
          <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <h4 className="font-medium text-gray-900 mb-1">Auto-Save</h4>
          <p className="text-sm text-gray-600">
            Your progress is saved automatically
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <Rocket className="h-6 w-6 text-purple-600 mx-auto mb-2" />
          <h4 className="font-medium text-gray-900 mb-1">Resume Anytime</h4>
          <p className="text-sm text-gray-600">
            Come back and finish later if needed
          </p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mt-6">
        <h4 className="font-medium text-gray-900 mb-2">What to expect:</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>Answer questions about your project goals and requirements</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>Upload relevant files and assets</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>Review and submit your information</span>
          </li>
        </ul>
      </div>
    </div>
  );
}