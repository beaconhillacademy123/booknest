import "./globals.css";
import Script from "next/script";
import OfflineStatus from "./components/OfflineStatus";

export const metadata = {
  title: "M King Reads",
  description: "Discover and read free books.",
  manifest: "/manifest.webmanifest",
  themeColor: "#2d261f",
  icons: { icon: "/icon-192.svg", apple: "/icon-192.svg" }
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body><OfflineStatus />{children}<Script id="pwa-register">{`if ('serviceWorker' in navigator) { window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {})); }`}</Script></body></html>;
}