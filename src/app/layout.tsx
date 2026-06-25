import type { Metadata } from "next";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "WrapLayer",
  description: "Zama Wrapper Registry Explorer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}