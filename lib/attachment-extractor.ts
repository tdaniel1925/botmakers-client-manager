/**
 * Attachment Content Extractor
 * Extracts text content from various attachment types for AI context
 */

'use server';

interface ExtractedContent {
  filename: string;
  mimeType: string;
  content: string;
  error?: string;
}

/**
 * Extract text content from attachment URL
 */
export async function extractAttachmentContent(
  url: string,
  mimeType: string,
  filename: string
): Promise<ExtractedContent> {
  try {
    // Fetch the file
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch attachment: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract based on MIME type
    let content = '';

    if (mimeType.startsWith('text/')) {
      // Plain text files
      content = buffer.toString('utf-8');
    } else if (mimeType === 'application/json') {
      // JSON files
      const jsonData = JSON.parse(buffer.toString('utf-8'));
      content = `JSON file content:\n${JSON.stringify(jsonData, null, 2)}`;
    } else if (mimeType === 'application/pdf') {
      // PDFs - note: would need pdf-parse library for full extraction
      content = `PDF file: ${filename}. (Full PDF text extraction requires additional setup)`;
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      // Word documents - note: would need mammoth library for full extraction
      content = `Word document: ${filename}. (Full DOCX extraction requires additional setup)`;
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mimeType === 'application/vnd.ms-excel'
    ) {
      // Excel files
      content = `Excel spreadsheet: ${filename}. (Full Excel extraction requires additional setup)`;
    } else if (
      mimeType.startsWith('image/') &&
      !mimeType.includes('svg')
    ) {
      // Images - note: would need OCR library for text extraction
      content = `Image file: ${filename}. MIME type: ${mimeType}. (Text extraction from images requires OCR)`;
    } else {
      content = `Attachment: ${filename} (${mimeType}). Binary file - content extraction not supported.`;
    }

    return {
      filename,
      mimeType,
      content: content.substring(0, 5000), // Limit to 5000 chars per attachment
    };
  } catch (error) {
    console.error(`Error extracting content from ${filename}:`, error);
    return {
      filename,
      mimeType,
      content: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Extract content from multiple attachments
 */
export async function extractMultipleAttachments(
  attachments: Array<{ storageUrl?: string; externalId?: string; filename: string; mimeType: string }>
): Promise<ExtractedContent[]> {
  const extractionPromises = attachments
    .filter(att => att.storageUrl) // Only process attachments with storage URLs
    .map(att => 
      extractAttachmentContent(att.storageUrl!, att.mimeType, att.filename)
    );

  return await Promise.all(extractionPromises);
}

/**
 * Format extracted attachment content for AI context
 */
export function formatAttachmentsForAI(extractedContents: ExtractedContent[]): string {
  if (extractedContents.length === 0) {
    return '';
  }

  const formattedAttachments = extractedContents.map(att => {
    if (att.error) {
      return `\n--- Attachment: ${att.filename} (${att.mimeType}) ---\nError: ${att.error}\n`;
    }
    if (!att.content || att.content.trim().length === 0) {
      return `\n--- Attachment: ${att.filename} (${att.mimeType}) ---\nNo text content available.\n`;
    }
    return `\n--- Attachment: ${att.filename} (${att.mimeType}) ---\n${att.content}\n`;
  }).join('\n');

  return `\n\n=== EMAIL ATTACHMENTS ===\n${formattedAttachments}\n=== END ATTACHMENTS ===`;
}


