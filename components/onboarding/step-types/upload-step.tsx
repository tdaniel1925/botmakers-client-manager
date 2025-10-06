/**
 * Upload Step Component
 * File upload interface for different categories
 */

"use client";

import { useState, useEffect } from "react";
import { FileUpload } from "@/components/file-upload";
import { Label } from "@/components/ui/label";
import { HelpCircle } from "lucide-react";

interface UploadStepProps {
  step: any;
  data: any;
  onChange: (data: any) => void;
  token: string;
  organizationId: string;
}

export function UploadStep({ step, data, onChange, token, organizationId }: UploadStepProps) {
  const [uploadData, setUploadData] = useState(data || {});

  useEffect(() => {
    console.log('Upload step data changed:', uploadData);
    onChange(uploadData);
  }, [uploadData]); // Remove onChange from dependencies to prevent infinite loop

  const handleUploadComplete = (category: string, files: any[]) => {
    console.log(`Files uploaded for category "${category}":`, files);
    setUploadData((prev: any) => ({
      ...prev,
      [category]: [...(prev[category] || []), ...files],
    }));
  };

  const handleUploadError = (error: string) => {
    console.error("Upload error:", error);
  };

  return (
    <div className="space-y-8">
      {step.uploadCategories?.map((category: any) => (
        <div key={category.name} className="space-y-4">
          <div>
            <Label className="text-base">
              {category.label}
              {category.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <p className="text-sm text-gray-600 mt-1">{category.description}</p>
            {category.maxFiles && (
              <p className="text-xs text-gray-500 mt-1">
                Maximum {category.maxFiles} file(s)
              </p>
            )}
          </div>

          <FileUpload
            organizationId={organizationId}
            category={category.name}
            multiple={category.maxFiles !== 1}
            accept={category.accept}
            maxSize={25}
            onUploadComplete={(files) => handleUploadComplete(category.name, files)}
            onError={handleUploadError}
            publicToken={token}
            usePublicUpload={true}
          />

          {uploadData[category.name] && uploadData[category.name].length > 0 && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ {uploadData[category.name].length} file(s) uploaded successfully
              </p>
            </div>
          )}
        </div>
      ))}

      {step.uploadCategories?.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          <p>No upload categories configured for this step.</p>
        </div>
      )}
    </div>
  );
}
