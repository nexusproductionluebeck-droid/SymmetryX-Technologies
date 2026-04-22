'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const disabled = !email.includes('@') || password.length < 6 || busy;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    router.push('/dashboard');
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="glass-card p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Willkommen zurück</h1>
          <p className="mt-1 text-sm text-textSecondary">
            Melde dich an, um deinen Mandanten zu verwalten.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm">
            <span className="text-textSecondary">E-Mail</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm text-textPrimary outline-none transition focus:border-brand-blue"
              placeholder="name@unternehmen.de"
              required
            />
          </label>

          <label className="block text-sm">
            <span className="text-textSecondary">Passwort</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm text-textPrimary outline-none transition focus:border-brand-blue"
              required
            />
          </label>

          <button
            type="submit"
            disabled={disabled}
            className="w-full rounded-xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Anmeldung läuft …' : 'Anmelden'}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-widest text-textSecondary">
          <div className="h-px flex-1 bg-border" />
          oder
          <div className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="mt-6 w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm font-medium text-textPrimary transition hover:border-brand-blue"
        >
          Mit Enterprise SSO fortfahren
        </button>
      </div>
    </main>
  );
}
