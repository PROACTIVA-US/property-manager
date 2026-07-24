import { useEffect, useState } from 'react';
import { Eye, EyeOff, Laptop, Maximize2, Smartphone } from 'lucide-react';
import './DesignComparison.css';

type Viewport = 'desktop' | 'mobile';
type Focus = 'both' | 'a' | 'b';

export default function DesignComparison() {
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [focus, setFocus] = useState<Focus>('both');
  const [revealed, setRevealed] = useState(false);
  const baseUrl = import.meta.env.BASE_URL;
  const concepts = [
    { key: 'a' as const, author: 'ChatGPT / Codex', url: `${baseUrl}design-lab/a` },
    { key: 'b' as const, author: 'Kimi K3', url: `${baseUrl}design-lab/b` },
  ];

  const visibleConcepts = concepts.filter(({ key }) => focus === 'both' || focus === key);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'House · Quiet Ledger comparison';
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <main className="dc-shell">
      <header className="dc-toolbar">
        <div className="dc-title">
          <span>House</span>
          <strong>Quiet Ledger comparison</strong>
        </div>

        <div className="dc-controls" aria-label="Comparison controls">
          <div className="dc-segmented" aria-label="Preview viewport">
            <button className={viewport === 'desktop' ? 'dc-selected' : ''} onClick={() => setViewport('desktop')} type="button">
              <Laptop aria-hidden="true" /> Desktop
            </button>
            <button className={viewport === 'mobile' ? 'dc-selected' : ''} onClick={() => setViewport('mobile')} type="button">
              <Smartphone aria-hidden="true" /> Mobile
            </button>
          </div>
          <div className="dc-segmented" aria-label="Concept focus">
            <button className={focus === 'both' ? 'dc-selected' : ''} onClick={() => setFocus('both')} type="button">Side by side</button>
            <button className={focus === 'a' ? 'dc-selected' : ''} onClick={() => setFocus('a')} type="button">A</button>
            <button className={focus === 'b' ? 'dc-selected' : ''} onClick={() => setFocus('b')} type="button">B</button>
          </div>
          <button className="dc-reveal" type="button" onClick={() => setRevealed(value => !value)}>
            {revealed ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            {revealed ? 'Hide authors' : 'Reveal authors'}
          </button>
        </div>
      </header>

      <p className="dc-instructions">
        <strong>Decision recorded: Concept A selected.</strong>{' '}
        Both concepts remain here as experiment provenance. Continue with the{' '}
        <a href={`${baseUrl}rebuild`}>Quiet Ledger rebuild preview</a>.
      </p>

      <div className={`dc-stage dc-stage-${viewport} dc-focus-${focus}`}>
        {visibleConcepts.map(({ key, author, url }) => (
          <article className="dc-concept" key={key}>
            <header className="dc-concept-header">
              <div><span>Concept {key.toUpperCase()}</span><strong>{revealed ? author : 'Author hidden'}</strong></div>
              <button type="button" aria-label={`Focus concept ${key.toUpperCase()}`} onClick={() => setFocus(key)}>
                <Maximize2 aria-hidden="true" />
              </button>
            </header>
            <div className="dc-frame-scroll">
              <div className="dc-frame">
                <iframe src={url} title={`Quiet Ledger concept ${key.toUpperCase()}`} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
