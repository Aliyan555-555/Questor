"use client";
// import { SocketProvider } from "@/src/hooks/useSocket";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log("hello")
  return (
    <div
      style={{ backgroundImage: "url(/images/bg.webp)" }}
      className="w-screen h-screen bg-cover bg-no-repeat bg-center"
    >
      {/* <SocketProvider>{children}</SocketProvider> */}
      {children}
    </div>
  );
}
