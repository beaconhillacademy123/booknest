'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Check, Clock3, X } from 'lucide-react';
import { supabase } from '../../lib/supabase-browser';

type RequestRow={id:string;title:string;author:string|null;source_url:string|null;reason:string|null;status:string;created_at:string};

export default function AdminPage(){
  const [rows,setRows]=useState<RequestRow[]>([]);
  const [allowed,setAllowed]=useState<boolean|null>(null);
  const [loading,setLoading]=useState(true);
  const [genres,setGenres]=useState<{id:string;name:string}[]>([]);
  const [genreFor,setGenreFor]=useState<Record<string,string>>({});
  const [coverFor,setCoverFor]=useState<Record<string,string>>({});

  async function load(){
    const {data:{session}}=await supabase.auth.getSession();
    if(!session){window.location.href='/login';return;}
    const {data:admin}=await supabase.from('booknest_admins').select('user_id').eq('user_id',session.user.id).maybeSingle();
    if(!admin){setAllowed(false);setLoading(false);return;}
    setAllowed(true);
    const [{data},{data:genreData}]=await Promise.all([
      supabase.from('booknest_book_requests').select('id,title,author,source_url,reason,status,created_at').order('created_at',{ascending:false}),
      supabase.from('booknest_genres').select('id,name').order('name')
    ]);
    setRows((data??[]) as RequestRow[]); setGenres(genreData??[]); setLoading(false);
  }
  useEffect(()=>{load()},[]);

  async function setStatus(id:string,status:'approved'|'rejected'){
    if(status==='rejected'){
      await supabase.from('booknest_book_requests').update({status}).eq('id',id);
      setRows(r=>r.map(x=>x.id===id?{...x,status}:x)); return;
    }
    const genreId=genreFor[id];
    if(!genreId){alert('Select a genre first.');return;}
    const {error}=await supabase.rpc('approve_book_request',{request_id:id,selected_genre_id:genreId,book_cover_url:coverFor[id]||null,mark_featured:false});
    if(error){alert(error.message);return;}
    setRows(r=>r.map(x=>x.id===id?{...x,status:'approved'}:x));
  }

  if(loading)return <main className="simplePage"><p>Loading catalogue management...</p></main>;
  if(!allowed)return <main className="simplePage"><Link href="/">← Back home</Link><h1>Catalogue management</h1><p>Your account does not have administrator access.</p></main>;

  return <main><header className="topbar"><Link href="/" className="brand"><div className="logo"><BookOpen size={22}/></div><span>M King Reads</span></Link><Link href="/library" className="login">My Library</Link></header>
  <section className="section adminPage"><Link href="/library" className="back"><ArrowLeft size={16}/> Back to my library</Link><div className="sectionHead"><div><span className="sectionKicker">CATALOGUE MANAGEMENT</span><h1>Book suggestions</h1><p>Review reader suggestions before they enter the public catalogue.</p></div></div>
  {rows.length===0?<div className="empty">No book suggestions yet.</div>:<div className="adminRequests">{rows.map(r=><article className="adminRequest" key={r.id}><div><div className="adminStatus"><Clock3 size={14}/>{r.status}</div><h3>{r.title}</h3><p className="author">{r.author||'Author not provided'}</p>{r.reason&&<p>{r.reason}</p>}{r.source_url&&<a href={r.source_url} target="_blank" rel="noreferrer">Open source</a>}</div><div className="adminActions">{r.status==='pending'&&<><select value={genreFor[r.id]??''} onChange={e=>setGenreFor(v=>({...v,[r.id]:e.target.value}))}><option value="">Select genre</option>{genres.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select><input className="adminCoverInput" value={coverFor[r.id]??''} onChange={e=>setCoverFor(v=>({...v,[r.id]:e.target.value}))} placeholder="Cover URL (optional)"/><button onClick={()=>setStatus(r.id,'approved')}><Check size={16}/> Approve & add</button><button onClick={()=>setStatus(r.id,'rejected')}><X size={16}/> Reject</button></>}</div></article>)}</div>}</section></main>
}