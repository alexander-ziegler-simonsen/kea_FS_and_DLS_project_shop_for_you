import { Box, Grid, GridItem, Text } from "@chakra-ui/react"

function App() {
  return (
    <Grid templateAreas={{
      base: `"header" "main"`,
      lg: `"header header" "aside main`
    }}
    templateColumns={{base: "1fr", lg: "200px 1fr" }}>
      <GridItem pl="2" area={"header"}>Header</GridItem>
      <GridItem pl="2" area={"aside"}>left side here</GridItem>
      <GridItem pl="2" area={"main"}>
        <Box paddingLeft={2}>
        <Text>big text</Text>
        
          <ul>
            <li>item</li>
            <li>item</li>
            <li>item</li>
            <li>item</li>
            <li>item</li>
          </ul>
          <h1>big new text</h1>
          <ul>
            <li>item</li>
            <li>item</li>
            <li>item</li>
            <li>item</li>
            <li>item</li>
          </ul>
        </Box>
      </GridItem>
    </Grid>
  )
}

export default App
