const TEACHASSIST_URL = import.meta.env.VITE_TEACHASSIST_URL || 'http://localhost:3000';

export default function TeachEmbed() {
  const src = `${TEACHASSIST_URL}?embedded=true`;

  return (
    <iframe
      src={src}
      title="TeachAssist"
      className="fixed inset-0 top-12 w-full h-[calc(100vh-3rem)] border-0"
      allow="clipboard-read; clipboard-write"
    />
  );
}
