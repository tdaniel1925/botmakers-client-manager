"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { 
  createSupportTicket,
  getAllSupportTickets,
  getOrganizationSupportTickets,
  getSupportTicketById,
  updateSupportTicket,
  addSupportMessage,
  getSupportTicketMessages,
} from "@/db/queries/support-queries";
import { isPlatformAdmin } from "@/db/queries/platform-queries";
import { ActionResult } from "@/types";

/**
 * Create a new support ticket (organization users)
 */
export async function createSupportTicketAction(data: {
  organizationId: string;
  subject: string;
  description: string;
  category?: "billing" | "technical" | "feature_request" | "bug_report" | "account" | "other";
  priority?: "low" | "medium" | "high" | "critical";
}): Promise<ActionResult<any>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized",
      };
    }

    const ticket = await createSupportTicket({
      organizationId: data.organizationId,
      createdBy: userId,
      subject: data.subject,
      description: data.description,
      category: data.category || "other",
      priority: data.priority || "medium",
      status: "open",
    });

    revalidatePath("/dashboard/support");
    revalidatePath("/platform/support");

    return {
      isSuccess: true,
      message: "Support ticket created successfully",
      data: ticket,
    };
  } catch (error) {
    console.error("Error creating support ticket:", error);
    return {
      isSuccess: false,
      message: "Failed to create support ticket",
    };
  }
}

/**
 * Get all support tickets (platform admin only)
 */
export async function getAllSupportTicketsAction(): Promise<ActionResult<any[]>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized",
      };
    }

    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      return {
        isSuccess: false,
        message: "Platform admin access required",
      };
    }

    const tickets = await getAllSupportTickets();

    return {
      isSuccess: true,
      message: "Support tickets fetched successfully",
      data: tickets,
    };
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    return {
      isSuccess: false,
      message: "Failed to fetch support tickets",
    };
  }
}

/**
 * Get organization support tickets
 */
export async function getOrganizationSupportTicketsAction(
  organizationId: string
): Promise<ActionResult<any[]>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized",
      };
    }

    const tickets = await getOrganizationSupportTickets(organizationId);

    return {
      isSuccess: true,
      message: "Support tickets fetched successfully",
      data: tickets,
    };
  } catch (error) {
    console.error("Error fetching organization support tickets:", error);
    return {
      isSuccess: false,
      message: "Failed to fetch support tickets",
    };
  }
}

/**
 * Get support ticket by ID
 */
export async function getSupportTicketByIdAction(ticketId: string): Promise<ActionResult<any>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized",
      };
    }

    const ticket = await getSupportTicketById(ticketId);

    if (!ticket) {
      return {
        isSuccess: false,
        message: "Support ticket not found",
      };
    }

    return {
      isSuccess: true,
      message: "Support ticket fetched successfully",
      data: ticket,
    };
  } catch (error) {
    console.error("Error fetching support ticket:", error);
    return {
      isSuccess: false,
      message: "Failed to fetch support ticket",
    };
  }
}

/**
 * Update support ticket status (platform admin only)
 */
export async function updateSupportTicketStatusAction(
  ticketId: string,
  status: "open" | "in_progress" | "waiting_response" | "resolved" | "closed"
): Promise<ActionResult<any>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized",
      };
    }

    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      return {
        isSuccess: false,
        message: "Platform admin access required",
      };
    }

    const updates: any = { status };
    if (status === "resolved") {
      updates.resolvedAt = new Date();
    } else if (status === "closed") {
      updates.closedAt = new Date();
    }

    const updatedTicket = await updateSupportTicket(ticketId, updates);

    revalidatePath("/platform/support");
    revalidatePath(`/platform/support/${ticketId}`);

    return {
      isSuccess: true,
      message: "Ticket status updated successfully",
      data: updatedTicket,
    };
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return {
      isSuccess: false,
      message: "Failed to update ticket status",
    };
  }
}

/**
 * Add message to support ticket
 */
export async function addSupportMessageAction(
  ticketId: string,
  message: string,
  isInternalNote: boolean = false
): Promise<ActionResult<any>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized",
      };
    }

    // Check if internal note - only platform admins can add those
    if (isInternalNote) {
      const isAdmin = await isPlatformAdmin(userId);
      if (!isAdmin) {
        return {
          isSuccess: false,
          message: "Only platform admins can add internal notes",
        };
      }
    }

    const newMessage = await addSupportMessage({
      ticketId,
      senderId: userId,
      senderType: (await isPlatformAdmin(userId)) ? "platform_admin" : "user",
      message,
      isInternalNote,
    });

    revalidatePath("/platform/support");
    revalidatePath(`/platform/support/${ticketId}`);
    revalidatePath("/dashboard/support");

    return {
      isSuccess: true,
      message: "Message added successfully",
      data: newMessage,
    };
  } catch (error) {
    console.error("Error adding support message:", error);
    return {
      isSuccess: false,
      message: "Failed to add message",
    };
  }
}

/**
 * Get support ticket messages
 */
export async function getSupportTicketMessagesAction(ticketId: string): Promise<ActionResult<any[]>> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        isSuccess: false,
        message: "Unauthorized",
      };
    }

    const messages = await getSupportTicketMessages(ticketId);

    // Filter out internal notes for non-admin users
    const isAdmin = await isPlatformAdmin(userId);
    const filteredMessages = isAdmin 
      ? messages 
      : messages.filter(msg => !msg.isInternalNote);

    return {
      isSuccess: true,
      message: "Messages fetched successfully",
      data: filteredMessages,
    };
  } catch (error) {
    console.error("Error fetching support messages:", error);
    return {
      isSuccess: false,
      message: "Failed to fetch messages",
    };
  }
}

