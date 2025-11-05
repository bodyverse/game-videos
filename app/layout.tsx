import type { Metadata } from "next";
import "./globals.css";
import { AvatarSingleton } from "@/components/avatar/AvatarSingleton";

const loadGoogleFont = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_FONTS === "true";
const inter = loadGoogleFont ? require("next/font/google").Inter({ subsets: ["latin"] }) : null;
const bodyClassName = inter?.className ?? "font-sans";

export const metadata: Metadata = {
  title: "BodyVerse Watch",
  description: "Watch short-form emotion-driven clips with your crew."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={bodyClassName}>
        <AvatarSingleton />
        {children}
      </body>
    </html>
  );
}
