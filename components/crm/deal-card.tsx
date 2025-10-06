import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SelectDeal } from "@/db/schema";
import { DollarSign, Calendar, User } from "lucide-react";
import Link from "next/link";

interface DealCardProps {
  deal: SelectDeal & { contactName?: string };
  isDragging?: boolean;
}

export function DealCard({ deal, isDragging }: DealCardProps) {
  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <Link href={`/dashboard/deals/${deal.id}`}>
      <Card 
        className={`mb-3 cursor-pointer hover:shadow-md transition-all ${
          isDragging ? 'opacity-50 rotate-2' : ''
        }`}
      >
        <CardContent className="p-4">
          <h3 className="font-medium text-sm mb-2 line-clamp-2">{deal.title}</h3>
          
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(deal.value)}
            </span>
          </div>

          <div className="space-y-2">
            {deal.contactName && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <User className="h-3 w-3" />
                {deal.contactName}
              </div>
            )}
            
            {deal.expectedCloseDate && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Calendar className="h-3 w-3" />
                {new Date(deal.expectedCloseDate).toLocaleDateString()}
              </div>
            )}
            
            <div className="flex items-center justify-between pt-2">
              <Badge variant="secondary" className="text-xs">
                {deal.probability}%
              </Badge>
              <span className="text-xs text-gray-400">
                {new Date(deal.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}




