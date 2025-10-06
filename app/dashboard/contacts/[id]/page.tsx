"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContactFormDialog } from "@/components/crm/contact-form-dialog";
import { getContactByIdAction } from "@/actions/contacts-actions";
import { getActivitiesAction } from "@/actions/activities-actions";
import { getUserOrganizationsAction } from "@/actions/organizations-actions";
import { SelectContact, SelectActivity } from "@/db/schema";
import { ArrowLeft, Mail, Phone, Building2, Briefcase, Calendar, Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;
  
  const [contact, setContact] = useState<SelectContact | null>(null);
  const [activities, setActivities] = useState<SelectActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    loadContact();
  }, [contactId]);

  const loadContact = async () => {
    setLoading(true);
    try {
      // Get user's organization
      const orgsResult = await getUserOrganizationsAction();
      if (orgsResult.isSuccess && orgsResult.data && orgsResult.data.length > 0) {
        const orgId = orgsResult.data[0].id;
        setOrganizationId(orgId);
        
        // Fetch contact
        const contactResult = await getContactByIdAction(contactId, orgId);
        if (contactResult.isSuccess && contactResult.data) {
          setContact(contactResult.data);
          
          // Fetch related activities
          const activitiesResult = await getActivitiesAction(orgId, {
            contactId: contactId,
            limit: 10,
          });
          if (activitiesResult.isSuccess && activitiesResult.data) {
            setActivities(activitiesResult.data.activities);
          }
        } else {
          toast({ title: "Error", description: "Contact not found", variant: "destructive" });
          router.push("/dashboard/contacts");
        }
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load contact", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "lead":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "archived":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <main className="p-6 md:p-10">
        <p className="text-gray-500">Loading contact...</p>
      </main>
    );
  }

  if (!contact) {
    return (
      <main className="p-6 md:p-10">
        <p className="text-gray-500">Contact not found</p>
      </main>
    );
  }

  return (
    <main className="p-6 md:p-10">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/contacts" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Contacts
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {contact.firstName} {contact.lastName}
            </h1>
            <div className="flex items-center gap-3 text-gray-600">
              {contact.jobTitle && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {contact.jobTitle}
                </span>
              )}
              {contact.company && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {contact.company}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusBadgeColor(contact.status)}>
              {contact.status}
            </Badge>
            <ContactFormDialog
              organizationId={organizationId}
              contact={contact}
              onSuccess={loadContact}
              trigger={
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              }
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contact.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                      {contact.email}
                    </a>
                  </div>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                      {contact.phone}
                    </a>
                  </div>
                </div>
              )}
              {contact.company && (
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Company</p>
                    <p>{contact.company}</p>
                  </div>
                </div>
              )}
              {contact.jobTitle && (
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Job Title</p>
                    <p>{contact.jobTitle}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {contact.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 whitespace-pre-wrap">{contact.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Activities related to this contact
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-sm text-gray-500">No activities found</p>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3 border-l-2 border-gray-200 pl-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {activity.type}
                          </Badge>
                          {activity.completed && (
                            <Badge variant="secondary" className="text-xs">
                              Completed
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium">{activity.subject}</p>
                        {activity.description && (
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {activity.dueDate && new Date(activity.dueDate).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {contact.email && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`mailto:${contact.email}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </a>
                </Button>
              )}
              {contact.phone && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`tel:${contact.phone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call
                  </a>
                </Button>
              )}
              <Link href="/dashboard/activities">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Meeting
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Created</p>
                <p>{new Date(contact.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Last Updated</p>
                <p>{new Date(contact.updatedAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}




