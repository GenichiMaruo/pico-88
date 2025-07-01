import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pico88 - 8ビットCPUシミュレータ",
  description:
    "教育およびホビー用途向けの8ビットマイクロプロセッサ「PICO-88」のWebベースシミュレータ。アセンブリ言語の学習やレトロコンピューティングの体験ができます。",
  keywords: [
    "8bit",
    "CPU",
    "simulator",
    "assembly",
    "programming",
    "education",
    "retro computing",
    "PICO-88",
  ],
  authors: [{ name: "Genichi Maruo", url: "https://maru1010.com/" }],
  creator: "Genichi Maruo",
  openGraph: {
    title: "Pico88 - 8ビットCPUシミュレータ",
    description:
      "教育およびホビー用途向けの8ビットマイクロプロセッサ「PICO-88」のWebベースシミュレータ。アセンブリ言語の学習やレトロコンピューティングの体験ができます。",
    url: "https://pico88.maru1010.com",
    siteName: "Pico88 Simulator",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pico88 - 8ビットCPUシミュレータ",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pico88 - 8ビットCPUシミュレータ",
    description:
      "教育およびホビー用途向けの8ビットマイクロプロセッサ「PICO-88」のWebベースシミュレータ。アセンブリ言語の学習やレトロコンピューティングの体験ができます。",
    images: ["/og-image.png"],
    creator: "@your_twitter_handle", // 実際のTwitterハンドルに変更してください
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Google Search Console用（必要に応じて設定）
    // google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Pico88",
    description:
      "教育およびホビー用途向けの8ビットマイクロプロセッサ「PICO-88」のWebベースシミュレータ。アセンブリ言語の学習やレトロコンピューティングの体験ができます。",
    url: "https://pico88.maru1010.com",
    author: {
      "@type": "Person",
      name: "Genichi Maruo",
      url: "https://maru1010.com/",
    },
    applicationCategory: "EducationApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      ratingCount: "1",
    },
  };

  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
