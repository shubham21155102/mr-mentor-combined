import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { isTokenExpired, willExpireSoon } from "@/lib/jwt"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!response.ok) {
            return null
          }

          const data = await response.json()
          
          if (data.token && data.user) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              image: data.user.image,
              backendToken: data.token,
            }
          }

          return null
        } catch (error) {
          console.error('Error during credentials sign in:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only handle Google sign-in here
      if (account?.provider === 'google') {
        try {
          // Send the Google ID token to your backend
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              idToken: account?.id_token,
            }),
          })

          if (!response.ok) {
            console.error('Backend authentication failed')
            return false
          }

          const data = await response.json()
          
          // Store the backend JWT token and user info
          if (data.token && data.user) {
            // @ts-ignore - Adding custom property
            user.backendToken = data.token
            // @ts-ignore
            user.id = data.user.id
            user.name = data.user.name
            user.email = data.user.email
            user.image = data.user.image
          }

          return true
        } catch (error) {
          console.error('Error during Google sign in:', error)
          return false
        }
      }
      
      // For credentials provider, user is already populated in authorize
      return true
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        return {
          ...token,
          // @ts-ignore
          backendToken: user.backendToken,
          accessToken: account?.access_token,
          id: user.id,
        }
      }

      // Check if backend token is expired
      if (token.backendToken) {
        const tokenExpired = isTokenExpired(token.backendToken as string);
        if (tokenExpired === true) {
          console.warn('Backend token expired, clearing session');
          // @ts-ignore
          token.backendToken = null;
        }

        // Check if token will expire soon (within 5 minutes)
        if (willExpireSoon(token.backendToken as string, 5 * 60 * 1000)) {
          console.warn('Backend token will expire soon, consider implementing refresh logic');
        }
      }

      return token
    },
    async session({ session, token }) {
      // Check if backend token is expired before sending to client
      if (token.backendToken && isTokenExpired(token.backendToken as string) === true) {
        console.warn('Backend token expired in session callback, clearing token');
        return {
          ...session,
          backendToken: null,
          accessToken: null,
          user: {
            ...session.user,
            id: null,
          }
        }
      }

      // Send properties to the client
      return {
        ...session,
        // @ts-ignore
        backendToken: token.backendToken,
        // @ts-ignore
        accessToken: token.accessToken,
        user: {
          ...session.user,
          // @ts-ignore
          id: token.id,
        }
      }
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
