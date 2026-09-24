'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineStatus() {
  const [offline, setOffline] = useState(false);
  const [justOnline, setJustOnline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    const online = () => { setOffline(false); setJustOnline(true); window.setTimeout(() => setJustOnline(false), 2200); };
    update();
    window.addEventListener('online', online);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', update);
    };
  }, []);

  if (!offline && !justOnline) return null;

  if (justOnline) return <div className="offlineStatus onlineStatus" role="status"><span>You're back online.</span></div>;

  return (
    <div className="offlineStatus" role="status">
      <WifiOff size={16} />
      <span>You're offline. Saved pages can still be opened.</span>
    </div>
  );
}
