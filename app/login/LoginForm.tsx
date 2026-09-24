'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase-browser';

export default function LoginForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = '/library';
    });
  }, []);

  async function resetPassword() {
    if (busy) return;
    const address = email.trim();
    if (!address) { setMessage('Enter your email address first.'); return; }
    setBusy(true); setMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(address, { redirectTo: `${window.location.origin}/reset-password` });
    setMessage(error ? error.message : 'Password reset instructions have been sent to your email.');
    setBusy(false);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage('');

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        setMessage(error.message);
      } else {
        window.location.href = '/library';
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
      if (error) {
        setMessage(error.message);
      } else if (data.session) {
        window.location.href = '/library';
      } else {
        setMessage('Account created. Check your email to confirm your account, then log in.');
      }
    }
    setBusy(false);
  }

  return <main className="authPage">
    <div className="authCard">
      <Link href="/" className="authBrand"><div className="logo"><BookOpen size={22}/></div><span>M King Reads</span></Link>
      <div className="authIntro">
        <h1>{mode === 'login' ? 'Welcome back.' : 'Create your library.'}</h1>
        <p>{mode === 'login' ? 'Sign in to save books and keep your reading progress.' : 'Create a free M King Reads account to build your personal library.'}</p>
      </div>
      <form className="authForm" onSubmit={submit}>
        <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" placeholder="you@example.com"/></label>
        {!forgot && <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="At least 6 characters"/></label>}
        {forgot && <p className="authHint">Enter your email and we'll send you a secure password reset link.</p>}
        {message && <div className="authMessage">{message}</div>}
        {forgot ? <button type="button" className="authSubmit" disabled={busy} onClick={resetPassword}>{busy ? <><Loader2 size={17} className="spin"/> Please wait...</> : 'Send reset link'}</button> : <button className="authSubmit" disabled={busy}>{busy ? <><Loader2 size={17} className="spin"/> Please wait...</> : mode === 'login' ? 'Log in' : 'Create account'}</button>}
      </form>
      {mode === 'login' && <button className="authSwitch" onClick={()=>{setForgot(v=>!v);setMessage('')}}>{forgot ? '← Back to log in' : 'Forgot your password?'}</button>}
      {!forgot && <button className="authSwitch" onClick={()=>{setMode(mode === 'login' ? 'signup' : 'login');setMessage('')}}>
        {mode === 'login' ? 'New to M King Reads? Create an account' : 'Already have an account? Log in'}
      </button>}
      <Link className="authBack" href="/">← Back to library</Link>
    </div>
  </main>;
}
