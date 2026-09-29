import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BetGift",
  description: "Send a bet. Give them something to root for."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
