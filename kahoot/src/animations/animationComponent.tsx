import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface NumberAnimationProps {
  targetValue: number;
}

export const NumberAnimation: React.FC<NumberAnimationProps> = ({ targetValue }) => {
  const [number, setNumber] = useState(0);
  const [start,setStart] = useState(0)

  useEffect(() => {
   setStart(0)
    const end = targetValue;
    const duration = 2;

    const step = (timestamp: number) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      setNumber(Math.floor(progress * (end - start) + start)); 

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    // Start the animation
    requestAnimationFrame(step);
  }, [targetValue]);

  return (
    <motion.div
      style={{ fontSize: "3rem", fontWeight: "bold", color: "#000" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {number}
    </motion.div>
  );
};


