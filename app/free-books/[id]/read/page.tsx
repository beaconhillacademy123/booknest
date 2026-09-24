import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Reader from '../../../read/[id]/Reader';

type Book = {
  id: number;
  title: string;
  authors: { name: string }[];
  summaries: string[];
  formats: Record<string, string>;
};

async function getBook(id: string) {
  const response = await fetch('https://gutendex.com/books/' + encodeURIComponent(id), { next: { revalidate: 86400 } });
  if (!response.ok) return null;
  return response.json() as Promise<Book>;
}

function extractBody(html: string) {
  const lower = html.toLowerCase();
  const bodyStart = lower.indexOf('<body');
  const bodyOpenEnd = bodyStart >= 0 ? html.indexOf('>', bodyStart) + 1 : 0;
  const bodyEnd = lower.indexOf('</body>', bodyOpenEnd);
  return bodyStart >= 0 && bodyEnd >= 0 ? html.slice(bodyOpenEnd, bodyEnd) : html;
}

function cleanExternalHtml(html: string, baseUrl: string) {
  const scriptPattern = new RegExp('<script[\\s\\S]*?<\\/script>', 'gi');
  const stylePattern = new RegExp('<style[\\s\\S]*?<\\/style>', 'gi');
  const commentPattern = new RegExp('<!--[\\s\\S]*?-->', 'g');
  const imagePattern = /src="([^"]+)"/gi;

  let cleaned = html
    .replace(scriptPattern, '')
    .replace(stylePattern, '')
    .replace(commentPattern, '');

  return cleaned.replace(imagePattern, (_match, src) => {
    try {
      return 'src="' + new URL(src, baseUrl).toString() + '"';
    } catch {
      return _match;
    }
  });
}

export default async function FreeBookReader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await getBook(id);
  if (!book) notFound();

  const html = book.formats['text/html'] || book.formats['text/html; charset=utf-8'];
  if (!html) {
    return (
      <main className="simplePage">
        <Link href={'/free-books/' + book.id} className="back"><ArrowLeft size={16}/> Back to book</Link>
        <h1>Reader unavailable</h1>
        <p>This Project Gutenberg edition does not currently provide an HTML reading format.</p>
      </main>
    );
  }

  const response = await fetch(html, { next: { revalidate: 86400 } });
  if (!response.ok) {
    return (
      <main className="simplePage">
        <Link href={'/free-books/' + book.id} className="back"><ArrowLeft size={16}/> Back to book</Link>
        <h1>Reader temporarily unavailable</h1>
        <p>We could not load the ebook right now. Please try again shortly.</p>
      </main>
    );
  }

  const raw = await response.text();
  const content = cleanExternalHtml(extractBody(raw), html);
  const author = book.authors?.[0]?.name || 'Unknown author';
  const coverUrl = book.formats['image/jpeg'] || null;

  return (
    <>
      <div className="freeBookReaderBanner">
        <Link href={'/free-books/' + book.id}><ArrowLeft size={15}/> Back to book</Link>
        <span><BookOpen size={15}/> Free ebook · Project Gutenberg source</span>
      </div>
      <Reader
        bookId={'gutenberg-' + book.id}
        title={book.title}
        author={author}
        coverUrl={coverUrl}
        chapter={1}
        chapterCount={1}
        chapterLabel="Full book"
        chapterItems={[{ number: 1, label: 'Full book', href: '/free-books/' + book.id + '/read' }]}
        content={content}
        sourceUrl={'https://www.gutenberg.org/ebooks/' + book.id}
        backHref={'/free-books/' + book.id}
        persistToCloud={false}
        sourceLabel="Project Gutenberg"
      />
    </>
  );
}
