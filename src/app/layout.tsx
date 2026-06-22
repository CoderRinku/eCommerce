import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { AIChatWidget } from "@/components/common/AIChatWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SokolBazar | 100% Pure & Organic Grocery Platform",
  description: "SokolBazar is a premium Bangladeshi D2C platform offering safe, pure, and chemical-free organic groceries directly sourced from local farmers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  document.documentElement.classList.remove('dark');
                  localStorage.setItem('theme', 'light');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300 selection:bg-orange-500/30 selection:text-orange-900">
        <AppProviders>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <AIChatWidget />
        </AppProviders>
      </body>
    </html>
  );
}
