import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gen Z Lotto",
  description: "Secure lottery platform with instant wallet funding",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}