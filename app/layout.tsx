import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://open-memome.cocoa-toast-3272.chatgpt.site"),
  title: "Open Memome | The open map of humanity's memes",
  description:
    "A public, evidence-based semantic map of the memes humans transmit.",
  openGraph: {
    title: "Open Memome",
    description: "A public, evidence-based map of the memes humans transmit.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Open Memome",
    description: "A public, evidence-based map of the memes humans transmit.",
    images: ["/og.png"],
  },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
