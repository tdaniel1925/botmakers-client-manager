"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MessageSquare,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface MessageLog {
  id: string;
  messageType: "sms" | "email";
  recipient: string;
  subject?: string;
  body: string;
  status: "pending" | "sent" | "failed" | "bounced" | "delivered";
  sentAt?: Date;
  deliveredAt?: Date;
  errorMessage?: string;
  templateName?: string;
  contactName?: string;
  createdAt: Date;
}

interface MessageLogsProps {
  logs: MessageLog[];
  onViewDetails?: (log: MessageLog) => void;
}

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-gray-500", icon: Clock },
  sent: { label: "Sent", color: "bg-blue-500", icon: CheckCircle2 },
  delivered: { label: "Delivered", color: "bg-green-500", icon: CheckCircle2 },
  failed: { label: "Failed", color: "bg-red-500", icon: XCircle },
  bounced: { label: "Bounced", color: "bg-orange-500", icon: XCircle },
};

export function MessageLogs({ logs, onViewDetails }: MessageLogsProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "sms" | "email">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.recipient.toLowerCase().includes(search.toLowerCase()) ||
      log.contactName?.toLowerCase().includes(search.toLowerCase()) ||
      log.subject?.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = typeFilter === "all" || log.messageType === typeFilter;
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: logs.length,
    sent: logs.filter((l) => l.status === "sent" || l.status === "delivered").length,
    failed: logs.filter((l) => l.status === "failed" || l.status === "bounced").length,
    pending: logs.filter((l) => l.status === "pending").length,
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Message Delivery Log</h3>
            <p className="text-sm text-gray-500">
              Track SMS and email delivery status
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-gray-500">Total Messages</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
              <p className="text-xs text-gray-500">Sent/Delivered</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <p className="text-xs text-gray-500">Failed/Bounced</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
              <p className="text-xs text-gray-500">Pending</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by recipient, contact, or subject..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Message Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sms">SMS Only</SelectItem>
                <SelectItem value="email">Email Only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="bounced">Bounced</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  {logs.length === 0 ? "No messages sent yet" : "No messages match your filters"}
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => {
                const statusConfig = STATUS_CONFIG[log.status];
                const StatusIcon = statusConfig.icon;

                return (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {log.messageType === "sms" ? (
                          <div className="p-1.5 bg-green-100 rounded">
                            <MessageSquare className="h-3.5 w-3.5 text-green-600" />
                          </div>
                        ) : (
                          <div className="p-1.5 bg-blue-100 rounded">
                            <Mail className="h-3.5 w-3.5 text-blue-600" />
                          </div>
                        )}
                        <span className="text-sm capitalize">{log.messageType}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{log.contactName || "Unknown"}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-mono text-gray-600">{log.recipient}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{log.templateName || "—"}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${statusConfig.color} text-white border-0`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {log.sentAt
                          ? formatDistanceToNow(log.sentAt, { addSuffix: true })
                          : "—"}
                      </div>
                      {log.errorMessage && (
                        <div className="text-xs text-red-600 mt-1">
                          {log.errorMessage}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails?.(log)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

