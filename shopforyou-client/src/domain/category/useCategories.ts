import { useQuery } from "@tanstack/react-query";
import ms from "ms";
import ApiClient from "../../services/grocery-api-client";
import { Category } from "./Category";
import categories from "./categories";

const apiClient = new ApiClient<Category>("/api/categories");

const useCategories = () =>
  useQuery<{ results: Category[] }, Error>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await apiClient.getAll();
      return { results: (response as any).categories || [] }; // Explicitly cast to handle server response
    },
    staleTime: ms("0"),
    cacheTime: ms("0"),
    initialData: { results: categories.results },
  });

export default useCategories;