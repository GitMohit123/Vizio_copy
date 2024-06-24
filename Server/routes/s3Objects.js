import { Router } from "express";
import {
  listTeams,
  createTeam,
  listRoot,
  deleteVideo,
  deleteVideoFolder,
  renameFolderFile,
  downloadFolderFile,
} from "../controllers/s3Objects.js";

const s3router = Router();
s3router.get("/listTeams", listTeams);
s3router.post("/createTeam", createTeam);
s3router.get("/fetchTeamsData", listRoot);
s3router.delete("/delete", deleteVideo);
s3router.post("/deletefolder", deleteVideoFolder);
s3router.post("/rename", renameFolderFile);
s3router.post("/download", downloadFolderFile);

export default s3router;
