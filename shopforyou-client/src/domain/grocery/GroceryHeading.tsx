import { Heading } from "@chakra-ui/react";
import useGroceryQueryStore from "../../groceryState";
import useCategories from "../category/useCategories";

const GroceryHeading = () => {
  const { categoryId } = useGroceryQueryStore((s) => s.groceryQuery);
  const { data: categories } = useCategories();

  const categoryName = categoryId
    ? categories?.results.find((category) => category.id === categoryId)?.name || "All Groceries"
    : "All Groceries";

  return (
    <Heading as="h1" fontSize="5xl" paddingY={5}>
      {categoryName}
    </Heading>
  );
};

export default GroceryHeading;
