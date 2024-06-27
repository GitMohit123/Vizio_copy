import React, { useState } from "react";
import HomeContext from "./HomeContext";
import { useDispatch, useSelector } from "react-redux";
import { addTeamState, setCurrentTeam } from "../../app/Actions/teamActions";
import {
  setPath,
  setPathEmpty,
  setTeamPath,
} from "../../app/Actions/cmsAction";

const HomeState = ({ children }) => {
  // user state
  const user = useSelector((state) => state.user.info);

  //team state

  const team = useSelector((state) => state.team.info);
  const currentTeam = useSelector((state) => state.team.currentTeam);
  const teamState = useSelector((state) => state.team.teamState);
  const optionState = useSelector((state) => state.team.optionState);
  const folders = useSelector((state) => state.cms.folders);
  const files = useSelector((state) => state.cms.files);
  const path = useSelector((state) => state.cms.path);

  //cms State
  const teamPath = useSelector((state) => state.cms.teamPath);
  const projectState = useSelector((state) => state.cms.projectState);

  //setting current team
  const handleTeamClick = (currentTeamName) => {
    dispatch(setCurrentTeam(currentTeamName));
    dispatch(setTeamPath(currentTeam));
    dispatch(setPathEmpty(""));
  };
  //open team add popup
  const handleAddTeam = () => {
    dispatch(addTeamState(true));
  };

  //profile team dropdown
  const handleDropDownClick = () => {
    console.log("Drop down clicked ");
    setIsTeamDropDownOpen((prev) => !prev);
  };

  //diplay team Name
  const displayName = (teamName) => {
    const firstLetter = teamName.charAt(0);
    const nameDisplayed = `${firstLetter} T`;
    return nameDisplayed;
  };

  const [isOpenVisibility, setIsOpenVisibility] = useState(false);
  const [videoPreview, setVideoPreview] = useState("");
  const [previewPopup, setPreviewPopup] = useState(false);
  const [isUploadDropdownOpen, setIsUploadDropdownOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const dispatch = useDispatch();
  const [teamName, setTeamName] = useState("");
  const [isTeamDropDownOpen, setIsTeamDropDownOpen] = useState(false);
  const [load, setLoad] = useState(false);
  const [reName, setReName] = useState("");
  const [renamePopup, setRenamePopup] = useState(false);
  const [itemToRename, setItemToRename] = useState({});
  const [isUploadingProgressOpen, setIsUploadingProgressOpen] = useState(false);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [selectedFilesWithUrls, setSelectedFilesWithUrls] = useState([]);
  const [videoPercentageUploaded, setVideoPercentageUploaded] = useState(0);
  const [selectedProgressItem, setSelectedProgressItem] = useState({});

  return (
    <HomeContext.Provider
      value={{
        displayName,
        user,
        renamePopup,
        setRenamePopup,
        selectedProgressItem,
        setSelectedProgressItem,
        load,
        setLoad,
        itemToRename,
        setItemToRename,
        reName,
        setReName,
        team,

        currentTeam,
        teamState,

        teamName,
        setTeamName,
        teamPath,
        handleTeamClick,
        handleAddTeam,
        handleDropDownClick,
        optionState,
        projectState,
        isOpenVisibility,
        setIsOpenVisibility,
        isUploadDropdownOpen,
        setIsUploadDropdownOpen,
        selectedFiles,
        setSelectedFiles,
        selectedFolders,
        setSelectedFolders,
        isDragging,
        setIsDragging,
        isTeamDropDownOpen,
        setIsTeamDropDownOpen,
        files,
        folders,
        path,
        videoPreview,
        setVideoPreview,
        setPreviewPopup,
        previewPopup,
        isUploadingProgressOpen,
        setIsUploadingProgressOpen,
        isUploadingFiles,
        setIsUploadingFiles,
        selectedFilesWithUrls,
        setSelectedFilesWithUrls,
        videoPercentageUploaded,
        setVideoPercentageUploaded,
      }}
    >
      {children}
    </HomeContext.Provider>
  );
};

export default HomeState;
