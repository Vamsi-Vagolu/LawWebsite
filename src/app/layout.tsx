import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
// import Footer from "../components/Footer"; // if you have one
import SessionProviderWrapper from "./SessionProviderWrapper";
<<<<<<< HEAD
import MaintenanceListener from '../components/MaintenanceListener';
=======
>>>>>>> c5d9fe5741220d5347dae26caafca2da7df4e769

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
<<<<<<< HEAD
          <MaintenanceListener />
=======
>>>>>>> c5d9fe5741220d5347dae26caafca2da7df4e769
          {/* ✅ Always show navbar/footer - maintenance page has its own layout */}
          <Navbar />
          <main>{children}</main>
          {/* <Footer /> */}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
