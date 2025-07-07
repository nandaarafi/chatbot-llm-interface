import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import  { PanelLeftOpen } from "lucide-react"
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { user as usersTable } from "@/lib/db/schema/auth";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";

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

export default async function LayoutPrivate({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })

    const userRows = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, session!.user.id))
    .limit(1);
      
    const dbUser = userRows[0];

    if (!dbUser) {
    redirect('/sign-in');
    }
    const userData = {
        ...dbUser.user_metadata,
        email: dbUser.email,
        image: dbUser.image,
        id: dbUser.id,
        name: dbUser.name,
      };

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-background">
        <SidebarProvider defaultOpen={true}>
          <div className="flex h-screen bg-background overflow-hidden">
            <div className="h-screen sticky top-0 flex-shrink-0 border-r">
              <AppSidebar user={userData}/>
              <PanelLeftOpen />
            </div>
            <main className="flex-1 overflow-y-auto transition-[margin] duration-300 ease-in-out">
              <div className="max-w-7xl mx-auto w-full p-4">
                {children}
              </div>
            </main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
