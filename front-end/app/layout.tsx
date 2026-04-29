import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Burnout Detection System",
  description:
    "Industrial Employee Burnout Detection — AI-powered wellness monitoring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-parchment text-near-black font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
