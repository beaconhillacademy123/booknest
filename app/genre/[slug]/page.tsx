import Link from 'next/link';
import { ArrowLeft, BookOpen, Search } from 'lucide-react';
import { getBooksByGenre, getGenre } from '../../../lib/booknest';

export default async function GenrePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { genre, books } = await getBooksByGenre(slug);
  if (!genre) return <main className="simplePage"><Link href="/">← Back home</Link><h1>Genre not found</h1></main>;
  return <main>
    <header className="topbar"><Link href="/" className="brand"><div className="logo"><BookOpen size={22}/></div><span>M King Reads</span></Link><Link href="/" className="login">Home</Link></header>
    <section className="section pageIntro"><Link href="/" className="back"><ArrowLeft size={16}/> Back to library</Link><div className="genreTitle"><span>{genre.icon}</span><div><span className="sectionKicker">M KING READS COLLECTION</span><h1>{genre.name}</h1><p>{books.length} book{books.length === 1 ? '' : 's'} in this collection.</p></div></div></section>
    <section className="section genreToolbar"><form className="search searchNew" action="/" method="get"><Search size={18}/><input name="q" placeholder="Search all books..." /><button>Search</button></form><Link className="secondary" href="/#genres">Browse another genre</Link></section>
    <section className="section"><div className="books">{books.map(b=><article className="book" key={b.id}><Link href={`/book/${b.id}`} className="cover" style={{backgroundImage:b.cover_url ? `url("${b.cover_url}")` : undefined}}><span>{getGenre(b)?.name ?? genre.name}</span></Link><div className="bookInfo"><Link href={`/book/${b.id}`}><h3>{b.title}</h3></Link><p className="author">{b.author}</p><p>{b.description ?? 'A free book available through M King Reads.'}</p><div className="actions"><Link className="read" href={`/book/${b.id}`}>View book</Link></div></div></article>)}</div></section>
  </main>;
}