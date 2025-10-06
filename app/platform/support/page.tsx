import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, AlertCircle } from "lucide-react";
import { getAllSupportTicketsAction } from "@/actions/support-actions";
import Link from "next/link";

export default async function PlatformSupportPage() {
  const ticketsResult = await getAllSupportTicketsAction();
  const tickets = ticketsResult.data || [];

  const openTickets = tickets.filter(t => t.status === "open" || t.status === "in_progress");

  return (
    <main className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Support Tickets</h1>
        <p className="text-gray-600">Manage support requests from organizations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Tickets</p>
                <p className="text-2xl font-bold">{tickets.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Open/In Progress</p>
                <p className="text-2xl font-bold">{openTickets.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">High Priority</p>
                <p className="text-2xl font-bold">
                  {tickets.filter(t => t.priority === "high" || t.priority === "critical").length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <Card>
        <CardContent className="p-6">
          {tickets.length === 0 ? (
            <div className="text-center py-10">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No support tickets yet</p>
              <p className="text-sm text-gray-500">Tickets will appear here when users submit them</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/platform/support/${ticket.id}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {ticket.organizationName} · Ticket #{ticket.id.slice(0, 8)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        ticket.status === "open" ? "destructive" :
                        ticket.status === "in_progress" ? "default" :
                        ticket.status === "resolved" ? "secondary" :
                        "outline"
                      }>
                        {ticket.status.replace("_", " ")}
                      </Badge>
                      <Badge variant={
                        ticket.priority === "critical" ? "destructive" :
                        ticket.priority === "high" ? "destructive" :
                        ticket.priority === "medium" ? "default" :
                        "secondary"
                      }>
                        {ticket.priority}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{ticket.description}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Created {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

