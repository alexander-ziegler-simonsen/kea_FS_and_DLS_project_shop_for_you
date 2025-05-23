import { Box, Flex, SimpleGrid, Text, Badge, Button, Divider, Stack, Heading } from "@chakra-ui/react";
import { Grocery } from "./Grocery";
import useCartStore from "../order/cartStore";

interface Props {
  grocery: Grocery;
}

const GroceryAttributes = ({ grocery }: Props) => {
  const price = grocery.prices[0]?.price;
  const isPremium = grocery.categories.some(cat => cat.name.toLowerCase().includes("premium"));

  // Get the current quantity of this grocery in the cart
  const cartQuantity = useCartStore((state) => {
    const item = state.items.find((i) => i.id === String(grocery.id));
    return item ? item.quantity : 0;
  });
  const addToCart = useCartStore((state) => state.addToCart);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    addToCart({
      id: String(grocery.id),
      name: grocery.names[0]?.name || "",
      price: grocery.prices[0]?.price || 0,
      image: grocery.images[0]?.image || "",
      amount: grocery.amounts[0]?.amount ?? 0, // Pass amount to cart
    });
  };

  const handleIncrement = () => {
    increaseQuantity(String(grocery.id));
  };

  const handleDecrement = () => {
    if (cartQuantity > 1) {
      decreaseQuantity(String(grocery.id));
    } else if (cartQuantity === 1) {
      removeFromCart(String(grocery.id));
    }
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
        <Flex gap={2} mb={4}>
          {cartQuantity === 0 ? (
            <Button colorScheme="green" onClick={handleAddToCart}>Add to cart</Button>
          ) : (
            <Flex align="center" gap={2} bg={"gray.900"} _dark={{ bg: "gray.700" }} _light={{ bg: "gray.100" }} p={2} borderRadius="lg">
              <Button onClick={handleDecrement} borderRadius="full" bg="gray.300" minW={12} minH={12} fontSize="2xl" color="black" _hover={{ bg: 'gray.400' }}>-</Button>
              <Text color="white" fontSize="2xl" fontWeight="bold">{cartQuantity}</Text>
              <Button onClick={handleIncrement} borderRadius="full" bg="gray.300" minW={12} minH={12} fontSize="2xl" color="black" _hover={{ bg: 'gray.400' }}>+</Button>
              <Button variant="ghost" colorScheme="red" fontSize="2xl" ml={2} onClick={() => removeFromCart(String(grocery.id))}>
                &#10005;
              </Button>
            </Flex>
          )}
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