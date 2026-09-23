'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

type Props = {
  bookId: string;
};

export default function ResumeBookButton({ bookId }: Props) {
  const [resume, setResume] = useState<{ chapter: number; position: number } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`booknest-last-reader-${bookId}`);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const chapter = Number(parsed?.chapter);
      const position = Number(parsed?.position);
      if (Number.isFinite(chapter) && chapter > 0) {
        setResume({
          chapter: Math.floor(chapter),
          position: Number.isFinite(position) && position > 0 ? Math.floor(position) : 0
        });
      }
    } catch {
      // Ignore malformed local reader state.
    }
  }, [bookId]);

  if (!resume) return null;

  return (
    <Link className="secondary resumeBookButton" href={`/read/${bookId}?chapter=${resume.chapter}`}>
      <BookOpen size={16} />
      Continue reading · Chapter {resume.chapter}
    </Link>
  );
}
