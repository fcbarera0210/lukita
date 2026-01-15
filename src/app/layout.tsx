import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from '@/components/ui/Toast';
import { ConditionalLayout } from '@/components/ConditionalLayout';
import { SettingsProvider } from '@/lib/settings-context';
import { ThemeProvider } from '@/components/ThemeProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lukita - Finanzas Personales",
  description: "PWA para gestionar tus finanzas personales",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lukita",
  },
  openGraph: {
    title: "Lukita - Finanzas Personales",
    description: "PWA para gestionar tus finanzas personales",
    type: "website",
    images: [
      {
        url: "/png/logo-lukita.png",
        width: 1200,
        height: 630,
        alt: "Lukita - Finanzas Personales",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lukita - Finanzas Personales",
    description: "PWA para gestionar tus finanzas personales",
    images: ["/png/logo-lukita.png"],
  },
  icons: {
    icon: [
      { url: "/svg/logo-icono.svg", type: "image/svg+xml" },
      { url: "/png/logo-icono.png", type: "image/png" },
    ],
    apple: [
      { url: "/png/logo-icono.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#00C6DB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Lukita" />
        <link rel="apple-touch-icon" href="/png/logo-icono.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors duration-300`}
      >
        <ToastProvider>
          <SettingsProvider>
            <ThemeProvider>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
            </ThemeProvider>
          </SettingsProvider>
        </ToastProvider>
      </body>
    </html>
  );
}