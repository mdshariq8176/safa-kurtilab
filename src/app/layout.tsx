import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Safa Kurtilab | Premium Indian Ethnic Wear",
  description: "Experience the epitome of elegance with Safa Kurtilab. Exquisite cotton Kurtis, Pant Sets, and traditional ensembles handcrafted to perfection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${jakarta.variable} font-sans bg-[#fbfbf9] text-[#111827] antialiased min-h-screen flex flex-col relative`}
      >
        {/* Subtle global background watermark */}
        <div 
          className="pointer-events-none fixed inset-0 z-0 opacity-[0.015] bg-center bg-no-repeat bg-contain"
          style={{ backgroundImage: 'url("/images/logo_emblem.png")', backgroundSize: '40%' }}
        />
        <div className="relative z-10 flex flex-col min-h-screen flex-grow">
          {children}
        </div>
      </body>
    </html>
  );
}
