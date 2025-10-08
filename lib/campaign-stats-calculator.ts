// Campaign Stats Calculator - Calculate performance metrics for voice campaigns

import type { SelectVoiceCampaign, SelectCallRecord } from "@/db/schema";

export interface CampaignPerformanceMetrics {
  totalCalls: number;
  completedCalls: number;
  failedCalls: number;
  noAnswerCalls: number;
  voicemailCalls: number;
  successRate: number;
  answerRate: number;
  averageCallDuration: number; // seconds
  totalCallDuration: number; // seconds
  averageCallQuality: number; // 1-10
  followUpRate: number; // percentage of calls needing follow-up
  totalCost: number; // cents
  averageCostPerCall: number; // cents
  callsByHour: Record<string, number>;
  callsByDay: Record<string, number>;
  qualityDistribution: Record<string, number>; // rating -> count
  topQuestionsAsked: Array<{ question: string; count: number }>;
}

/**
 * Calculate comprehensive performance metrics for a campaign
 */
export function calculateCampaignPerformance(
  campaign: SelectVoiceCampaign,
  callRecords: SelectCallRecord[]
): CampaignPerformanceMetrics {
  const totalCalls = callRecords.length;
  const completedCalls = callRecords.filter(c => c.aiAnalysisStatus === "completed").length;
  const failedCalls = callRecords.filter(c => c.aiAnalysisStatus === "failed").length;
  
  // Call status breakdown
  const noAnswerCalls = callRecords.filter(c => 
    c.transcript.toLowerCase().includes("no answer") || 
    c.callDurationSeconds === 0
  ).length;
  
  const voicemailCalls = callRecords.filter(c =>
    c.transcript.toLowerCase().includes("voicemail")
  ).length;
  
  // Success and answer rates
  const successRate = totalCalls > 0 ? (completedCalls / totalCalls) * 100 : 0;
  const answerRate = totalCalls > 0 
    ? ((totalCalls - noAnswerCalls) / totalCalls) * 100 
    : 0;
  
  // Call duration metrics
  const totalCallDuration = callRecords.reduce((sum, c) => 
    sum + (c.callDurationSeconds || 0), 0
  );
  const averageCallDuration = totalCalls > 0 ? totalCallDuration / totalCalls : 0;
  
  // Quality metrics
  const qualityRatings = callRecords
    .filter(c => c.callQualityRating !== null)
    .map(c => c.callQualityRating!);
  const averageCallQuality = qualityRatings.length > 0
    ? qualityRatings.reduce((sum, r) => sum + r, 0) / qualityRatings.length
    : 0;
  
  // Follow-up metrics
  const followUpCount = callRecords.filter(c => c.followUpNeeded).length;
  const followUpRate = totalCalls > 0 ? (followUpCount / totalCalls) * 100 : 0;
  
  // Cost metrics
  const totalCost = campaign.totalCost || 0;
  const averageCostPerCall = totalCalls > 0 ? totalCost / totalCalls : 0;
  
  // Calls by hour (0-23)
  const callsByHour = callRecords.reduce((acc, call) => {
    if (call.callTimestamp) {
      const hour = new Date(call.callTimestamp).getHours().toString();
      acc[hour] = (acc[hour] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  // Calls by day of week
  const callsByDay = callRecords.reduce((acc, call) => {
    if (call.callTimestamp) {
      const day = new Date(call.callTimestamp).toLocaleDateString('en-US', { weekday: 'long' });
      acc[day] = (acc[day] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  // Quality distribution
  const qualityDistribution = callRecords.reduce((acc, call) => {
    if (call.callQualityRating) {
      const rating = call.callQualityRating.toString();
      acc[rating] = (acc[rating] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  // Top questions asked
  const allQuestions: string[] = [];
  callRecords.forEach(call => {
    if (call.questionsAsked && Array.isArray(call.questionsAsked)) {
      allQuestions.push(...call.questionsAsked);
    }
  });
  
  const questionCounts = allQuestions.reduce((acc, q) => {
    acc[q] = (acc[q] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topQuestionsAsked = Object.entries(questionCounts)
    .map(([question, count]) => ({ question, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return {
    totalCalls,
    completedCalls,
    failedCalls,
    noAnswerCalls,
    voicemailCalls,
    successRate: Math.round(successRate * 10) / 10,
    answerRate: Math.round(answerRate * 10) / 10,
    averageCallDuration: Math.round(averageCallDuration),
    totalCallDuration,
    averageCallQuality: Math.round(averageCallQuality * 10) / 10,
    followUpRate: Math.round(followUpRate * 10) / 10,
    totalCost,
    averageCostPerCall: Math.round(averageCostPerCall),
    callsByHour,
    callsByDay,
    qualityDistribution,
    topQuestionsAsked,
  };
}

/**
 * Compare two campaign performance metrics
 */
export function compareCampaignPerformance(
  current: CampaignPerformanceMetrics,
  previous: CampaignPerformanceMetrics
) {
  return {
    callsChange: current.totalCalls - previous.totalCalls,
    callsChangePercent: previous.totalCalls > 0
      ? ((current.totalCalls - previous.totalCalls) / previous.totalCalls) * 100
      : 0,
    successRateChange: current.successRate - previous.successRate,
    qualityChange: current.averageCallQuality - previous.averageCallQuality,
    durationChange: current.averageCallDuration - previous.averageCallDuration,
    costChange: current.totalCost - previous.totalCost,
  };
}

/**
 * Get campaign health score (0-100)
 */
export function getCampaignHealthScore(metrics: CampaignPerformanceMetrics): number {
  let score = 0;
  
  // Answer rate (0-30 points)
  score += Math.min(30, (metrics.answerRate / 100) * 30);
  
  // Success rate (0-30 points)
  score += Math.min(30, (metrics.successRate / 100) * 30);
  
  // Call quality (0-25 points)
  score += Math.min(25, (metrics.averageCallQuality / 10) * 25);
  
  // Efficiency: calls vs cost (0-15 points)
  // Lower cost per call is better
  if (metrics.averageCostPerCall > 0) {
    const efficiency = Math.max(0, 1 - (metrics.averageCostPerCall / 1000)); // Assume $10 is max reasonable
    score += efficiency * 15;
  }
  
  return Math.round(score);
}

/**
 * Get recommendations based on campaign performance
 */
export function getCampaignRecommendations(
  metrics: CampaignPerformanceMetrics
): Array<{ type: "success" | "warning" | "error"; message: string }> {
  const recommendations: Array<{ type: "success" | "warning" | "error"; message: string }> = [];
  
  // Answer rate checks
  if (metrics.answerRate < 50) {
    recommendations.push({
      type: "error",
      message: "Low answer rate. Consider adjusting call times or improving phone number quality."
    });
  } else if (metrics.answerRate < 70) {
    recommendations.push({
      type: "warning",
      message: "Answer rate could be improved. Review calling schedule and target audience."
    });
  }
  
  // Success rate checks
  if (metrics.successRate < 60) {
    recommendations.push({
      type: "error",
      message: "Low success rate. Review agent prompts and conversation flow."
    });
  } else if (metrics.successRate > 90) {
    recommendations.push({
      type: "success",
      message: "Excellent success rate! Your agent is performing very well."
    });
  }
  
  // Call quality checks
  if (metrics.averageCallQuality < 5) {
    recommendations.push({
      type: "error",
      message: "Call quality is below average. Consider revising the system prompt."
    });
  } else if (metrics.averageCallQuality > 8) {
    recommendations.push({
      type: "success",
      message: "Great call quality! Customers are having positive experiences."
    });
  }
  
  // Duration checks
  if (metrics.averageCallDuration < 30) {
    recommendations.push({
      type: "warning",
      message: "Very short calls. Agent may not be engaging properly or calls are dropping."
    });
  } else if (metrics.averageCallDuration > 600) {
    recommendations.push({
      type: "warning",
      message: "Very long calls. Consider optimizing conversation flow to improve efficiency."
    });
  }
  
  // Follow-up rate checks
  if (metrics.followUpRate > 75) {
    recommendations.push({
      type: "warning",
      message: "High follow-up rate. Agent may need more information to resolve issues on first call."
    });
  }
  
  // Cost efficiency
  if (metrics.averageCostPerCall > 500) {
    recommendations.push({
      type: "warning",
      message: "High cost per call. Review call duration and provider pricing."
    });
  }
  
  return recommendations;
}
