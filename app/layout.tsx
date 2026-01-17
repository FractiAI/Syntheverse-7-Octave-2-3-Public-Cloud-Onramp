import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Footer } from '@/components/Footer';
import { GlobalSupportButton } from '@/components/GlobalSupportButton';

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
      {/* Required for pricing table */}
      <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
      <body className={inter.className}>
        <ErrorBoundary>
          <div className="flex min-h-screen flex-col bg-background">
            {/* Navigation component hides itself on dashboard routes */}
            <Navigation />
            <main className="flex-1">{children}</main>
            <Footer />

            {/* Global floating support button */}
            <GlobalSupportButton />
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}
