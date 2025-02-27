import { Backdrop, Button, Radio } from "@mui/material";
import React, { useState } from "react";
import { MdOutlineSettings } from "react-icons/md";
import GalleryModel from "./GalleryModel";

const SettingsModel = ({ data, handleSaveSettings,isOpen, setIsOpen }) => {
  // const [] = useState(false);
  const [selectedFile, setSelectedFile] = useState(data?.coverImage);
  const [isImageCropModelOpen] = useState(false);
  const [isGallrayOpen, setIsGalleryOpen] = useState(false);
  const [quizData, setQuizData] = useState<{
    name: string; description: string;
    isPrivet:boolean;
    coverImage: string;
  }>({
    name: data?.name,
    description: data?.discription,
    isPrivet: data?.isPrivet,
    coverImage: data?.coverImage,

  });
  const handleIsOpen = () => setIsOpen(true);
  const handleIsClose = () =>
    setIsOpen(isImageCropModelOpen ? true : isGallrayOpen ? true : false);

  const handleClickOutside = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      handleIsClose();
    }
  };

  // const onDrop = useCallback((acceptedFiles: File[]) => {
  //   setSelectedFile(URL.createObjectURL(acceptedFiles[0]));
  // }, []);

  // const { getRootProps, getInputProps, isDragActive, fileRejections } =
  //   useDropzone({
  //     onDrop,
  //     accept: {
  //       "image/png": [],
  //       "image/jpeg": [],
  //       "image/jpg": [],
  //     },
  //   });

  // const renderError = () => {
  //   if (fileRejections.length > 0) {
  //     return (
  //       <p className="text-red-500">
  //         Only PNG, JPG, and JPEG files are accepted.
  //       </p>
  //     );
  //   }
  //   return null;
  // };

  // const handleCrop = () => {
  //   setIsImageCropModelOpen(true);
  // };

  const handleSave = () => {
    handleSaveSettings({ ...quizData, coverImage: selectedFile });
    handleIsClose()
  };

  const handleCancel = () => {
    setQuizData({
      name: "",
      description: "",
      isPrivet: true,
      coverImage: "",
    });
    setSelectedFile(data?.coverImage)
    handleIsClose();
  };

  return (
    <div
      onClick={isOpen ? handleIsClose : handleIsOpen}
      className="relative cursor-pointer flex py-1 justify-between border-2 border-white  w-full rounded-[10px] px-2 h-full"
    >
      <input
        type="text"
        readOnly
        value={data?.name}
        placeholder="Enter title here"
        className="bg-transparent text-white font-semibold focus:outline-none focus:border-none cursor-pointer"
      />
      <Backdrop open={isOpen} className="z-50" onClick={handleClickOutside}>
        <div
          className="w-[85%] flex flex-col h-[95%] bg-white rounded-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full py-3 border-b border-gray-300 flex items-center justify-between px-8">
            <div className="flex text-lg font-semibold items-center gap-2">
              <MdOutlineSettings fontSize={22} />
              <h2>Settings</h2>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCancel}
                className="!bg-gray-100 !text-black !px-4 !font-semibold !capitalize !rounded-md"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="!bg-blue-600 !text-white !px-4 !font-semibold !capitalize !rounded-md"
              >
                Done
              </Button>
            </div>
          </div>
          <div className="flex-1  w-full flex">
            {/* Sidebar */}
            <div className="w-[300px] h-full border-r border-gray-300">
              <div className="w-full bg-gray-100 py-4 px-6 border-b border-gray-300 font-semibold relative text-xl">
                <span className="absolute left-0 top-0 w-[5px] h-full bg-blue-600"></span>{" "}
                Basic Settings
              </div>
            </div>

            <div className="flex-1 max-h-full overflow-y-scroll pt-4 px-4  gap-3 bg-gray-100 flex">
              <div className="h-full w-[60%] flex flex-col gap-3">
                <div
                  style={{
                    boxShadow:
                      "rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px",
                  }}
                  className="w-full flex flex-col gap-1 bg-white rounded-lg p-4"
                >
                  <div className="flex flex-col gap-1">
                    <h2 className="text-sm font-bold">Title</h2>
                    <p>Enter a title for your Questor</p>
                    <input
                      type="text"
                      value={quizData.name}
                      onChange={(e) =>
                        setQuizData({ ...quizData, name: e.target.value })
                      }
                      className="px-4 py-2 border rounded-md border-gray-300 w-full focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-sm font-bold">
                      Description{" "}
                      <span className="text-gray-400">(Optional)</span>
                    </h2>
                    <p>
                      Provide a short description for your Questor to increase
                      visibility
                    </p>
                    <textarea
                      rows={3}
                      value={quizData.description}
                      onChange={(e) =>
                        setQuizData({
                          ...quizData,
                          description: e.target.value,
                        })
                      }
                      className="px-4 py-2 border rounded-md border-gray-300 w-full focus:outline-none"
                    ></textarea>
                  </div>
                </div>
                <div
                  style={{
                    boxShadow:
                      "rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px",
                  }}
                  className="w-full flex flex-col gap-2 bg-white rounded-lg p-4"
                >
                  <h2 className="text-sm font-bold">Visibility</h2>
                  <p>Choose who can see this Questor.</p>
                  <div
                    className="w-full flex select-none p-2"
                    onClick={() =>
                      setQuizData((prev) => ({ ...prev, isPrivet: true }))
                    }
                    style={{
                      boxShadow:
                        "rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px",
                    }}
                  >
                    <Radio
                      checked={quizData.isPrivet}
                      name="size-radio-button-demo"
                      sx={{
                        "& .MuiSvgIcon-root": {
                          fontSize: 28,
                        },
                      }}
                    />
                    <div>
                      <h4>Private</h4>
                      <p className="text-gray-400">Only visible to you</p>
                    </div>
                  </div>
                  <div
                    className="w-full flex p-2 mt-2 select-none"
                    onClick={() =>
                      setQuizData((prev) => ({ ...prev, isPrivet: false }))
                    }
                    style={{
                      boxShadow:
                        "rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px",
                    }}
                  >
                    <Radio
                      checked={!quizData.isPrivet}
                      name="size-radio-button-demo"
                      sx={{
                        "& .MuiSvgIcon-root": {
                          fontSize: 28,
                        },
                      }}
                    />
                    <div>
                      <h4>Public</h4>
                      <p className="text-gray-400">
                        Visible to everyone on the Discover page.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Right Panel */}
              <div className="h-full w-[40%] flex flex-col gap-4">
                <div
                  style={{
                    boxShadow:
                      "rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px",
                  }}
                  className="w-full flex flex-col gap-1 bg-white rounded-lg p-4"
                >
                  <h2 className="text-sm font-bold">Cover Image</h2>
                  <p>Add a cover image to make your Questor stand out.</p>
                  <div
                    onClick={() => setIsGalleryOpen(true)}
                    className={`border-2 border-dashed 
                          h-[200px] flex w-full select-none items-center  relative justify-center rounded-lg text-center border-gray-300`}
                  >
                    {!selectedFile && <p className="font-semibold text-lg text-white bg-blue-600 px-3 rounded-md py-1">Select images</p>}
                    {selectedFile && (
                      <div className="w-full relative h-[200px]">
                        <img
                          src={selectedFile}
                          alt="Cover"
                          className="w-full h-full object-cover object-center rounded-lg"
                        />
                        <div className="absolute p-3 z-50 w-full top-0 left-0 h-full bg-gradient-to-b from-transparent to-black flex items-end justify-between">
                          {/* <IconButton
                            className={"!bg-white !text-black"}
                            onClick={(e) => { e.stopPropagation();handleCrop()}}
                          >
                            <MdCrop />
                          </IconButton> */}

                          <Button className="!px-3 !py-1.5 !font-semibold !capitalize !text-black !bg-white !rounded-md ">
                            Change
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Backdrop>
      {/* {isImageCropModelOpen && (
        <ImageCroppingComponent
          open={isImageCropModelOpen}
          close={() => setIsImageCropModelOpen(false)}
          image={selectedFile}
          setImage={(d) => setSelectedFile(d) }
        />
      )} */}

      <GalleryModel
        close={() => setIsGalleryOpen(false)}
        open={isGallrayOpen}
        setImage={(i) => setSelectedFile(i)}
      />
    </div>
  );
};

export default SettingsModel;
