import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { Suspense } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader, SiteHeaderFallback } from "@/components/site-header";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

function metadataBaseUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return new URL(explicit);
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim();
  if (vercel) return new URL(`https://${vercel.replace(/^https?:\/\//, "")}`);
  return new URL("http://localhost:3000");
}

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl(),
  title: {
    default: "Rest In Pump",
    template: "%s · Rest In Pump",
  },
  description:
    "A Halloween graveyard for dead Solana memecoins. Read-only, a little haunted, and honest that we have all been rugged.",
  applicationName: "Rest In Pump",
};

export const viewport: Viewport = {
  themeColor: "#140818",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable} dark h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <div
          aria-hidden
          className="pointer-events-none fixed top-16 right-[8%] size-20 rounded-full bg-[#ffe1a8] opacity-70 shadow-[0_0_80px_24px_rgba(255,196,120,0.28)] sm:size-28"
        />
        <Suspense fallback={<SiteHeaderFallback />}>
          <SiteHeader />
        </Suspense>
        <div id="content" className="flex-1">
          {children}
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}
