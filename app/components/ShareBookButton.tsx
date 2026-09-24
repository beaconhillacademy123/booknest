'use client';

import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';

export default function ShareBookButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: title + ' — M King Reads', text: 'Read this book on M King Reads.', url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  return (
    <button className="secondary shareBookButton" onClick={share}>
      {copied ? <Check size={16} /> : <Share2 size={16} />}
      {copied ? 'Link copied' : 'Share book'}
    </button>
  );
}
