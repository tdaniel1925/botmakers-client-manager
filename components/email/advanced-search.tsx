/**
 * Advanced Email Search Component
 * Semantic search with filters and AI-powered query understanding
 */

'use client';

import { useState } from 'react';
import { Search, Calendar, User, Tag, Sparkles, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SearchFilters {
  query: string;
  from?: string;
  to?: string;
  dateFrom?: string;
  dateTo?: string;
  hasAttachment?: boolean;
  isUnread?: boolean;
  isStarred?: boolean;
  priority?: string;
  folder?: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClose: () => void;
}

export function AdvancedSearch({ onSearch, onClose }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({ query: '' });
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="bg-background border shadow-2xl rounded-lg w-full max-w-3xl">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Advanced Search</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Form */}
        <div className="p-6 space-y-4">
          {/* Main Query */}
          <div className="space-y-2">
            <Label htmlFor="search-query">Search Query</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-query"
                type="text"
                value={filters.query}
                onChange={(e) => updateFilter('query', e.target.value)}
                placeholder="Search emails by subject, content, or semantic meaning..."
                className="pl-10"
                autoFocus
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              <span>AI-powered semantic search understands natural language queries</span>
            </div>
          </div>

          {/* Toggle Advanced Filters */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
          </Button>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="space-y-4 pt-2 border-t">
              <div className="grid grid-cols-2 gap-4">
                {/* From */}
                <div className="space-y-2">
                  <Label htmlFor="filter-from">From</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="filter-from"
                      type="email"
                      value={filters.from || ''}
                      onChange={(e) => updateFilter('from', e.target.value)}
                      placeholder="sender@example.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* To */}
                <div className="space-y-2">
                  <Label htmlFor="filter-to">To</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="filter-to"
                      type="email"
                      value={filters.to || ''}
                      onChange={(e) => updateFilter('to', e.target.value)}
                      placeholder="recipient@example.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Date From */}
                <div className="space-y-2">
                  <Label htmlFor="filter-date-from">Date From</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="filter-date-from"
                      type="date"
                      value={filters.dateFrom || ''}
                      onChange={(e) => updateFilter('dateFrom', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Date To */}
                <div className="space-y-2">
                  <Label htmlFor="filter-date-to">Date To</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="filter-date-to"
                      type="date"
                      value={filters.dateTo || ''}
                      onChange={(e) => updateFilter('dateTo', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="filter-priority">Priority</Label>
                  <Select
                    value={filters.priority}
                    onValueChange={(value) => updateFilter('priority', value)}
                  >
                    <SelectTrigger id="filter-priority">
                      <SelectValue placeholder="Any priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Folder */}
                <div className="space-y-2">
                  <Label htmlFor="filter-folder">Folder</Label>
                  <Select
                    value={filters.folder}
                    onValueChange={(value) => updateFilter('folder', value)}
                  >
                    <SelectTrigger id="filter-folder">
                      <SelectValue placeholder="Any folder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INBOX">Inbox</SelectItem>
                      <SelectItem value="SENT">Sent</SelectItem>
                      <SelectItem value="DRAFTS">Drafts</SelectItem>
                      <SelectItem value="STARRED">Starred</SelectItem>
                      <SelectItem value="ARCHIVE">Archive</SelectItem>
                      <SelectItem value="TRASH">Trash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasAttachment}
                    onChange={(e) => updateFilter('hasAttachment', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm">Has attachment</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.isUnread}
                    onChange={(e) => updateFilter('isUnread', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm">Unread only</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.isStarred}
                    onChange={(e) => updateFilter('isStarred', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm">Starred only</span>
                </label>
              </div>
            </div>
          )}

          {/* Suggested Searches */}
          <div className="pt-2 border-t space-y-2">
            <Label className="text-xs text-muted-foreground uppercase">
              Suggested Searches
            </Label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateFilter('query', 'emails from clients needing response')}
                className="px-3 py-1.5 text-xs bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
              >
                Needs response
              </button>
              <button
                onClick={() => updateFilter('query', 'important emails from this week')}
                className="px-3 py-1.5 text-xs bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
              >
                This week's important
              </button>
              <button
                onClick={() => updateFilter('query', 'emails with invoices or receipts')}
                className="px-3 py-1.5 text-xs bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
              >
                Invoices & receipts
              </button>
              <button
                onClick={() => updateFilter('query', 'meeting requests')}
                className="px-3 py-1.5 text-xs bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
              >
                Meeting requests
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex items-center justify-between">
          <Button variant="outline" onClick={handleClear}>
            Clear All
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSearch} disabled={!filters.query.trim()}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

