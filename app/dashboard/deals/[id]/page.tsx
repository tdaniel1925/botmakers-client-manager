"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DealFormDialog } from "@/components/crm/deal-form-dialog";
import { getDealByIdAction } from "@/actions/deals-actions";
import { getContactByIdAction } from "@/actions/contacts-actions";
import { getUserOrganizationsAction } from "@/actions/organizations-actions";
import { SelectDeal, SelectContact } from "@/db/schema";
import { ArrowLeft, DollarSign, Calendar, TrendingUp, User, Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id as string;
  
  const [deal, setDeal] = useState<SelectDeal | null>(null);
  const [contact, setContact] = useState<SelectContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    loadDeal();
  }, [dealId]);

  const loadDeal = async () => {
    setLoading(true);
    try {
      const orgsResult = await getUserOrganizationsAction();
      if (orgsResult.isSuccess && orgsResult.data && orgsResult.data.length > 0) {
        const orgId = orgsResult.data[0].id;
        setOrganizationId(orgId);
        
        const dealResult = await getDealByIdAction(dealId, orgId);
        if (dealResult.isSuccess && dealResult.data) {
          setDeal(dealResult.data);
          
          // Load associated contact if exists
          if (dealResult.data.contactId) {
            const contactResult = await getContactByIdAction(dealResult.data.contactId, orgId);
            if (contactResult.isSuccess && contactResult.data) {
              setContact(contactResult.data);
            }
          }
        } else {
          toast({ title: "Error", description: "Deal not found", variant: "destructive" });
          router.push("/dashboard/deals");
        }
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load deal", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="p-6 md:p-10">
        <p className="text-gray-500">Loading deal...</p>
      </main>
    );
  }

  if (!deal) {
    return (
      <main className="p-6 md:p-10">
        <p className="text-gray-500">Deal not found</p>
      </main>
    );
  }

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  return (
    <main className="p-6 md:p-10">
      <div className="mb-8">
        <Link href="/dashboard/deals" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Pipeline
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{deal.title}</h1>
            <div className="flex items-center gap-3 text-gray-600">
              <Badge className="capitalize">{deal.stage}</Badge>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(deal.value)}
              </span>
            </div>
          </div>
          <DealFormDialog
            organizationId={organizationId}
            deal={deal}
            onSuccess={loadDeal}
            trigger={
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Value</p>
                    <p className="font-semibold">{formatCurrency(deal.value)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Probability</p>
                    <p className="font-semibold">{deal.probability}%</p>
                  </div>
                </div>
              </div>

              {deal.expectedCloseDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Expected Close Date</p>
                    <p>{new Date(deal.expectedCloseDate).toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              {contact && (
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <Link 
                      href={`/dashboard/contacts/${contact.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {contact.firstName} {contact.lastName}
                    </Link>
                    {contact.company && (
                      <p className="text-sm text-gray-500">{contact.company}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {deal.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 whitespace-pre-wrap">{deal.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deal Stage</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="text-lg py-2 px-4 capitalize">{deal.stage}</Badge>
              <p className="text-sm text-gray-500 mt-4">
                Move this deal through your pipeline by editing the stage
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Created</p>
                <p>{new Date(deal.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Last Updated</p>
                <p>{new Date(deal.updatedAt).toLocaleDateString()}</p>
              </div>
              {deal.actualCloseDate && (
                <div>
                  <p className="text-gray-500">Closed Date</p>
                  <p>{new Date(deal.actualCloseDate).toLocaleDateString()}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}



