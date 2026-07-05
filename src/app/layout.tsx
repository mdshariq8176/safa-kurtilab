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
  description: "Experience the epitome of elegance with Safa Kurtilab. Exquisite silk, velvet, and georgette Kurtis, Anarkalis, and traditional ensembles handcrafted to perfection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${jakarta.variable} font-sans bg-[#fbfbf9] text-[#111827] antialiased min-h-screen flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
