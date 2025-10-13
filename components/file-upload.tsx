"use client";

/**
 * File Upload Component - Uploadthing Version
 * Reusable drag-and-drop file upload with progress tracking
 */

import { useState, useCallback } from 'react';
import { Upload, X, File, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { useUploadThing } from '@/lib/uploadthing';
import { useDropzone } from 'react-dropzone';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  status: 'uploading' | 'complete' | 'error';
  progress: number;
  error?: string;
}

interface FileUploadProps {
  organizationId: string;
  category?: string;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  onUploadComplete?: (files: UploadedFile[]) => void;
  onError?: (error: string) => void;
  // For public onboarding uploads (no authentication)
  publicToken?: string;
  usePublicUpload?: boolean;
}

export function FileUpload({
  organizationId,
  category = 'general',
  multiple = true,
  accept,
  maxSize = 25,
  onUploadComplete,
  onError,
  publicToken,
  usePublicUpload = false,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Choose the right upload endpoint based on authentication
  const endpoint = usePublicUpload ? "onboardingUpload" : "authenticatedUpload";
  
  // Setup Uploadthing hook
  const { startUpload, isUploading: uploadthingUploading } = useUploadThing(endpoint, {
    onClientUploadComplete: (uploadedFiles) => {
      console.log('✅ Upload complete:', uploadedFiles);
      
      // Convert to our format
      const completedFiles: UploadedFile[] = uploadedFiles.map((file) => ({
        id: file.key || file.name,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        url: file.url,
        status: 'complete' as const,
        progress: 100,
      }));

      // Update file states
      setFiles((prev) =>
        prev.map((f) => {
          const uploaded = completedFiles.find((uf) => uf.name === f.name);
          return uploaded || f;
        })
      );

      setIsUploading(false);
      toast.success(`${completedFiles.length} file(s) uploaded successfully`);
      
      if (onUploadComplete) {
        onUploadComplete(completedFiles);
      }
    },
    onUploadError: (error) => {
      console.error('❌ Upload error:', error);
      setIsUploading(false);
      
      const errorMessage = error.message || 'Upload failed';
      toast.error(errorMessage);
      
      // Mark all uploading files as errored
      setFiles((prev) =>
        prev.map((f) =>
          f.status === 'uploading'
            ? { ...f, status: 'error' as const, error: errorMessage }
            : f
        )
      );
      
      if (onError) {
        onError(errorMessage);
      }
    },
    onUploadBegin: (fileName) => {
      console.log('📤 Upload beginning:', fileName);
    },
  });

  const handleFiles = useCallback(
    async (fileList: File[]) => {
      if (!fileList || fileList.length === 0) return;

      // Validate file count
      if (!multiple && fileList.length > 1) {
        toast.error('Only one file is allowed');
        return;
      }

      // Validate file sizes
      const maxSizeBytes = maxSize * 1024 * 1024;
      const oversizedFiles = fileList.filter((file) => file.size > maxSizeBytes);
      if (oversizedFiles.length > 0) {
        toast.error(`Files must be smaller than ${maxSize}MB`);
        return;
      }

      // Create initial file objects
      const newFiles: UploadedFile[] = fileList.map((file) => ({
        id: `${Date.now()}-${file.name}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: '',
        status: 'uploading' as const,
        progress: 0,
      }));

      setFiles((prev) => [...prev, ...newFiles]);
      setIsUploading(true);

      try {
        // For public uploads, pass token via input
        // For authenticated uploads, no input needed
        if (usePublicUpload && publicToken) {
          // @ts-ignore - uploadthing types don't properly reflect input parameter
          await startUpload(fileList, {
            token: publicToken,
            organizationId,
            category,
          });
        } else {
          await startUpload(fileList, undefined as any);
        }
      } catch (error) {
        console.error('Upload exception:', error);
        setIsUploading(false);
        
        const errorMsg = error instanceof Error ? error.message : 'Upload failed';
        toast.error(errorMsg);
        
        if (onError) {
          onError(errorMsg);
        }
      }
    },
    [maxSize, multiple, onError, startUpload, usePublicUpload, publicToken, organizationId, category]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFiles,
    multiple,
    accept: undefined, // Temporarily disable accept to test if it's causing the issue
    maxSize: maxSize * 1024 * 1024,
    disabled: isUploading || uploadthingUploading,
    noClick: false, // Explicitly enable click
    noKeyboard: false, // Explicitly enable keyboard
  });

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
          ${isUploading || uploadthingUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400'}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-sm font-medium text-gray-700 mb-1">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-xs text-gray-500 mb-4">or click to browse</p>
        {accept && (
          <p className="text-xs text-gray-500">
            Accepted: {accept}
          </p>
        )}
        {maxSize && (
          <p className="text-xs text-gray-500">
            Max size: {maxSize}MB per file
          </p>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <Card key={file.id} className="p-4">
              <div className="flex items-center gap-3">
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {file.status === 'uploading' && (
                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  )}
                  {file.status === 'complete' && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                  {file.error && (
                    <p className="text-xs text-red-600 mt-1">{file.error}</p>
                  )}
                </div>

                {/* Remove Button */}
                {file.status !== 'uploading' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Progress Bar */}
              {file.status === 'uploading' && (
                <div className="mt-2">
                  <Progress value={file.progress} className="h-1" />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Upload Summary */}
      {files.length > 0 && (
        <div className="text-xs text-gray-500 text-center">
          {files.filter((f) => f.status === 'complete').length} of {files.length} files uploaded
        </div>
      )}
    </div>
  );
}