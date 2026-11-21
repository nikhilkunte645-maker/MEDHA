import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MEDHA — Adaptive AI Learning Intelligence Platform',
  description: 'Know what you know. Fix what you don\'t. Evidence-based conceptual knowledge tracking, reasoning diagnosis, and adaptive question generation for Class 10 Physics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-canvas text-text-primary min-h-screen antialiased selection:bg-accent-primary selection:text-white">
        {children}
      </body>
    </html>
  );
}