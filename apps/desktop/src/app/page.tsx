import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col items-start justify-center px-8 py-24">
      <span className="stat-pill text-brand-teal">
        <span className="h-2 w-2 rounded-full bg-brand-teal" />
        SymmetryX Technologies S.L.
      </span>
      <h1 className="mt-6 text-6xl font-semibold tracking-tight sm:text-7xl">
        MagnaX <span className="text-brand-teal">Leitstand</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-textSecondary">
        Jeder Deckenpunkt ein Infrastrukturknoten. Jeder Infrastrukturknoten eine
        Datenquelle. Dieses Cockpit bündelt Licht, Mesh, Sensorik und Sicherheit
        für Industrie und Gewerbe.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Link
          href="/login"
          className="rounded-xl bg-brand-blue px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-blue/90"
        >
          Anmelden
        </Link>
        <Link
          href="/dashboard"
          className="rounded-xl border border-border bg-surface-raised px-6 py-3 text-sm font-semibold text-textPrimary transition hover:border-brand-blue"
        >
          Demo-Dashboard
        </Link>
      </div>

      <div className="mt-20 grid w-full gap-5 sm:grid-cols-3">
        <FeatureCard
          title="Mesh-Topologie"
          body="Live-Graph jedes Deckenpunkts. Self-healing WLAN aus der Infrastruktur."
        />
        <FeatureCard
          title="Sensorik & Analytics"
          body="Raumnutzung, Energie, Luftqualität. ESG-konforme Reports mit einem Klick."
        />
        <FeatureCard
          title="Industrie-Ready"
          body="AGV-Navigation, Evakuierungsmodus, Wartungs-Vorhersage. Multi-Standort, White-Label."
        />
      </div>
    </main>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-base font-semibold text-textPrimary">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-textSecondary">{body}</p>
    </div>
  );
}
