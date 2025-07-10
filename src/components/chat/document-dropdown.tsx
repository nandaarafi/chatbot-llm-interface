import { useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useSWR from 'swr';
import { Document } from '@/lib/db/schema';
import { Skeleton } from '@/components/ui/skeleton';

interface DocumentDropdownProps {
    selectedDocuments: Document[];
    onSelect: (doc: Document) => void;
    onRemove: (docId: string) => void;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    throw error;
  }
  return res.json();
};

export function DocumentDropdown({ selectedDocuments, onSelect, onRemove }: DocumentDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
  const { data: documents, error, isLoading, mutate } = useSWR<Document[]>(
    isOpen ? '/api/documents' : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Refresh data when opening the dropdown
      mutate();
    }
  };
  const isDocumentSelected = (docId: string) => {
    return selectedDocuments.some(doc => doc.id === docId);
  };

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Plus className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
  align="start" 
  className="w-64"
  side="top"
  sideOffset={5}
>
  {isLoading ? (
    <DropdownMenuItem 
      className="flex flex-col items-start gap-1 cursor-default"
      onSelect={(e) => e.preventDefault()}
    >
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </DropdownMenuItem>
  ) : error ? (
    <DropdownMenuItem 
      className="text-red-500 cursor-default"
      onSelect={(e) => e.preventDefault()}
    >
      Failed to load documents
    </DropdownMenuItem>
  ) : documents?.length ? (
    documents.map((doc) => (
      <DropdownMenuItem 
        key={doc.id} 
        onClick={() => !isDocumentSelected(doc.id) && onSelect(doc)}
        className={`cursor-pointer ${isDocumentSelected(doc.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={isDocumentSelected(doc.id)}
      >
        <FileText className="h-4 w-4 text-muted-foreground mr-2" />
        <span className="truncate">{doc.name}</span>
      </DropdownMenuItem>
    ))
  ) : (
    <DropdownMenuItem 
      className="text-muted-foreground cursor-default"
      onSelect={(e) => e.preventDefault()}
    >
      <FileText className="h-4 w-4 text-muted-foreground mr-2 opacity-0" />
      No documents found
    </DropdownMenuItem>
  )}
</DropdownMenuContent>
    </DropdownMenu>
  );
}