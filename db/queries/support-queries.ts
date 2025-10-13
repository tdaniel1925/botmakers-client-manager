import { db } from "../db";
import { 
  supportTicketsTable, 
  supportMessagesTable,
  SelectSupportTicket,
  InsertSupportTicket,
  SelectSupportMessage,
  InsertSupportMessage,
} from "../schema/support-schema";
import { organizationsTable } from "../schema/crm-schema";
import { eq, desc, and, getTableColumns } from "drizzle-orm";

/**
 * Create a new support ticket
 */
export async function createSupportTicket(data: InsertSupportTicket): Promise<SelectSupportTicket> {
  const result = await db
    .insert(supportTicketsTable)
    .values(data)
    .returning();
  
  return result[0];
}

/**
 * Get all support tickets (for platform admins)
 */
export async function getAllSupportTickets(): Promise<(SelectSupportTicket & { organizationName: string })[]> {
  try {
    const tickets = await db
      .select({
        ...getTableColumns(supportTicketsTable),
        organizationName: organizationsTable.name,
      })
      .from(supportTicketsTable)
      .leftJoin(organizationsTable, eq(supportTicketsTable.organizationId, organizationsTable.id))
      .orderBy(desc(supportTicketsTable.createdAt));
    
    return tickets.map(ticket => ({
      ...ticket,
      organizationName: ticket.organizationName || "Unknown",
    }));
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    return [];
  }
}

/**
 * Get support tickets for an organization
 */
export async function getOrganizationSupportTickets(organizationId: string): Promise<SelectSupportTicket[]> {
  try {
    const tickets = await db
      .select()
      .from(supportTicketsTable)
      .where(eq(supportTicketsTable.organizationId, organizationId))
      .orderBy(desc(supportTicketsTable.createdAt));
    
    return tickets;
  } catch (error) {
    console.error("Error fetching organization support tickets:", error);
    return [];
  }
}

/**
 * Get support ticket by ID with organization info
 */
export async function getSupportTicketById(ticketId: string) {
  try {
    const result = await db
      .select({
        ...getTableColumns(supportTicketsTable),
        organizationName: organizationsTable.name,
      })
      .from(supportTicketsTable)
      .leftJoin(organizationsTable, eq(supportTicketsTable.organizationId, organizationsTable.id))
      .where(eq(supportTicketsTable.id, ticketId))
      .limit(1);
    
    if (result.length === 0) return null;
    
    return {
      ...result[0],
      organizationName: result[0].organizationName || "Unknown",
    };
  } catch (error) {
    console.error("Error fetching support ticket:", error);
    return null;
  }
}

/**
 * Update support ticket
 */
export async function updateSupportTicket(
  ticketId: string,
  data: Partial<InsertSupportTicket>
): Promise<SelectSupportTicket> {
  const result = await db
    .update(supportTicketsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(supportTicketsTable.id, ticketId))
    .returning();
  
  return result[0];
}

/**
 * Add message to support ticket
 */
export async function addSupportMessage(data: InsertSupportMessage): Promise<SelectSupportMessage> {
  const result = await db
    .insert(supportMessagesTable)
    .values(data)
    .returning();
  
  return result[0];
}

/**
 * Get messages for a support ticket
 */
export async function getSupportTicketMessages(ticketId: string): Promise<SelectSupportMessage[]> {
  try {
    const messages = await db
      .select()
      .from(supportMessagesTable)
      .where(eq(supportMessagesTable.ticketId, ticketId))
      .orderBy(supportMessagesTable.createdAt);
    
    return messages;
  } catch (error) {
    console.error("Error fetching support messages:", error);
    return [];
  }
}

