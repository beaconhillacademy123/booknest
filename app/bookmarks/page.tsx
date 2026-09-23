'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bookmark, BookOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase-browser';

type Row={id:string;book_id:string;location:string;created_at:string;booknest_books:{id:string;title:string;author:string|null;cover_url:string|null}|null};

export default function BookmarksPage(){
 const [rows,setRows]=useState<Row[]>([]); const [loading,setLoading]=useState(true);
 useEffect(()=>{(async()=>{const {data:{session}}=await supabase.auth.getSession();if(!session){window.location.href='/login';return;}
 const {data}=await supabase.from('booknest_bookmarks').select('id,book_id,location,created_at,booknest_books(id,title,author,cover_url)').order('created_at',{ascending:false});
 const normalized=(data??[]).map((r:any)=>({...r,booknest_books:Array.isArray(r.booknest_books)?(r.booknest_books[0]??null):r.booknest_books}));
 setRows(normalized as Row[]);setLoading(false);})();},[]);
 async function remove(id:string){await supabase.from('booknest_bookmarks').delete().eq('id',id);setRows(r=>r.filter(x=>x.id!==id));}
 return <main><header className="topbar"><Link href="/" className="brand"><div className="logo"><BookOpen size={22}/></div><span>M King Reads</span></Link><Link href="/library" className="login">My Library</Link></header>
 <section className="section bookmarksPage"><Link href="/library" className="back"><ArrowLeft size={16}/> Back to my library</Link><div className="sectionHead"><div><span className="sectionKicker">YOUR READING MARKS</span><h1>Bookmarks</h1><p>Jump back to chapters you marked while reading.</p></div></div>
 {loading?<div className="empty">Loading bookmarks...</div>:rows.length===0?<div className="libraryEmpty"><Bookmark size={38}/><h3>No bookmarks yet.</h3><p>Bookmark a chapter while reading and it will appear here.</p><Link className="read" href="/">Discover books</Link></div>:<div className="bookmarkList">{rows.map(r=>{const b=r.booknest_books;if(!b)return null;const chapter=Number(r.location.replace('chapter-',''))||1;return <article className="bookmarkItem" key={r.id}>{b.cover_url&&<img src={b.cover_url} alt=""/>}<div><span>Chapter {chapter}</span><h3>{b.title}</h3><p>{b.author}</p></div><div className="bookmarkActions"><Link className="read" href={'/read/'+b.id+'?chapter='+chapter}>Open bookmark</Link><button onClick={()=>remove(r.id)}>Remove</button></div></article>})}</div>}</section></main>;
}