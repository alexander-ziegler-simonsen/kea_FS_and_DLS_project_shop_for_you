import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/loginPage";
import { Box, Button, Grid, GridItem, HStack, Text } from "@chakra-ui/react";
import { useColorMode } from "./components/ui/color-mode";

function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <Router>
      <Grid
        templateAreas={{
          base: `"header" "main"`,
          lg: `"header header" "aside main"`,
        }}
        templateColumns={{ base: "1fr", lg: "200px 1fr" }}
      >
        <GridItem bg="orange.300" area="header" p={2}>
          <HStack gap={5}>
            <Text fontWeight="bold" fontSize="2xl">
              Shop for You
            </Text>
            <Button variant="outline" onClick={toggleColorMode}>
              toggle color
            </Button>
          </HStack>
        </GridItem>

        <GridItem p={2} bg="orange.100" area="aside">
          <Text>big text</Text>
          <ul>
            <li><Text>item</Text></li>
            <li><Text>item</Text></li>
            <li><Text>item</Text></li>
            <li><Text>item</Text></li>
          </ul>
        </GridItem>

        <GridItem p={2} bg="orange.200" area="main">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </GridItem>
      </Grid>
    </Router>
  );
}

export default App;

