import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster, toast } from 'sonner'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Your App Name",
  description: "Your application description",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-background">
        <SidebarProvider defaultOpen={true}>
          <div className="flex h-screen bg-background overflow-hidden">
            <div className="h-screen sticky top-0 flex-shrink-0 border-r">
              <AppSidebar />
            </div>
            <main className="flex-1 overflow-y-auto transition-[margin] duration-300 ease-in-out">
              <div className="max-w-7xl mx-auto w-full p-4">
                {children}
              </div>
            </main>
          </div>
        </SidebarProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
