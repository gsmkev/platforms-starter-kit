import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { AdapterUser } from "next-auth/adapters";
import { compare } from "bcryptjs";

import { db } from "@/lib/db/client";
import type { TenantAccess } from "@/lib/auth/types";
import type { TenantRole, UserRole } from "@prisma/client";

type AdapterUserWithAccess = AdapterUser & {
  role: UserRole;
  tenantAccess: TenantAccess[];
};

const credentials = Credentials({
  name: "Email and password",
  credentials: {
    email: { label: "Email", type: "email", required: true },
    password: { label: "Password", type: "password", required: true },
  },
  authorize: async (credentials) => {
    const emailInput = credentials?.email;
    const passwordInput = credentials?.password;

    if (typeof emailInput !== "string" || typeof passwordInput !== "string") {
      return null;
    }

    const email = emailInput.toLowerCase().trim();
    const password = passwordInput;

    if (!email || !password) {
      return null;
    }

    const user = await db.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: {
            tenant: true,
          },
        },
      },
    });

    if (!user?.passwordHash) {
      return null;
    }

    const passwordMatches = await compare(password, user.passwordHash);

    if (!passwordMatches) {
      return null;
    }

    const tenantAccess: TenantAccess[] = user.memberships.map((membership) => ({
      tenantId: membership.tenantId,
      tenantSubdomain: membership.tenant.subdomain,
      role: membership.role,
    }));

    const adapterUser: AdapterUserWithAccess = {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      role: user.role,
      tenantAccess,
    };

    return adapterUser;
  },
});

export const {
  auth,
  handlers: { GET, POST },
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(db) as any,
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [credentials],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as AdapterUserWithAccess).role;
        token.tenantAccess = (user as AdapterUserWithAccess).tenantAccess;
      } else if (!token.role || !token.tenantAccess) {
        const dbUser = await db.user.findUnique({
          where: { id: token.sub! },
          include: {
            memberships: {
              include: {
                tenant: true,
              },
            },
          },
        });

        token.role = dbUser?.role ?? "USER";
        token.tenantAccess =
          dbUser?.memberships.map((membership) => ({
            tenantId: membership.tenantId,
            tenantSubdomain: membership.tenant.subdomain,
            role: membership.role as TenantRole,
          })) ?? [];
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as UserRole;
        session.user.tenantAccess = (token.tenantAccess ??
          []) as TenantAccess[];
      }

      return session;
    },
  },
});
