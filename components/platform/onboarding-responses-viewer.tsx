/**
 * Onboarding Responses Viewer Component
 * Displays all client responses from the onboarding
 */

"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, File as FileIcon, ExternalLink, Image as ImageIcon, FileArchive, FileSpreadsheet } from "lucide-react";

interface OnboardingResponsesViewerProps {
  session: any;
  responses: any[];
}

export function OnboardingResponsesViewer({
  session,
  responses,
}: OnboardingResponsesViewerProps) {
  const steps = session.steps as any[];
  const sessionResponses = session.responses as any;

  const exportResponses = () => {
    // Create CSV content
    const csv = Object.entries(sessionResponses || {})
      .map(([stepIndex, data]: [string, any]) => {
        const step = steps[parseInt(stepIndex)];
        return `"${step.title}","${JSON.stringify(data).replace(/"/g, '""')}"`;
      })
      .join("\n");

    const csvContent = `"Step","Response"\n${csv}`;

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `onboarding-responses-${session.id}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    // Image files
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) {
      return <ImageIcon className="h-4 w-4 text-blue-600" />;
    }
    
    // Archive files
    if (['zip', 'rar', 'tar', 'gz'].includes(ext || '')) {
      return <FileArchive className="h-4 w-4 text-orange-600" />;
    }
    
    // Spreadsheet files
    if (['xls', 'xlsx', 'csv'].includes(ext || '')) {
      return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
    }
    
    // Document files
    if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) {
      return <FileText className="h-4 w-4 text-red-600" />;
    }
    
    // Default file icon
    return <FileIcon className="h-4 w-4 text-gray-600" />;
  };

  const handleDownloadAll = async (files: any[], categoryName: string) => {
    // Download all files by opening them in new tabs
    files.forEach((file, idx) => {
      if (file.url) {
        setTimeout(() => {
          window.open(file.url, '_blank');
        }, idx * 100); // Stagger downloads slightly
      }
    });
  };

  const renderFilesList = (files: any[], categoryName?: string): React.ReactNode => {
    if (!files || files.length === 0) {
      return <span className="text-gray-400 italic">No files uploaded</span>;
    }

    return (
      <div className="space-y-3">
        <div className="space-y-2">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded border">
              {getFileIcon(file.name || 'file.txt')}
              <div className="flex-1">
                <p className="text-sm font-medium">{file.name || 'Unnamed file'}</p>
                {file.size && (
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                )}
              </div>
              {file.url && (
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Download className="h-3 w-3" />
                  Download
                </a>
              )}
            </div>
          ))}
        </div>
        
        {/* Download All button - show when there are 2+ files */}
        {files.length >= 2 && (
          <Button
            onClick={() => handleDownloadAll(files, categoryName || 'files')}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Download All ({files.length} files)
          </Button>
        )}
      </div>
    );
  };

  const renderResponseValue = (value: any, categoryName?: string): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">No response</span>;
    }

    // Check if this looks like file upload data - be more lenient
    if (Array.isArray(value) && value.length > 0) {
      const firstItem = value[0];
      // Check if it has file-like properties (name or url or id)
      if (firstItem && typeof firstItem === 'object' && (firstItem.url || firstItem.name || firstItem.id)) {
        return renderFilesList(value, categoryName);
      }
    }

    if (Array.isArray(value)) {
      return (
        <div className="space-y-1">
          {value.map((item, idx) => (
            <Badge key={idx} variant="secondary" className="mr-2">
              {typeof item === "object" ? JSON.stringify(item) : String(item)}
            </Badge>
          ))}
        </div>
      );
    }

    if (typeof value === "object") {
      return (
        <pre className="text-sm bg-gray-50 p-2 rounded border overflow-auto max-h-32">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }

    return <p className="text-gray-700">{String(value)}</p>;
  };

  return (
    <div className="space-y-4">
      {/* Export Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Client Responses</h3>
        <Button onClick={exportResponses} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export to CSV
        </Button>
      </div>

      {/* Responses List */}
      {Object.keys(sessionResponses || {}).length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>No responses yet. The client hasn't started the onboarding.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {steps.map((step, index) => {
            const response = sessionResponses[index];

            if (!response) {
              return (
                <Card key={index} className="p-4 opacity-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      Step {index + 1}: {step.title}
                    </h4>
                    <Badge variant="secondary">Not completed</Badge>
                  </div>
                  <p className="text-sm text-gray-500">Client hasn't reached this step yet</p>
                </Card>
              );
            }

            return (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">
                    Step {index + 1}: {step.title}
                  </h4>
                  <Badge>Completed</Badge>
                </div>

                <div className="space-y-3">
                  {/* Form responses */}
                  {step.type === "form" && step.fields && (
                    <div className="space-y-3">
                      {step.fields.map((field: any) => (
                        <div key={field.name} className="border-l-2 border-blue-200 pl-4">
                          <Label className="text-sm font-medium text-gray-700">
                            {field.label}
                          </Label>
                          <div className="mt-1">
                            {renderResponseValue(response[field.name])}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload responses */}
                  {step.type === "upload" && (
                    <div className="space-y-4">
                      {Object.keys(response || {}).length === 0 ? (
                        <p className="text-gray-500 italic">No files uploaded yet</p>
                      ) : (
                        Object.entries(response).map(([category, files]) => (
                          <div key={category} className="border-l-4 border-green-400 pl-4 bg-green-50 p-4 rounded-r-lg">
                            <Label className="text-base font-semibold text-gray-900 capitalize mb-3 block">
                              {category.replace(/_/g, " ")}
                            </Label>
                            <div className="mt-2">
                              {renderResponseValue(files, category)}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Choice responses */}
                  {step.type === "choice" && (
                    <div className="border-l-2 border-purple-200 pl-4">
                      <Label className="text-sm font-medium text-gray-700">
                        Selected Choices
                      </Label>
                      <div className="mt-1">
                        {renderResponseValue(response.selectedChoices || response)}
                      </div>
                    </div>
                  )}

                  {/* Other types */}
                  {!["form", "upload", "choice"].includes(step.type) && (
                    <div className="border-l-2 border-gray-200 pl-4">
                      {renderResponseValue(response)}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}