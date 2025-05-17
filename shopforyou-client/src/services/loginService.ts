import UserApiClient from "./user-api-client";

const API_URL = "/api/users/login";

const userApiClient = new UserApiClient(API_URL);

export const loginUser = async (credentials: { identifier: string; password: string }) => {
  try {
    return await userApiClient.post(credentials);
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Login failed");
  }
};
