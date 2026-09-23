'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bookmark, ChevronLeft, ChevronRight, Home, List, Moon, Sun, Type } from 'lucide-react';

type Props = {
  bookId: string;
  title: string;
  author: string;
  coverUrl: string | null;
  chapter: number;
  chapterCount: number;
  content: string;
  sourceUrl: string | null;
  chapterLabel: string;
  nextHref?: string;
  prevHref?: string;
};

export default function Reader({
  bookId, title, author, coverUrl, chapter, chapterCount, content, sourceUrl, chapterLabel, nextHref, prevHref
}: Props) {
  const storageKey = `booknest-progress-${bookId}-${chapter}`;
  const [fontSize, setFontSize] = useState(19);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [saved, setSaved] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const savedFont = Number(localStorage.getItem('booknest-font-size') || 19);
    const savedTheme = (localStorage.getItem('booknest-reader-theme') || 'light') as 'light' | 'sepia' | 'dark';
    const savedBookmark = localStorage.getItem(`booknest-bookmark-${bookId}`) === String(chapter);
    setFontSize(Math.min(25, Math.max(16, savedFont)));
    setTheme(savedTheme);
    setSaved(savedBookmark);

    const restore = () => {
      const y = Number(localStorage.getItem(storageKey) || 0);
      if (y > 0) window.scrollTo(0, y);
    };
    setTimeout(restore, 120);
  }, [bookId, chapter, storageKey]);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
      setProgress(pct);
      localStorage.setItem(storageKey, String(Math.round(window.scrollY)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [storageKey]);

  const bodyClass = `reader reader-${theme}`;

  function changeFont(delta: number) {
    const next = Math.min(25, Math.max(16, fontSize + delta));
    setFontSize(next);
    localStorage.setItem('booknest-font-size', String(next));
  }

  function changeTheme(next: 'light' | 'sepia' | 'dark') {
    setTheme(next);
    localStorage.setItem('booknest-reader-theme', next);
  }

  function toggleBookmark() {
    const key = `booknest-bookmark-${bookId}`;
    if (saved) {
      localStorage.removeItem(key);
      setSaved(false);
    } else {
      localStorage.setItem(key, String(chapter));
      setSaved(true);
    }
  }

  return (
    <main className={bodyClass}>
      <div className="readerProgress"><span style={{ width: `${progress}%` }} /></div>
      <header className="readerTopbar">
        <Link href={`/book/${bookId}`} className="readerBrand"><Home size={17}/><span>BookNest</span></Link>
        <div className="readerTitle"><strong>{title}</strong><small>{author}</small></div>
        <div className="readerTools">
          <button onClick={() => changeFont(-1)} aria-label="Decrease text size"><Type size={15}/><span>A</span></button>
          <button onClick={() => changeFont(1)} aria-label="Increase text size"><Type size={18}/><span>A</span></button>
          <button onClick={() => changeTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle dark mode">{theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}</button>
          <button className={saved ? 'readerSaved' : ''} onClick={toggleBookmark} aria-label="Bookmark chapter"><Bookmark size={18} fill={saved ? 'currentColor' : 'none'}/></button>
        </div>
      </header>

      <div className="readerLayout">
        <aside className="readerAside">
          {coverUrl && <img src={coverUrl} alt="" />}
          <div>
            <span>READING</span>
            <h1>{title}</h1>
            <p>{author}</p>
          </div>
          <div className="readerMenu">
            <span><List size={15}/> Chapter {chapter} of {chapterCount}</span>
            <span>{Math.round(progress)}% through this chapter</span>
          </div>
        </aside>

        <article className="readerArticle">
          <div className="readerArticleHead">
            <span>CHAPTER {chapter}</span>
            <h2>{chapterLabel}</h2>
          </div>
          <div className="readerBody" style={{ fontSize: `${fontSize}px` }} dangerouslySetInnerHTML={{ __html: content }} />
          <div className="readerNav">
            {prevHref ? <Link href={prevHref}><ChevronLeft size={18}/> Previous</Link> : <span />}
            <Link href={`/book/${bookId}`}>Book details</Link>
            {nextHref ? <Link href={nextHref}>Next <ChevronRight size={18}/></Link> : <span />}
          </div>
          {sourceUrl && <p className="readerSource">This reading edition is presented from an open ebook source. <a href={sourceUrl} target="_blank" rel="noreferrer">View source</a>.</p>}
        </article>
      </div>
    </main>
  );
}
