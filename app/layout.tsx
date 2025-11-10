import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nifty 50 AI Trading Agent",
  description: "Advanced AI trading agent with dynamic support/resistance levels and RSI analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
