import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SessionProviderWrapper from "./SessionProviderWrapper"; // client wrapper

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LawFirmEdu",
  description: "Law notes, quizzes, and educational resources for aspiring lawyers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProviderWrapper>
          <div className="flex flex-col min-h-screen">
            <header>
              <Navbar />
            </header>

            <main className="flex-grow bg-gray-50">
              {children}
            </main>

            <footer>
              <Footer />
            </footer>
          </div>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
