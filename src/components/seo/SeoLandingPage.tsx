import Link from 'next/link';

export function SeoLandingPage({
  eyebrow,
  title,
  description,
  points,
}: {
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
}) {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <article className="mx-auto max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">{eyebrow}</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">{title}</h1>
        <p className="mt-6 text-lg leading-8 text-slate-300">{description}</p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {points.map((point) => <li key={point} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200">{point}</li>)}
        </ul>
        <Link href="/" className="mt-10 inline-flex rounded-full bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600">Explore the digital skyline</Link>
      </article>
    </main>
  );
}
