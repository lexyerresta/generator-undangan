import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Generator Link Undangan",
  description: "Generate link undangan nikahan otomatis & elegan",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-950 text-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}
