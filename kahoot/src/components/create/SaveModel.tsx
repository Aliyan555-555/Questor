"use client"
import { Backdrop, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion';
import Image from "next/image";
import { FiPlay } from "react-icons/fi";

interface ErrorType {
  index: number;
  message: string;
  type: string;
  question: string;
  media: string;
}
export const SaveModel = ({ open, close, errors, id,ReturnToHome}: {
  open: boolean; close: () => void; errors: ErrorType[]; id: string | null;ReturnToHome:(value:string) => void
}) => {
  const navigation = useRouter();

  const handleLiveHost = () => {
    navigation.push(`/play/${id}`);
  }

  return (
    <Backdrop open={open} className="z-[100000000000] flex items-center justify-center bg-black/30 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full select-none max-w-[600px] p-6 bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl flex flex-col gap-6 border border-white/20"
      >
        {/* Title Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">{errors.length > 0 ? "This Questor can't be played" : "Your Questor is ready"}</h2>
          {errors.length > 0 && <p className="text-sm text-gray-300 mt-2">
            All questions need to be completed before you can start playing.
          </p>}
        </div>

        {/* Errors List */}
        {errors.length > 0 && <div className="w-full max-h-[350px] scroll-smooth overflow-y-auto space-y-4 scrollbar-hide">
          { errors.map((error, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-4 bg-red-500/10 backdrop-blur-md border border-red-500/40 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              {/* Image */}
              <div className="w-[80px] h-[80px] flex-shrink-0 overflow-hidden rounded-lg border border-white/20">
                <Image
                  src={error.media}
                  alt="image"
                  width={80}
                  height={80}
                  className="object-fill w-full h-full"
                />
              </div>

              {/* Error Details */}
              <div className="flex-1 gap-3 text-white">
                <h3 className="capitalize font-semibold text-sm text-red-300">
                  {error.index} - {error.type}
                </h3>
                <p className="text-sm font-medium">{error.question}</p>
                <p className="text-sm rounded-sm font-semibold py-[2px] px-[3px] mt-1 bg-red-600/40 border border-red-500 text-white">
                  {error.message}
                </p>
              </div>


            </motion.div>
          ))}
        </div>}
        {errors && errors.length === 0 && <div className="w-full ">
          <div onClick={handleLiveHost} className="w-full cursor-pointer flex bg-white/70 hover:bg-white/45 h-[70px] rounded-md">
            <div className=" h-full w-[70px] flex items-center justify-center ">
              <FiPlay fontSize={25} />
            </div>
            <div className="flex  flex-col justify-center">
              <h2 className="font-bold">Host live</h2>
              <p className="font-semibold">Host a live Questor now</p>
            </div>
          </div>
        </div>}

        {/* Actions */}
        {errors.length > 0 && <div className="flex gap-4">
          <Button
            onClick={close}
            className="!w-1/2 !bg-gray-600 !text-white !font-semibold !capitalize !py-3 !rounded-lg !transition-all"
          >
            Back to Edit
          </Button>
          <Button
            onClick={() =>{ReturnToHome('draft');close();}}
            className="!w-1/2 !bg-blue-500/80 !text-white !font-semibold !capitalize !py-3 !rounded-lg !hover:bg-blue-600 !transition-all"
          >
            Keep as Draft
          </Button>
        </div>}
        {errors.length === 0 && <div className="flex gap-4">
          <Button
            onClick={close}
            className="!w-1/2 !bg-gray-600 !text-white !font-semibold !capitalize !py-3 !rounded-lg !transition-all"
          >
            Back to Edit
          </Button>
          <Button
            onClick={() =>{ReturnToHome('active');close();}}
            
            className="!w-1/2 !bg-blue-500/80 !text-white !font-semibold !capitalize !py-3 !rounded-lg !hover:bg-blue-600 !transition-all"
          >
            Publish
          </Button>
        </div>}
      </motion.div>
    </Backdrop>
  );
};
