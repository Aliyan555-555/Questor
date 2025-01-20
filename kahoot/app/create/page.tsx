"use client";
import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion } from "framer-motion";

const Create = () => {
  const [customizableBarIsOpen, setCustomizableBarIsOpen] = useState(true);
  return (
    <div className="w-sceen bg-white h-screen flex flex-col">
      <div className="w-full h-[70px] bg-gray-400"></div>
      <div className="w-full flex-1 flex">
        <div className="w-[170px] h-full bg-pink-400"></div>
        <div className="flex-1 h-full bg-red-400"></div>
        <motion.div
          animate={{ width: customizableBarIsOpen ? "350px" : 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="w-[350px] h-full bg-blue-400 relative"
        >
          <motion.button
            animate={{ left: customizableBarIsOpen ? "-40px" : "-50px" }}
            onClick={() => setCustomizableBarIsOpen((p) => !p)}
            className="absolute top-1/2 bg-white py-2 px-2 z-0 w-[80px] rounded-md"
          >
            {customizableBarIsOpen ? (
              <FaChevronRight fontSize={23} />
            ) : (
              <FaChevronLeft fontSize={23} />
            )}
          </motion.button>

          <div className="w-full h-full z-10 bg-red-900 relative"></div>
        </motion.div>
      </div>
    </div>
  );
};

export default Create;
