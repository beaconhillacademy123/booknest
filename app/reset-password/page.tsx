'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase-browser';

export default function ResetPasswordPage() {
  const [password,setPassword]=useState('');
  const [confirm,setConfirm]=useState('');
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const [ready,setReady]=useState(false);
  const [invalid,setInvalid]=useState(false);

  useEffect(() => {
    let mounted=true;

    const checkSession=async () => {
      const {data}=await supabase.auth.getSession();
      if(!mounted) return;
      setReady(!!data.session);
      if(!data.session) setInvalid(true);
    };

    void checkSession();

    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
      if(!mounted) return;
      if(event==='PASSWORD_RECOVERY' || session){
        setReady(true);
        setInvalid(false);
      }
    });

    return () => {
      mounted=false;
      subscription.unsubscribe();
    };
  }, []);

  async function submit(e:FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (password.length < 6) { setMessage('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setMessage('Passwords do not match.'); return; }
    setBusy(true); setMessage('');
    const {error}=await supabase.auth.updateUser({password});
    if (error) setMessage(error.message);
    else setMessage('Password updated successfully. You can now log in with your new password.');
    setBusy(false);
  }

  return <main className="authPage"><div className="authCard">
    <Link href="/" className="authBrand"><div className="logo"><BookOpen size={22}/></div><span>M King Reads</span></Link>
    <div className="authIntro"><h1>Set a new password.</h1><p>Choose a new password for your M King Reads account.</p></div>
    {!ready && !invalid ? <div className="empty">Checking reset link...</div> : invalid ? <div className="authMessage">This password reset link is invalid or has expired. Please request a new reset link from the login page.</div> : <form className="authForm" onSubmit={submit}>
      <label>New password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} autoComplete="new-password" placeholder="At least 6 characters"/></label>
      <label>Confirm password<input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required minLength={6} autoComplete="new-password" placeholder="Repeat your password"/></label>
      {message && <div className="authMessage">{message}</div>}
      <button className="authSubmit" disabled={busy}>{busy ? <><Loader2 size={17} className="spin"/> Please wait...</> : 'Update password'}</button>
    </form>}
    <Link className="authBack" href="/login">← Back to log in</Link>
  </div></main>;
}
