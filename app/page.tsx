import Link from 'next/link';
import { BookOpen, Search, Bookmark, Sparkles, ChevronRight } from 'lucide-react';
import { getBooks, getGenres, getGenre, searchBooks } from '../lib/booknest';

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const q = params.q?.trim() ?? '';
  const [genres, books] = await Promise.all([getGenres(), q ? searchBooks(q, 12) : getBooks(12)]);

  return <main>
    <header className="topbar">
      <Link href="/" className="brand"><div className="logo"><BookOpen size={22}/></div><span>BookNest</span></Link>
      <nav><Link className="active" href="/">Home</Link><Link href="/#genres">Genres</Link><Link href="/library">My Library</Link></nav>
      <Link href="/login" className="login">Log in</Link>
    </header>

    <section className="hero">
      <div className="heroText">
        <span className="eyebrow"><Sparkles size={15}/> YOUR FREE DIGITAL LIBRARY</span>
        <h1>Find your next<br/><em>great read.</em></h1>
        <p>Discover free books across fiction, education, business, African literature and more.</p>
        <form className="search" action="/" method="get"><Search size={19}/><input name="q" defaultValue={q} placeholder="Search books, authors or topics..."/><button>Search</button></form>
      </div>
      <div className="heroCard"><div className="bookStack">📚</div><strong>Free books.</strong><span>One growing library.</span></div>
    </section>

    <section className="section" id="genres"><div className="sectionHead"><h2>Browse by genre</h2><Link href="/#genres">View all <ChevronRight size={17}/></Link></div>
      <div className="genres">{genres.map(g=><Link className="genre" href={`/genre/${g.slug}`} key={g.id}><span>{g.icon}</span>{g.name}</Link>)}</div>
    </section>

    <section className="section"><div className="sectionHead"><div><h2>{q ? `Search results for “${q}”` : 'Featured books'}</h2><p>{q ? `${books.length} book${books.length === 1 ? '' : 's'} found.` : 'Start reading something new.'}</p></div></div>
      {books.length === 0 ? <div className="empty">No books matched that search yet. Try another title, author or topic.</div> : <div className="books">{books.map(b=>{
        const genre = getGenre(b);
        return <article className="book" key={b.id}>
          <Link href={`/book/${b.id}`} className="cover" style={{backgroundImage:b.cover_url ? `url("${b.cover_url}")` : undefined}}><span>{genre?.name ?? 'Free book'}</span></Link>
          <div className="bookInfo"><Link href={`/book/${b.id}`}><h3>{b.title}</h3></Link><p className="author">{b.author}</p><p>{b.description ?? 'A free book available through BookNest.'}</p><div className="actions"><Link className="read" href={`/book/${b.id}`}>View book</Link><button className="save" aria-label="Save book"><Bookmark size={17}/></button></div></div>
        </article>;
      })}</div>}
    </section>
    <footer><div className="brand"><div className="logo"><BookOpen size={19}/></div><span>BookNest</span></div><p>A free digital library for curious minds.</p></footer>
  </main>
}