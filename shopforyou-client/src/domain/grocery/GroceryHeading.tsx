import { Heading } from "@chakra-ui/react";
import useGroceryQueryStore from "../../groceryState";

const GroceryHeading = () => {
  const { categoryId } = useGroceryQueryStore((s) => s.groceryQuery);

  const categoryName = categoryId ? `Category ${categoryId}` : "All Groceries";

  return (
    <Heading as="h1" fontSize="5xl" paddingY={5}>
      {categoryName}
    </Heading>
  );
};

export default GroceryHeading;
