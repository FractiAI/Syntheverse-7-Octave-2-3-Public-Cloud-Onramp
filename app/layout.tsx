import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pay via PayPal — Solitary Pipe',
  description: 'Irreducible minimum: solitary pipe to PayPal only. Pay via PayPal.Me (@PrudencioMendez924).',
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
