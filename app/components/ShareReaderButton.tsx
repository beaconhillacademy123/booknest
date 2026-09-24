'use client';

import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';

export default function ShareReaderButton({ title, chapter }: { title: string; chapter: number }) {
  const [copied, setCopied] = useState(false);

  async function share() {
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
    } catch {}
  }

  return (
    <button onClick={share} aria-label="Share this chapter" title="Share this chapter">
      {copied ? <Check size={18} /> : <Share2 size={18} />}
    </button>
  );
}
