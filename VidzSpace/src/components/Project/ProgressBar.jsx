import React, { useContext, useState } from "react";
import { motion } from "framer-motion";
import { FaCircle } from "react-icons/fa";
import { RiArrowDropDownLine } from "react-icons/ri";
import { updateProgress } from "../../api/s3Objects";
import { setCMSData } from "../../app/Actions/cmsAction";
import HomeContext from "../../context/homePage/HomeContext";
import { useDispatch } from "react-redux";
import { fetchTeamsData } from "../../api/s3Objects";

const RectBar = ({ doc }) => {
  // console.log(obj);

  const dispatch = useDispatch();
  //console.log(index, filefolderpath, file);
  const [showDropdown, setShowDropdown] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case "In Progress":
        return "text-blue-400";
      case "Upcoming":
        return "text-red-400";
      case "Done":
        return "text-green-400";
      default:
        return "";
    }
  };

  const insetBorderStyle = {
    boxShadow: "inset 0 0 0 2px rgba(105, 105, 105, 0.7)",
  };

  const { teamPath, path, user, currentTeam } = useContext(HomeContext);

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

  const updateMetadata = async (type, name, progress) => {
    const user_id = user?.uid;
    updateProgress(type, path, teamPath, user_id, name, progress)
      .then((data) => {
        console.log(data);
        fetchData();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getProgressFolder = (innerFiles) => {
    if (
      innerFiles &&
      innerFiles.some((file) => file?.Metadata?.progress === "Upcoming")
    ) {
      return "Upcoming";
    } else if (
      innerFiles &&
      innerFiles.some((file) => file?.Metadata?.progress === "In Progress")
    ) {
      return "In Progress";
    }

    return innerFiles && innerFiles[0]?.Metadata?.progress;
  };

  const progress =
    doc?.Type === "file"
      ? doc?.Metadata?.progress
      : getProgressFolder(doc?.innerFiles);

  //console.log(selectedProgressItem);

  return (
    <div>
      <motion.div
        style={insetBorderStyle}
        className="absolute flex gap-2 rounded-md top-[2px] right-2 text-black items-center justify-center px-3 py-1 bg-[#7A7B99] bg-opacity-60 backdrop-blur-3xl"
      >
        <div className="flex items-center gap-2 justify-center">
          <FaCircle size={20} className={getStatusColor(progress)} />
          <span>{progress}</span>
        </div>
        {doc?.Type === "file" && (
          <div className="flex items-center justify-center">
            <RiArrowDropDownLine
              size={30}
              onClick={() => {
                // setSelectedProgressItem({
                //   type: file?.Type,
                //   index: index,
                //   path: path,
                //   name: file?.Key,
                // });
                setShowDropdown((prev) => !prev);
              }}
            />
          </div>
        )}
      </motion.div>
      {/* {selectedProgressItem &&
        selectedProgressItem?.index === index &&
        selectedProgressItem?.path === filefolderpath && */}
      {showDropdown && (
        <div className="absolute top-10 right-2 bg-[#4b4b5a] shadow-md rounded-md z-10 text-white py-1 px-1">
          {["In Progress", "Upcoming", "Done"]
            .filter((item) => item !== doc?.Metadata?.progress)
            .map((status) => (
              <div
                key={status}
                className="px-4 py-2 cursor-pointer hover:bg-gray-500 hover:rounded-md text-white"
                onClick={() => {
                  setShowDropdown(false);
                  updateMetadata(doc?.Type, doc?.Key, status);
                }}
              >
                {status}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default RectBar;
