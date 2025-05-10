import ApiClient from "../../services/api-client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Grocery } from "./Grocery";
import useGroceryQueryStore from "../../groceryState";

const apiClient = new ApiClient<Grocery>('/api/groceries');

const useGroceries = () => {
  const sortOrder = useGroceryQueryStore((s) => s.groceryQuery.sortOrder);

  return useInfiniteQuery({
    queryKey: ['groceries', sortOrder],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.getAll({ params: { page: pageParam, ordering: sortOrder } }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: Infinity,
  });
};

export default useGroceries;