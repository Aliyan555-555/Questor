"use client";
import { Backdrop, Button } from "@mui/material";
import React, { useRef } from "react";
import {
  CropperRef,
  Cropper,
  CropperState,
  CoreSettings,
} from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";

const ImageCroppingComponent = ({ open, close, image, setImage }) => {
  const cropperRef = useRef<CropperRef>(null);

  // Default cropping coordinates
  const defaultCoordinates = (state: CropperState, settings: CoreSettings) => {
    return {
      left: 100,
      top: 100,
      width: 400,
      height: 400,
    };
  };

  // Handle save button
  const handleSave = () => {
    if (cropperRef.current) {
      const canvas = cropperRef.current.getCanvas();
      if (canvas) {
        const croppedImage = canvas.toDataURL("image/jpeg"); // Convert cropped area to Base64 image
        console.log("Cropped Image:", croppedImage); // Display in console or use this data elsewhere
        setImage(croppedImage)
        close()
      } else {
       close()
      }
    }
  };

  const handleCancel = () => {
    close();
  };

  return (
    <Backdrop open={open} className={"!z-50"}>
      <div className={"w-[50%] h-fit bg-white p-4 rounded-md"}>
        <Cropper
          className="z-[1000000000] bg-white h-[400px] border border-gray-300"
          ref={cropperRef}
          src={image}
          defaultCoordinates={defaultCoordinates}
          stencilProps={{ handlers: true, lines: true }}
        />

        {/* Controls Section */}
        <div
          className={"w-full flex items-center justify-center mt-4 space-x-4"}
        >
          <Button  color="secondary" className="!bg-slate-50 !capitalize !w-[100px] !border-2 !border-black !font-semibold  !text-black" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSave} className="!bg-blue-600 !w-[100px] !text-white">
            Save
          </Button>
        </div>
      </div>
    </Backdrop>
  );
};

export default ImageCroppingComponent;
