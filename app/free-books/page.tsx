import Link from 'next/link';
import { BookOpen, ChevronLeft, ChevronRight, Search } from 'lucide-react';

type GutenbergBook={id:number;title:string;authors:{name:string;birth_year:number|null;death_year:number|null}[];summaries:string[];subjects:string[];bookshelves:string[];languages:string[];copyright:boolean|null;formats:Record<string,string>;download_count:number};

const TOPICS=[
  ['','All free books'],['classics','Classics'],['children','Children'],['romance','Romance'],['science fiction','Science Fiction'],['mystery','Mystery & Crime'],['poetry','Poetry'],['education','Education'],['history','History'],['africa','Africa'],
] as const;

async function getGutenberg(url:string){
  const response=await fetch(url,{next:{revalidate:3600}});
  if(!response.ok) throw new Error('Gutenberg catalogue unavailable');
  return response.json() as Promise<{count:number;next:string|null;previous:string|null;results:GutenbergBook[]}>;
}

export default async function FreeBooksPage({searchParams}:{searchParams:Promise<{q?:string;topic?:string;page?:string}>}){
  const params=await searchParams; const q=params.q?.trim()||''; const topic=params.topic?.trim()||''; const page=Math.max(1,Number(params.page||1)||1);
  const url=new URL('https://gutendex.com/books/'); url.searchParams.set('languages','en'); url.searchParams.set('page',String(page)); if(q) url.searchParams.set('search',q); if(topic) url.searchParams.set('topic',topic);
  let data:{count:number;next:string|null;previous:string|null;results:GutenbergBook[]}={count:0,next:null,previous:null,results:[]}; let failed=false;
  try{data=await getGutenberg(url.toString());}catch{failed=true;}
  const totalPages=Math.max(1,Math.ceil(data.count/32));
  return <main><header className="topbar"><Link href="/" className="brand"><div className="logo"><BookOpen size={22}/></div><span>M King Reads</span></Link><nav><Link href="/">Home</Link><Link className="active" href="/free-books">Free Books</Link><Link href="/#genres">Genres</Link><Link href="/library">My Library</Link></nav><Link href="/login" className="login">Log in</Link></header>
  <section className="section freeBooksPage">
    <div className="sectionHead"><div><span className="sectionKicker">PROJECT GUTENBERG COLLECTION</span><h1>Thousands of free books.</h1><p>Explore a live catalogue of Project Gutenberg books from inside M King Reads.</p></div></div>
    <form className="search freeBooksSearch" action="/free-books" method="get"><Search size={19}/><input name="q" defaultValue={q} placeholder="Search titles or authors..."/><input type="hidden" name="topic" value={topic}/><button>Search</button></form>
    <div className="freeBookTopics">{TOPICS.map(([value,label])=><Link key={value} className={topic===value?'active':''} href={'/free-books?topic='+encodeURIComponent(value)+(q?'&q='+encodeURIComponent(q):'')}>{label}</Link>)}</div>
    {failed?<div className="empty">The free-book catalogue is temporarily unavailable. Please try again shortly.</div>:<><div className="freeBooksMeta"><strong>{data.count.toLocaleString()}</strong> books found <span>· Page {page} of {totalPages.toLocaleString()}</span></div>
    <div className="books booksNew freeBookGrid">{data.results.map(book=>{const author=book.authors?.[0]?.name||'Unknown author';const cover=book.formats['image/jpeg'];const html=book.formats['text/html']||book.formats['text/html; charset=utf-8'];const summary=book.summaries?.[0]||'A free book from Project Gutenberg.';return <article className="book bookNew freeBookCard" key={book.id}><Link href={'/free-books/'+book.id} className="cover" style={cover?{backgroundImage:'url("'+cover+'")'}:undefined} aria-label={book.title}/><div className="bookInfo"><span className="cardGenre">FREE TO ACCESS</span><h3>{book.title}</h3><p className="author">{author}</p><p>{summary}</p><div className="actions">{html&&<Link className="read" href={'/free-books/'+book.id+'/read'}>Read here</Link>}<Link className="read" href={'/free-books/'+book.id}>Details</Link></div></div></article>})}</div>
    <div className="freeBooksPagination">{page>1?<Link href={'/free-books?'+new URLSearchParams({...(q?{q}:{}),...(topic?{topic}:{}),page:String(page-1)}).toString()}><ChevronLeft size={16}/> Previous</Link>:<span/>}{page<totalPages?<Link href={'/free-books?'+new URLSearchParams({...(q?{q}:{}),...(topic?{topic}:{}),page:String(page+1)}).toString()}>Next <ChevronRight size={16}/></Link>:<span/>}</div></>}
    <div className="copyrightNotice"><strong>Copyright, Public-Domain &amp; Availability Notice</strong><p>M King Reads provides access to books and other reading materials obtained from third-party sources, including Project Gutenberg and other lawful sources. Copyright status may vary by country or jurisdiction. A work that is public domain or freely available in one jurisdiction may remain protected elsewhere.</p><p>M King Reads does not independently warrant that every third-party work is free from copyright restrictions in every country. Users are responsible for determining whether accessing, downloading, reproducing, distributing, or otherwise using a work is lawful in their jurisdiction.</p><p>Where a work is provided through a third-party source, M King Reads does not claim ownership of that work. If you are unsure about the copyright status or permitted use of a work, seek appropriate legal guidance before reproducing, distributing, publishing, or commercially using it.</p><small>M King Reads is an educational and reading platform and does not provide legal advice.</small></div>
  </section></main>;
}