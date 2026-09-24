'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferred(event);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!visible || !deferred) return null;

  async function install() {
    if (installing) return;
    setInstalling(true);
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch {}
    setDeferred(null);
    setVisible(false);
    setInstalling(false);
  }

  return <div className="installPrompt">
    <div><Download size={20}/><span><strong>Install M King Reads</strong><small>Keep your library one tap away.</small></span></div>
    <button className="installButton" onClick={install} disabled={installing}>{installing ? "Installing…" : "Install"}</button>
    <button className="installClose" onClick={() => setVisible(false)} aria-label="Close"><X size={17}/></button>
  </div>;
}
