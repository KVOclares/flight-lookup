import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import { ShaderBackground } from '@/components/ShaderBackground';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-dm-sans',
});

export const metadata: Metadata = {
  title: 'Aero — Flight Tracker',
  description: 'Track your flight instantly. Enter your flight number to get real-time status and timezone conversions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${dmSans.className} min-h-screen antialiased bg-[#050A14] text-slate-200 selection:bg-sky-400/30`}>
        <ShaderBackground />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
