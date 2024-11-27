import type { Metadata } from "next";
import { Lora } from "next/font/google";
import "./globals.css";

const lora = Lora({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { template: "%s | Awesome Shop", absolute: "Awesome Shop" },
  description: "An AWESOME SHOP built by me",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={lora.className}>{children}</body>
    </html>
  );
}
