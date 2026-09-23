import type { Metadata } from "next";
import { Fraunces, Inter, Caveat } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
  variable: "--font-fraunces",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://growwithroja.com"),
  title: "Grow With Roja - Mindset & Life Coaching",
  description:
    "Grow With Roja - life & mindset coaching with NLP, EFT and Ho'oponopono. Set boundaries, break old patterns, feel like yourself again.",
  openGraph: {
    title: "Grow With Roja - Mindset & Life Coaching",
    description:
      "Life & mindset coaching with NLP, EFT and Ho'oponopono. Set boundaries, break old patterns, feel like yourself again.",
    images: ["/roja-hero.png"],
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
