import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

export const metadata: Metadata = {
  title: 'MagnaX Desktop — SymmetryX Technologies',
  description:
    'Der Leitstand für MagnaX-Infrastruktur. Hallen, Gebäude, Sensorik, Mesh — alles auf einer Oberfläche.',
  applicationName: 'MagnaX Desktop',
  authors: [{ name: 'SymmetryX Technologies S.L.' }],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
