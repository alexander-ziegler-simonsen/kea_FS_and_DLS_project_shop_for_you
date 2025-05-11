import { SimpleGrid, Text } from "@chakra-ui/react";
import { Grocery } from "./Grocery";
import DefinitionItem from "../../components/DefinitionItem";

interface Props {
  grocery: Grocery;
}

const GroceryAttributes = ({ grocery }: Props) => {
  return (
    <SimpleGrid columns={2} as="dl">
      <DefinitionItem term="Price">
        <Text>{grocery.prices.map((p) => p.price).join(", ")}</Text>
      </DefinitionItem>
      <DefinitionItem term="Description">
        <Text>{grocery.descriptions.map((d) => d.description).join(", ")}</Text>
      </DefinitionItem>
      <DefinitionItem term="Category">
        <Text>{grocery.categories.map((cat) => cat.name).join(", ")}</Text>
      </DefinitionItem>
      <DefinitionItem term="Amount">
        <Text>{grocery.amounts.map((amt) => amt.amount).join(", ")}</Text>
      </DefinitionItem>
    </SimpleGrid>
  );
};

export default GroceryAttributes;