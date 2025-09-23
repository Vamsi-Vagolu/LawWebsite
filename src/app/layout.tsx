import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
// import Footer from "../components/Footer"; // if you have one
import SessionProviderWrapper from "./SessionProviderWrapper";
import MaintenanceListener from '../components/MaintenanceListener';

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Law Firm Education Site",
  description: "Legal education resources and study materials",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProviderWrapper>
          <MaintenanceListener />
          {/* ✅ Always show navbar/footer - maintenance page has its own layout */}
          <Navbar />
          <main>{children}</main>
          {/* <Footer /> */}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
