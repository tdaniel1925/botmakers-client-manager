/**
 * Call Analysis Queue Utilities
 * Manages async AI analysis of call transcripts
 * In production, use a proper queue like BullMQ or Inngest
 */

// Queue for async AI analysis (simplified - in production use a proper queue)
let analysisQueue: string[] = [];

export async function queueCallAnalysis(callRecordId: string) {
  analysisQueue.push(callRecordId);
  // In a real implementation, this would add to a proper job queue
  // For now, we'll process immediately in the background
  processQueuedAnalysis();
}

async function processQueuedAnalysis() {
  if (analysisQueue.length === 0) return;
  
  const callRecordId = analysisQueue.shift();
  if (!callRecordId) return;
  
  // Import dynamically to avoid circular dependencies
  const { analyzeCallTranscript } = await import("@/lib/ai-call-analyzer");
  const { getCallRecordById } = await import("@/db/queries/calls-queries");
  
  try {
    const callRecord = await getCallRecordById(callRecordId);
    if (callRecord) {
      // Process in background
      analyzeCallTranscript(
        callRecordId,
        callRecord.transcript,
        callRecord.structuredData
      ).catch(console.error);
    }
  } catch (error) {
    console.error(`Failed to analyze call ${callRecordId}:`, error);
  }
  
  // Continue processing queue
  if (analysisQueue.length > 0) {
    setTimeout(processQueuedAnalysis, 1000);
  }
}

export function getQueueLength(): number {
  return analysisQueue.length;
}

export function clearQueue(): void {
  analysisQueue = [];
}

