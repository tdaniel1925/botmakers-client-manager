"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Edit, Trash2, Star, Smartphone, Building } from "lucide-react";
import type { SelectOrganizationContact } from "@/db/schema";

interface OrganizationContactCardProps {
  contact: SelectOrganizationContact;
  onEdit: (contactId: string) => void;
  onDelete: (contactId: string) => void;
}

export function OrganizationContactCard({
  contact,
  onEdit,
  onDelete,
}: OrganizationContactCardProps) {
  return (
    <Card className={`hover:shadow-md transition-shadow ${contact.isPrimary ? 'border-green-500 border-2' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">
                {contact.firstName} {contact.lastName}
              </h3>
              {contact.isPrimary && (
                <Badge variant="default" className="text-xs bg-green-600">
                  <Star className="h-3 w-3 mr-1 fill-white" />
                  Primary
                </Badge>
              )}
              {!contact.isActive && (
                <Badge variant="destructive" className="text-xs">
                  Inactive
                </Badge>
              )}
            </div>
            {contact.jobTitle && (
              <p className="text-sm font-medium text-gray-700">{contact.jobTitle}</p>
            )}
            {contact.department && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Building className="h-3 w-3" />
                <span>{contact.department}</span>
              </div>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(contact.id)}
              title="Edit contact"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(contact.id)}
              title="Delete contact"
              className="hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          {contact.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <a 
                href={`mailto:${contact.email}`} 
                className="hover:underline hover:text-blue-600 break-all"
              >
                {contact.email}
              </a>
            </div>
          )}
          
          {contact.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <a 
                href={`tel:${contact.phone}`}
                className="hover:underline hover:text-blue-600"
              >
                {contact.phone}
              </a>
            </div>
          )}
          
          {contact.mobilePhone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Smartphone className="h-4 w-4 flex-shrink-0" />
              <a 
                href={`tel:${contact.mobilePhone}`}
                className="hover:underline hover:text-blue-600"
              >
                {contact.mobilePhone} <span className="text-xs text-gray-400">(mobile)</span>
              </a>
            </div>
          )}
          
          {(contact.city || contact.state) && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>
                {contact.city}
                {contact.city && contact.state && ", "}
                {contact.state}
              </span>
            </div>
          )}
          
          {contact.notes && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 italic line-clamp-2">
                {contact.notes}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
