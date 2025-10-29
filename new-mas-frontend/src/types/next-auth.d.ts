import { DefaultSession, DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
    backendToken?: string
    accessToken?: string
  }

  interface User extends DefaultUser {
    backendToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backendToken?: string
    accessToken?: string
    id?: string
  }
}
