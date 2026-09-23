import { notFound, redirect } from 'next/navigation';
import { getBook } from '../../../lib/booknest';
import Reader from './Reader';

type ReaderSource = { repo: string; chapters: string[] };

const SOURCES: Record<string, ReaderSource> = {
  '1342': { repo: 'standardebooks/jane-austen_pride-and-prejudice', chapters: Array.from({ length: 61 }, (_, i) => `chapter-${i + 1}.xhtml`) },
  '1661': {
    repo: 'standardebooks/arthur-conan-doyle_the-adventures-of-sherlock-holmes',
    chapters: ['a-scandal-in-bohemia.xhtml','the-redheaded-league.xhtml','a-case-of-identity.xhtml','the-boscombe-valley-mystery.xhtml','the-five-orange-pips.xhtml','the-man-with-the-twisted-lip.xhtml','the-adventure-of-the-blue-carbuncle.xhtml','the-adventure-of-the-speckled-band.xhtml','the-adventure-of-the-engineers-thumb.xhtml','the-adventure-of-the-noble-bachelor.xhtml','the-adventure-of-the-beryl-coronet.xhtml','the-adventure-of-the-copper-beeches.xhtml']
  },
  '11': { repo: 'standardebooks/lewis-carroll_alices-adventures-in-wonderland_john-tenniel', chapters: Array.from({ length: 12 }, (_, i) => `chapter-${i + 1}.xhtml`) },
  '345': { repo: 'standardebooks/bram-stoker_dracula', chapters: Array.from({ length: 27 }, (_, i) => `chapter-${i + 1}.xhtml`) },
  '2701': { repo: 'standardebooks/herman-melville_moby-dick', chapters: Array.from({ length: 135 }, (_, i) => `chapter-${i + 1}.xhtml`) }
};

const DRACULA_CHAPTER_LABELS = [
  "Jonathan Harker's Journal",
  "Jonathan Harker's Journal — continued",
  "Jonathan Harker's Journal — continued",
  "Jonathan Harker's Journal — continued",
  "Letter from Miss Mina Murray to Miss Lucy Westenra",
  "Mina Murray's Journal",
  "Cutting from “The Dailygraph,” 8 August",
  "Mina Murray's Journal",
  "Letter, Mina Harker to Lucy Westenra",
  "Letter, Dr. Seward to the Hon. Arthur Holmwood",
  "Lucy Westenra's Diary",
  "Dr. Seward's Diary",
  "Dr. Seward's Diary — continued",
  "Mina Harker's Journal",
  "Dr. Seward's Diary — continued",
  "Dr. Seward's Diary — continued",
  "Dr. Seward's Diary — continued",
  "Dr. Seward's Diary",
  "Jonathan Harker's Journal",
  "Jonathan Harker's Journal",
  "Dr. Seward's Diary",
  "Jonathan Harker's Journal",
  "Dr. Seward's Diary",
  "Dr. Seward's Phonograph Diary, spoken by Van Helsing",
  "Dr. Seward's Diary",
  "Dr. Seward's Diary",
  "Mina Harker's Journal"
];

function getSourceId(book: { source_url: string | null }) {
  const match = book.source_url?.match(/\/ebooks\/(\d+)/);
  return match?.[1] ?? null;
}

function extractBody(html: string) {
  const lower = html.toLowerCase();
  const bodyStart = lower.indexOf('<body');
  const bodyOpenEnd = bodyStart >= 0 ? html.indexOf('>', bodyStart) + 1 : 0;
  const bodyEnd = lower.indexOf('</body>', bodyOpenEnd);
  const body = bodyStart >= 0 && bodyEnd >= 0 ? html.slice(bodyOpenEnd, bodyEnd) : html;
  return body;
}

function labelFromFile(file: string, index: number) {
  if (file.startsWith('chapter-')) return `Chapter ${index + 1}`;
  return file.replace('.xhtml', '').replace(/-/g, ' ');
}

function chapterLabel(sourceId: string | null, file: string, index: number) {
  if (sourceId === '345') return DRACULA_CHAPTER_LABELS[index] ?? `Chapter ${index + 1}`;
  return labelFromFile(file, index);
}

function cleanExternalHtml(html: string, baseUrl?: string) {
  const scriptPattern = new RegExp('<script[\\\\s\\\\S]*?<\\\\/script>', 'gi');
  const stylePattern = new RegExp('<style[\\\\s\\\\S]*?<\\\\/style>', 'gi');
  const commentPattern = new RegExp('<!--[\\\\s\\\\S]*?-->', 'g');
  const imagePattern = new RegExp("src\\\\s*=\\\\s*[\\\\x22\\\\x27]([^\\\\x22\\\\x27]+)[\\\\x22\\\\x27]", "gi");

  let cleaned = html
    .replace(scriptPattern, '')
    .replace(stylePattern, '')
    .replace(commentPattern, '');

  if (baseUrl) {
    cleaned = cleaned.replace(imagePattern, (_match, prefix, src, suffix) => {
      try {
        return prefix + new URL(src, baseUrl).toString() + suffix;
      } catch {
        return _match;
      }
    });
  }

  return cleaned;
}

export default async function ReadPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ chapter?: string }>;
}) {
  const { id } = await params;
  const { chapter: chapterParam } = await searchParams;
  const book = await getBook(id);
  if (!book) notFound();

  const sourceId = getSourceId(book);
  const source = sourceId ? SOURCES[sourceId] : undefined;

  if (!source) {
    const gutenbergUrl = sourceId
      ? `https://www.gutenberg.org/cache/epub/${sourceId}/pg${sourceId}-images.html`
      : null;

    if (!gutenbergUrl) {
      if (book.read_url) redirect(book.read_url);
      return null;
    }

    const response = await fetch(gutenbergUrl, { next: { revalidate: 86400 } });
    if (!response.ok) {
      if (book.read_url) redirect(book.read_url);
      return null;
    }

    const html = await response.text();
    const content = cleanExternalHtml(extractBody(html), gutenbergUrl);
    return <Reader
      bookId={id}
      title={book.title}
      author={book.author}
      coverUrl={book.cover_url}
      chapter={1}
      chapterCount={1}
      chapterLabel="Full book"
      chapterItems={[{ number: 1, label: 'Full book', href: `/read/${id}` }]}
      content={content}
      sourceUrl={book.source_url}
    />;
  }

  const requested = Number(chapterParam || 1);
  const chapter = Number.isFinite(requested) ? Math.min(source.chapters.length, Math.max(1, Math.floor(requested))) : 1;
  const file = source.chapters[chapter - 1];
  const rawUrl = `https://raw.githubusercontent.com/${source.repo}/master/src/epub/text/${file}`;
  const response = await fetch(rawUrl);

  if (!response.ok) {
    if (book.read_url) redirect(book.read_url);
    return null;
  }

  const content = extractBody(await response.text());
  const base = `/read/${id}`;
  const prevHref = chapter > 1 ? `${base}?chapter=${chapter - 1}` : undefined;
  const nextHref = chapter < source.chapters.length ? `${base}?chapter=${chapter + 1}` : undefined;
  const chapterItems = source.chapters.map((chapterFile, index) => ({
    number: index + 1,
    label: chapterLabel(sourceId, chapterFile, index),
    href: `${base}?chapter=${index + 1}`
  }));

  return <Reader
    bookId={id}
    title={book.title}
    author={book.author}
    coverUrl={book.cover_url}
    chapter={chapter}
    chapterCount={source.chapters.length}
    chapterLabel={chapterLabel(sourceId, file, chapter - 1)}
    chapterItems={chapterItems}
    content={content}
    sourceUrl={book.source_url}
    prevHref={prevHref}
    nextHref={nextHref}
  />;
}
