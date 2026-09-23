'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bookmark, ChevronLeft, ChevronRight, Home, List, Moon, Sun } from 'lucide-react';
import { supabase } from '../../../lib/supabase-browser';

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
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user.id ?? null;
      setUserId(uid);
      if (uid) {
        const { data: savedProgress } = await supabase.from('booknest_reading_progress').select('progress').eq('user_id', uid).eq('book_id', bookId).maybeSingle();
        if (savedProgress && chapter === 1) setProgress(Number(savedProgress.progress ?? 0));
      }
    });

    const savedFont = Number(localStorage.getItem('booknest-font-size') || 19);
    const savedTheme = (localStorage.getItem('booknest-reader-theme') || 'light') as 'light' | 'sepia' | 'dark';
    const savedBookmark = localStorage.getItem(`booknest-bookmark-${bookId}`) === String(chapter);
    setFontSize(Math.min(26, Math.max(16, savedFont)));
    setTheme(savedTheme);
    setSaved(savedBookmark);

    const restore = () => {
      const y = Number(localStorage.getItem(storageKey) || 0);
      if (y > 0) window.scrollTo(0, y);
    };
    setTimeout(restore, 120);
  }, [bookId, chapter, storageKey]);

  useEffect(() => {
    const updateProgress = () => {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      const pct = Math.min(100, Math.max(0, (window.scrollY / max) * 100));
      setProgress(pct);
      localStorage.setItem(storageKey, String(Math.round(window.scrollY)));
      if (userId) {
        void supabase.from('booknest_reading_progress').upsert({ user_id: userId, book_id: bookId, progress: Number(pct.toFixed(2)), updated_at: new Date().toISOString() });
      }
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    const timer = window.setTimeout(updateProgress, 250);
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
      window.clearTimeout(timer);
    };
  }, [storageKey, content, userId, bookId]);

  const bodyClass = `reader reader-${theme}`;

  function changeFont(delta: number) {
    setFontSize(current => {
      const next = Math.min(26, Math.max(16, current + delta));
      localStorage.setItem('booknest-font-size', String(next));
      return next;
    });
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
      if (userId) void supabase.from('booknest_bookmarks').delete().eq('user_id', userId).eq('book_id', bookId).eq('location', `chapter-${chapter}`);
    } else {
      localStorage.setItem(key, String(chapter));
      setSaved(true);
      if (userId) void supabase.from('booknest_bookmarks').upsert({ user_id: userId, book_id: bookId, location: `chapter-${chapter}` });
    }
  }

  return (
    <main className={bodyClass}>
      <div className="readerProgress" aria-label={`Reading progress ${Math.round(progress)} percent`}>
        <span style={{ width: `${progress}%` }} />
      </div>

      <header className="readerTopbar">
        <Link href={`/book/${bookId}`} className="readerBrand"><Home size={17}/><span>BookNest</span></Link>
        <div className="readerTitle"><strong>{title}</strong><small>{author}</small></div>

        <div className="readerTools">
          <button onClick={() => changeFont(-1)} aria-label="Decrease text size" title="Smaller text"><span className="fontButton">A−</span></button>
          <button onClick={() => changeFont(1)} aria-label="Increase text size" title="Larger text"><span className="fontButton">A+</span></button>
          <span className="fontSizeBadge">{fontSize}px</span>
          <button onClick={() => changeTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle dark mode">{theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}</button>
          <button className={saved ? 'readerSaved' : ''} onClick={toggleBookmark} aria-label="Bookmark chapter" title="Bookmark chapter"><Bookmark size={18} fill={saved ? 'currentColor' : 'none'}/></button>
        </div>
      </header>

      <div className="readerProgressInfo">
        <span>Chapter {chapter} of {chapterCount}</span>
        <strong>{Math.round(progress)}% read</strong>
      </div>

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

          <nav className="readerNav" aria-label="Chapter navigation">
            {prevHref ? (
              <Link href={prevHref}><ChevronLeft size={18}/> Previous</Link>
            ) : (
              <span className="readerNavDisabled">Previous</span>
            )}
            <span className="readerChapterPill">Chapter {chapter} / {chapterCount}</span>
            {nextHref ? (
              <Link href={nextHref}>Next <ChevronRight size={18}/></Link>
            ) : (
              <span className="readerNavDisabled">Finished</span>
            )}
          </nav>

          {sourceUrl && <p className="readerSource">This reading edition is presented from an open ebook source. <a href={sourceUrl} target="_blank" rel="noreferrer">View source</a>.</p>}
        </article>
      </div>
    </main>
  );
}
