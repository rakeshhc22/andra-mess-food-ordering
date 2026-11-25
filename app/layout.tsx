import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ANDRA MESS",
  description: "Andhra-style South Indian food, ordered online.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#8b1e2b",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full`}
    >
      <body className="h-full bg-zinc-200">
        <Providers>
          {/* Mobile shell: app is capped at phone width and centered,
              with a neutral backdrop showing on wider viewports. */}
          <div className="min-h-full w-full bg-zinc-200 flex justify-center">
            <div className="w-full max-w-[430px] min-h-full bg-cream shadow-xl">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
