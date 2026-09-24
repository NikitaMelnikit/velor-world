import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import { Hud } from "@/components/navigation/Hud";
import { MenuOverlay, Stage } from "@/components/navigation/MenuOverlay";
import { Cursor } from "@/components/cursor/Cursor";
import { Toast } from "@/components/collect/Toast";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://velor.world"),
  title: {
    default: "VELOR — Objects with a point of view",
    template: "%s — VELOR",
  },
  description:
    "Don't visit the brand. Enter it. VELOR is a design house at the intersection of industrial design, architecture, material science and culture.",
  openGraph: {
    title: "VELOR — Enter the world",
    description: "Objects with a point of view. A digital museum, magazine, product platform and archive in one world.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${instrument.variable} ${plexMono.variable}`}>
      <body className="grain">
        <a href="#page" className="t-label sr-only fixed left-4 top-4 z-[200] bg-bone px-3 py-2 text-ink focus:not-sr-only">
          Skip to content
        </a>
        <AppProviders>
          <Stage>{children}</Stage>
          <MenuOverlay />
          <Hud />
          <Toast />
          <Cursor />
        </AppProviders>
      </body>
    </html>
  );
}
