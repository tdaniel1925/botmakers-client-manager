/**
 * Thread Importance Scoring Library
 * AI-powered algorithm to score email thread importance
 */

import type { SelectEmail, SelectEmailThread } from '@/db/schema/email-schema';

export interface ThreadScore {
  score: number; // 0-100
  reason: string;
  factors: {
    senderImportance: number;
    keywordRelevance: number;
    threadEngagement: number;
    timeSensitivity: number;
  };
}

/**
 * Calculate importance score for an email thread
 */
export function calculateThreadImportance(
  thread: SelectEmailThread,
  emails: SelectEmail[],
  userEmail: string
): ThreadScore {
  const factors = {
    senderImportance: calculateSenderImportance(thread, emails, userEmail),
    keywordRelevance: calculateKeywordRelevance(thread, emails),
    threadEngagement: calculateThreadEngagement(thread, emails),
    timeSensitivity: calculateTimeSensitivity(thread, emails),
  };

  // Weighted average
  const score = Math.round(
    factors.senderImportance * 0.3 +
    factors.keywordRelevance * 0.3 +
    factors.threadEngagement * 0.2 +
    factors.timeSensitivity * 0.2
  );

  const reason = generateScoreReason(score, factors);

  return {
    score: Math.min(100, Math.max(0, score)),
    reason,
    factors,
  };
}

/**
 * Calculate sender importance (0-100)
 */
function calculateSenderImportance(
  thread: SelectEmailThread,
  emails: SelectEmail[],
  userEmail: string
): number {
  let score = 50; // Base score

  const participants = thread.participants || [];
  
  // Check if sender is a frequent contact (would need historical data)
  // For now, use heuristics based on email domain and patterns
  
  // Higher score for domain-matched emails (same company)
  const userDomain = userEmail.split('@')[1];
  const hasSameDomain = participants.some((p: any) => {
    const email = typeof p === 'object' ? p.email : p;
    return email.includes(`@${userDomain}`);
  });
  
  if (hasSameDomain) {
    score += 15;
  }

  // Check if there are multiple participants (group conversation)
  if (participants.length > 2) {
    score += 10;
  }

  // Check for known professional domains
  const professionalDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'];
  const hasCustomDomain = participants.some((p: any) => {
    const email = typeof p === 'object' ? p.email : p;
    const domain = email.split('@')[1];
    return !professionalDomains.includes(domain);
  });

  if (hasCustomDomain) {
    score += 10; // Custom domains often indicate business emails
  }

  return Math.min(100, score);
}

/**
 * Calculate keyword relevance (0-100)
 */
function calculateKeywordRelevance(
  thread: SelectEmailThread,
  emails: SelectEmail[]
): number {
  let score = 30; // Base score

  const subject = (thread.subject || '').toLowerCase();
  const allText = emails
    .map(e => `${e.subject} ${e.bodyText}`.toLowerCase())
    .join(' ');

  // High-priority keywords
  const urgentKeywords = ['urgent', 'asap', 'important', 'deadline', 'critical', 'emergency'];
  const urgentMatches = urgentKeywords.filter(kw => 
    subject.includes(kw) || allText.includes(kw)
  ).length;

  score += urgentMatches * 15;

  // Business keywords
  const businessKeywords = ['meeting', 'project', 'proposal', 'contract', 'invoice', 'payment', 'budget', 'review', 'approval', 'decision'];
  const businessMatches = businessKeywords.filter(kw => 
    subject.includes(kw) || allText.includes(kw)
  ).length;

  score += businessMatches * 8;

  // Action keywords
  const actionKeywords = ['please', 'need', 'request', 'can you', 'could you', 'would you'];
  const actionMatches = actionKeywords.filter(kw => 
    allText.includes(kw)
  ).length;

  score += actionMatches * 5;

  return Math.min(100, score);
}

/**
 * Calculate thread engagement (0-100)
 */
function calculateThreadEngagement(
  thread: SelectEmailThread,
  emails: SelectEmail[]
): number {
  let score = 20; // Base score

  const messageCount = thread.messageCount || emails.length;

  // More messages = more engagement
  if (messageCount >= 10) {
    score += 40;
  } else if (messageCount >= 5) {
    score += 30;
  } else if (messageCount >= 3) {
    score += 20;
  } else if (messageCount >= 2) {
    score += 10;
  }

  // Recent activity bonus
  const lastMessageDate = new Date(thread.lastMessageAt);
  const hoursSinceLastMessage = (Date.now() - lastMessageDate.getTime()) / (1000 * 60 * 60);

  if (hoursSinceLastMessage < 24) {
    score += 20;
  } else if (hoursSinceLastMessage < 72) {
    score += 10;
  }

  // Unread count (indicates pending responses)
  const unreadCount = thread.unreadCount || 0;
  score += Math.min(unreadCount * 5, 20);

  return Math.min(100, score);
}

/**
 * Calculate time sensitivity (0-100)
 */
function calculateTimeSensitivity(
  thread: SelectEmailThread,
  emails: SelectEmail[]
): number {
  let score = 40; // Base score

  const lastMessageDate = new Date(thread.lastMessageAt);
  const hoursSinceLastMessage = (Date.now() - lastMessageDate.getTime()) / (1000 * 60 * 60);

  // Very recent emails are more time-sensitive
  if (hoursSinceLastMessage < 1) {
    score += 40;
  } else if (hoursSinceLastMessage < 6) {
    score += 30;
  } else if (hoursSinceLastMessage < 24) {
    score += 20;
  } else if (hoursSinceLastMessage < 72) {
    score += 10;
  }

  // Check for deadline mentions in recent emails
  const recentEmail = emails[0];
  if (recentEmail) {
    const text = `${recentEmail.subject} ${recentEmail.bodyText}`.toLowerCase();
    const hasDeadline = text.includes('deadline') || text.includes('by ') || text.includes('due');
    
    if (hasDeadline) {
      score += 20;
    }
  }

  return Math.min(100, score);
}

/**
 * Generate human-readable reason for the score
 */
function generateScoreReason(score: number, factors: ThreadScore['factors']): string {
  const reasons: string[] = [];

  // Determine primary factor
  const maxFactor = Math.max(
    factors.senderImportance,
    factors.keywordRelevance,
    factors.threadEngagement,
    factors.timeSensitivity
  );

  if (score >= 80) {
    reasons.push('High priority');
  } else if (score >= 60) {
    reasons.push('Medium-high priority');
  } else if (score >= 40) {
    reasons.push('Medium priority');
  } else {
    reasons.push('Low priority');
  }

  if (factors.keywordRelevance >= 70) {
    reasons.push('contains urgent or important keywords');
  }

  if (factors.timeSensitivity >= 70) {
    reasons.push('recent activity or time-sensitive');
  }

  if (factors.threadEngagement >= 70) {
    reasons.push('active conversation with multiple messages');
  }

  if (factors.senderImportance >= 70) {
    reasons.push('from important contact');
  }

  return reasons.join(' - ');
}

/**
 * Categorize email using AI-like heuristics
 */
export function categorizeEmail(email: SelectEmail): {
  category: 'important' | 'social' | 'promotions' | 'updates' | 'newsletters' | null;
  confidence: number;
} {
  const subject = (email.subject || '').toLowerCase();
  const from = typeof email.fromAddress === 'object' 
    ? email.fromAddress.email.toLowerCase() 
    : email.fromAddress.toLowerCase();
  const body = (email.bodyText || '').toLowerCase();

  // Newsletter detection
  if (
    subject.includes('newsletter') ||
    subject.includes('weekly') ||
    subject.includes('monthly') ||
    from.includes('newsletter') ||
    from.includes('no-reply') ||
    from.includes('noreply') ||
    body.includes('unsubscribe')
  ) {
    return { category: 'newsletters', confidence: 85 };
  }

  // Promotions detection
  if (
    subject.includes('sale') ||
    subject.includes('offer') ||
    subject.includes('discount') ||
    subject.includes('%') ||
    subject.includes('deal') ||
    subject.includes('limited time') ||
    subject.includes('free') ||
    body.includes('shop now') ||
    body.includes('buy now')
  ) {
    return { category: 'promotions', confidence: 80 };
  }

  // Updates/Notifications detection
  if (
    subject.includes('notification') ||
    subject.includes('alert') ||
    subject.includes('update') ||
    subject.includes('reminder') ||
    subject.includes('confirm') ||
    subject.includes('verification') ||
    from.includes('notifications@') ||
    from.includes('alerts@')
  ) {
    return { category: 'updates', confidence: 75 };
  }

  // Social detection
  if (
    from.includes('facebook') ||
    from.includes('twitter') ||
    from.includes('linkedin') ||
    from.includes('instagram') ||
    from.includes('social') ||
    subject.includes('tagged') ||
    subject.includes('mentioned') ||
    subject.includes('friend request')
  ) {
    return { category: 'social', confidence: 90 };
  }

  // Important detection (keywords + context)
  const importantKeywords = ['urgent', 'important', 'action required', 'deadline', 'asap', 'critical'];
  const hasImportantKeyword = importantKeywords.some(kw => 
    subject.includes(kw) || body.includes(kw)
  );

  if (hasImportantKeyword || email.priority === 'high' || email.priority === 'urgent') {
    return { category: 'important', confidence: 85 };
  }

  // Default: no clear category
  return { category: null, confidence: 0 };
}



