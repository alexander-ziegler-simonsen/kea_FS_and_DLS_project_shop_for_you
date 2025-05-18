import ApiClient from "../../services/grocery-api-client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Grocery } from "./Grocery";
import useGroceryQueryStore from "../../groceryState";

const apiClient = new ApiClient<Grocery>('/api/groceries');

const useGroceries = () => {
  const sortOrder = useGroceryQueryStore((s) => s.groceryQuery.sortOrder);
  const categoryId = useGroceryQueryStore((s) => s.groceryQuery.categoryId);
  const searchText = useGroceryQueryStore((s) => s.groceryQuery.searchText);

  return useInfiniteQuery({
    queryKey: ['groceries', sortOrder, categoryId, searchText],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.getAll({
        params: { page: pageParam, ordering: sortOrder, categoryId, searchText },
      }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: Infinity,
  });
};

export default useGroceries;