/**
 * Attachment Viewer Component
 * Preview and download email attachments
 */

'use client';

import { useState } from 'react';
import { Download, FileText, Image, File, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SelectEmailAttachment } from '@/db/schema/email-schema';

interface AttachmentViewerProps {
  attachments: SelectEmailAttachment[];
  onClose?: () => void;
}

export function AttachmentViewer({ attachments, onClose }: AttachmentViewerProps) {
  const [selectedAttachment, setSelectedAttachment] = useState<SelectEmailAttachment | null>(
    attachments[0] || null
  );

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <Image className="h-5 w-5" />;
    }
    if (mimeType.includes('pdf') || mimeType.includes('document')) {
      return <FileText className="h-5 w-5" />;
    }
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const canPreview = (mimeType: string) => {
    return (
      mimeType.startsWith('image/') ||
      mimeType === 'application/pdf' ||
      mimeType.startsWith('text/')
    );
  };

  const handleDownload = (attachment: SelectEmailAttachment) => {
    if (attachment.url) {
      window.open(attachment.url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex">
      {/* Sidebar - Attachment List */}
      <div className="w-80 border-r bg-muted/30 flex flex-col">
        <div className="border-b px-4 py-3 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Attachments</h3>
            <p className="text-xs text-muted-foreground">
              {attachments.length} file{attachments.length !== 1 ? 's' : ''}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {attachments.map((attachment) => (
            <button
              key={attachment.id}
              onClick={() => setSelectedAttachment(attachment)}
              className={`w-full p-3 rounded-lg mb-2 text-left transition-colors ${
                selectedAttachment?.id === attachment.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-muted'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getFileIcon(attachment.mimeType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{attachment.filename}</p>
                  <p className="text-xs opacity-70">
                    {formatFileSize(attachment.size)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="border-t p-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              attachments.forEach((attachment) => handleDownload(attachment));
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Download All
          </Button>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col">
        {selectedAttachment ? (
          <>
            {/* Header */}
            <div className="border-b px-6 py-4 flex items-center justify-between bg-background">
              <div className="flex items-center gap-3">
                {getFileIcon(selectedAttachment.mimeType)}
                <div>
                  <h2 className="font-semibold">{selectedAttachment.filename}</h2>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedAttachment.size)} • {selectedAttachment.mimeType}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(selectedAttachment)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleDownload(selectedAttachment)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>

            {/* Preview */}
            <div className="flex-1 overflow-auto p-6 bg-muted/20">
              {canPreview(selectedAttachment.mimeType) ? (
                <>
                  {/* Image Preview */}
                  {selectedAttachment.mimeType.startsWith('image/') && (
                    <div className="flex items-center justify-center h-full">
                      {selectedAttachment.url ? (
                        <img
                          src={selectedAttachment.url}
                          alt={selectedAttachment.filename}
                          className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                        />
                      ) : (
                        <div className="text-center space-y-2">
                          <Image className="h-12 w-12 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Image preview not available
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PDF Preview */}
                  {selectedAttachment.mimeType === 'application/pdf' && (
                    <div className="h-full">
                      {selectedAttachment.url ? (
                        <iframe
                          src={selectedAttachment.url}
                          className="w-full h-full rounded-lg shadow-lg"
                          title={selectedAttachment.filename}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center space-y-2">
                            <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              PDF preview not available
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Text Preview */}
                  {selectedAttachment.mimeType.startsWith('text/') && (
                    <div className="bg-background rounded-lg shadow-lg p-6">
                      <pre className="text-sm whitespace-pre-wrap font-mono">
                        {selectedAttachment.url
                          ? 'Text preview would load here...'
                          : 'Preview not available'}
                      </pre>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <File className="h-16 w-16 mx-auto text-muted-foreground" />
                    <div>
                      <p className="font-medium">Preview not available</p>
                      <p className="text-sm text-muted-foreground">
                        This file type cannot be previewed
                      </p>
                    </div>
                    <Button onClick={() => handleDownload(selectedAttachment)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download to view
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <File className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">No attachment selected</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}





