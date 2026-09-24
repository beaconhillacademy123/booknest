'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';

const STORAGE_KEY = 'm-king-reads-copyright-notice-ack';

export default function CopyrightNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      setOpen(localStorage.getItem(STORAGE_KEY) !== '1');
    } catch {
      setOpen(true);
    }
  }, []);

  function acknowledge() {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch {}
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="copyrightModalOverlay" role="presentation">
      <div className="copyrightModal" role="dialog" aria-modal="true" aria-labelledby="copyright-notice-title">
        <div className="copyrightModalIcon"><ShieldCheck size={24}/></div>
        <button className="copyrightModalClose" onClick={acknowledge} aria-label="Close copyright notice"><X size={19}/></button>
        <span className="sectionKicker">BEFORE YOU START READING</span>
        <h2 id="copyright-notice-title">Copyright, Public-Domain &amp; Availability Notice</h2>
        <div className="copyrightModalBody">
          <p>M King Reads provides access to books and other reading materials obtained from third-party sources, including Project Gutenberg and other lawful sources. Copyright status may vary by country or jurisdiction.</p>
          <p>A work that is public domain, freely available, or no longer protected by copyright in one jurisdiction may remain protected by copyright or subject to other legal restrictions elsewhere.</p>
          <p>M King Reads does not independently warrant that every third-party work is free from copyright restrictions in every country. You are responsible for determining whether accessing, downloading, reproducing, distributing, publishing, or otherwise using a work is lawful in your jurisdiction.</p>
          <p>If you are unsure about the copyright status or permitted use of a work, please seek appropriate legal guidance before reproducing, distributing, publishing, or commercially using it.</p>
        </div>
        <p className="copyrightModalFinePrint">M King Reads is an educational and reading platform and does not provide legal advice.</p>
        <button className="copyrightModalButton" onClick={acknowledge}>I understand</button>
      </div>
    </div>
  );
}
