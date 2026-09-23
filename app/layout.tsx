import "./globals.css";
export const metadata = { title: "M King Reads", description: "Discover and read free books." };
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}