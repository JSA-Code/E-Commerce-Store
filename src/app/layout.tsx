import type { Metadata } from "next";
import { Lora } from "next/font/google";
import "./globals.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ReactQueryProvider from "./ReactQueryProvider";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

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
      <body className={lora.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange
        >
          {/* // * provider is client comp but passes w/ children prop therefore render separately and not converted to client comp  */}
          <ReactQueryProvider>
            <Navbar />
            <div className="min-h-[50vh]">{children}</div>
            <Footer />
          </ReactQueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
