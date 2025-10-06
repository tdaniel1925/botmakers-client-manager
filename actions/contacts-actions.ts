"use server";

import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  bulkDeleteContacts,
  getContactCountByStatus,
} from "@/db/queries/contacts-queries";
import { InsertContact, SelectContact } from "@/db/schema";
import { ActionResult } from "@/types/actions/actions-types";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { getUserRole } from "@/db/queries/organizations-queries";
import { canAccessResource, canEditResource, canDeleteResource } from "@/lib/rbac";
import { validateContact, formatValidationErrors } from "@/lib/validation-utils"; // ✅ FIX BUG-019

export async function getContactsAction(
  organizationId: string,
  options?: {
    search?: string;
    status?: string;
    ownerId?: string;
    limit?: number;
    offset?: number;
    sortBy?: "createdAt" | "updatedAt" | "firstName" | "company";
    sortOrder?: "asc" | "desc";
  }
): Promise<ActionResult<{ contacts: SelectContact[]; total: number }>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const userRole = await getUserRole(userId, organizationId);
    
    if (!userRole) {
      return { isSuccess: false, message: "User not found in organization" };
    }
    
    // If user is sales_rep, only show their own contacts
    let queryOptions = { ...options };
    if (userRole.role === "sales_rep") {
      queryOptions.ownerId = userId;
    }
    
    const result = await getContacts(organizationId, queryOptions);
    return { isSuccess: true, message: "Contacts retrieved successfully", data: result };
  } catch (error) {
    console.error("Error getting contacts:", error);
    return { isSuccess: false, message: "Failed to get contacts" };
  }
}

export async function getContactByIdAction(
  contactId: string,
  organizationId: string
): Promise<ActionResult<SelectContact | null>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const contact = await getContactById(contactId, organizationId);
    
    if (!contact) {
      return { isSuccess: false, message: "Contact not found" };
    }
    
    const userRole = await getUserRole(userId, organizationId);
    
    if (!userRole) {
      return { isSuccess: false, message: "User not found in organization" };
    }
    
    // Check if user has permission to view this contact
    if (!canAccessResource(userRole.role as any, contact.ownerId, userId)) {
      return { isSuccess: false, message: "Permission denied" };
    }
    
    return { isSuccess: true, message: "Contact retrieved successfully", data: contact };
  } catch (error) {
    console.error("Error getting contact:", error);
    return { isSuccess: false, message: "Failed to get contact" };
  }
}

export async function createContactAction(
  data: InsertContact
): Promise<ActionResult<SelectContact>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    // ✅ FIX BUG-019: Validate required fields before creation
    const validation = validateContact({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || undefined,
      phone: data.phone || undefined,
      organizationId: data.organizationId,
    });
    
    if (!validation.isValid) {
      return {
        isSuccess: false,
        message: formatValidationErrors(validation.errors),
      };
    }
    
    const userRole = await getUserRole(userId, data.organizationId);
    
    if (!userRole) {
      return { isSuccess: false, message: "User not found in organization" };
    }
    
    const contactData = {
      ...data,
      ownerId: data.ownerId || userId,
      createdBy: userId,
    };
    
    const newContact = await createContact(contactData);
    revalidatePath("/dashboard/contacts");
    return { isSuccess: true, message: "Contact created successfully", data: newContact };
  } catch (error) {
    console.error("Error creating contact:", error);
    return { isSuccess: false, message: "Failed to create contact" };
  }
}

export async function updateContactAction(
  contactId: string,
  organizationId: string,
  data: Partial<InsertContact>
): Promise<ActionResult<SelectContact>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const contact = await getContactById(contactId, organizationId);
    
    if (!contact) {
      return { isSuccess: false, message: "Contact not found" };
    }
    
    // ✅ FIX BUG-019: Validate fields before update (only if provided)
    if (data.firstName !== undefined || data.lastName !== undefined || data.email !== undefined || data.phone !== undefined) {
      const validation = validateContact({
        firstName: data.firstName !== undefined ? data.firstName : contact.firstName,
        lastName: data.lastName !== undefined ? data.lastName : contact.lastName,
        email: data.email !== undefined ? data.email || undefined : contact.email || undefined,
        phone: data.phone !== undefined ? data.phone || undefined : contact.phone || undefined,
        organizationId: organizationId,
      });
      
      if (!validation.isValid) {
        return {
          isSuccess: false,
          message: formatValidationErrors(validation.errors),
        };
      }
    }
    
    const userRole = await getUserRole(userId, organizationId);
    
    if (!userRole) {
      return { isSuccess: false, message: "User not found in organization" };
    }
    
    // Check if user has permission to edit this contact
    if (!canEditResource(userRole.role as any, contact.ownerId, userId)) {
      return { isSuccess: false, message: "Permission denied" };
    }
    
    const updatedContact = await updateContact(contactId, organizationId, data);
    
    if (!updatedContact) {
      return { isSuccess: false, message: "Failed to update contact" };
    }
    
    revalidatePath("/dashboard/contacts");
    revalidatePath(`/dashboard/contacts/${contactId}`);
    return { isSuccess: true, message: "Contact updated successfully", data: updatedContact };
  } catch (error) {
    console.error("Error updating contact:", error);
    return { isSuccess: false, message: "Failed to update contact" };
  }
}

export async function deleteContactAction(
  contactId: string,
  organizationId: string
): Promise<ActionResult<void>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const contact = await getContactById(contactId, organizationId);
    
    if (!contact) {
      return { isSuccess: false, message: "Contact not found" };
    }
    
    const userRole = await getUserRole(userId, organizationId);
    
    if (!userRole) {
      return { isSuccess: false, message: "User not found in organization" };
    }
    
    // Check if user has permission to delete this contact
    if (!canDeleteResource(userRole.role as any, contact.ownerId, userId)) {
      return { isSuccess: false, message: "Permission denied" };
    }
    
    const success = await deleteContact(contactId, organizationId);
    
    if (!success) {
      return { isSuccess: false, message: "Failed to delete contact" };
    }
    
    revalidatePath("/dashboard/contacts");
    return { isSuccess: true, message: "Contact deleted successfully" };
  } catch (error) {
    console.error("Error deleting contact:", error);
    return { isSuccess: false, message: "Failed to delete contact" };
  }
}

export async function bulkDeleteContactsAction(
  contactIds: string[],
  organizationId: string
): Promise<ActionResult<number>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const userRole = await getUserRole(userId, organizationId);
    
    if (!userRole) {
      return { isSuccess: false, message: "User not found in organization" };
    }
    
    // Only admins can bulk delete
    if (userRole.role !== "admin") {
      return { isSuccess: false, message: "Permission denied" };
    }
    
    const deletedCount = await bulkDeleteContacts(contactIds, organizationId);
    revalidatePath("/dashboard/contacts");
    return { isSuccess: true, message: `${deletedCount} contacts deleted successfully`, data: deletedCount };
  } catch (error) {
    console.error("Error bulk deleting contacts:", error);
    return { isSuccess: false, message: "Failed to delete contacts" };
  }
}

export async function getContactCountByStatusAction(
  organizationId: string
): Promise<ActionResult<Record<string, number>>> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { isSuccess: false, message: "Unauthorized" };
    }
    
    const counts = await getContactCountByStatus(organizationId);
    return { isSuccess: true, message: "Contact counts retrieved successfully", data: counts };
  } catch (error) {
    console.error("Error getting contact counts:", error);
    return { isSuccess: false, message: "Failed to get contact counts" };
  }
}




