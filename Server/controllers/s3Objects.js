import {
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { s3Client } from "../s3config.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const prefix = "users/";

export const listTeams = async (req, res, next) => {
  const { user_id } = req.query;
  // console.log(user_id)
  try {
    const params = {
      Bucket: "vidzspace",
      Prefix: prefix + `${user_id}/`,
    };

    const data = await s3Client.send(new ListObjectsV2Command(params));

    if (data.KeyCount === 0) {
      // No teams found for the user
      return res.status(204).json({ message: "No content found" });
    }
    const teamNames = data.Contents.map((obj) => {
      const keyParts = obj.Key.split("/");
      // console.log(keyParts)
      if (keyParts.length === 4) {
        return keyParts[keyParts.length - 2];
      }
    });
    const filteredTeamNames = teamNames.filter(
      (teamName) => teamName !== null && teamName !== undefined
    );
    const uniqueTeamNames = [...new Set(filteredTeamNames)];

    return res.status(200).json(uniqueTeamNames); // Send OK (200) with the list of teams
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.status(500).json({ message: "Internal Server Error" }); // Send Internal Server Error (500) with a generic message
  }
};

export const createTeam = async (req, res, next) => {
  const { teamName, user_id } = req.body;
  if (!teamName || !user_id) {
    return res
      .status(400)
      .json({ message: "Missing required fields: teamName and user_id" });
  }
  try {
    const userParams = {
      Bucket: "vidzspace",
      Prefix: prefix + `${user_id}/`,
    };
    const headObjectResponse = await s3Client.send(
      new ListObjectsV2Command(userParams)
    );
    if (headObjectResponse.KeyCount === 0) {
      console.log("No user found");
      const userIdParams = {
        Bucket: "vidzspace",
        Key: prefix + `${user_id}/`,
        Body: "",
      };
      await s3Client.send(new PutObjectCommand(userIdParams));
    }
    console.log("User found");
    const params = {
      Bucket: "vidzspace",
      Key: prefix + `${user_id}/${teamName}/`,
      Body: "",
    };

    await s3Client.send(new PutObjectCommand(params));
    return res.status(200).json({ message: "Team created successfully" });
  } catch (err) {
    console.error("Error creating team folder:", err);
    // Handle specific errors (optional)
    if (err.code === "AccessDenied") {
      return res
        .status(403)
        .json({ message: "Insufficient permissions to create team folder" });
    } else if (err.code === "BucketNotFound") {
      return res.status(404).json({ message: "Bucket not found" });
    } else {
      // Generic error handling (improve based on specific needs)
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

function getFilesForSubfolder(subfolderKey, objects) {
  var subFiles = [];
  var subfolders = [];
  objects.map((item) => {
    if (item.Key.startsWith(subfolderKey)) {
      const relativePath = item.Key.slice(subfolderKey.length);

      if (relativePath.endsWith("/"))
        subfolders.push({ Key: relativePath.slice(0, -1), Type: "folder" });

      // if (relativePath.indexOf('/') === -1 && relativePath !== "") subFiles.push( { ...item, Key: relativePath }); //is a file
      if (relativePath.indexOf("/") === -1 && relativePath !== "")
        subFiles.push(item); //is a file
    }
  });
  return { subFiles: subFiles, subfolders: subfolders };
}

async function addMetadataAndSignedUrl(file) {
  const key = file.Key.split("/").filter(Boolean).pop();
  const fileParams = {
    Bucket: "vidzspace",
    Key: file.Key,
    ContentType: "video/mp4",
  };
  const url = await getSignedUrl(s3Client, new GetObjectCommand(fileParams));
  const metadata = await s3Client.send(new HeadObjectCommand(fileParams));
  return {
    Key: key,
    LastModified: file.LastModified,
    ETag: file.ETag,
    Size: file.Size,
    StorageClass: file.StorageClass,
    Type: "file",
    SignedUrl: url,
    Metadata: metadata?.Metadata,
  };
}

async function getFolderSize(bucketName, folderPath, data2) {
  const params = {
    Bucket: bucketName,
    Prefix: folderPath,
  };
  let totalSize = 0;
  let continuationToken = null;
  do {
    let response;

    if (data2 && !data2.IsTruncated) response = data2;
    else
      response = await s3Client.send(
        new ListObjectsV2Command({
          ...params,

          ContinuationToken: continuationToken,
        })
      );
    response.Contents.forEach((item) => {
      totalSize += item.Size;
    });

    continuationToken = response.IsTruncated
      ? response.NextContinuationToken
      : null;
  } while (continuationToken);

  return totalSize;
}

async function calculateFolderSizes(folders, bucketName, prefix) {
  const folderSizes = [];

  for (const folder of folders) {
    if (folder.Type === "folder") {
      const folderSize = await getFolderSize(bucketName, prefix + folder.Key + "/");
      folderSizes.push({ Key: folder.Key, size: folderSize });
    }
  }

  return folderSizes;
}

export const listRoot = async (req, res, next) => {
  const user_id = req.query.requester_id;
  let path = req.query.path || ""; // Default to empty string if path is not provided
  console.log("path:" + path);

  // Ensure path ends with a slash if it is not empty
  if (path && !path.endsWith("/")) {
    path += "/";
  }

  try {
    const params = {
      Bucket: "vidzspace",
      Prefix: prefix + `${path}`,
      Delimiter: "/",
    };
    const data = await s3Client.send(new ListObjectsV2Command(params));

    const params2 = {
      Bucket: "vidzspace",
      Prefix: prefix + `${path}`,
      Delimiter: "",
    };
    const data2 = await s3Client.send(new ListObjectsV2Command(params2));
    const size = await getFolderSize("vidzspace", prefix + path, data2);

    // const owner_id = getOwnerIdFromObjectKey(prefix + path);
    // var sharingDetails;

    // const hasMetadata = (data.Contents || []).filter((item) => item.Key.endsWith("metadata.json")).length > 0;
    // if(hasMetadata){
    //   console.log("has metadata")
    //   const {sharing, sharingwith, sharingtype} = await getFolderMetadata(path);
    //   if((user_id !== owner_id) && (sharing !== "public") && !(sharing === "limited" && sharingwith.includes(user_id))){ //requester has no access
    //     console.log("no access")
    //     return res.status(201).json({
    //       success: false,
    //       message: "no access"
    //     });
    //   }
    //   sharingDetails = {sharing, sharingwith, sharingtype};
    // }
    // else if (owner_id !== user_id) {
    //   return res.status(201).json({
    //     success: false,
    //     message: "no access"
    //   });
    // }

    // Extract the common prefixes (folders) and top-level files
    const folders = (data.CommonPrefixes || []).map((prefix) => ({
      Key: prefix.Prefix.split("/").filter(Boolean).pop(),
      Type: "folder",
      LastModified: null,
    }));

    console.log("reached here");

    //inner files
    // folders.forEach(subfolder => {
    //   const innerStuff = getFilesForSubfolder(params.Prefix + subfolder.Key + '/', data2.Contents);
    //   subfolder.innerFiles = innerStuff.subFiles;
    //   subfolder.innerFolders = innerStuff.subfolders;
    // });
    // res.json({folders: folders, data2: data2.Contents})

    for (const subfolder of folders) {
      const innerStuff = getFilesForSubfolder(
        params.Prefix + subfolder.Key + "/",
        data2.Contents
      );
      subfolder.innerFolders = innerStuff.subfolders;
      subfolder.innerFiles = await Promise.all(
        innerStuff.subFiles.map(async (file) => {
          if (file) {
            return await addMetadataAndSignedUrl(file);
          } else {
            return [];
          }
        })
      );

      // Get LastModified for the folder itself (assuming it's listed in data2.Contents)
      const folderObject = data2.Contents.find(
        (item) => item.Key === params.Prefix + subfolder.Key + "/"
      );
      if (folderObject) {
        subfolder.LastModified = folderObject.LastModified;
      }
    }
    // console.log("Got the meta data")

    const files = await Promise.all(
      (data.Contents || [])
        .filter((item) => item.Key !== params.Prefix) // Exclude the prefix itself if it's listed
        .map(async (file) => {
          const key = file.Key.split("/").filter(Boolean).pop();
          // console.log(file.Key);
          const fileParams = {
            Bucket: "vidzspace",
            Key: file.Key,
            ContentType: "video/mp4",
          };
          // Generate pre-signed URL for each file
          const url = await getSignedUrl(
            s3Client,
            new GetObjectCommand(fileParams)
          );

          const metadata = await s3Client.send(
            new HeadObjectCommand(fileParams)
          );

          return {
            Key: key,
            LastModified: file.LastModified,
            ETag: file.ETag,
            Size: file.Size,
            StorageClass: file.StorageClass,
            Type: "file",
            SignedUrl: url,
            Metadata: metadata?.Metadata,
          };
        })
    );
    const folderSizes = await calculateFolderSizes(folders, "vidzspace", prefix + path);
    // Combine folders and files into a single array
    const result = {
      folders: folders.map((folder) => ({ ...folder, size: folderSizes.find((f) => f.Key === folder.Key)?.size || 0 })), // Add size to each folder object
      files: files,
      // sharingDetails: sharingDetails,
      size:size
    };

    return res.json(result);
  } catch (err) {
    return err;
  }
};
