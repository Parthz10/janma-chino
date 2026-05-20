import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Compass, HeartHandshake } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Janma Chino Kundali',
  description: 'Precise Vedic astrology and compatibility platform for Nepal and India',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#08111f] text-slate-50 antialiased flex flex-col">
        {/* Sticky Glassmorphic Header */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-[#08111f]/80 backdrop-blur-md shadow-lg">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              
              {/* Brand Logo */}
              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-2xl font-extrabold text-amber-500 group-hover:scale-110 transition-transform duration-200">
                  ॐ
                </span>
                <span className="text-lg font-bold tracking-wider text-white group-hover:text-amber-400 transition-colors">
                  Janma Chino
                </span>
              </Link>

              {/* Navigation Actions */}
              <nav className="flex items-center gap-6">
                <Link 
                  href="/chart" 
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <Compass className="h-4 w-4 text-amber-400/80" />
                  <span>Chart Generator</span>
                </Link>
                
                <Link 
                  href="/compatibility" 
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <HeartHandshake className="h-4 w-4 text-rose-400/80 animate-pulse" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-rose-300 font-bold">
                    Kundali Matcher
                  </span>
                </Link>
              </nav>

            </div>
          </div>
        </header>

        <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}

