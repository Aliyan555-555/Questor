// "use client";

// import { RootState } from "@/src/redux/store";
// import { useSelector } from "react-redux";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const quiz = useSelector((root:RootState) => root.student.currentGame)
  return (
    <div
      // style={{ backgroundImage: "url(/images/bg.webp)" }}
      className="w-screen h-screen bg-cover bg-no-repeat bg-center"
    >
      {/* <SocketProvider>{children}</SocketProvider> */}
      {children}
    </div>
  );
}
