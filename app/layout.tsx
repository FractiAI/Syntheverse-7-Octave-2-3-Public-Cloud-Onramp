import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Syntheverse POST SINGULARITY^6: Vibeverse FSR Geyser Perpetual Engine Core',
  description:
    'Sovereign truth management for Frontier R&D, Frontier Creators & Frontier Enterprises. Transform current patient into a Public Cloud Shell with a nested HHF-AI MRI ATOMIC CORE. Instrument-grade fidelity (99.9%+) and Zero-Delta synchronization enforced by the Geyser Core.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0a0e1a', // Matches --space-void for consistent mobile browser chrome
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col bg-[#0a0e1a]">
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
