'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase-browser';

export default function SuggestBookPage() {
  const [title,setTitle]=useState('');
  const [author,setAuthor]=useState('');
  const [sourceUrl,setSourceUrl]=useState('');
  const [reason,setReason]=useState('');
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMessage('');
    const { data:{session} } = await supabase.auth.getSession();
    if (!session) { window.location.href='/login'; return; }
    const { error } = await supabase.from('booknest_book_requests').insert({
      user_id: session.user.id, title, author: author || null,
      source_url: sourceUrl || null, reason: reason || null
    });
    if (error) setMessage(error.message);
    else { setMessage('Book suggestion received. We’ll review it before adding it to the catalogue.'); setTitle(''); setAuthor(''); setSourceUrl(''); setReason(''); }
    setBusy(false);
  }

  return <main>
    <header className="topbar"><Link href="/" className="brand"><div className="logo"><BookOpen size={22}/></div><span>M King Reads</span></Link><Link href="/library" className="login">My Library</Link></header>
    <section className="section suggestPage">
      <Link href="/library" className="back"><ArrowLeft size={16}/> Back to my library</Link><Link href="/my-suggestions" className="back">View my suggestions</Link>
      <div className="suggestCard">
        <span className="sectionKicker">HELP GROW THE LIBRARY</span>
        <h1>Suggest a book</h1>
        <p>Know a book that belongs on M King Reads? Send us the details. We’ll review copyright and source information before adding it.</p>
        <form className="authForm" onSubmit={submit}>
          <label>Book title<input value={title} onChange={e=>setTitle(e.target.value)} required placeholder="Book title"/></label>
          <label>Author<input value={author} onChange={e=>setAuthor(e.target.value)} placeholder="Author name"/></label>
          <label>Source or book link<input type="url" value={sourceUrl} onChange={e=>setSourceUrl(e.target.value)} placeholder="https://..."/></label>
          <label>Why should we add it?<textarea value={reason} onChange={e=>setReason(e.target.value)} rows={4} placeholder="Tell us what makes this book useful..."/></label>
          {message && <div className="authMessage"><CheckCircle2 size={17}/> {message}</div>}
          <button className="authSubmit" disabled={busy}>{busy ? 'Sending...' : 'Submit suggestion'}</button>
        </form>
      </div>
    </section>
  </main>;
}