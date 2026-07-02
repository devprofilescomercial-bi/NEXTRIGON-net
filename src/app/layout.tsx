import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nextrigon — conecta. colabora. realiza.",
  description: "A rede de match entre advogados: encontre o parceiro certo por especialidade, comarca e reputação.",
  openGraph: {
    title: "Nextrigon — conecta. colabora. realiza.",
    description: "A rede de match entre advogados: encontre o parceiro certo por especialidade, comarca e reputação.",
    url: "https://nextrigon.com.br",
    siteName: "Nextrigon",
    images: [
      {
        url: "https://nextrigon.com.br/logo.png",
        width: 512,
        height: 512,
        alt: "Nextrigon",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#070c18",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
