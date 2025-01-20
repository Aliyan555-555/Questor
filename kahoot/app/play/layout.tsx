
"use client";
import { SocketProvider } from "@/src/hooks/useSocket";

export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
        <SocketProvider>
            { children }
        </SocketProvider>
    )
}