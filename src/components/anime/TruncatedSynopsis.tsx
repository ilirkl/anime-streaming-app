'use client';

import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';

// Helper function to truncate text
const truncateText = (text: string, maxLength: number = 500) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

interface TruncatedSynopsisProps {
  text: string;
  maxLength?: number;
}

export function TruncatedSynopsis({ text, maxLength = 500 }: TruncatedSynopsisProps) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = text && text.length > maxLength;
  
  if (!text) return null;
  
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Synopsis</h2>
      <p className="text-muted-foreground">
        {expanded ? text : truncateText(text, maxLength)}
      </p>
      {needsTruncation && (
        <button 
          onClick={() => setExpanded(!expanded)} 
          className="text-xs text-primary hover:text-primary/80 mt-2 flex items-center"
        >
          {expanded ? 'Show Less' : 'Read More'}
          <MoreHorizontal className="h-3 w-3 ml-1" />
        </button>
      )}
    </div>
  );
}
