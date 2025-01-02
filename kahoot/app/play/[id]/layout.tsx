"use client"
import { SocketProvider } from "@/src/hooks/useSocket";
import { div } from "framer-motion/client";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SocketProvider>
      <div
        style={{ backgroundImage: "url(/images/bg.webp)" }}
        className="w-screen h-screen bg-cover bg-no-repeat bg-center"
      >
        {children}
      </div>
    </SocketProvider>
  );
}
