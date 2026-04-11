import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mimu - PetCare Premium",
  description: "Cuidado premium para seu pet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>{children}</body>
    </html>
  );
}
