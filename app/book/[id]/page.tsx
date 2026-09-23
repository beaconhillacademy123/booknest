import Link from 'next/link';
import { ArrowLeft, BookOpen, ExternalLink } from 'lucide-react';
import SaveBookButton from '../../components/SaveBookButton';
import { getBook, getGenre } from '../../../lib/booknest';

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await getBook(id);
  if (!book) return <main className="simplePage"><Link href="/">← Back home</Link><h1>Book not found</h1></main>;
  const genre = getGenre(book);
  return <main>
    <header className="topbar"><Link href="/" className="brand"><div className="logo"><BookOpen size={22}/></div><span>M King Reads</span></Link><Link href="/" className="login">Home</Link></header>
    <section className="bookDetail section"><Link href="/" className="back"><ArrowLeft size={16}/> Back to library</Link><div className="detailGrid"><div className="detailCover" style={{backgroundImage:book.cover_url ? `url("${book.cover_url}")` : undefined}}></div><div><div className="eyebrow">{genre?.icon} {genre?.name ?? 'FREE BOOK'}</div><h1>{book.title}</h1><h2>by {book.author}</h2><p className="detailDesc">{book.description}</p><div className="meta"><span>{book.language ?? 'English'}</span>{book.publication_year && <span>{book.publication_year}</span>}<span>{book.source_name ?? 'Free source'}</span></div><div className="detailActions"><Link className="read" href={`/read/${id}`}>Read in M King Reads <BookOpen size={16}/></Link><SaveBookButton bookId={id} />{book.read_url && <a className="secondary" href={book.read_url} target="_blank" rel="noreferrer">Original source <ExternalLink size={16}/></a>}{book.download_url && <a className="secondary" href={book.download_url} target="_blank" rel="noreferrer">Source & downloads</a>}</div><p className="license">{book.license}</p></div></div></section>
  </main>;
}
