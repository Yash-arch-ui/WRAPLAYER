import type { Metadata } from "next";
import { Dancing_Script } from "next/font/google"; // <-- Imports right from Google Fonts natively
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import  "./providers";
import Providers from "./providers";

// Configure the cursive font
const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-cursive",
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "WrapLayer",
  description: "Zama Wrapper Registry-Operating with Secure Confidential Registry",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={dancingScript.variable}>
      <body>
        <Providers>
          {children}
          </Providers></body>
    </html>
  );
}