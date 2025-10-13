/**
 * Organization Contacts Server Actions
 * CRUD operations with self-healing and authorization
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  getOrganizationContacts,
  getContactById,
  createOrganizationContact,
  updateOrganizationContact,
  deleteOrganizationContact,
  getPrimaryContact,
  getContactCount,
} from "@/db/queries/organization-contacts-queries";
import { getUserRole } from "@/db/queries/organizations-queries";
import { ActionResult } from "@/types";
import { withSelfHealing } from "@/lib/self-healing/error-interceptor";
import type { SelectOrganizationContact, InsertOrganizationContact } from "@/db/schema";

/**
 * Get contacts for an organization
 */
export const getOrganizationContactsAction = withSelfHealing(
  async function getOrganizationContactsAction(
    organizationId: string,
    options?: {
      search?: string;
      isActive?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<ActionResult<{ contacts: SelectOrganizationContact[]; total: number }>> {
    try {
      const { userId } = await auth();
      
      if (!userId) {
        return { isSuccess: false, message: "Unauthorized" };
      }
      
      // Check user has access to this organization
      const userRole = await getUserRole(userId, organizationId);
      
      if (!userRole) {
        return { isSuccess: false, message: "Access denied" };
      }
      
      const result = await getOrganizationContacts(organizationId, options);
      
      return {
        isSuccess: true,
        message: "Contacts retrieved successfully",
        data: result,
      };
    } catch (error) {
      console.error("Error getting organization contacts:", error);
      return { isSuccess: false, message: "Failed to get contacts" };
    }
  },
  { source: 'getOrganizationContactsAction', category: 'database' }
);

/**
 * Get single contact by ID
 */
export const getOrganizationContactByIdAction = withSelfHealing(
  async function getOrganizationContactByIdAction(
    contactId: string,
    organizationId: string
  ): Promise<ActionResult<SelectOrganizationContact>> {
    try {
      const { userId } = await auth();
      
      if (!userId) {
        return { isSuccess: false, message: "Unauthorized" };
      }
      
      const userRole = await getUserRole(userId, organizationId);
      
      if (!userRole) {
        return { isSuccess: false, message: "Access denied" };
      }
      
      const contact = await getContactById(contactId);
      
      if (!contact) {
        return { isSuccess: false, message: "Contact not found" };
      }
      
      // Verify contact belongs to the organization
      if (contact.organizationId !== organizationId) {
        return { isSuccess: false, message: "Access denied" };
      }
      
      return {
        isSuccess: true,
        message: "Contact retrieved successfully",
        data: contact,
      };
    } catch (error) {
      console.error("Error getting contact:", error);
      return { isSuccess: false, message: "Failed to get contact" };
    }
  },
  { source: 'getOrganizationContactByIdAction', category: 'database' }
);

/**
 * Get primary contact for organization
 */
export const getPrimaryContactAction = withSelfHealing(
  async function getPrimaryContactAction(
    organizationId: string
  ): Promise<ActionResult<SelectOrganizationContact | null>> {
    try {
      const { userId } = await auth();
      
      if (!userId) {
        return { isSuccess: false, message: "Unauthorized" };
      }
      
      const userRole = await getUserRole(userId, organizationId);
      
      if (!userRole) {
        return { isSuccess: false, message: "Access denied" };
      }
      
      const contact = await getPrimaryContact(organizationId);
      
      return {
        isSuccess: true,
        message: contact ? "Primary contact found" : "No primary contact set",
        data: contact,
      };
    } catch (error) {
      console.error("Error getting primary contact:", error);
      return { isSuccess: false, message: "Failed to get primary contact" };
    }
  },
  { source: 'getPrimaryContactAction', category: 'database' }
);

/**
 * Create new organization contact
 */
export const createOrganizationContactAction = withSelfHealing(
  async function createOrganizationContactAction(data: {
    organizationId: string;
    firstName: string;
    lastName: string;
    jobTitle?: string;
    department?: string;
    email?: string;
    phone?: string;
    mobilePhone?: string;
    officePhone?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    notes?: string;
    isPrimary?: boolean;
  }): Promise<ActionResult<SelectOrganizationContact>> {
    try {
      const { userId } = await auth();
      
      if (!userId) {
        return { isSuccess: false, message: "Unauthorized" };
      }
      
      const userRole = await getUserRole(userId, data.organizationId);
      
      if (!userRole) {
        return { isSuccess: false, message: "Access denied" };
      }
      
      // All organization members with roles can create contacts
      // (userRole.role can be "manager" or "sales_rep")
      
      // Validate required fields
      if (!data.firstName || !data.lastName) {
        return {
          isSuccess: false,
          message: "First name and last name are required",
        };
      }
      
      const contact = await createOrganizationContact({
        ...data,
        createdBy: userId,
      });
      
      revalidatePath(`/dashboard/organizations/${data.organizationId}`);
      revalidatePath("/dashboard/contacts");
      
      return {
        isSuccess: true,
        message: "Contact created successfully",
        data: contact,
      };
    } catch (error) {
      console.error("Error creating contact:", error);
      return { isSuccess: false, message: "Failed to create contact" };
    }
  },
  { source: 'createOrganizationContactAction', category: 'database' }
);

/**
 * Update organization contact
 */
export const updateOrganizationContactAction = withSelfHealing(
  async function updateOrganizationContactAction(
    contactId: string,
    organizationId: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      jobTitle?: string;
      department?: string;
      email?: string;
      phone?: string;
      mobilePhone?: string;
      officePhone?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
      notes?: string;
      isPrimary?: boolean;
      isActive?: boolean;
    }>
  ): Promise<ActionResult<SelectOrganizationContact>> {
    try {
      const { userId } = await auth();
      
      if (!userId) {
        return { isSuccess: false, message: "Unauthorized" };
      }
      
      const userRole = await getUserRole(userId, organizationId);
      
      if (!userRole) {
        return { isSuccess: false, message: "Access denied" };
      }
      
      // All organization members with roles can update contacts
      // (userRole.role can be "manager" or "sales_rep")
      
      const contact = await getContactById(contactId);
      
      if (!contact) {
        return { isSuccess: false, message: "Contact not found" };
      }
      
      if (contact.organizationId !== organizationId) {
        return { isSuccess: false, message: "Access denied" };
      }
      
      const updated = await updateOrganizationContact(contactId, data);
      
      if (!updated) {
        return { isSuccess: false, message: "Failed to update contact" };
      }
      
      revalidatePath(`/dashboard/organizations/${organizationId}`);
      revalidatePath("/dashboard/contacts");
      
      return {
        isSuccess: true,
        message: "Contact updated successfully",
        data: updated,
      };
    } catch (error) {
      console.error("Error updating contact:", error);
      return { isSuccess: false, message: "Failed to update contact" };
    }
  },
  { source: 'updateOrganizationContactAction', category: 'database' }
);

/**
 * Delete organization contact (soft delete)
 */
export const deleteOrganizationContactAction = withSelfHealing(
  async function deleteOrganizationContactAction(
    contactId: string,
    organizationId: string
  ): Promise<ActionResult<void>> {
    try {
      const { userId } = await auth();
      
      if (!userId) {
        return { isSuccess: false, message: "Unauthorized" };
      }
      
      const userRole = await getUserRole(userId, organizationId);
      
      // Allow managers to delete contacts (role can be "manager" or "sales_rep")
      if (!userRole) {
        return { isSuccess: false, message: "Access denied" };
      }
      
      const contact = await getContactById(contactId);
      
      if (!contact) {
        return { isSuccess: false, message: "Contact not found" };
      }
      
      if (contact.organizationId !== organizationId) {
        return { isSuccess: false, message: "Access denied" };
      }
      
      await deleteOrganizationContact(contactId, false); // Soft delete
      
      revalidatePath(`/dashboard/organizations/${organizationId}`);
      revalidatePath("/dashboard/contacts");
      
      return {
        isSuccess: true,
        message: "Contact deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting contact:", error);
      return { isSuccess: false, message: "Failed to delete contact" };
    }
  },
  { source: 'deleteOrganizationContactAction', category: 'database' }
);

/**
 * Get contact count for organization
 */
export const getContactCountAction = withSelfHealing(
  async function getContactCountAction(
    organizationId: string
  ): Promise<ActionResult<number>> {
    try {
      const { userId } = await auth();
      
      if (!userId) {
        return { isSuccess: false, message: "Unauthorized" };
      }
      
      const userRole = await getUserRole(userId, organizationId);
      
      if (!userRole) {
        return { isSuccess: false, message: "Access denied" };
      }
      
      const count = await getContactCount(organizationId);
      
      return {
        isSuccess: true,
        message: "Contact count retrieved",
        data: count,
      };
    } catch (error) {
      console.error("Error getting contact count:", error);
      return { isSuccess: false, message: "Failed to get contact count" };
    }
  },
  { source: 'getContactCountAction', category: 'database' }
);
