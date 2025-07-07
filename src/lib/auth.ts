import { db } from "@/lib/db";
import { account, user, session, verification } from "@/lib/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { env } from "@/lib/env/setting-env";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const auth = betterAuth({
    socialProviders: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
    },
    user: {
        deleteUser: { 
            enabled: true
        } 
    },
    emailAndPassword: {
        enabled: true
    },
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: user,
            session: session,
            account: account,
            verification: verification,
        },
    }),
    plugins: [nextCookies()]
});

export async function getCurrentUser() {
    const session = await auth.api.getSession({
        headers: headers()
    });

    if (!session || !session.user) {
        redirect("/login");
        throw new Error("Not authenticated");
    }

    return session.user;
}

// Add these type exports at the bottom of auth.ts
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type SessionType = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;
export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;