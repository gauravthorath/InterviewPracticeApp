import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Interview Practice",
  description:
    "Mock interviewer with five prompting techniques. Demo mode needs no API key; paste an OpenRouter key for a live run.",
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="en">
    <body className={`${sans.variable} ${serif.variable}`}>{children}</body>
  </html>
);

export default RootLayout;
