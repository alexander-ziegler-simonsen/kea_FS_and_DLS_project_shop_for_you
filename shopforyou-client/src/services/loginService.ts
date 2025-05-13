import axios from "axios";

const API_URL = "http://localhost:3006/api/users/login";

export const loginUser = async (credentials: { identifier: string; password: string }) => {
  try {
    const response = await axios.post(API_URL, credentials);
    return response.data; // Return the JWT token
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Login failed");
  }
};
