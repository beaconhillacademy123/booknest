'use client';

import { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import { supabase } from '../../lib/supabase-browser';

export default function SaveBookButton({ bookId }: { bookId: string }) {
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { if (active) setReady(true); return; }
      const { data: row } = await supabase.from('booknest_library').select('book_id').eq('book_id', bookId).maybeSingle();
      if (active) { setSaved(!!row); setReady(true); }
    });
    return () => { active = false; };
  }, [bookId]);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = '/login';
      return;
    }
    if (saved) {
      await supabase.from('booknest_library').delete().eq('book_id', bookId);
      setSaved(false);
    } else {
      const { error } = await supabase.from('booknest_library').insert({ user_id: session.user.id, book_id: bookId });
      if (!error) setSaved(true);
    }
    setBusy(false);
  }

  if (!ready) return <button className="save" aria-label="Save book" disabled><Bookmark size={17}/></button>;
  return <button className={`save ${saved ? 'saveActive' : ''}`} onClick={toggle} disabled={busy} aria-label={saved ? 'Remove from library' : 'Save to library'} title={saved ? 'Saved to My Library' : 'Save to My Library'}><Bookmark size={17} fill={saved ? 'currentColor' : 'none'}/></button>;
}
