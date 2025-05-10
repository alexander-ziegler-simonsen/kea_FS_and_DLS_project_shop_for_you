import groceryData from "./grocerys"; // Import local grocery data

const useGroceries = () => {
  // Return local groceryData as a fallback
  return {
    data: {
      pages: [
        {
          results: groceryData.results.map((item) => ({
            id: item.id,
            createdAt: item.createdAt,
            groceryname: item.names || [],
            groceryimage: item.images || [],
            categories: item.categories || [],
            price: item.prices || [],
            description: item.descriptions || [],
          })),
        },
      ],
    },
    error: null,
    isLoading: false,
    fetchNextPage: () => {},
    hasNextPage: false,
  };
};

export default useGroceries;