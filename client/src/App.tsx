import { Box, Button, Grid, GridItem, HStack, Text, VStack } from "@chakra-ui/react"
import { useColorMode } from "./components/ui/color-mode"

function App() {

  // https://chakra-ui.com/docs/components/concepts/color-mode#usecolormode
  const { toggleColorMode } = useColorMode()

  return (
    <Grid templateAreas={{
      base: `"header" "main"`,
      lg: `"header header" "aside main"`
    }}
    templateColumns={{base: "1fr", lg: "200px 1fr" }}>
      <GridItem bg={"orange.300"} area={"header"} p={2}>

        <HStack gap={"5"}>
          <Text fontWeight={"bold"} fontSize={"2xl"}>Shop for You</Text>
        <Button variant={"outline"} onClick={toggleColorMode}>
          toggle color
        </Button>

        </HStack>

        
      </GridItem>

      <GridItem p={2} bg={"orange.100"} area={"aside"}>left side here
      <Text>big text</Text>
        <Text>item</Text>
          <ul>
            <li><Text>item</Text></li>
            <li><Text>item</Text></li>
            <li><Text>item</Text></li>
            <li><Text>item</Text></li>
          </ul>
          <h1>big new text</h1>
          <ul>
            <li><Text>item</Text></li>
            <li><Text>item</Text></li>
            <li><Text>item</Text></li>
            <li><Text>item</Text></li>
          </ul>
      </GridItem>
      <GridItem p={2} bg={"orange.200"} area={"main"}>
        main box here
      </GridItem>
    </Grid>
  )
}

export default App
