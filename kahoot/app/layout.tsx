"use client";
// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import StoreProvider from "@/src/redux/Provider";
import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "@/src/redux/store";
import Loading from "./play/[id]/loading";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <StoreProvider>
        <PersistGate loading={<Loading />} persistor={persistor}>
          <body
          // //  className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <ToastContainer />
            {children}
          </body>
        </PersistGate>
      </StoreProvider>
    </html>
  );
}
