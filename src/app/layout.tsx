// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gen Z Lotto | Premium 5/90 Experience',
  description: "Ghana's Premier 5/90 Digital Lottery Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0b0b0c] text-zinc-100 min-h-screen flex flex-col font-sans antialiased selection:bg-yellow-500 selection:text-black overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}