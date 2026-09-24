'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, LogOut, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase-browser';

type Row = {
  book_id: string;
  created_at: string;
  booknest_books: {
    id: string; title: string; author: string | null; cover_url: string | null;
    description: string | null; publication_year: number | null;
  } | null;
  progress: {
    progress: number;
    chapter: number;
    position: number;
  } | null;
};

export default function LibraryPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = '/login';
      return;
    }
    setEmail(session.user.email ?? '');
    const { data } = await supabase
      .from('booknest_library')
      .select('book_id,created_at,booknest_books(id,title,author,cover_url,description,publication_year),booknest_reading_progress(progress,chapter,position)')
      .order('created_at', { ascending: false });
    const normalized = (data ?? []).map((row: any) => ({ ...row, booknest_books: Array.isArray(row.booknest_books) ? (row.booknest_books[0] ?? null) : row.booknest_books, progress: Array.isArray(row.booknest_reading_progress) ? (row.booknest_reading_progress[0] ?? null) : row.booknest_reading_progress }));
    setRows(normalized as Row[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) window.location.href = '/login';
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function remove(bookId: string) {
    await supabase.from('booknest_library').delete().eq('book_id', bookId);
    setRows(current => current.filter(row => row.book_id !== bookId));
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  return <main>
    <header className="topbar">
      <Link href="/" className="brand"><div className="logo"><BookOpen size={22}/></div><span>M King Reads</span></Link>
      <div className="libraryHeaderActions"><span className="libraryEmail">{email}</span><Link className="secondary" href="/profile">Account</Link><button className="logoutButton" onClick={logout}><LogOut size={15}/> Log out</button></div>
    </header>
    <section className="section libraryPage">
      <div className="sectionHead libraryHero"><div><h2>My Library</h2><p>Your personal shelf — pick up where you left off.</p><div className="libraryStats"><div className="libraryStat"><strong>{rows.length}</strong><span>Saved books</span></div><div className="libraryStat"><strong>{rows.filter(r => r.progress && Number(r.progress.progress) > 0 && Number(r.progress.progress) < 100).length}</strong><span>In progress</span></div><div className="libraryStat"><strong>{rows.filter(r => r.progress && Number(r.progress.progress) >= 100).length}</strong><span>Completed</span></div></div></div><Link className="secondary libraryBrowse" href="/">Browse books</Link></div>
      {loading ? <div className="empty">Loading your library...</div> : rows.length === 0 ? <div className="libraryEmpty"><BookOpen size={38}/><h3>Your shelf is empty.</h3><p>Save a book while browsing and it will appear here.</p><Link className="read" href="/">Find a book</Link></div> : <div className="books">{rows.map(row => {
        const b=row.booknest_books;
        if (!b) return null;
        return <article className="book" key={row.book_id}>
          <Link href={`/book/${b.id}`} className="cover" style={{backgroundImage:b.cover_url ? `url("${b.cover_url}")` : undefined}} />
          <div className="bookInfo"><Link href={`/book/${b.id}`}><h3>{b.title}</h3></Link><p className="author">{b.author}</p><div className="libraryProgress">{row.progress ? <><div className="libraryProgressTop"><span>Chapter {row.progress.chapter}</span><strong>{Math.round(row.progress.progress)}%</strong></div><div className="libraryProgressBar"><span style={{width:`${Math.min(100, Math.max(0, Number(row.progress.progress)))}%`}} /></div></> : <span>Not started</span>}</div><div className="actions"><Link className="read" href={row.progress && Number(row.progress.progress) > 0 && Number(row.progress.progress) < 100 ? `/read/${b.id}?chapter=${Math.max(1, Number(row.progress.chapter ?? 1))}` : `/read/${b.id}`}>{row.progress && Number(row.progress.progress) >= 100 ? 'Read again' : row.progress && Number(row.progress.progress) > 0 ? 'Continue reading' : 'Read'}</Link><button className="save" onClick={()=>remove(b.id)} aria-label="Remove from library"><Trash2 size={17}/></button></div></div>
        </article>;
      })}</div>}
    </section>
  </main>;
}
