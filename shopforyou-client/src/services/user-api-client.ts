import axios, { AxiosRequestConfig } from "axios";

class UserApiClient {
  private endpoint: string;
  private instance;

  constructor(endpoint: string, baseURL?: string) {
    this.endpoint = endpoint;
    this.instance = axios.create({
      baseURL: baseURL || import.meta.env.VITE_USER_HANDLER_URL,
    });
  }

  post = (data: any, config?: AxiosRequestConfig) =>
    this.instance.post(this.endpoint, data, config).then((res) => res.data);
}

export default UserApiClient;
