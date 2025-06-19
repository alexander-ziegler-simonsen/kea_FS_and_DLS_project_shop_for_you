import { useQuery } from "@tanstack/react-query";
import ms from "ms";
import ApiClient from "../../services/grocery-api-client";
import { Category } from "./Category";
import categories from "./categories";
import { Response } from "../../services/grocery-api-client";

const apiClient = new ApiClient<Category>("/api/categories");

const useCategories = () =>
  useQuery<Response<Category>, Error>(
    ["categories"],
    async () => {
      const response = await apiClient.getAll();
      // If the response is already in the correct shape, return it
      if (
        response &&
        typeof response === "object" &&
        Array.isArray((response as any).results)
      ) {
        return response as Response<Category>;
      }
      // Fallback: try to adapt legacy/mock shape
      if (response && Array.isArray((response as any).categories)) {
        return {
          count: (response as any).categories.length,
          next: null,
          results: (response as any).categories,
        };
      }
      return { count: 0, next: null, results: [] };
    },
    {
      staleTime: ms("15000"),
      cacheTime: ms("15000"),
      initialData: {
        count: categories.results.length,
        next: null,
        results: categories.results as unknown as Category[],
      },
    }
  );

export default useCategories;