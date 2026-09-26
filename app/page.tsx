import Link from 'next/link';
import { BookOpen, Search, Sparkles, ChevronRight, Bookmark, Globe2, LibraryBig } from 'lucide-react';
import SaveBookButton from './components/SaveBookButton';
import ContinueReading from './components/ContinueReading';
import { getBooks, getGenres, getGenre, searchBooks } from '../lib/booknest';

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const q = params.q?.trim() ?? '';
  const [genres, books] = await Promise.all([
    getGenres(),
    q ? searchBooks(q, 24) : getBooks(24)
  ]);

  const featured = books.filter(b => b.is_featured);
  const primaryBooks = q ? books : (featured.length ? featured : books).slice(0, 8);
  const africanBooks = books.filter(b => {
    const g = getGenre(b);
    return g?.slug === 'african-literature';
  }).slice(0, 4);
  const otherBooks = books.filter(b => !primaryBooks.some(p => p.id === b.id)).slice(0, 8);

  return <main><ContinueReading />
    <header className="topbar">
      <Link href="/" className="brand"><div className="logo"><BookOpen size={22}/></div><span>M King Reads</span></Link>
      <nav><Link className="active" href="/">Home</Link><Link href="/free-books">Free Books</Link><Link href="/#genres">Genres</Link><Link href="/library">My Library</Link></nav>
      <Link href="/login" className="login">Log in</Link>
    </header>

    <section className="hero heroNew">
      <div className="heroText">
        <span className="eyebrow"><Sparkles size={15}/> WELCOME TO M KING READS</span>
        <h1>Stories worth<br/><em>your time.</em></h1>
        <p>Discover books to read, save and return to whenever you want — all in one growing digital library.</p>
        <form className="search searchNew" action="/" method="get">
          <Search size={19}/><input name="q" defaultValue={q} placeholder="Search books, authors or topics..."/><button>Search</button>
        </form>
        <div className="heroLinks"><Link href="/#featured">Explore books <ChevronRight size={16}/></Link><Link href="/#genres">Browse genres <ChevronRight size={16}/></Link></div>
      </div>
      <div className="heroShowcase">
        <div className="heroBadge">READ • SAVE • RETURN</div>
        <div className="heroBooks">
          {primaryBooks.slice(0,3).map((b,i)=><Link key={b.id} href={`/book/${b.id}`} className={`heroBook heroBook${i+1}`} style={{backgroundImage:b.cover_url ? `url("${b.cover_url}")` : undefined}} aria-label={b.title}/>)}
        </div>
        <div className="heroCardCopy"><strong>A growing library.</strong><span>Find your next favourite story.</span></div>
      </div>
    </section>

    <section className="trustStrip">
      <div><BookOpen size={20}/><span><strong>Read online</strong><small>Comfortable built-in reader</small></span></div>
      <div><Bookmark size={20}/><span><strong>Save your books</strong><small>Keep a personal shelf</small></span></div>
      <div><LibraryBig size={20}/><span><strong>Track your reading</strong><small>Pick up where you stopped</small></span></div>
      <div><Globe2 size={20}/><span><strong>Made to grow</strong><small>More books and features ahead</small></span></div>
    </section>

    <section className="section" id="genres">
      <div className="sectionHead"><div><h2>Explore by genre</h2><p>Something for every kind of reader.</p></div><Link href="/#genres">View all <ChevronRight size={17}/></Link></div>
      <div className="genres genresNew">{genres.map(g=><Link className="genre" href={`/genre/${g.slug}`} key={g.id}><span>{g.icon}</span><strong>{g.name}</strong><small>Explore</small></Link>)}</div>
    </section>

    <section className="section bookSection" id="featured">
      <div className="sectionHead"><div><span className="sectionKicker">HANDPICKED FOR YOU</span><h2>{q ? `Search results for “${q}”` : 'Featured books'}</h2><p>{q ? `${books.length} book${books.length === 1 ? '' : 's'} found.` : 'A selection to help you discover your next read.'}</p></div></div>
      {books.length === 0 ? <div className="empty">No books matched that search yet. Try another title, author or topic.</div> : <div className="books booksNew">{primaryBooks.map(b=><BookCard key={b.id} book={b}/>)}</div>}
    </section>

    {!q && africanBooks.length > 0 && <section className="section africanSection">
      <div className="africanBanner">
        <div><span className="sectionKicker">FROM OUR CONTINENT</span><h2>Stories from Africa.</h2><p>Explore African voices, literature and stories as the collection grows.</p></div>
        <Link className="bannerButton" href="/genre/african-literature">Explore African Literature <ChevronRight size={17}/></Link>
      </div>
      <div className="books booksNew compactBooks">{africanBooks.map(b=><BookCard key={b.id} book={b}/>)}</div>
    </section>}

    {!q && otherBooks.length > 0 && <section className="section">
      <div className="sectionHead"><div><span className="sectionKicker">KEEP EXPLORING</span><h2>More to discover</h2><p>There is always another book waiting.</p></div></div>
      <div className="books booksNew">{otherBooks.map(b=><BookCard key={b.id} book={b}/>)}</div>
    </section>}

    {!q && <section className="section freeBooksFeature">
      <div className="freeBooksFeatureCard">
        <div className="freeBooksFeatureArt">
          <div className="freeBooksFeatureBook">M</div>
          <div className="freeBooksFeatureBook">K</div>
          <div className="freeBooksFeatureBook">R</div>
        </div>
        <div className="freeBooksFeatureCopy">
          <span className="sectionKicker">OPEN COLLECTION</span>
          <h2>Thousands of books. One place to read.</h2>
          <p>Explore a live collection from Project Gutenberg and read available editions directly inside M King Reads.</p>
          <Link className="bannerButton" href="/free-books">Explore Free Books <ChevronRight size={17}/></Link>
        </div>
      </div>
    </section>}

    <section className="section ctaSection">
      <div className="ctaBox">
        <div><span className="sectionKicker">YOUR PERSONAL SHELF</span><h2>Save books now. Come back anytime.</h2><p>Create a free account to build your own library and keep track of your reading.</p></div>
        <Link className="ctaButton" href="/login">Create my free library <ChevronRight size={17}/></Link>
      </div>
    </section>

    <footer><div><div className="brand"><div className="logo"><BookOpen size={19}/></div><span>M King Reads</span></div><p>A growing digital library for curious minds.</p></div><div className="footerLinks"><Link href="/copyright">Copyright &amp; Sources</Link><Link href="/free-books">Free Books</Link><Link href="/login">My Library</Link></div></footer>
  </main>
}

function BookCard({book}: {book: any}) {
  const genre = getGenre(book);
  return <article className="book bookNew">
    <Link href={`/book/${book.id}`} className="cover" style={{backgroundImage:book.cover_url ? `url("${book.cover_url}")` : undefined}} aria-label={book.title} />
    <div className="bookInfo"><span className="cardGenre">{genre?.icon} {genre?.name ?? 'Free book'}</span><Link href={`/book/${book.id}`}><h3>{book.title}</h3></Link><p className="author">{book.author}</p><p>{book.description ?? 'A free book available through M King Reads.'}</p><div className="actions"><Link className="read" href={`/book/${book.id}`}>View book</Link><SaveBookButton bookId={book.id} /></div></div>
  </article>;
}