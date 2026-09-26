'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronRight, X } from 'lucide-react';

type LastBook = {
  bookId: string;
  chapter: number;
  position: number;
  title: string;
  author: string;
  coverUrl?: string | null;
  resumeHref?: string;
};

const DISMISSED_KEY = 'm-king-reads-dismiss-continue-reading';

export default function ContinueReading() {
  const [book, setBook] = useState<LastBook | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISSED_KEY) === '1') return;
      const raw = localStorage.getItem('m-king-reads-last-book');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.bookId && parsed?.title && Number(parsed.chapter) > 0) {
        setBook({
          bookId: String(parsed.bookId),
          chapter: Math.floor(Number(parsed.chapter)),
          position: Math.max(0, Math.floor(Number(parsed.position) || 0)),
          title: String(parsed.title),
          author: String(parsed.author || ''),
          coverUrl: parsed.coverUrl || null,
          resumeHref: typeof parsed.resumeHref === 'string' ? parsed.resumeHref : undefined
        });
      }
    } catch {}
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {}
    setBook(null);
  };

  if (!book) return null;

  return (
    <section className="continueReading">
      <button
        type="button"
        className="continueReadingDismiss"
        onClick={dismiss}
        aria-label="Dismiss continue reading"
        title="Dismiss"
      >
        <X size={14} />
      </button>
      <div className="continueReadingCover">
        {book.coverUrl ? <img src={book.coverUrl} alt="" /> : <BookOpen size={28} />}
      </div>
      <div className="continueReadingCopy">
        <span className="sectionKicker">PICK UP WHERE YOU LEFT OFF</span>
        <h2>{book.title}</h2>
        <p>{book.author} · Chapter {book.chapter}</p>
      </div>
      <Link className="continueReadingButton" href={book.resumeHref || ('/read/' + book.bookId + '?chapter=' + book.chapter)}>
        Continue reading <ChevronRight size={17} />
      </Link>
    </section>
  );
}
