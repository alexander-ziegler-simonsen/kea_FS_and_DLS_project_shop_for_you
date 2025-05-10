import ApiClient from "../../services/api-client";
import { useQuery } from "@tanstack/react-query";
import { Grocery } from "./Grocery";

const apiClient = new ApiClient<Grocery>("/groceries");

const useGrocery = (groceryId: number) =>
  useQuery<Grocery, Error>({
    queryKey: ["grocery", groceryId],
    queryFn: () => apiClient.get(groceryId),
    staleTime: Infinity,
  });

export default useGrocery;