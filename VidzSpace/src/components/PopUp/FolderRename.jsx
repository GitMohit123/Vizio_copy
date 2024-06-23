import React, { useContext, useEffect } from "react";
import Input from "../HomeInputs/Input";
import { MdDriveFileRenameOutline } from "react-icons/md";
import HomeContext from "../../context/homePage/HomeContext";
import { motion } from "framer-motion";
import { fileFolderRename } from "../../api/s3Objects";

const FolderRename = () => {
  const {
    reName,
    setReName,
    setRenamePopup,
    itemToRename,
    setItemToRename,
    teamPath,
    user,
  } = useContext(HomeContext);

  const handleRename = () => {
    fileFolderRename(
      itemToRename?.type,
      itemToRename?.path,
      reName,
      teamPath,
      user?.uid,
      itemToRename?.name
    )
      .then((data) => {
        console.log(data);
      })
      .catch((error) => console.log(error));
  };
  return (
    <div className="absolute h-[95%] w-[95%] flex justify-center items-center z-10 bg-opacity-10 bg-[#2f2f2f] backdrop-blur-sm">
      <div className="popup bg-[#2f2f2f] w-2/6 h-2/7 p-5 flex flex-col rounded-xl border-2 border-[#4c4c4c]">
        <div className="flex w-full px-2 mb-6">
          <p className="text-white text-3xl font-bold">Rename The folder</p>
        </div>
        <div className="flex w-full px-2 flex-col text-white mb-4">
          <Input
            placeholder={"New Folder/File Name"}
            label={"Folder Name"}
            icon={<MdDriveFileRenameOutline />}
            inputState={reName}
            inputStateFunc={setReName}
            type={"text"}
          />
        </div>
        <div className="flex w-full flex-row justify-end items-center px-2 gap-3">
          <motion.div
            className="p-2 px-6 bg-[#8c8c8c] rounded-xl cursor-pointer hover:bg-[#747373] text-white"
            onClick={() => setRenamePopup(false)}
          >
            Cancel
          </motion.div>
          <motion.button
            disabled={!reName}
            className={`p-2 px-6 rounded-xl ${
              reName
                ? "cursor-pointer bg-[#f8ff2a]"
                : "cursor-not-allowed bg-[#f0e679]"
            }`}
            onClick={handleRename}
          >
            New Name
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default FolderRename;
