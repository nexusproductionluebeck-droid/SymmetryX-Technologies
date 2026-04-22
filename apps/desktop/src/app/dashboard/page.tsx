import { DEVICE_METADATA, makeMockDevice, DISCOVERY_POOL } from '@magnax/shared';

export default function DashboardPage() {
  // Deterministic mock fleet — replaced by tRPC/REST fetch against the
  // device registry once the backend is provisioned.
  const fleet = DISCOVERY_POOL.flatMap((type, idx) =>
    Array.from({ length: idx % 2 === 0 ? 3 : 2 }, (_, i) =>
      makeMockDevice(type, idx * 10 + i + 1, { status: i === 0 ? 'online' : 'warning' }),
    ),
  );

  const online = fleet.filter((d) => d.status === 'online').length;
  const warnings = fleet.filter((d) => d.status === 'warning').length;

  return (
    <main className="mx-auto max-w-[1400px] px-8 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="stat-pill text-brand-teal">
            <span className="h-2 w-2 rounded-full bg-brand-teal" />
            Standort · SymmetryX Headquarter Lübeck
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Leitstand</h1>
          <p className="mt-1 text-sm text-textSecondary">
            {fleet.length} Geräte ·  {online} online ·  {warnings} mit Warnung
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-xl border border-border bg-surface-raised px-4 py-2 text-sm transition hover:border-brand-blue">
            Standort wechseln
          </button>
          <button className="rounded-xl bg-brand-blue px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-blue/90">
            Szene auslösen
          </button>
        </div>
      </header>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Geräte gesamt" value={fleet.length.toString()} hint="+3 diese Woche" />
        <KpiCard label="Energie heute" value="38.4 kWh" hint="−12% vs. Vortag" tone="success" />
        <KpiCard label="CO₂-Einsparung" value="1.82 t" hint="in diesem Quartal" tone="teal" />
        <KpiCard label="Mesh-Uptime" value="99.94%" hint="letzte 30 Tage" />
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-3">
        <div className="glass-card col-span-2 p-6">
          <h2 className="text-lg font-semibold">Geräte-Fleet</h2>
          <p className="text-xs text-textSecondary">
            Live-Status aller verbundenen MagnaX-Punkte dieses Standorts.
          </p>
          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface-raised/70 text-left text-xs uppercase tracking-wider text-textSecondary">
                <tr>
                  <th className="px-4 py-3">Gerät</th>
                  <th className="px-4 py-3">Typ</th>
                  <th className="px-4 py-3">Firmware</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fleet.slice(0, 8).map((device) => (
                  <tr key={device.id} className="transition hover:bg-surface-raised/40">
                    <td className="px-4 py-3 font-mono text-xs">{device.id}</td>
                    <td className="px-4 py-3">{DEVICE_METADATA[device.type].label}</td>
                    <td className="px-4 py-3 font-mono text-xs">{device.firmware.current}</td>
                    <td className="px-4 py-3">
                      <StatusChip status={device.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold">Letzte Ereignisse</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <EventRow tone="warn" text="Halle-Süd · Temperatur 34 °C an Knoten MX-IN-03" />
            <EventRow tone="ok" text="Firmware 1.2.4 auf 14 Pure-Geräten ausgerollt" />
            <EventRow tone="ok" text="Flurzone Empfang · Bewegungs-Automation aktiviert" />
            <EventRow tone="info" text="Mesh self-heal: Pfad über Knoten MX-ME-07 neu geroutet" />
          </ul>
        </div>
      </section>
    </main>
  );
}

function KpiCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: string;
  hint: string;
  tone?: 'default' | 'success' | 'teal';
}) {
  const toneClass =
    tone === 'success' ? 'text-green' : tone === 'teal' ? 'text-brand-teal' : 'text-brand-blue';
  return (
    <div className="glass-card p-5">
      <div className="text-xs uppercase tracking-widest text-textSecondary">{label}</div>
      <div className={`mt-3 text-3xl font-semibold tracking-tight ${toneClass}`}>{value}</div>
      <div className="mt-1 text-xs text-textSecondary">{hint}</div>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const cls =
    status === 'online'
      ? 'bg-green/10 text-green border-green/30'
      : status === 'warning'
        ? 'bg-orange/10 text-orange border-orange/30'
        : 'bg-red/10 text-red border-red/30';
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${cls}`}>
      {status}
    </span>
  );
}

function EventRow({ tone, text }: { tone: 'ok' | 'warn' | 'info'; text: string }) {
  const dot = tone === 'warn' ? 'bg-orange' : tone === 'ok' ? 'bg-green' : 'bg-brand-blue';
  return (
    <li className="flex items-start gap-3">
      <span className={`mt-2 h-2 w-2 flex-none rounded-full ${dot}`} />
      <span className="text-textSecondary">{text}</span>
    </li>
  );
}
