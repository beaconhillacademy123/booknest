import { supabaseRest } from './supabase-rest';

export type Genre = { id: string; name: string; slug: string; icon: string | null };
export type Book = {
  id: string; title: string; author: string; description: string | null; cover_url: string | null;
  source_name: string | null; source_url: string | null; license: string | null; read_url: string | null; download_url: string | null;
  is_featured: boolean; publication_year: number | null; language: string | null;
  booknest_genres?: Genre | Genre[] | null;
};

export async function getGenres() {
  return supabaseRest<Genre[]>('booknest_genres?select=id,name,slug,icon&order=name.asc');
}

export async function getBooks(limit = 12) {
  return supabaseRest<Book[]>(`booknest_books?select=id,title,author,description,cover_url,source_name,source_url,license,read_url,download_url,is_featured,publication_year,language,booknest_genres(id,name,slug,icon)&order=created_at.desc&limit=${limit}`);
}

export async function getBook(id: string) {
  const rows = await supabaseRest<Book[]>(`booknest_books?select=id,title,author,description,cover_url,source_name,source_url,license,read_url,download_url,is_featured,publication_year,language,booknest_genres(id,name,slug,icon)&id=eq.${encodeURIComponent(id)}&limit=1`);
  return rows[0] ?? null;
}

export async function getBooksByGenre(slug: string, limit = 50) {
  const genres = await supabaseRest<Genre[]>(`booknest_genres?select=id,name,slug,icon&slug=eq.${encodeURIComponent(slug)}&limit=1`);
  const genre = genres[0];
  if (!genre) return { genre: null, books: [] as Book[] };
  const books = await supabaseRest<Book[]>(`booknest_books?select=id,title,author,description,cover_url,source_name,source_url,license,read_url,download_url,is_featured,publication_year,language,booknest_genres(id,name,slug,icon)&genre_id=eq.${genre.id}&order=created_at.desc&limit=${limit}`);
  return { genre, books };
}

export async function searchBooks(query: string, limit = 50) {
  const q = encodeURIComponent(`%${query}%`);
  const books = await supabaseRest<Book[]>(`booknest_books?select=id,title,author,description,cover_url,source_name,source_url,license,read_url,download_url,is_featured,publication_year,language,booknest_genres(id,name,slug,icon)&or=(title.ilike.${q},author.ilike.${q},description.ilike.${q})&order=created_at.desc&limit=${limit}`);
  return books;
}

export function getGenre(book: Book) {
  return Array.isArray(book.booknest_genres) ? book.booknest_genres[0] : book.booknest_genres;
}