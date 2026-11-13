import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Daybreak", description: "Real help. One step at a time." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-AU"><body>{children}</body></html>;
}
