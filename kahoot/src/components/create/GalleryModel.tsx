"use client";
import { FetchPexelsImages, FetchUnsplashImages } from '@/src/redux/api';
import { Backdrop, CircularProgress } from '@mui/material';
import Image from 'next/image';
import { BsImage } from "react-icons/bs";
import React, { useState, useEffect, useRef } from 'react';

const GalleryModel = ({ open, close, setImage }: { open: boolean, close: () => void, setImage: () => void }) => {
    const [searchQuery, setSearchQuery] = useState<string | null>(null);
    const [imagesApiName] = useState(["Unsplash", "Pexeles"])
    const [currentApiIndex, setCurrentApiIndex] = useState(0)

    return (
        <Backdrop open={open} className='!z-[10000000000] !flex items-center justify-center'>
            <div className='flex w-[65%] h-[600px] bg-white rounded-lg shadow-lg overflow-hidden'>
                <div className='h-full w-[250px] bg-slate-50  pt-6 pl-6'>

                    <div className='flex flex-col gap-1'>
                        <h2 className='text-700 font-semibold py-2 flex gap-2 items-center '><BsImage fontSize={20} /><p>Images</p></h2>
                        <div className='flex flex-col pl-3 pr-1  gap-1'>
                            {
                                imagesApiName.map((api, index) => (
                                    <button key={index} onClick={() => setCurrentApiIndex(index)} className={`hover:bg-[#00000023] px-4 py-2 text-left text-sm rounded-md ${currentApiIndex === index ? 'text-blue-600 bg-[#2386fe21]' : ''}`}>
                                        {api}
                                    </button>
                                ))
                            }
                        </div>
                    </div>
                </div>
                <div className='flex-1 h-[600px] bg-slate-50'>
                    {
                        currentApiIndex === 0 ? (
                            <UnsplashImages close={close} setImage={setImage} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

                        ) : (
                            <PexelsImages close={close} setImage={setImage} setSearchQuery={setSearchQuery} searchQuery={searchQuery} />
                        )
                    }
                </div>
            </div>
        </Backdrop>
    );
};

export default GalleryModel;

const UnsplashImages = ({ searchQuery, setSearchQuery, setImage,close }: {setImage:() =>void, searchQuery: string | null; setSearchQuery: React.Dispatch<React.SetStateAction<string | null>> }) => {
    const [images, setImages] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const galleryRef = useRef<HTMLDivElement>(null);

    // Fetch Images when query or page changes
    const fetchImages = async () => {
        if (loading) return;

        setLoading(true);
        const newImages = await FetchUnsplashImages(searchQuery, page, 30, searchQuery ? false : true);
        setImages((prevImages) => (page === 1 ? newImages : [...prevImages, ...newImages]));
        setLoading(false);
    };

    // Load images on searchQuery or page change
    useEffect(() => {
        setImages([])
        fetchImages();
    }, [searchQuery]);
    useEffect(() => {

        fetchImages();
    }, [page]);

    // Infinite Scroll
    const handleScroll = () => {
        if (!galleryRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = galleryRef.current;
        if (scrollHeight - scrollTop <= clientHeight + 100 && !loading) {
            setPage((prevPage) => prevPage + 1);
        }
    };

    useEffect(() => {
        const gallery = galleryRef.current;
        if (!gallery) return;

        gallery.addEventListener("scroll", handleScroll);
        return () => gallery.removeEventListener("scroll", handleScroll);
    }, [loading]);

    const handleSelectImage = (media: string) => {
        setImage(media);
        close();

    }

    return (
        <div className="w-full h-full p-4 gap-3 flex flex-col">
            {/* Header */}
            <div className='w-full flex items-center justify-center'>
                <input
                    type="text"
                    placeholder="Search for images..."
                    value={searchQuery??""}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='p-2 border-2 focus:outline-none w-[80%] border-gray-500 rounded-md'
                />
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <h2 className="font-semibold">Popular Images</h2>
                <p className="text-gray-400">Provided by Unsplash</p>
            </div>

            {images.length === 0 ?
                (
                    <div className="w-full h-full flex-col gap-4 flex items-center justify-center">
                        <h3 className="text-xl font-semibold">No results found</h3>
                        <p className="text-gray-500 text-center">
                            {searchQuery
                                ? `We couldn't find any images for "${searchQuery}". Please try a different keyword.`
                                : `It looks like there are no images to display right now. Try exploring popular images or searching for something specific!`}
                        </p>
                        <button
                            onClick={() => setSearchQuery("")}
                            className="py-2 px-4 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition">
                            {searchQuery ? "Clear Search" : "Explore Popular Images"}
                        </button>
                    </div>

                ) : (<div ref={galleryRef} className="w-full h-full flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {images.map((img,i) => (
                        <div  onClick={()=>handleSelectImage(img.urls.full)} key={i} className="shadow-md cursor-pointer rounded-lg h-[150px] overflow-hidden bg-white">
                            <Image
                                src={img.urls.thumb}
                                width={img.width / 10}
                                height={Math.floor((300 * img.height) / img.width)}
                                alt={"Images"}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>)}
            {loading && (
                <div className="col-span-full flex items-center justify-center">
                    <CircularProgress />
                </div>
            )}
        </div>
    );
};



const PexelsImages = ({ searchQuery, setSearchQuery,setImage,close }) => {
    const [images, setImages] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const galleryRef = useRef<HTMLDivElement>(null);

    const fetchImages = async () => {
        if (loading) return;

        setLoading(true);
        const newImages = await FetchPexelsImages(searchQuery, page, 30, searchQuery ? false : true);
        setImages((prevImages) =>
            page === 1 ? newImages : [...prevImages, ...newImages]
        );
        setLoading(false);
    };

    useEffect(() => {
        setImages([]);
        fetchImages();
    }, [searchQuery]);

    useEffect(() => {
        fetchImages();
    }, [page]);

    // Infinite Scroll
    const handleScroll = () => {
        if (!galleryRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = galleryRef.current;
        if (scrollHeight - scrollTop <= clientHeight + 100 && !loading) {
            setPage((prevPage) => prevPage + 1);
        }
    };

    useEffect(() => {
        const gallery = galleryRef.current;
        if (!gallery) return;

        gallery.addEventListener("scroll", handleScroll);
        return () => gallery.removeEventListener("scroll", handleScroll);
    }, [loading]);
    const handleSelectImage = (media: string) => {
        setImage(media);
        close();

    }
    return (
        <div className="w-full h-full p-4 gap-3 flex flex-col">
            <div className='w-full flex items-center justify-center'>
                <input
                    type="text"
                    placeholder="Search for images..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='p-2 border-2 focus:outline-none w-[80%] border-gray-500 rounded-md'
                />
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">

                <h2 className="font-semibold">Popular Images</h2>
                <p className="text-gray-400">Provided by Pexels</p>
            </div>
            <div
                ref={galleryRef}
                className="w-full h-full flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
            >
                {images.map((img,i) => (
                    <div
                    onClick={() => handleSelectImage(img.src)}
                        key={i}
                        className="shadow-md rounded-lg cursor-pointer h-[150px] overflow-hidden bg-white"
                    >
                        <Image
                            src={img.src}
                            width={img.width / 10}
                            height={Math.floor((300 * img.height) / img.width)}
                            alt={"Images"}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>
            {loading && (
                <div className="col-span-full flex items-center justify-center">
                    <CircularProgress />
                </div>
            )}
        </div>
    );
};