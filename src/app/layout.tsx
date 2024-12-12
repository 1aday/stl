import type { Metadata } from 'next/dist/lib/metadata/types/metadata-interface';
import "./globals.css";

export const metadata: Metadata = {
  title: "STL Viewer",
  description: "A simple STL viewer with customization options",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
