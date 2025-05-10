import { Grid, Show, GridItem, Box, HStack } from "@chakra-ui/react";
import CustomList from "../components/CustomList";
import GameGrid from "../domain/game/GameGrid";
import GameHeading from "../domain/game/GameHeading";
import useGameQueryStore from "../state";
import useGenres from "../domain/genre/useGenres";
import SortSelector from "../components/SortSelector";
import useCategories from "../domain/category/useCategories";
import { Category } from "../domain/category/Category";

const HomePage = () => {
  const { genreId, categoryId } = useGameQueryStore((s) => s.gameQuery);
  const setGenreId = useGameQueryStore((s) => s.setGenreId);
  const setCategoryId = useGameQueryStore((s) => s.setCategoryId);

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
          <CustomList
            title="Genres"
            onSelectedItemId={setGenreId}
            selectedItemId={genreId}
            useDataHook={useGenres}
          />
          <CustomList<Category>
            title="Categories"
            onSelectedItemId={setCategoryId}
            selectedItemId={categoryId}
            useDataHook={useCategories}
          />
        </GridItem>
      </Show>
      <GridItem area={"main"}>
        <Box paddingLeft={2}>
          <GameHeading />
          <HStack>
            <SortSelector />
          </HStack>
          <GameGrid />
        </Box>
      </GridItem>
    </Grid>
  );
};

export default HomePage;