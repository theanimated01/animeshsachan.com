import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono, Poppins } from 'next/font/google'
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-jetbrains'
})
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-poppins'
})

export const metadata: Metadata = {
  title: "Animesh's Personal Website",
  description: "Welcome to my personal website! I'm a software engineer passionate about building great products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} ${poppins.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
