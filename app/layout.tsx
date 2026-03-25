export const metadata = {
  title: "Quantum Frequency V3",
  description: "Frequency generator app",
  themeColor: "#000000"
};
import './globals.css';
import type { Metadata } from 'next';
import { Orbitron, Rajdhani, Share_Tech_Mono } from 'next/font/google';

const orbitron = Orbitron({
  variable: '--font-orbitron',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
});

const rajdhani = Rajdhani({
  variable: '--font-rajdhani',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

const shareTechMono = Share_Tech_Mono({
  variable: '--font-share-tech-mono',
  subsets: ['latin'],
  weight: '400',
});

export const metadata: Metadata = {
  title: 'Quantum Frequency v3',
  description: 'Play therapeutic square wave frequencies in custom sequences for the QSB',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${orbitron.variable} ${rajdhani.variable} ${shareTechMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
        <link rel="manifest" href="/manifest.json" />
      </body>
    </html>
  );
}
