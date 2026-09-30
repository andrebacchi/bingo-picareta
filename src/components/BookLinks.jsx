import { BookOpen, Download, ExternalLink, Award } from "lucide-react";

const BOOKS = [
  {
    title: "Manual Prático do Picareta em Saúde",
    badge: "Semifinalista do prêmio Jabuti 2025",
    img: `${import.meta.env.BASE_URL}img/livro-manual-picareta.jpg`,
    href: "https://a.co/d/0d6uiH9U",
    cta: "Comprar na Amazon",
    icon: ExternalLink,
    accent: "from-rose-500 to-red-600"
  },
  {
    title: "Tarot Cético — Cartomancia Racional",
    subtitle: "Download grátis · livro sobre falácias e vieses",
    img: `${import.meta.env.BASE_URL}img/livro-tarot-cetico.jpg`,
    href: "https://drive.google.com/file/d/1Zi7Wb5T2tQAeCNduO-DvIcjNKGJ6-aE_/view",
    cta: "Baixar grátis",
    icon: Download,
    accent: "from-amber-500 to-yellow-600"
  }
];

export default function BookLinks() {
  return (
    <section className="mt-10">
      <div className="flex items-center gap-2 mb-3 justify-center">
        <BookOpen className="w-4 h-4 text-rose-500" />
        <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">Leituras do Picareta</h2>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {BOOKS.map((b) => {
          const Icon = b.icon;
          return (
            <a
              key={b.title}
              href={b.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-300 transition-all"
            >
              <div className="w-16 sm:w-20 shrink-0">
                <img
                  src={b.img}
                  alt={b.title}
                  className="w-full rounded-lg shadow-md ring-1 ring-slate-200 object-cover aspect-[3/4]"
                />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <h3 className="font-bold text-slate-900 text-sm leading-tight">{b.title}</h3>
                {b.badge && (
                  <p className="flex items-center gap-1 text-xs font-semibold text-amber-600 mt-0.5">
                    <Award className="w-3 h-3 shrink-0" /> {b.badge}
                  </p>
                )}
                {b.subtitle && <p className="text-xs text-slate-500 mt-0.5">{b.subtitle}</p>}
                <span className={`mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-full bg-gradient-to-r ${b.accent} w-fit`}>
                  <Icon className="w-3.5 h-3.5" /> {b.cta}
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}