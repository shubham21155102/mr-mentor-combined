import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/contexts/UserContext";
import { AuthProvider } from "@/providers/AuthProvider";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "MR Mentor - Expert Mentorship Platform",
  description: "Level up with guided mock interviews and personalized feedback from experts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${roboto.variable} font-sans`}>
        <ErrorBoundary>
          <AuthProvider>
            <UserProvider>
              {children}
            </UserProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
