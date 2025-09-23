import type { Metadata } from 'next';
<<<<<<< HEAD
=======
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});
>>>>>>> c5d9fe5741220d5347dae26caafca2da7df4e769

export const metadata: Metadata = {
  title: 'Maintenance - Law Firm Site',
  description: 'Site is currently under maintenance',
};

export default function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
<<<<<<< HEAD
  return <>{children}</>;
}
=======
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* ✅ Removed maintenance-mode class to fix hydration error */}
        {/* ✅ NO SessionProviderWrapper - completely isolated */}
        {children}
      </body>
    </html>
  );
}
>>>>>>> c5d9fe5741220d5347dae26caafca2da7df4e769
