'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, LibraryBig, LogOut, UserRound } from 'lucide-react';
import { supabase } from '../../lib/supabase-browser';

export default function ProfilePage() {
  const [email, setEmail] = useState('');
  const [initial, setInitial] = useState('M');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ saved: 0, progress: 0, completed: 0 });
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = '/login'; return; }
      const address = session.user.email ?? '';
      setEmail(address);
      setInitial(address.charAt(0).toUpperCase() || 'M');

      const { data } = await supabase
        .from('booknest_library')
        .select('book_id,booknest_reading_progress(progress)');
      const rows = (data ?? []).map((r: any) => ({
        progress: Array.isArray(r.booknest_reading_progress)
          ? r.booknest_reading_progress[0]?.progress
          : r.booknest_reading_progress?.progress
      }));
      setStats({
        saved: rows.length,
        progress: rows.filter((r: any) => Number(r.progress) > 0 && Number(r.progress) < 100).length,
        completed: rows.filter((r: any) => Number(r.progress) >= 100).length
      });
      setLoading(false);
    }
    load();
  }, []);

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  if (loading) return <main className="simplePage"><p>Loading your account...</p></main>;

  return <main>
    <header className="topbar">
      <Link href="/" className="brand"><div className="logo"><BookOpen size={22}/></div><span>M King Reads</span></Link>
      <Link href="/library" className="login">My Library</Link>
    </header>
    <section className="section profilePage">
      <Link href="/library" className="back">← Back to my library</Link>
      <div className="profileCard">
        <div className="profileIdentity">
          <div className="profileAvatar">{initial}</div>
          <div><h1>Your account</h1><p>{email}</p></div>
        </div>
        <div className="libraryStats">
          <div className="libraryStat"><strong>{stats.saved}</strong><span>Saved books</span></div>
          <div className="libraryStat"><strong>{stats.progress}</strong><span>In progress</span></div>
          <div className="libraryStat"><strong>{stats.completed}</strong><span>Completed</span></div>
        </div>
        <div className="profileActions">
          <Link className="profileAction" href="/library"><LibraryBig size={17}/> Open My Library</Link><Link className="profileAction" href="/bookmarks"><BookOpen size={17}/> My Bookmarks</Link><Link className="profileAction" href="/my-suggestions"><BookOpen size={17}/> My Book Suggestions</Link>
          <Link className="profileAction" href="/"><UserRound size={17}/> Discover books</Link>
          <button className="profileAction profileDanger" onClick={logout} disabled={loggingOut}><LogOut size={17}/> {loggingOut ? "Logging out…" : "Log out"}</button>
        </div>
      </div>
    </section>
  </main>;
}