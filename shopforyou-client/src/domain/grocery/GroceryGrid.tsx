import { SimpleGrid, Spinner, Text } from "@chakra-ui/react";
import useGroceries from "./useGroceries";
import GroceryCard from "./GroceryCard";
import GroceryCardSkeleton from "./GroceryCardSkeleton";
import GroceryCardContainer from "./GroceryCardContainer";
import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";

const GroceryGrid = () => {
  const skeletons = [...Array(20).keys()];

  const { data, error, isLoading, fetchNextPage, hasNextPage } = useGroceries();

  if (error) return <Text color="tomato">{(error as { message: string }).message}</Text>;

  const fetchedGroceriesCount =
    data?.pages.reduce((total, page) => total + page.results.length, 0) || 0;

  return (
    <InfiniteScroll
      dataLength={fetchedGroceriesCount}
      next={fetchNextPage}
      hasMore={hasNextPage || false}
      loader={<Spinner />}
      scrollThreshold={1}
    >
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3, xl: 4 }}
        spacing={4}
        paddingY={10}
      >
        {isLoading
          ? skeletons.map((skeleton) => (
              <GroceryCardContainer key={skeleton}>
                <GroceryCardSkeleton />
              </GroceryCardContainer>
            ))
          : data?.pages.map((page, index) => (
              <React.Fragment key={index}>
                {page.results.map((grocery) => {
                  const transformedGrocery = {
                    id: grocery.id.toString(),
                    name: grocery.names?.[0]?.name || "Unknown",
                    image: grocery.images?.[0]?.image || "",
                    category: grocery.categories?.[0]?.name || "Uncategorized",
                    price: grocery.prices?.[0]?.price || 0,
                  };
                  return (
                    <GroceryCardContainer key={grocery.id}>
                      <GroceryCard grocery={transformedGrocery} />
                    </GroceryCardContainer>
                  );
                })}
              </React.Fragment>
            ))}
      </SimpleGrid>
    </InfiniteScroll>
  );
};

export default GroceryGrid;
