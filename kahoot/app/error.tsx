"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Home } from "lucide-react";
import { truncateString } from "@/src/lib/services";

export default function Error({
  error,
  // reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error caught by boundary:", error);
  }, [error]);
  return (
    <div
      className="w-screen h-screen flex flex-col items-center bg-cover bg-no-repeat bg-bottom justify-center bg-gray-100"
      style={{ backgroundImage: "url(/images/UI/error.jpg)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-[350px] md:w-[420px] bg-white shadow-xl rounded-xl flex flex-col items-center p-6 text-center"
      >
        {/* Error Icon */}
        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: 10 }}
          transition={{ repeat: Infinity, repeatType: "mirror", duration: 1.2 }}
        >
          <AlertCircle className="text-red-500 w-16 h-16" />
        </motion.div>

        <h2 className="text-2xl font-bold text-gray-800 mt-4">
          Oops! Something went wrong
        </h2>
        <p className="text-gray-600 mt-2">
          An unexpected error occurred. Please try again or return home.
        </p>

        {/* Error Message (For Debugging) */}
        {error.message && (
          <div className="bg-gray-200 p-3 rounded-md mt-4 text-sm text-gray-700 max-w-[320px] overflow-auto">
            {truncateString(error.message,30)}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4 mt-6">
          {/* Retry Button */}
          {/* <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => reset()}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition shadow-md"
          >
            <RotateCw className="w-5 h-5" /> Retry
          </motion.button> */}

          {/* Go Home Button */}
          <motion.a
          href="/"
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition shadow-md"
          >
            <Home className="w-5 h-5" /> Go Home
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
}
