"use client";
import { SocketProvider } from "@/src/hooks/useSocket";
import { GetAllThemes } from "@/src/redux/api";
import { setThemes } from "@/src/redux/schema/student";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dispatch = useDispatch();
  const fetch = async () => {
    const res = await GetAllThemes();
    if (res?.status) {
      dispatch(setThemes(res?.data));
    }
  }
    useEffect(() => {
      fetch();
    }, []);
  return <SocketProvider>{children}</SocketProvider>;
}
