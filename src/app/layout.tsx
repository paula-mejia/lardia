import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import GoogleAnalytics from "@/components/analytics/google-analytics";
import MetaPixel from "@/components/analytics/meta-pixel";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lardia.com.br"),
  title: {
    default: "LarDia - Gestão de Empregados Domésticos",
    template: "%s | LarDia",
  },
  description:
    "A forma mais simples de gerenciar sua empregada doméstica dentro da lei. Cálculos automáticos, eSocial integrado e contracheques digitais.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: "LarDia - Gestão de Empregados Domésticos",
    description:
      "A forma mais simples de gerenciar sua empregada doméstica dentro da lei. Cálculos automáticos, eSocial integrado e contracheques digitais.",
    url: "https://lardia.com.br",
    siteName: "LarDia",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "LarDia - Seu lar em dia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LarDia - Gestão de Empregados Domésticos",
    description:
      "A forma mais simples de gerenciar sua empregada doméstica dentro da lei. Cálculos automáticos, eSocial integrado e contracheques digitais.",
    images: ["/icon-512.png"],
  },
  alternates: {
    canonical: "https://lardia.com.br",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "LarDia",
  url: "https://lardia.com.br",
  logo: "https://lardia.com.br/icon-512.png",
  description:
    "A forma mais simples de gerenciar sua empregada doméstica dentro da lei.",
  sameAs: [],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <GoogleAnalytics />
        <MetaPixel />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
