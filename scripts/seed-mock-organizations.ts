/**
 * Seed Mock Organizations Script
 * Creates 3 fully-populated test organizations for development/testing
 */

import { db } from "../db/db";
import { 
  organizationsTable, 
  userRolesTable,
  projectsTable,
  clientOnboardingSessionsTable,
  onboardingTodosTable,
  activitiesTable,
  organizationContactsTable
} from "../db/schema";
import { clerkClient } from "@clerk/nextjs/server";
import { eq, inArray } from "drizzle-orm";

const MOCK_ORGANIZATIONS = [
  {
    name: "Test Corp",
    slug: "test-corp",
    plan: "pro" as const,
    status: "active" as const,
    maxUsers: 25,
    maxStorageGb: 100,
    description: "A test organization showcasing Pro plan features with advanced project management and analytics capabilities.",
    phone: "+1-555-0100",
    email: "contact@testcorp.example.com",
    website: "https://testcorp.example.com",
    addressLine1: "123 Tech Street",
    addressLine2: "Suite 400",
    city: "San Francisco",
    state: "CA",
    postalCode: "94105",
    country: "United States",
  },
  {
    name: "Demo Inc",
    slug: "demo-inc",
    plan: "free" as const,
    status: "trial" as const,
    maxUsers: 5,
    maxStorageGb: 10,
    description: "A demonstration organization on the Free plan, perfect for testing basic functionality and limitations.",
    phone: "+1-555-0200",
    email: "hello@demoinc.example.com",
    website: "https://demoinc.example.com",
    addressLine1: "456 Startup Lane",
    city: "Austin",
    state: "TX",
    postalCode: "78701",
    country: "United States",
  },
  {
    name: "Sample LLC",
    slug: "sample-llc",
    plan: "enterprise" as const,
    status: "active" as const,
    maxUsers: 100,
    maxStorageGb: 500,
    description: "An enterprise-level organization with full feature access, showcasing advanced team collaboration and unlimited projects.",
    phone: "+1-555-0300",
    email: "info@samplellc.example.com",
    website: "https://samplellc.example.com",
    addressLine1: "789 Enterprise Blvd",
    addressLine2: "Floor 10",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    country: "United States",
  },
];

const MOCK_TEAM_MEMBERS = {
  "test-corp": [
    { firstName: "Alice", lastName: "Anderson", email: "alice@testcorp.example.com", role: "admin" as const },
    { firstName: "Bob", lastName: "Brown", email: "bob@testcorp.example.com", role: "admin" as const },
    { firstName: "Charlie", lastName: "Chen", email: "charlie@testcorp.example.com", role: "manager" as const },
    { firstName: "Diana", lastName: "Davis", email: "diana@testcorp.example.com", role: "manager" as const },
    { firstName: "Eve", lastName: "Evans", email: "eve@testcorp.example.com", role: "manager" as const },
    { firstName: "Frank", lastName: "Fisher", email: "frank@testcorp.example.com", role: "sales_rep" as const },
    { firstName: "Grace", lastName: "Garcia", email: "grace@testcorp.example.com", role: "sales_rep" as const },
  ],
  "demo-inc": [
    { firstName: "Henry", lastName: "Harris", email: "henry@demoinc.example.com", role: "admin" as const },
    { firstName: "Ivy", lastName: "Ingram", email: "ivy@demoinc.example.com", role: "manager" as const },
    { firstName: "Jack", lastName: "Johnson", email: "jack@demoinc.example.com", role: "manager" as const },
    { firstName: "Kelly", lastName: "King", email: "kelly@demoinc.example.com", role: "sales_rep" as const },
    { firstName: "Leo", lastName: "Lee", email: "leo@demoinc.example.com", role: "sales_rep" as const },
  ],
  "sample-llc": [
    { firstName: "Mary", lastName: "Martinez", email: "mary@samplellc.example.com", role: "admin" as const },
    { firstName: "Nathan", lastName: "Nelson", email: "nathan@samplellc.example.com", role: "admin" as const },
    { firstName: "Olivia", lastName: "O'Brien", email: "olivia@samplellc.example.com", role: "manager" as const },
    { firstName: "Paul", lastName: "Parker", email: "paul@samplellc.example.com", role: "manager" as const },
    { firstName: "Quinn", lastName: "Quinn", email: "quinn@samplellc.example.com", role: "manager" as const },
    { firstName: "Rachel", lastName: "Robinson", email: "rachel@samplellc.example.com", role: "sales_rep" as const },
    { firstName: "Sam", lastName: "Smith", email: "sam@samplellc.example.com", role: "sales_rep" as const },
  ],
};

const MOCK_PROJECTS = [
  {
    name: "Q4 Marketing Campaign",
    description: "Launch comprehensive digital marketing campaign for Q4 product releases",
    status: "active" as const,
    priority: "high" as const,
    dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
  },
  {
    name: "Website Redesign",
    description: "Complete overhaul of company website with modern design and improved UX",
    status: "active" as const,
    priority: "high" as const,
    dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
  },
  {
    name: "Mobile App Development",
    description: "Build iOS and Android mobile applications for customer engagement",
    status: "active" as const,
    priority: "medium" as const,
    dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
  },
  {
    name: "CRM Integration",
    description: "Integrate Salesforce with internal systems for unified customer data",
    status: "active" as const,
    priority: "medium" as const,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  },
  {
    name: "Data Migration Project",
    description: "Migrate legacy data to new cloud infrastructure",
    status: "active" as const,
    priority: "low" as const,
    dueDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
  },
  {
    name: "Employee Onboarding Portal",
    description: "Internal portal for streamlined employee onboarding process",
    status: "completed" as const,
    priority: "medium" as const,
    dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
  },
  {
    name: "Annual Report Design",
    description: "Create visual design for 2024 annual shareholder report",
    status: "completed" as const,
    priority: "low" as const,
    dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  },
  {
    name: "Security Audit",
    description: "Comprehensive security audit of all systems and infrastructure",
    status: "on_hold" as const,
    priority: "high" as const,
    dueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
  },
];

const MOCK_CONTACTS = [
  {
    firstName: "Sarah",
    lastName: "Thompson",
    jobTitle: "CEO",
    department: "Executive",
    email: "sarah.thompson@client.com",
    phone: "+1-555-1001",
    mobilePhone: "+1-555-1002",
    isPrimary: true,
  },
  {
    firstName: "Michael",
    lastName: "Rodriguez",
    jobTitle: "VP of Operations",
    department: "Operations",
    email: "m.rodriguez@client.com",
    phone: "+1-555-1003",
    isPrimary: false,
  },
  {
    firstName: "Jennifer",
    lastName: "Wong",
    jobTitle: "Marketing Director",
    department: "Marketing",
    email: "j.wong@client.com",
    phone: "+1-555-1004",
    mobilePhone: "+1-555-1005",
    isPrimary: false,
  },
  {
    firstName: "David",
    lastName: "Kim",
    jobTitle: "IT Manager",
    department: "Technology",
    email: "d.kim@client.com",
    phone: "+1-555-1006",
    isPrimary: false,
  },
];

/**
 * Generate secure random password for test users
 */
function generateSecurePassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Create mock Clerk users for team members
 */
async function createMockClerkUsers(members: typeof MOCK_TEAM_MEMBERS[keyof typeof MOCK_TEAM_MEMBERS]) {
  const clerk = await clerkClient();
  const createdUsers: Array<{ clerkUserId: string; email: string; role: string }> = [];

  for (const member of members) {
    try {
      // Check if user already exists
      const existingUsers = await clerk.users.getUserList({
        emailAddress: [member.email],
      });

      let clerkUserId: string;

      if (existingUsers.data.length > 0) {
        console.log(`✓ User ${member.email} already exists`);
        clerkUserId = existingUsers.data[0].id;
      } else {
        // Create new Clerk user
        const user = await clerk.users.createUser({
          emailAddress: [member.email],
          firstName: member.firstName,
          lastName: member.lastName,
          password: generateSecurePassword(),
          skipPasswordRequirement: false,
        });

        clerkUserId = user.id;
        console.log(`✓ Created Clerk user: ${member.email}`);
      }

      createdUsers.push({
        clerkUserId,
        email: member.email,
        role: member.role,
      });
    } catch (error) {
      console.error(`✗ Error creating user ${member.email}:`, error);
    }
  }

  return createdUsers;
}

/**
 * Main seed function
 */
export async function seedMockOrganizations(currentPlatformAdminUserId: string) {
  console.log("\n🌱 Starting mock organization seed...\n");

  const results = {
    organizations: [] as Array<{ id: string; name: string; slug: string }>,
    teamMembers: 0,
    projects: 0,
    contacts: 0,
    activities: 0,
  };

  for (const orgData of MOCK_ORGANIZATIONS) {
    console.log(`\n📦 Creating organization: ${orgData.name}`);

    // Check if organization already exists
    const existingOrg = await db
      .select()
      .from(organizationsTable)
      .where(eq(organizationsTable.slug, orgData.slug))
      .limit(1);

    let organizationId: string;

    if (existingOrg.length > 0) {
      console.log(`  ℹ️  Organization ${orgData.name} already exists, using existing org`);
      organizationId = existingOrg[0].id;
      results.organizations.push({
        id: organizationId,
        name: orgData.name,
        slug: orgData.slug,
      });
    } else {
      // Create organization
      const [organization] = await db
        .insert(organizationsTable)
        .values(orgData)
        .returning();

      organizationId = organization.id;
      console.log(`  ✓ Created organization: ${organization.id}`);

      results.organizations.push({
        id: organizationId,
        name: orgData.name,
        slug: orgData.slug,
      });
    }

    // ✅ Continue to create team members, projects, etc. for this organization (whether new or existing)

    // Add current platform admin as admin member
    await db.insert(userRolesTable).values({
      userId: currentPlatformAdminUserId,
      organizationId,
      role: "admin",
    });
    console.log(`  ✓ Added platform admin as organization admin`);
    results.teamMembers++;

    // Create mock team members
    const members = MOCK_TEAM_MEMBERS[orgData.slug as keyof typeof MOCK_TEAM_MEMBERS];
    const clerkUsers = await createMockClerkUsers(members);

    for (const user of clerkUsers) {
      await db.insert(userRolesTable).values({
        userId: user.clerkUserId,
        organizationId,
        role: user.role,
      });
      results.teamMembers++;
    }
    console.log(`  ✓ Created ${clerkUsers.length} team members`);

    // Create mock projects (fewer for free plan)
    const projectCount = orgData.plan === "free" ? 3 : MOCK_PROJECTS.length;
    for (let i = 0; i < projectCount; i++) {
      const projectData = MOCK_PROJECTS[i];
      
      const [project] = await db
        .insert(projectsTable)
        .values({
          name: projectData.name,
          description: projectData.description,
          status: projectData.status,
          priority: projectData.priority,
          dueDate: projectData.dueDate,
          organizationId,
          createdBy: currentPlatformAdminUserId,
          assignedTo: clerkUsers[i % clerkUsers.length]?.clerkUserId || currentPlatformAdminUserId,
        })
        .returning();

      results.projects++;

      // Add mock activities for each project
      const activityTypes = ["call", "email", "meeting", "task", "note"] as const;
      for (let j = 0; j < 3; j++) {
        await db.insert(activitiesTable).values({
          organizationId,
          type: activityTypes[j % activityTypes.length],
          subject: `${activityTypes[j % activityTypes.length]} regarding ${projectData.name}`,
          description: `Mock activity for ${projectData.name}`,
          dueDate: new Date(Date.now() + (j + 1) * 7 * 24 * 60 * 60 * 1000),
          completed: j === 0,
          completedAt: j === 0 ? new Date() : null,
          userId: clerkUsers[j % clerkUsers.length]?.clerkUserId || currentPlatformAdminUserId,
          createdBy: currentPlatformAdminUserId,
        });
        results.activities++;
      }
    }
    console.log(`  ✓ Created ${projectCount} projects with activities`);

    // Create mock organization contacts
    for (const contactData of MOCK_CONTACTS) {
      await db.insert(organizationContactsTable).values({
        ...contactData,
        organizationId,
        createdBy: currentPlatformAdminUserId,
      });
      results.contacts++;
    }
    console.log(`  ✓ Created ${MOCK_CONTACTS.length} organization contacts`);
  }

  console.log("\n✅ Mock organization seed complete!\n");
  console.log("Summary:");
  console.log(`  - Organizations: ${results.organizations.length}`);
  console.log(`  - Team Members: ${results.teamMembers}`);
  console.log(`  - Projects: ${results.projects}`);
  console.log(`  - Contacts: ${results.contacts}`);
  console.log(`  - Activities: ${results.activities}`);
  console.log("\n");

  return results;
}

/**
 * Clear all mock organizations and related data
 */
export async function clearMockOrganizations() {
  console.log("\n🗑️  Clearing mock organizations...\n");

  const mockSlugs = MOCK_ORGANIZATIONS.map((org) => org.slug);

  // Get organization IDs
  const orgs = await db
    .select()
    .from(organizationsTable)
    .where(inArray(organizationsTable.slug, mockSlugs));

  if (orgs.length === 0) {
    console.log("  ℹ️  No mock organizations found to clear");
    return { cleared: 0 };
  }

  const orgIds = orgs.map((org) => org.id);

  // Delete will cascade to related tables (user_roles, projects, activities, contacts, etc.)
  for (const orgId of orgIds) {
    await db.delete(organizationsTable).where(eq(organizationsTable.id, orgId));
  }

  console.log(`  ✓ Cleared ${orgs.length} mock organizations and all related data\n`);

  return { cleared: orgs.length };
}
