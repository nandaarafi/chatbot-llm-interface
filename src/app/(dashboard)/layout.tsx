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
  title: "Ask Your PDF",
  description: "Chat with your PDF",
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
        <div className={`${geistSans.variable} ${geistMono.variable} h-full`}>
          <SidebarProvider defaultOpen={true}>
            <div className="flex min-h-screen bg-background">
              <div className="sticky top-0 h-screen flex-shrink-0 border-r">
                <AppSidebar user={userData}/>
              </div>
              <main className="flex-1 overflow-y-auto">
                <div className="h-full w-full">
                  {children}
                </div>
              </main>
            </div>
          </SidebarProvider>
        </div>
      );
}
