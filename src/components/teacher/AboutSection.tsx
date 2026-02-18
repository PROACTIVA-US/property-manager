import { User } from 'lucide-react';

interface AboutSectionProps {
  photoUrl: string | null;
  name: string;
  tagline: string;
  bio: string;
  philosophy: string;
}

export default function AboutSection({ photoUrl, name, tagline, bio, philosophy }: AboutSectionProps) {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Photo */}
          <div className="shrink-0">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={name}
                className="w-48 h-48 rounded-2xl object-cover border-2 border-cc-border shadow-xl"
              />
            ) : (
              <div className="w-48 h-48 rounded-2xl bg-cc-surface border-2 border-cc-border flex items-center justify-center">
                <User className="h-20 w-20 text-cc-muted" />
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-bold text-cc-text mb-2">{name}</h1>
            <p className="text-lg text-cc-accent mb-6">{tagline}</p>
            {bio && (
              <p className="text-cc-muted leading-relaxed mb-4">{bio}</p>
            )}
            {philosophy && (
              <div className="mt-4 p-4 bg-cc-surface rounded-xl border border-cc-border">
                <h3 className="text-sm font-semibold text-cc-accent mb-2 uppercase tracking-wider">Teaching Philosophy</h3>
                <p className="text-cc-text italic">"{philosophy}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
