import axios from "axios";

const API_URL = "http://localhost:3006/api/users/register";

export const registerUser = async (userData: {
  email: string;
  username: string;
  password: string;
  address: string;
  role?: string; // Added optional role property
}) => {
  try {
    const response = await axios.post(API_URL, userData);
    return response.data; // Return the registered user data
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Registration failed");
  }
};
