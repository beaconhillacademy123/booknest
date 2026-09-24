'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock3, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase-browser';

type Suggestion = { id:string; title:string; author:string|null; reason:string|null; status:string; created_at:string; };

export default function MySuggestionsPage() {
  const [rows,setRows]=useState<Suggestion[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(() => {
    async function load() {
      const {data:{session}}=await supabase.auth.getSession();
      if(!session){window.location.href='/login';return;}
      const {data}=await supabase.from('booknest_book_requests').select('id,title,author,reason,status,created_at').eq('user_id',session.user.id).order('created_at',{ascending:false});
      setRows((data??[]) as Suggestion[]); setLoading(false);
    }
    void load();
  },[]);
  if(loading) return <main className="simplePage"><p>Loading your suggestions...</p></main>;
  return <main>
    <header className="topbar"><Link href="/" className="brand"><div className="logo"><BookOpen size={22}/></div><span>M King Reads</span></Link><Link href="/library" className="login">My Library</Link></header>
    <section className="section suggestionsPage">
      <Link href="/profile" className="back"><ArrowLeft size={16}/> Back to account</Link>
      <div className="sectionHead"><div><span className="sectionKicker">YOUR CONTRIBUTIONS</span><h1>My book suggestions</h1><p>See the books you have suggested and their review status.</p></div><Link className="profileAction" href="/suggest-book">Suggest another book</Link></div>
      {rows.length===0 ? <div className="empty">You haven't suggested any books yet.</div> : <div className="suggestionList">
        {rows.map(row => {
          const status=row.status.toLowerCase(); const Icon=status==='approved'?CheckCircle2:status==='rejected'?XCircle:Clock3;
          return <article className="suggestionItem" key={row.id}><div className="suggestionIcon"><Icon size={18}/></div><div className="suggestionCopy"><h3>{row.title}</h3><p>{row.author || 'Author not provided'}{row.reason ? ' · ' + row.reason : ''}</p><small>{new Date(row.created_at).toLocaleDateString()}</small></div><span className={'suggestionStatus suggestionStatus-'+status}>{status}</span></article>;
        })}
      </div>}
    </section>
  </main>;
}