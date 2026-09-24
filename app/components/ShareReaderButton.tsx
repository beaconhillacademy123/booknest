'use client';

import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';

export default function ShareReaderButton({ title, chapter }: { title: string; chapter: number }) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  async function share() {
    if (sharing) return;
    setSharing(true);
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: title + ' — Chapter ' + chapter + ' | M King Reads',
          text: 'Read Chapter ' + chapter + ' of ' + title + ' on M King Reads.',
          url
        });
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
    <button onClick={share} aria-label={sharing ? "Sharing this chapter" : "Share this chapter"} title={sharing ? "Sharing…" : "Share this chapter"} disabled={sharing}>
      {copied ? <Check size={18} /> : <Share2 size={18} />}
    </button>
  );
}
