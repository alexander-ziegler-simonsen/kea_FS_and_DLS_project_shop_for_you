import axios, { AxiosRequestConfig } from "axios";

export interface Response<T> {
  count: number;
  next: string | null;
  results: T[];
  nextPage?: number; // Added for pagination support
  totalItems?: number;
  currentPage?: number;
  totalPages?: number;
}

const axiosInstance = axios.create({
  // baseURL: "https://api.rawg.io/api",
  baseURL: import.meta.env.VITE_GROCERY_HANDLER_URL,
  // params: {
  //   key: import.meta.env.VITE_API_KEY,
  // },
});

class ApiClient<T> {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  getAll = (config?: AxiosRequestConfig) =>
    axiosInstance
      .get<Response<T>>(this.endpoint, config)
      .then((res) => res.data);

  get = (id: number | string) =>
    axiosInstance.get<T>(this.endpoint + "/" + id).then((res) => res.data);

  getSorted = (sortOrder: string, config?: AxiosRequestConfig) =>
    axiosInstance
      .get<Response<T>>(this.endpoint, {
        ...config,
        params: { ...config?.params, ordering: sortOrder },
      })
      .then((res) => res.data as Response<T>);

  // Add POST method
  post = (data: any, config?: AxiosRequestConfig) =>
    axiosInstance.post<T>(this.endpoint, data, config).then((res) => res.data);

  // Add UPDATE method (for POST to update endpoints)
  update = (id: number | string, data: any, config?: AxiosRequestConfig) =>
    axiosInstance.post<T>(`${this.endpoint}/update/${id}`, data, config).then((res) => res.data);

  // Add DELETE method
  delete = (id: number | string, config?: AxiosRequestConfig) =>
    axiosInstance.delete<T>(`${this.endpoint}/${id}`, config).then((res) => res.data);

  // Add uploadFormData method for multipart/form-data
  uploadFormData = (path: string, formData: FormData, config?: AxiosRequestConfig) =>
    axiosInstance.post<T>(`${this.endpoint}${path}`, formData, {
      ...config,
      headers: {
        ...(config?.headers || {}),
        'Content-Type': 'multipart/form-data',
      },
    }).then((res) => res.data);
}

export default ApiClient;