"use client";
import React, { useState, useRef, useEffect } from "react";
import { FaVolumeDown, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { motion } from "framer-motion";

interface AudioPlayerProps {
  fileName: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ fileName }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(1);
  const [isClicked, setIsClicked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handlePlay = () => {
    if (audioRef.current && !isPlaying) {

  
      audioRef.current.play().then(() =>setIsPlaying(true)).catch((err) => {
        console.log("Audio play error:", err);
      });
      // setIsPlaying(true);
    }
  };

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
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, []);

  useEffect(() => {
   handlePlay();
  });

  return (
    <button
      className="bg-[#0000009a] flex w-fit items-center rounded-lg px-3 gap-2 py-3 justify-center text-3xl text-white font-bold"
      onClick={handleClick} 
    >
      <audio hidden ref={audioRef} controls loop>
        <source src={`/audios/${fileName}`} type="audio/webm" />
      </audio>

      {getVolumeIcon()}


      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{
          width: isClicked ? "100px" : "0",
          opacity: isClicked ? 1 : 0,
        }}
        transition={{ duration: 0.6 }}
        className="w-[50px] h-full flex items-center"
      >
        <input
          type="range"
          min="0"
          max="100"
          value={volume * 100}
          onChange={handleVolumeChange}
          className="w-full pro"
        />
      </motion.div>
    </button>
  );
};

export default AudioPlayer;
