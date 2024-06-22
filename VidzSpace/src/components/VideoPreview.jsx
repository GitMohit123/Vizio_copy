import React, { useContext, useState, useRef } from "react";
import HomeContext from "../context/homePage/HomeContext";
import { IoIosClose } from "react-icons/io";
import { FaPlay, FaPause } from "react-icons/fa";

const VideoPreview = ({ url, index }) => {
  const { setVideoPreview, setPreviewPopup } = useContext(HomeContext);

  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const togglePlayPause = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  return (
    <>
      <div className=" fixed flex justify-center items-center inset-0 z-50 bg-opacity-70 bg-black">
        <div className="relative bg-[#090f24f5] rounded-lg w-[1000px] h-[600px]">
          <video
            ref={videoRef}
            className="rounded-xl object-cover aspect-square w-full h-full"
            id={`video-${index}`}
            src={url}
            alt="Technology"
            muted
            onClick={togglePlayPause}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            controls={false} // Disable default controls
          />
          <div
            className="absolute inset-0 flex justify-center items-center cursor-pointer"
            onClick={togglePlayPause}
          >
            {isPlaying ? (
              <FaPause className="text-white text-5xl" />
            ) : (
              <FaPlay className="text-white text-5xl" />
            )}
          </div>
          <IoIosClose
            className="fa-solid fa-square-xmark text-black  absolute z-10 top-4 right-4 cursor-pointer"
            size={30}
            onClick={() => setPreviewPopup(false)}
          />
        </div>
      </div>
    </>
  );
};

export default VideoPreview;
