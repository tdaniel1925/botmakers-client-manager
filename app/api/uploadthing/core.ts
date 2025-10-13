/**
 * Uploadthing Core Configuration
 * Defines file upload routes and permissions
 */

import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/db";
import { clientOnboardingSessionsTable } from "@/db/schema/onboarding-schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const f = createUploadthing();

// Middleware for authenticated uploads
const authenticatedMiddleware = async () => {
  const { userId } = auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  return { userId };
};

// File router configuration
export const ourFileRouter = {
  // Authenticated uploads (for logged-in users)
  authenticatedUpload: f({
    image: { maxFileSize: "16MB", maxFileCount: 10 },
    pdf: { maxFileSize: "16MB", maxFileCount: 10 },
    "application/msword": { maxFileSize: "16MB", maxFileCount: 10 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "16MB", maxFileCount: 10 },
    "application/vnd.ms-excel": { maxFileSize: "16MB", maxFileCount: 10 },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { maxFileSize: "16MB", maxFileCount: 10 },
    "text/plain": { maxFileSize: "4MB", maxFileCount: 10 },
    "text/csv": { maxFileSize: "4MB", maxFileCount: 10 },
    "application/zip": { maxFileSize: "32MB", maxFileCount: 5 },
  })
    .middleware(authenticatedMiddleware)
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("✅ Authenticated upload complete:", file.name);
      console.log("   URL:", file.url);
      console.log("   User:", metadata.userId);
      
      return { 
        url: file.url,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedBy: metadata.userId,
      };
    }),

  // Public onboarding uploads (token-based authentication)
  onboardingUpload: f({
    image: { maxFileSize: "16MB", maxFileCount: 10 },
    pdf: { maxFileSize: "16MB", maxFileCount: 10 },
    "application/msword": { maxFileSize: "16MB", maxFileCount: 10 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "16MB", maxFileCount: 10 },
    "application/vnd.ms-excel": { maxFileSize: "16MB", maxFileCount: 10 },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { maxFileSize: "16MB", maxFileCount: 10 },
    "text/plain": { maxFileSize: "4MB", maxFileCount: 10 },
    "text/csv": { maxFileSize: "4MB", maxFileCount: 10 },
    "application/zip": { maxFileSize: "32MB", maxFileCount: 5 },
  })
    .input(z.object({ 
      token: z.string(),
      organizationId: z.string().optional(),
      category: z.string().optional(),
    }))
    .middleware(async ({ input }) => {
      const { token } = input;
      
      if (!token) {
        throw new Error("Onboarding token required");
      }
      
      // Validate token and get session - use direct select instead of db.query
      const sessions = await db
        .select()
        .from(clientOnboardingSessionsTable)
        .where(eq(clientOnboardingSessionsTable.accessToken, token))
        .limit(1);
      
      const session = sessions[0];
      
      if (!session) {
        throw new Error("Invalid or expired onboarding token");
      }
      
      return { 
        sessionId: session.id, 
        organizationId: session.organizationId,
        token 
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("✅ Onboarding upload complete:", file.name);
      console.log("   URL:", file.url);
      console.log("   Session:", metadata.sessionId);
      console.log("   Organization:", metadata.organizationId);
      
      return { 
        url: file.url,
        name: file.name,
        size: file.size,
        type: file.type,
        sessionId: metadata.sessionId,
        organizationId: metadata.organizationId,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;