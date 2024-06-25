import React, { useContext, useState } from "react";
import { FaPhotoVideo } from "react-icons/fa";
import HomeContext from "../../context/homePage/HomeContext";
import { IoIosClose } from "react-icons/io";
import { TbCloudUpload } from "react-icons/tb";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import PreviewLoader from "../../components/PreviewLoader";
import { useEffect } from "react";
import { setCMSData } from "../../app/Actions/cmsAction";
import {
  routePath,
  setPath,
  setPathEmpty,
  setProjectState,
} from "../../app/Actions/cmsAction";
import { download } from "../../api/s3Objects";
import { BsThreeDotsVertical } from "react-icons/bs";
import { ImFilesEmpty } from "react-icons/im";
import ProgressBar from "../../components/Project/ProgressBar";
import "../../styles/CSS/Scrollbar/projectScrollbar.css";
import VideoPreview from "../../components/VideoPreview";
import { useNavigate } from "react-router-dom";
import { deleteVideo, deleteVideoFolder } from "../../api/s3Objects";
import FolderRename from "../../components/PopUp/FolderRename";
import { fetchTeamsData } from "../../api/s3Objects";
const TeamProjects = () => {
  const { teamPath, files, folders, path, load, setLoad } =
    useContext(HomeContext);

  console.log("path", path);
  const display = path.split("/");
  const dispatch = useDispatch();
  const extractName = (filename) => {
    const match = filename.match(/-(\w+)\./);
    return match ? match[1] : filename;
  };

  //console.log(teamPath);
  const convertBytesToGB = (bytes) => {
    const gigabyte = 1024 * 1024 * 1024; // One gigabyte in bytes
    const convertedValue = bytes / gigabyte;
    return convertedValue.toFixed(2) + " GB"; // Format to two decimal places and add unit
  };
  const getDifferenceText = (pastTimeString) => {
    const currentDate = new Date();
    const timeDifference =
      currentDate.getTime() - new Date(pastTimeString).getTime();
    const millisecondsInSecond = 1000;
    const secondsInMinute = 60;
    const minutesInHour = 60;
    const hoursInDay = 24;

    const seconds = Math.floor(timeDifference / millisecondsInSecond);
    const minutes = Math.floor(seconds / secondsInMinute);
    const hours = Math.floor(minutes / minutesInHour);
    const days = Math.floor(hours / hoursInDay);

    if (days > 0) {
      return `${days} days ago`;
    } else if (hours > 0) {
      return `${hours} hours ago`;
    } else if (minutes > 0) {
      return `${minutes} minutes ago`;
    } else {
      return "now";
    }
  };

  const handleRoute = async (file_path) => {
    setLoad(true);
    dispatch(setPath(file_path));
    setTimeout(() => {
      setLoad(false);
    }, 1000);
  };
  const handleRouteClick = (display_path) => {
    console.log("route");
    dispatch(routePath(display_path));
  };

  const handleMouseEnter = (e) => {
    e.target.play();
  };

  const handleMouseLeave = (e) => {
    e.target.pause();
    e.target.currentTime = 0;
  };

  const [selectedItem, setSelectedItem] = useState({});

  const { itemToRename, setItemToRename, currentTeam } =
    useContext(HomeContext);

  const handleThreeDotsClick = (type, index, path) => {
    setSelectedItem({ type, index, path });
  };

  const fetchData = async () => {
    const currentTeamPath = currentTeam;
    try {
      const userId = user?.uid;
      const response = await fetchTeamsData(
        `${userId}/${currentTeamPath}/${path}`,
        userId
      );
      const filesData = response?.files;
      const folderData = response?.folders;
      dispatch(setCMSData(filesData, folderData));
    } catch (err) {
      console.log("Unable to fetch data");
    }
  };

  const handleRename = (type, index, path, name) => {
    setItemToRename({ type, index, path, name });
  };

  const closeSidebar = () => {
    setSelectedItem(null);
  };

  const { videoPreview, setVideoPreview, previewPopup, setPreviewPopup } =
    useContext(HomeContext);

  const navigate = useNavigate();

  const handleDoubleClick = () => {
    navigate("/feedback"); // Navigate to the feedback page
  };

  const handleDelete = (url) => {
    //console.log(deleteLoader);
    setLoad(true);

    setSelectedItem(null);
    deleteVideo(url)
      .then((data) => {
        console.log(data);

        fetchData();
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setTimeout(() => {
          setLoad(false);
        }, 1000);
      });

    //dispatch(setLoader(false));
  };

  const { user } = useContext(HomeContext);

  const handleDeleteFolder = (folderKey) => {
    // dispatch(setLoader(true));
    const userId = user?.uid;
    console.log(userId, folderKey);
    setSelectedItem(null);
    setLoad(true);
    deleteVideoFolder(folderKey, userId, teamPath, path)
      .then((data) => {
        console.log(data);

        fetchData();
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setTimeout(() => {
          setLoad(false);
        }, 1000);
      });
  };

  const { renamePopup, setRenamePopup } = useContext(HomeContext);

  //console.log(selectedItem);

  console.log(itemToRename);

  const handleDownload = (filePath, fileName, type) => {
    const userId = user?.uid;
    setSelectedItem(null);
    setLoad(true);
    download(filePath, teamPath, userId, fileName, type)
      .then((data) => {
        console.log(data);
      })
      .catch((error) => console.log(error))
      .finally(() => {
        setLoad(false);
      });
  };

  return (
    <>
      <div className="flex flex-row w-full p-2 justify-between items-center">
        <div className="flex flex-row gap-3 items-center  justify-center text-[#9B9DA0]">
          <FaPhotoVideo />
          <p
            className="text-[#f8ff2a] cursor-pointer"
            onClick={() => dispatch(setPathEmpty(""))}
          >
            {teamPath}
          </p>
          {display.map((part, index) => (
            <div
              key={index}
              onClick={() =>
                handleRouteClick(display.slice(0, index + 1).join("/"))
              }
              className="flex flex-row gap-2"
            >
              {index < path.length - 1 && (
                <span className="separator">{" / "}</span>
              )}
              <div className="cursor-pointer">{part}</div>
            </div>
          ))}
        </div>
      </div>

      {/* {loading ? (
        <>
          <PreviewLoader />
        </>
      ) : ( */}

      {load && (
        <>
          <PreviewLoader />
        </>
      )}

      {renamePopup && (
        <>
          <FolderRename />
        </>
      )}

      <div className={`transition ${load ? "blur-content" : ""}`}>
        {files.length === 0 && folders.length === 0 && !path ? (
          <div className="h-full w-full flex justify-center items-center">
            <motion.div
              onClick={() => dispatch(setProjectState(true))}
              className="flex flex-col justify-center items-center text-[#9B9DA0] cursor-pointer hover:text-[#f8ff2a]"
            >
              <TbCloudUpload className="text-9xl" />
              <p>Create Your Project</p>
            </motion.div>
          </div>
        ) : (
          <div className="h-full w-full p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
              {folders?.map((folder, index) => (
                <div
                  key={index}
                  className="p-4 bg-[#35353a] rounded-lg text-white relative cursor-pointer"
                  onDoubleClick={handleDoubleClick}
                >
                  <ProgressBar />
                  <div className="flex flex-col gap-2 w-full px-2 rounded-md">
                    {folder?.innerFiles.length !== 0 ||
                    folder?.innerFolders.length !== 0 ? (
                      <div
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-4 h-40 overflow-y-auto no-scrollbar"
                        onClick={() => handleRoute(folder.Key)}
                      >
                        {folder?.innerFiles &&
                          folder?.innerFiles.map((file, index) => (
                            <div className="rounded-lg" key={index}>
                              <video
                                className="rounded-lg object-cover aspect-square w-full"
                                key={index}
                                muted
                                src={file?.SignedUrl}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                              ></video>
                            </div>
                          ))}
                        {folder?.innerFolders &&
                          folder.innerFolders.map((inFolder, index) => (
                            <div className="flex flex-col justify-start items-center gap-1">
                              <img
                                src="/icons/Folder.png"
                                alt="Folder"
                                className="h-20 w-24"
                              />
                              <p className="text-sm text-gray-200">
                                {inFolder.Key}
                              </p>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="h-40 w-full flex justify-center items-center">
                        <div className="flex flex-col justify-center items-center gap-3 text-gray-400">
                          <ImFilesEmpty className="text-5xl" />
                          <p>Empty Folder</p>
                        </div>
                      </div>
                    )}

                    {/* Meta data of the folder */}
                    <div className="flex flex-row items-center w-full ">
                      <div className="flex flex-col gap-1 w-[91%]">
                        <div className="flex flex-row gap-4 justify-start items-center">
                          <p className="text-xl font-bold">{folder.Key}</p>
                          <p>{convertBytesToGB(folder.size)}</p>
                        </div>
                        <div className="text-lg text-gray-400">
                          Mohit -{" "}
                          {folder.LastModified
                            ? getDifferenceText(folder.LastModified)
                            : "Unknown"}
                        </div>
                      </div>

                      <div className="flex justify-center items-center">
                        <BsThreeDotsVertical
                          onClick={() =>
                            setSelectedItem({
                              type: "folder",
                              index: `folder-${index}`,
                              path: path,
                            })
                          }
                          className="font-black text-3xl cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                  {selectedItem?.type === "folder" &&
                    selectedItem?.index === `folder-${index}` &&
                    selectedItem?.path === path && (
                      <div className="absolute right-[-35px] top-[170px] h-50 bg-gray-900 px-2 py-4 z-10 rounded-xl">
                        <div className="absolute top-2 right-2 cursor-pointer">
                          <IoIosClose size={20} onClick={closeSidebar} />
                        </div>
                        <div className="flex flex-col text-left">
                          <p className="text-white hover:bg-slate-800 py-1 rounded-xl px-1">
                            Share
                          </p>
                          <p
                            className="text-white hover:bg-slate-800 py-1 rounded-xl px-1"
                            onClick={() =>
                              handleDownload(path, folder?.Key, "folder")
                            }
                          >
                            Download
                          </p>
                          <p className="text-white hover:bg-slate-800 py-1 rounded-xl px-1">
                            Click for Review
                          </p>
                          <p className="text-white hover:bg-slate-800 py-1 rounded-xl px-1">
                            Copy
                          </p>
                          <p
                            className="text-white hover:bg-slate-800 py-1 rounded-xl px-1"
                            onClick={() => {
                              closeSidebar();
                              setRenamePopup(true);
                              setItemToRename({
                                type: "folder",
                                index: `folder-${index}`,
                                path: path,
                                name: folder?.Key,
                              });
                            }}
                          >
                            rename
                          </p>
                          <p
                            className="text-white hover:bg-slate-800 py-1 rounded-xl px-1"
                            onClick={() => handleDeleteFolder(folder?.Key)}
                          >
                            Delete
                          </p>
                        </div>

                        {/* Sidebar content */}
                      </div>
                    )}
                </div>
              ))}
              {files?.map((file, index) => (
                <div
                  key={index}
                  className="p-4 bg-[#35353a] rounded-lg text-white relative cursor-pointer"
                  onDoubleClick={handleDoubleClick}
                >
                  <ProgressBar />
                  <div className="flex flex-col h-full w-full gap-2">
                    <video
                      className="rounded-lg object-cover aspect-square w-full h-40 cursor-pointer"
                      key={index}
                      src={file?.SignedUrl}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      muted
                      onClick={() => {
                        setVideoPreview(index);
                        setPreviewPopup(true);
                      }}
                    ></video>
                    <div className="flex flex-row items-center w-full ">
                      <div className="flex flex-col gap-1 w-[91%]">
                        <div className="flex flex-row gap-4 justify-start items-center">
                          <p className="text-xl font-bold">
                            {extractName(file.Key)}
                          </p>
                          <p>{convertBytesToGB(file.Size)}</p>
                        </div>
                        <div className="text-lg text-gray-400">
                          Mohit -{" "}
                          {file.LastModified
                            ? getDifferenceText(file.LastModified)
                            : "Unknown"}
                        </div>
                      </div>

                      <div className="flex justify-center items-center">
                        <BsThreeDotsVertical
                          onClick={() =>
                            setSelectedItem({
                              type: "file",
                              index: `file-${index}`,
                              path: path,
                            })
                          }
                          className="font-black text-3xl cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {selectedItem?.type === "file" &&
                    selectedItem?.index === `file-${index}` &&
                    selectedItem?.path === path && (
                      <div className="absolute right-[-40px] top-[170px] h-50 bg-gray-900 px-2 py-4 z-10 rounded-xl">
                        <div className="absolute top-2 right-2 cursor-pointer">
                          <IoIosClose size={20} onClick={closeSidebar} />
                        </div>
                        <div className="flex flex-col text-left">
                          <p className="text-white hover:bg-slate-800 py-1 rounded-xl px-1">
                            Share
                          </p>
                          <p
                            className="text-white hover:bg-slate-800 py-1 rounded-xl px-1"
                            onClick={() =>
                              handleDownload(path, file?.Key, "file")
                            }
                          >
                            Download
                          </p>
                          <p className="text-white hover:bg-slate-800 py-1 rounded-xl px-1">
                            Click for Review
                          </p>
                          <p className="text-white hover:bg-slate-800 py-1 rounded-xl px-1">
                            Copy
                          </p>
                          <p
                            className="text-white hover:bg-slate-800 py-1 rounded-xl px-1"
                            onClick={() => {
                              closeSidebar();
                              setRenamePopup(true);
                              setItemToRename({
                                type: "file",
                                index: `file-${index}`,
                                path: path,
                                name: file?.Key,
                              });
                            }}
                          >
                            rename
                          </p>
                          <p
                            className="text-white hover:bg-slate-800 py-1 rounded-xl px-1"
                            onClick={() => handleDelete(file?.SignedUrl)}
                          >
                            Delete
                          </p>
                        </div>
                      </div>
                    )}

                  {videoPreview === index && previewPopup && (
                    <VideoPreview url={file?.SignedUrl} index={index} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TeamProjects;
