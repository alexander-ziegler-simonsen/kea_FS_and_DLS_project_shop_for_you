import { useQuery } from "@tanstack/react-query";
import ms from "ms";
import ApiClient from "../../services/grocery-api-client";
import { Category } from "./Category";
import categories from "./categories";

const apiClient = new ApiClient<Category>("/api/categories");

const useCategories = () =>
  useQuery<{ results: Category[] }, Error>(
    ["categories"],
    async () => {
      const response = await apiClient.getAll();
      // Ensure the response is always in the expected format
      if (response && Array.isArray((response as any).categories)) {
        return { results: (response as any).categories };
      }
      return { results: [] };
    },
    {
      staleTime: ms("0"),
      cacheTime: ms("0"),
      initialData: { results: categories.results as unknown as Category[] },
    }
  );

export default useCategories;