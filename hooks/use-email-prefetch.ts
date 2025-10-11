/**
 * Email Prefetch Hook
 * Aggressively pre-fetches AI data for visible emails using IntersectionObserver
 * This makes AI popups feel instant by loading data before the user clicks
 */

'use client';

import { useEffect, useRef } from 'react';
import type { SelectEmail } from '@/db/schema/email-schema';
import { 
  getRelatedEmailsAction,
  generateQuickRepliesAction,
  getThreadMessagesAction
} from '@/actions/email-insights-actions';
import { generateEmailAI, needsAIGeneration } from '@/lib/email-ai-generator';

// Track which emails we've already prefetched
const prefetchedEmails = new Set<string>();

// Prefetch queue to avoid overwhelming the server
const prefetchQueue: string[] = [];
let isProcessingQueue = false;

async function processPrefetchQueue() {
  if (isProcessingQueue || prefetchQueue.length === 0) return;
  
  isProcessingQueue = true;
  console.log('🔄 Starting prefetch queue processing...', prefetchQueue.length, 'emails');
  
  while (prefetchQueue.length > 0) {
    const emailId = prefetchQueue.shift();
    if (!emailId || prefetchedEmails.has(emailId)) continue;
    
    // Mark as prefetched immediately to avoid duplicates
    prefetchedEmails.add(emailId);
    console.log('⚡ Prefetching data for email:', emailId.substring(0, 8) + '...');
    
    try {
      const startTime = Date.now();
      
      // Fetch database queries (fast)
      const databasePromises = Promise.allSettled([
        getRelatedEmailsAction(emailId),
        generateQuickRepliesAction(emailId),
        getThreadMessagesAction(emailId),
      ]);
      
      // Check if email needs AI generation
      const needsAI = await needsAIGeneration(emailId);
      
      // If needs AI, generate it in background (don't wait for it!)
      if (needsAI) {
        console.log(`🤖 Triggering background AI generation for ${emailId.substring(0, 8)}...`);
        generateEmailAI(emailId).catch(err => 
          console.warn(`⚠️ Background AI generation failed:`, err)
        );
      } else {
        console.log(`✓ AI already cached for ${emailId.substring(0, 8)}...`);
      }
      
      // Wait for database queries
      await databasePromises;
      
      const endTime = Date.now();
      console.log(`✅ Prefetch complete for ${emailId.substring(0, 8)}... in ${endTime - startTime}ms`);
      
      // Small delay between prefetches to avoid hammering server
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ Prefetch failed for email ${emailId}:`, error);
    }
  }
  
  isProcessingQueue = false;
  console.log('✅ Prefetch queue processing complete');
}

export function useEmailPrefetch(emails: SelectEmail[], enabled = true) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const emailRefs = useRef<Map<string, Element>>(new Map());

  useEffect(() => {
    if (!enabled) return;
    
    console.log('👀 Initializing IntersectionObserver for email prefetch');
    
    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const emailId = entry.target.getAttribute('data-email-id');
            console.log('👁️ Email card visible:', emailId?.substring(0, 8) + '...');
            if (emailId && !prefetchedEmails.has(emailId)) {
              // Add to queue
              if (!prefetchQueue.includes(emailId)) {
                prefetchQueue.push(emailId);
                console.log('📝 Added to prefetch queue:', emailId.substring(0, 8) + '...', 'Queue size:', prefetchQueue.length);
              }
              
              // Start processing queue
              processPrefetchQueue();
            } else if (emailId && prefetchedEmails.has(emailId)) {
              console.log('✓ Already prefetched:', emailId.substring(0, 8) + '...');
            }
          }
        });
      },
      {
        // Start prefetching when email is within 200px of viewport
        rootMargin: '200px',
        threshold: 0.1,
      }
    );

    return () => {
      console.log('🛑 Disconnecting IntersectionObserver');
      observerRef.current?.disconnect();
    };
  }, [enabled]);

  // Function to register an email card for prefetching
  const registerEmailCard = (emailId: string, element: Element | null) => {
    if (!element || !enabled) {
      console.log('⚠️ Cannot register card:', { emailId: emailId?.substring(0, 8), hasElement: !!element, enabled });
      return;
    }

    if (observerRef.current) {
      // Unobserve old element if it exists
      const oldElement = emailRefs.current.get(emailId);
      if (oldElement) {
        observerRef.current.unobserve(oldElement);
      }

      // Store and observe new element
      emailRefs.current.set(emailId, element);
      observerRef.current.observe(element);
      console.log('✅ Registered email card for observation:', emailId.substring(0, 8) + '...', 'Total cards:', emailRefs.current.size);
    } else {
      console.warn('⚠️ IntersectionObserver not initialized when trying to register card');
    }
  };

  // Manually trigger prefetch for an email (when popup opens)
  const prefetchEmail = async (email: SelectEmail) => {
    if (prefetchedEmails.has(email.id)) return; // Already prefetched
    
    prefetchedEmails.add(email.id);
    console.log('⚡ Manual prefetch triggered for:', email.id.substring(0, 8) + '...');
    
    // Prefetch database queries
    Promise.allSettled([
      getRelatedEmailsAction(email.id),
      generateQuickRepliesAction(email.id),
      getThreadMessagesAction(email.id),
    ]);
    
    // Trigger AI generation in background if needed
    needsAIGeneration(email.id).then(needsAI => {
      if (needsAI) {
        console.log(`🤖 Triggering immediate AI generation for ${email.id.substring(0, 8)}...`);
        generateEmailAI(email.id).catch(err => 
          console.warn(`⚠️ AI generation failed:`, err)
        );
      }
    });
  };

  return {
    registerEmailCard,
    prefetchEmail,
  };
}

// Export function to clear prefetch cache (useful when new emails arrive)
export function clearPrefetchCache() {
  prefetchedEmails.clear();
  prefetchQueue.length = 0;
}

