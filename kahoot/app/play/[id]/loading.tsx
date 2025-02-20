"use client";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";

const Loading = () => {
    const [dotCount, setDotCount] = useState([1]);

    useEffect(() => {
        const interval = setInterval(() => {
            setDotCount((prev) => (prev.length === 3 ? [1] : [...prev, prev.length + 1]));
        }, 500); 

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-blue_1 relative">
            {/* SVG with motion for smooth scaling & color change */}
            <motion.svg
                width="149"
                height="170"
                viewBox="0 0 149 170"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                initial={{ scale: 1, color: "#D62829" }}
                animate={{
                    scale: [1, 1.25, 1],
                    color: ["#D62829", "#FFD700", "#D62829"]
                }}
                transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
            >
                <path
                    d="M137.373 35.7655L96.1732 5.36553C88.3732 -0.43447 78.0732 -1.63447 69.0732 2.26553L22.1732 22.6655C13.2732 26.5655 7.07318 34.8655 5.97318 44.5655L0.173175 95.4655C-0.926825 105.166 3.27317 114.666 11.0732 120.466L52.2732 150.866C60.0732 156.666 70.3732 157.866 79.3732 153.966L82.6732 152.466C72.8732 148.666 63.2732 144.166 54.4732 139.066C27.9732 128.666 9.47318 105.766 13.1732 71.7655C17.0732 36.3655 38.9732 8.96553 83.5732 13.8655C111.073 16.8655 138.473 41.4655 134.073 81.4655C130.573 113.366 113.173 125.866 96.6732 129.666C101.073 131.866 110.073 134.566 119.273 136.566L126.273 133.566C135.173 129.666 141.373 121.366 142.473 111.666L148.273 60.7655C149.373 51.0655 145.173 41.5655 137.373 35.7655Z"
                    fill="currentColor"
                />
                <path
                    d="M76.2732 40.9655C58.4732 38.9655 49.0732 53.4655 46.9732 71.9655C43.8732 99.9655 53.7732 113.565 71.7732 115.565C84.2732 116.965 97.4732 105.765 100.173 81.2655C103.273 52.7655 93.8732 42.9655 76.2732 40.9655Z"
                    fill="currentColor"
                />
                <path
                    d="M121.073 143.166C120.373 143.366 119.673 143.566 118.873 143.866C114.973 145.266 111.073 146.666 107.173 148.066C102.473 149.766 97.7732 151.466 93.0732 153.066C91.4732 153.566 91.3732 155.766 92.8732 156.566C104.073 162.066 115.773 166.466 127.573 169.066C133.973 170.466 140.173 166.366 141.873 158.366L142.473 155.666C143.273 152.066 141.473 148.666 138.373 146.766C136.573 145.666 134.473 145.266 132.573 144.566C130.073 143.766 127.573 142.966 124.973 142.866C123.573 142.866 122.373 142.866 121.173 143.266L121.073 143.166Z"
                    fill="currentColor"
                />
            </motion.svg>

            {/* Loading Text with animated dots */}
            <h3 className="absolute bottom-10 text-white font-bold text-3xl flex">
                Loading
                {dotCount.map((_, i) => (
                    <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: [0, 1, 0], y: [0, -5, 0] }}
                        transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, delay: i * 0.1}}
                        className="ml-1"
                    >
                        .
                    </motion.span>
                ))}
            </h3>
        </div>
    );
};

export default Loading;
