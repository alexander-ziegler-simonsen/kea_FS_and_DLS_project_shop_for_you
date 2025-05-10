import { useQuery, UseQueryResult, UseQueryOptions } from "@tanstack/react-query";
import ms from "ms";
import ApiClient from "../../services/api-client";
import { Response } from "../../services/api-client";
import { Category } from "./Category";
import categories from "./categories";

const apiClient = new ApiClient<Category>("/categories");

const useCategories = () =>
  useQuery<Response<Category>, Error>({
    queryKey: ["categories"],
    queryFn: apiClient.getAll,
    staleTime: ms("1d"),
    cacheTime: ms("1d"),
    initialData: categories,
  } as unknown as UseQueryOptions<Response<Category>, Error>) as UseQueryResult<Response<Category>, Error>;

export default useCategories;