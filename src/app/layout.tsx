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
  title: "LarDia - eSocial sem erro, sem estresse",
  description: "Calculadora inteligente para empregador doméstico. Folha de pagamento, férias, 13º e rescisão com 100% de precisão.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  openGraph: {
    title: "LarDia - eSocial sem erro, sem estresse",
    description: "Calculadora inteligente para empregador doméstico. Folha de pagamento, férias, 13º e rescisão com 100% de precisão.",
    url: "https://lardia.com.br",
    siteName: "LarDia",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "https://lardia.com.br/icon-512.png",
        width: 512,
        height: 512,
        alt: "LarDia - eSocial sem erro, sem estresse",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LarDia - eSocial sem erro, sem estresse",
    description: "Calculadora inteligente para empregador doméstico. Folha de pagamento, férias, 13º e rescisão com 100% de precisão.",
    images: ["https://lardia.com.br/icon-512.png"],
  },
  alternates: {
    canonical: "https://lardia.com.br",
  },
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
