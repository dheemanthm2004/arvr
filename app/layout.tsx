import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SpecAR — WebAR Virtual Spectacle Try-On",
  description:
    "AI-powered virtual spectacle try-on using MediaPipe FaceMesh. Find your perfect frame in real time — no app required.",
  keywords: ["AR", "spectacles", "virtual try-on", "face detection", "MediaPipe", "WebAR"],
  openGraph: {
    title: "SpecAR — Virtual Spectacle Try-On",
    description: "Try spectacles in real time using your webcam. Powered by MediaPipe FaceMesh.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
