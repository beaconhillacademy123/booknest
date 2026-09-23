import { redirect, notFound } from 'next/navigation';
import { getBook } from '../../../lib/booknest';
export default async function ReadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await getBook(id);
  if (!book) notFound();
  if (book.read_url) redirect(book.read_url);
  return null;
}