import type { Metadata } from "next";
import { Sora, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/context/DataContext";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Catering Control Tower",
  description: "Mock cockpit for catering contractor operations",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sora.variable} ${spaceGrotesk.variable} ${spaceMono.variable} antialiased`}
      >
        <DataProvider>
          {children}
        </DataProvider>
      </body>
    </html>
  );
}
