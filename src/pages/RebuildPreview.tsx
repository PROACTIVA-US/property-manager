import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import CodexConcept from '../design-comparison/codex/CodexConcept';
import './RebuildPreview.css';

export default function RebuildPreview() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'House · Quiet Ledger rebuild';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <main className="rb-preview">
      <header className="rb-preview-status" aria-label="Rebuild status">
        <div>
          <CheckCircle2 aria-hidden="true" />
          <span>Selected direction</span>
          <strong>Quiet Ledger · Concept A</strong>
        </div>
        <p>
          Foundation preview — authentication and property data are intentionally
          not connected on this route yet.
        </p>
      </header>
      <CodexConcept />
    </main>
  );
}
