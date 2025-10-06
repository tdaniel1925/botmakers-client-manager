import { Card, CardContent } from "@/components/ui/card";
import { getAllOrganizationsAction } from "@/actions/platform-actions";
import { Building2, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function OrganizationsPage() {
  const orgsResult = await getAllOrganizationsAction();
  const organizations = orgsResult.data || [];

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
            <Link
              key={org.id}
              href={`/platform/organizations/${org.id}`}
              className="block"
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{org.name}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {org.userCount} user{org.userCount !== 1 ? 's' : ''}
                          </span>
                          <span>Created {new Date(org.createdAt).toLocaleDateString()}</span>
                          {org.slug && <span className="font-mono text-xs">/{org.slug}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right mr-4">
                        <Badge variant={org.status === 'active' ? 'default' : 'secondary'} className="mb-1">
                          {org.status}
                        </Badge>
                        <div className="text-xs text-gray-500 capitalize">{org.plan} plan</div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details →
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}

