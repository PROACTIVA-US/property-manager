import { useEffect } from 'react';
import CodexConcept from '../design-comparison/codex/CodexConcept';
import KimiConcept from '../design-comparison/kimi/KimiConcept';

export default function DesignConcept({ variant }: { variant: 'a' | 'b' }) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `House · Concept ${variant.toUpperCase()}`;
    return () => { document.title = previousTitle; };
  }, [variant]);

  return variant === 'a' ? <CodexConcept /> : <KimiConcept />;
}
