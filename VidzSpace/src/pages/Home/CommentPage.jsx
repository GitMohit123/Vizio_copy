import React from "react";
import Video from "../../components/Project/Video";
import { FaSearch } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { MdOutlineAccountCircle } from "react-icons/md";

const CommentPage = () => {
  const location = useLocation();
  const { file } = location.state || {};

  console.log("file navi", file);
  return (
    <>
      <div className=" bg-[#35353a] min-h-screen p-[1px]">
        <div className=" flex h-full w-full p-2 flex-col px-5 gap-4">
          {/* Header */}
          <div className="flex flex-row w-full bg-[#242426] gap-5 rounded-lg">
            <div className="w-[88%] flex flex-row gap-4 p-2 px-4 justify-center items-center rounded-xl"></div>

            <div className="flex flex-row gap-4 justify-center items-center cursor-pointer ">
              <p className="text-white border border-yellow-300 font-bold px-4 py-1 rounded-lg">
                View_Status
              </p>
              <p className="text-black font-bold px-4 py-1 rounded-full bg-[#f8ff2a]">
                Share
              </p>

              <MdOutlineAccountCircle size={30} className="text-yellow-400" />
            </div>
          </div>
        </div>
        <div className="lg:flex lg:justify-center p-0 min-h-screen">
          <div className=" flex-1 overflow-hidden ">
            <Video file={file} />
          </div>
          <div className=" lg:w-96 bg-[#242426] lg:h-screen shadow-lg shadow-black text-gray-300 transform -translate-x-2">
            fgh
          </div>
        </div>
      </div>
    </>
  );
};

export default CommentPage;
