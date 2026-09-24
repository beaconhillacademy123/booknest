import Link from 'next/link';
import { ArrowLeft, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';

export default function CopyrightPage() {
  return (
    <main>
      <header className="topbar">
        <Link href="/" className="brand"><div className="logo"><BookOpen size={22}/></div><span>M King Reads</span></Link>
        <Link href="/" className="login">Back to library</Link>
      </header>

      <section className="section legalPage">
        <Link href="/" className="back"><ArrowLeft size={16}/> Back to M King Reads</Link>

        <div className="legalHero">
          <div className="legalIcon"><ShieldCheck size={28}/></div>
          <span className="sectionKicker">RIGHTS &amp; SOURCES</span>
          <h1>Copyright, Public-Domain &amp; Availability</h1>
          <p>M King Reads is a reading platform. The legal status and permitted use of a work can depend on its source, licence, rights holder and the jurisdiction in which it is accessed.</p>
        </div>

        <div className="legalCard">
          <h2>Our general approach</h2>
          <p>M King Reads may provide access to books and reading materials from our own catalogue and from third-party sources. We aim to identify the source of externally provided works and preserve relevant source information.</p>
          <p>A work that is public domain, freely available, or no longer protected by copyright in one jurisdiction may remain protected by copyright or subject to other legal restrictions elsewhere.</p>
          <p>We therefore do not treat the availability of a work through a third-party catalogue as a universal statement that the work may be downloaded, reproduced, distributed, published or commercially used everywhere.</p>
        </div>

        <div className="legalCard">
          <h2>Third-party sources</h2>
          <p>Where a book is supplied through a third-party source, the rights, licences, terms of use and source information applicable to that edition remain important. M King Reads does not claim ownership of third-party works merely because they are accessible through the platform.</p>
          <p>For Project Gutenberg editions, readers can visit the source page provided with the individual book to review the source information and applicable terms.</p>
          <a className="legalSourceLink" href="https://www.gutenberg.org/" target="_blank" rel="noreferrer">Visit Project Gutenberg <ExternalLink size={14}/></a>
        </div>

        <div className="legalCard">
          <h2>Your responsibility</h2>
          <p>Users are responsible for determining whether accessing, downloading, reproducing, distributing, publishing, adapting or commercially using a work is lawful in their jurisdiction.</p>
          <p>If you are unsure about the copyright status or permitted use of a work, seek appropriate legal guidance before using it in a way that may require permission.</p>
        </div>

        <div className="legalCard legalNotice">
          <strong>Important</strong>
          <p>M King Reads is an educational and reading platform and does not provide legal advice. This page is general information, not a legal opinion or guarantee concerning the status of any particular work.</p>
        </div>
      </section>
    </main>
  );
}
