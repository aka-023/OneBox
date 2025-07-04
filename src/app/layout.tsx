"use client";
import "./globals.css";
import { SessionProvider } from "next-auth/react";


// export const metadata = {
//   title: "OneBox",
//   description: "made with ❤️",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}