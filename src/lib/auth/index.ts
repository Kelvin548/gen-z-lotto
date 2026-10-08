import { NextAuthOptions } from "next-auth";
export * from "./phone";
export * from "./password";
export * from "./otp";
export * from "./session";
export * from "./rbac";

// NextAuth custom session interface
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}