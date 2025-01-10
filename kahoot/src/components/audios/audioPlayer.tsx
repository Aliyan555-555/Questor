"use client";
import React, { useState, useRef, useEffect } from "react";
import { FaVolumeDown, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { motion } from "framer-motion";

interface AudioPlayerProps {
  fileName: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ fileName }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null); // Specify type for audioRef
  //   const [isHovered, setIsHovered] = useState(false);
  const [volume, setVolume] = useState(1); // default volume is 100%
  const [isClicked, setIsClicked] = useState(false); // New state to track button click

  // Function to handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100; // Convert to percentage
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Trigger play when the user clicks the button
  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.error("Audio play error:", err);
      });
    }
  };

  // Determine the icon based on volume
  const getVolumeIcon = () => {
    if (volume === 0) {
      return <FaVolumeMute />;
    } else if (volume < 0.7) {
      return <FaVolumeDown />;
    } else {
      return <FaVolumeUp />;
    }
  };

  const handleClick = () => {
    setIsClicked(!isClicked);
    handlePlay();
  };
  useEffect(() => {
    window.addEventListener("click", handleClick);
  }, []);

  return (
    <button
      className="bg-[#0000009a] flex w-fit items-center rounded-lg px-3 gap-2 py-3 justify-center text-3xl text-white font-bold"
      //   onMouseEnter={() => setIsHovered(true)}
      //   onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick} // Trigger the click event here
    >
      <audio hidden ref={audioRef} loop controls>
        <source src={`/audios/${fileName}`} type="audio/webm" />
      </audio>

      {getVolumeIcon()}

      {/* Trigger animation on button click */}
      <motion.div
        initial={{ width: 0, opacity: 0 }} // Start width from 5
        animate={{
          width: isClicked ? "100px" : "0",
          opacity: isClicked ? 1 : 0,
        }} // Animate to full width on click
        transition={{ duration: 0.6 }} // Duration for the animation
        className="w-[50px] h-full flex items-center"
      >
        <input
          type="range"
          min="0"
          max="100"
          value={volume * 100} // Convert back to percentage
          onChange={handleVolumeChange}
          className="w-full pro"
        />
      </motion.div>
    </button>
  );
};

export default AudioPlayer;
