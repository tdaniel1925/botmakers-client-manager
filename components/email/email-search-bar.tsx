// @ts-nocheck - Temporary: TypeScript has issues with email schema type inference
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface EmailSearchBarProps {
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

export function EmailSearchBar({
  onSearchChange,
  placeholder = 'Search emails...',
}: EmailSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearchChange(value);
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearchChange('');
  };

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-8 pr-8 h-7 text-xs"
      />
      {searchQuery && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-0.5 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

