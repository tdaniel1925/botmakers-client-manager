"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getAllOrganizationsAction } from "@/actions/platform-actions";
import { updateOrganizationAction } from "@/actions/organizations-admin-actions";
import { Building2, Users, Edit, Eye } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditOrganizationDialog } from "@/components/platform/edit-organization-dialog";
import { toast } from "sonner";
import { startImpersonationAction } from "@/actions/impersonation-actions";
import { useRouter } from "next/navigation";

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingOrg, setEditingOrg] = useState<any | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [impersonatingOrgId, setImpersonatingOrgId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    setIsLoading(true);
    const orgsResult = await getAllOrganizationsAction();
    setOrganizations(orgsResult.data || []);
    setIsLoading(false);
  };

  const handleEditClick = (e: React.MouseEvent, org: any) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingOrg(org);
    setEditDialogOpen(true);
  };

  const handleUpdateOrganization = async (data: any) => {
    if (!editingOrg) return;
    
    const result = await updateOrganizationAction(editingOrg.id, data);
    
    if (result.isSuccess) {
      toast.success("Organization updated successfully", {
        duration: 3000,
        icon: '✅',
      });
      
      // Update the organization in the list
      setOrganizations(prev => 
        prev.map(org => 
          org.id === editingOrg.id ? { ...org, ...data } : org
        )
      );
      setEditDialogOpen(false);
    } else {
      toast.error(result.message);
      throw new Error(result.message);
    }
  };

  const handleImpersonate = async (e: React.MouseEvent, org: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    setImpersonatingOrgId(org.id);
    
    try {
      const result = await startImpersonationAction(org.id, "Admin testing/support");
      
      if (result.success) {
        toast.success(`Now viewing as ${org.name}`, {
          description: "You are in impersonation mode. Click 'Exit' in the banner to return.",
          icon: "🎭",
          duration: 5000,
        });
        
        // Redirect to organization dashboard
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to start impersonation");
        setImpersonatingOrgId(null);
      }
    } catch (error) {
      toast.error("Failed to start impersonation");
      console.error("[Impersonation] Error:", error);
      setImpersonatingOrgId(null);
    }
  };

  if (isLoading) {
    return (
      <main className="p-6 lg:p-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading organizations...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 lg:p-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Organizations</h1>
          <p className="text-gray-600">Manage all client organizations</p>
        </div>
        <Link href="/platform/organizations/new">
          <Button>
            <Building2 className="h-4 w-4 mr-2" />
            Create Organization
          </Button>
        </Link>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 gap-4">
        {organizations.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No organizations yet</p>
              <Link href="/platform/organizations/new">
                <Button>Create your first organization</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          organizations.map((org) => (
            <Card key={org.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/platform/organizations/${org.id}`}
                    className="flex items-center gap-4 flex-1 min-w-0"
                  >
                    <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-gray-900 truncate">{org.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {org.userCount} user{org.userCount !== 1 ? 's' : ''}
                        </span>
                        <span>Created {new Date(org.createdAt).toLocaleDateString()}</span>
                        {org.slug && <span className="font-mono text-xs">/{org.slug}</span>}
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right mr-4">
                      <Badge variant={org.status === 'active' ? 'default' : 'secondary'} className="mb-1">
                        {org.status}
                      </Badge>
                      <div className="text-xs text-gray-500 capitalize">{org.plan} plan</div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => handleImpersonate(e, org)}
                      disabled={impersonatingOrgId === org.id}
                      title="Login as this organization"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => handleEditClick(e, org)}
                      title="Edit organization"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Link href={`/platform/organizations/${org.id}`}>
                      <Button variant="outline" size="sm">
                        View Details →
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Organization Dialog */}
      <EditOrganizationDialog
        organization={editingOrg}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleUpdateOrganization}
      />
    </main>
  );
}

