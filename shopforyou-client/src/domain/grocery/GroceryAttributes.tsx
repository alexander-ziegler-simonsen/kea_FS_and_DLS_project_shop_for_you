import { Box, Flex, SimpleGrid, Text, Badge, Button, Divider, Stack, Heading } from "@chakra-ui/react";
import { Grocery } from "./Grocery";
import useCartStore from "../order/cartStore";

interface Props {
  grocery: Grocery;
}

const GroceryAttributes = ({ grocery }: Props) => {
  const price = grocery.prices[0]?.price;
  const isPremium = grocery.categories.some(cat => cat.name.toLowerCase().includes("premium"));

  // Example: try to extract brand, type, etc. from categories or add more fields to Grocery if available
  const brand = grocery.categories.find(cat => cat.name.toLowerCase().includes("brand"))?.name || "";
  const type = grocery.categories.find(cat => cat.name.toLowerCase().includes("type"))?.name || "";
  const cut = grocery.categories.find(cat => cat.name.toLowerCase().includes("udskæring"))?.name || "";
  const animalType = grocery.categories.find(cat => cat.name.toLowerCase().includes("kylling"))?.name || "";

  // Nutrition info: try to extract from grocery.nutrition if available, else fallback to empty
  const nutrition = grocery.nutrition || [];

  const addToCart = useCartStore((state) => state.addToCart);
  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    addToCart({
      id: grocery.id,
      name: grocery.names[0]?.name || "",
      price: grocery.prices[0]?.price || 0,
      image: grocery.images[0]?.image || "",
    });
  };

  return (
    <Flex gap={8} alignItems="flex-start" direction={{ base: "column", md: "row" }}>
      {/* Left: Image and badges */}
      <Box minW="260px" maxW="320px">
        <Box position="relative">
          <img
            src={grocery.images[0]?.image || ""}
            alt={grocery.names[0]?.name || "Grocery Image"}
            style={{ width: "100%", borderRadius: "8px" }}
          />
          <Stack position="absolute" top={2} left={2} spacing={2}>
            {isPremium && <Badge colorScheme="green">Premium</Badge>}
          </Stack>
        </Box>
        {grocery.images.length > 1 && (
          <Flex mt={2} gap={2}>
            {grocery.images.map((img, idx) => (
              <img key={idx} src={img.image} alt="thumb" style={{ width: 48, height: 48, borderRadius: 4, border: "1px solid #eee" }} />
            ))}
          </Flex>
        )}
      </Box>

      {/* Right: Details */}
      <Box flex={1}>
        <Heading size="lg" mb={1}>{grocery.names.map(n => n.name).join(", ")}</Heading>
        <Flex align="center" mb={2} gap={3}>
          <Text fontSize="2xl" fontWeight="bold">{price} $</Text>
        </Flex>
        {grocery.prices[0]?.label && (
          <Text color="green.600" fontWeight="semibold" mb={2}>{grocery.prices[0].label}</Text>
        )}
        <Flex gap={2} mb={4}>
          <Button colorScheme="green" onClick={handleAddToCart}>Add to cart</Button>
        </Flex>
        <Divider my={4} />
        {/* Product details */}
        <Heading size="md" mb={2}>Product details</Heading>
        <SimpleGrid columns={2} spacing={2} mb={4}>
          <Box>
            <Text fontWeight="bold">Labels:</Text>
            <Text>{grocery.categories.map(cat => cat.name).join(", ")}</Text>
            <Text fontWeight="bold">Stock quantity:</Text>
            <Text>{grocery.amounts[0]?.amount ?? "-"}</Text>
          </Box>
        </SimpleGrid>
        <Divider my={4} />
        {/* Product description */}
        <Heading size="md" mb={2}>Product description</Heading>
        <Text mt={2}>
          {grocery.descriptions.map(d => d.description).join("\n\n")}
        </Text>
      </Box>
    </Flex>
  );
};

export default GroceryAttributes;