import type { Metadata } from "next";
import { Instrument_Serif, Overpass_Mono, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const overpassMono = Overpass_Mono({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-overpass-mono",
  display: "swap",
});

const sourceSans3 = Source_Sans_3({
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Alison Partee — UX Designer & Systems Builder",
  description:
    "Portfolio of Alison Partee — UX designer and systems builder specializing in data visualization, workflow automation, and human-centered technology.",
  openGraph: {
    title: "Alison Partee — UX Designer & Systems Builder",
    description:
      "Portfolio of Alison Partee — UX designer and systems builder specializing in data visualization, workflow automation, and human-centered technology.",
    url: "https://alisonpartee.com",
    siteName: "Alison Partee",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${overpassMono.variable} ${sourceSans3.variable}`}
    >
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
