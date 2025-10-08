"use server";

import { auth } from "@clerk/nextjs/server";
import { generateBusinessDescription, BusinessDescriptionInput } from "@/lib/ai-business-description-writer";

/**
 * Server action to generate business description
 */
export async function generateBusinessDescriptionAction(
  input: BusinessDescriptionInput | string
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized",
        description: ""
      };
    }

    const description = await generateBusinessDescription(input);
    
    return {
      isSuccess: true,
      message: "Description generated successfully",
      description
    };
  } catch (error: any) {
    console.error("[AI Description Action] Error:", error);
    return {
      isSuccess: false,
      message: error.message || "Failed to generate description",
      description: ""
    };
  }
}
