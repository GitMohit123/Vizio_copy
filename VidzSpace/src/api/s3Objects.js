import axios from "axios";

export const listTeams = async (userId) => {
  try {
    const response = await axios.get("/vidzspaceApi/users/s3/listTeams", {
      params: {
        user_id: userId,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 200) {
      // Successful response, process the data as needed
      if (response.data.length === 0) {
        return null;
      } else if (!response.data) {
        return null;
      } else {
        return response.data;
      }
    } else {
      // Handle non-200 status codes (errors)
      throw new Error(
        `API request failed with status code: ${response.status}`
      );
    }
  } catch (err) {
    console.log(err);
  }
};

export const deleteVideo = async (url, idToken) => {
  try {
    const { data } = await axios.delete(`/vidzspaceApi/users/s3/delete`, {
      data: {
        url,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    });

    console.log(data);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export const deleteVideoFolder = async (folderPath, userId, teamPath) => {
  try {
    console.log(userId, teamPath, folderPath);
    const { data } = await axios.post(
      `/vidzspaceApi/users/s3/deletefolder`,
      {
        folderPath,
        teamPath,
      },

      {
        params: {
          userId,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(data);

    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createTeam = async (teamName, userId) => {
  try {
    let encodedTeamName = teamName.includes("/")
      ? teamName.split("/")[0] // Extract the first part before the first slash
      : teamName;
    if (encodedTeamName === "") {
      encodedTeamName = "Demo";
    }
    const response = await axios.post("/vidzspaceApi/users/s3/createTeam", {
      teamName: `${encodedTeamName}'s Team`,
      user_id: userId,
    });

    if (response.status === 200) {
      console.log("Team created successfully:", response.data);
    } else {
      console.error("Error creating team:", response.data);
      throw new Error(response.data.message);
    }
  } catch (err) {
    console.error("Error:", err);
    // Handle errors generically (e.g., display a generic error message)
    throw err; // Re-throw the error for handling in the calling component"https://vidzspace.s3.ap-south-1.amazonaws.com/users/UfB3wWlKf2UAaudTwKuCTBtBMwm1/Anurag%20Leela%20Kanswal%27s%20Team/videos/anurag.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIA6GBMH26TF2GXMLPT%2F20240622%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20240622T163713Z&X-Amz-Expires=900&X-Amz-Signature=cc62c92c8e2ec5d9f6d55f296f79efe342ab666d871a12e2b274865375928825&X-Amz-SignedHeaders=host&x-id=GetObject"
  }
};

export const fetchTeamsData = async (path, user_id) => {
  try {
    const response = await axios.get(`/vidzspaceApi/users/s3/fetchTeamsData`, {
      params: {
        requester_id: user_id,
        path: path,
      },
    });
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.log(err);
  }
};
