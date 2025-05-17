import axios, { AxiosRequestConfig } from "axios";

class OrderApiClient {
  private endpoint: string;
  private instance;

  constructor(endpoint: string, baseURL?: string) {
    this.endpoint = endpoint;
    this.instance = axios.create({
      baseURL: baseURL || import.meta.env.VITE_ORDER_HANDLER_URL,
    });
  }

  post = (data: any, config?: AxiosRequestConfig) =>
    this.instance.post(this.endpoint, data, config).then((res) => res.data);
}

export default OrderApiClient;
