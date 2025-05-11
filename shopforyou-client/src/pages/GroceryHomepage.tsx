import { Grid, Show, GridItem, Box, HStack } from "@chakra-ui/react";
import CustomList from "../components/CustomList";
import GroceryGrid from "../domain/grocery/GroceryGrid";
import GroceryHeading from "../domain/grocery/GroceryHeading";
import useGroceryQueryStore from "../groceryState";
import useCategories from "../domain/category/useCategories";
import { Category } from "../domain/category/Category";
import GrocerySortSelector from "../components/GrocerySortSelector";
import { Link } from "react-router-dom";

const GroceryHomepage = () => {
  const { categoryId } = useGroceryQueryStore((s) => s.groceryQuery);
  const setCategoryId = useGroceryQueryStore((s) => s.setCategoryId);

  return (
    <Grid
      paddingX="4"
      templateAreas={{
        base: "main",
        lg: `"aside main"`,
      }}
      templateColumns={{ base: "1fr", lg: "200px 1fr" }}
    >
      <Show above="lg">
        <GridItem area={"aside"}>
          <CustomList<Category>
            title="Categories"
            onSelectedItemId={(id) => setCategoryId(id)}
            selectedItemId={categoryId}
            useDataHook={useCategories}
          />
        </GridItem>
      </Show>
      <GridItem area={"main"}>
        <Box paddingLeft={2}>
          <GroceryHeading />
          <HStack>
            <GrocerySortSelector/>
          </HStack>
          <GroceryGrid
            renderItem={(grocery) => (
              <Link to={`/groceries/${grocery.id}`} key={grocery.id}>
                {/* Render grocery item details here */}
              </Link>
            )}
          />
        </Box>
      </GridItem>
    </Grid>
  );
};

export default GroceryHomepage;
