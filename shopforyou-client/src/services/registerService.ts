import UserApiClient from "./user-api-client";

const API_URL = "/api/users/register";

const userApiClient = new UserApiClient(API_URL);

export const registerUser = async (userData: {
  email: string;
  username: string;
  password: string;
  address: string;
  role?: string; // Added optional role property
}) => {
  try {
    return await userApiClient.post(userData);
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Registration failed");
  }
};
