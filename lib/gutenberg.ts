export type GutenbergChapter = {
  label: string;
  content: string;
};

function decodeHeadingText(value: string) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function isNavigationHeading(text: string, attrs: string) {
  const value = (text + ' ' + attrs).toLowerCase();
  return /\b(contents|table of contents|cover|illustrations|list of illustrations|index|transcriber's note|transcribers note|project gutenberg|copyright|colophon)\b/.test(value);
}

function isChapterHeading(text: string) {
  const value = text.replace(/[\u00a0]+/g, ' ').replace(/\s+/g, ' ').trim();

  if (/^(chapter|chap\.?)[\s.:\-]+(?:[ivxlcdm]+|\d+|[a-z]+)\b/i.test(value)) return true;
  if (/^(book|part|volume|section)[\s.:\-]+(?:[ivxlcdm]+|\d+|[a-z]+)\b/i.test(value)) return true;
  if (/^(prologue|epilogue|preface|foreword|afterword|introduction|appendix)\b/i.test(value)) return true;

  return false;
}

function fallbackHeading(text: string, tag: string) {
  if (!text || text.length > 90) return false;
  if (/^(contents|table of contents|list of illustrations|illustrations|index)$/i.test(text)) return false;
  if (/^(chapter|chap\.?|book|part|volume|section|prologue|epilogue|preface|foreword|afterword|introduction|appendix)\b/i.test(text)) return true;
  return tag === 'h2' && /^[A-Z0-9][A-Z0-9 .,:;'"()\-]{2,70}$/.test(text);
}

/**
 * Gutenberg HTML varies considerably between editions. This parser first looks
 * for explicit chapter/part headings, then falls back to a small set of
 * repeated h2 headings. If it cannot find a reliable structure, the caller
 * can safely keep the whole ebook as one section.
 */
export function splitGutenbergHtml(html: string): GutenbergChapter[] {
  const headingPattern = /<(h[1-4])([^>]*)>([\s\S]*?)<\/\1>/gi;
  const matches: Array<{ tag: string; attrs: string; label: string; start: number; end: number }> = [];

  let match: RegExpExecArray | null;
  while ((match = headingPattern.exec(html)) !== null) {
    const label = decodeHeadingText(match[3]);
    if (!label || isNavigationHeading(label, match[2])) continue;
    matches.push({
      tag: match[1].toLowerCase(),
      attrs: match[2],
      label,
      start: match.index,
      end: headingPattern.lastIndex,
    });
  }

  const explicit = matches.filter(item => isChapterHeading(item.label));

  let boundaries = explicit;
  if (boundaries.length < 2) {
    const fallback = matches.filter(item => fallbackHeading(item.label, item.tag));
    const counts = new Map<string, number>();
    for (const item of fallback) counts.set(item.tag, (counts.get(item.tag) || 0) + 1);
    const repeatedTag = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
    boundaries = repeatedTag
      ? fallback.filter(item => item.tag === repeatedTag)
      : fallback;
  }

  if (boundaries.length < 2) {
    return [{ label: 'Full book', content: html }];
  }

  const chapters: GutenbergChapter[] = [];
  for (let index = 0; index < boundaries.length; index += 1) {
    const current = boundaries[index];
    const next = boundaries[index + 1];
    const content = html.slice(current.end, next ? next.start : html.length).trim();
    if (!content) continue;

    chapters.push({
      label: current.label,
      content,
    });
  }

  return chapters.length >= 2 ? chapters : [{ label: 'Full book', content: html }];
}
