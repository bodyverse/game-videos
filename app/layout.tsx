import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AvatarSingleton } from "@/components/avatar/AvatarSingleton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BodyVerse Watch",
  description: "Watch short-form emotion-driven clips with your crew."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AvatarSingleton />
        {children}
      </body>
    </html>
  );
}
