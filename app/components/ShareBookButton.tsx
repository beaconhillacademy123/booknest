'use client';

import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';

export default function ShareBookButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  async function share() {
    if (sharing) return;
    setSharing(true);
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: title + ' — M King Reads', text: 'Read this book on M King Reads.', url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {} finally {
      setSharing(false);
    }
  }

  return (
    <button className="secondary shareBookButton" onClick={share} disabled={sharing}>
      {copied ? <Check size={16} /> : <Share2 size={16} />}
      {sharing ? 'Sharing…' : copied ? 'Link copied' : 'Share book'}
    </button>
  );
}
