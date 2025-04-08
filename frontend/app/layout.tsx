import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import Providers from './providers';

// Importación detectHost eliminada porque no se usa
// import { detectHost } from "./api";

const inter = Inter({ subsets: ["latin"] });

// Use the environment variables for metadata
export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_SITE_TITLE || "Default Title",
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "Default Description",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const faviconUrl = process.env.NEXT_PUBLIC_FAVICON_URL || "/static/icon.ico";

  return (
    <html lang="es">
      {/* <link rel="icon" href="icon.ico" />
      <link rel="icon" href={faviconUrl} /> */}

      <link href={faviconUrl} rel="icon" type="image/x-icon"></link>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
