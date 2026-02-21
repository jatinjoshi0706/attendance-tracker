import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { LayoutDashboard, History } from 'lucide-react';
import LiveClock from '@/components/LiveClock';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Attendance Tracker',
  description: 'Track your 8-hour office shift attendance',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-white min-h-screen`}>
        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur border-b border-slate-800">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold">
                AT
              </div>
              <span className="font-semibold text-white text-sm tracking-tight">Attendance Tracker</span>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                <LayoutDashboard size={14} /> Today
              </Link>
              <Link
                href="/history"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                <History size={14} /> History
              </Link>
              <LiveClock />
            </div>
          </div>
        </nav>
        <main className="max-w-2xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
