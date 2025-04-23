
import { Box, Button, Heading, HStack, Stack, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const initialCartItems: CartItem[] = [
  { id: 1, name: "Item A", price: 25.0, quantity: 1 },
  { id: 2, name: "Item B", price: 40.0, quantity: 2 }
];

export default function ShoppingCartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);

  const updateQuantity = (id: number, delta: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);

  return (
    <Box p={8} maxW="600px" mx="auto">
      <Heading mb={6} textAlign="center">Shopping Cart</Heading>
      <Stack spaceX={5} spaceY={5}>
        {cartItems.map(item => (
          <Box
            key={item.id}
            p={4}
            backgroundColor={"whiteAlpha.300"}
            borderWidth={1}
            borderRadius="xl"
            boxShadow="md"
          >
            <VStack align="start" spaceX={2} spaceY={2}>
              <Text fontSize="lg" fontWeight="semibold">{item.name}</Text>
              <Text color="gray.600">Price: ${item.price.toFixed(2)}</Text>
              <HStack>
                <Button size="sm" onClick={() => updateQuantity(item.id, -1)}>-</Button>
                <Text>{item.quantity}</Text>
                <Button size="sm" onClick={() => updateQuantity(item.id, 1)}>+</Button>
              </HStack>
            </VStack>
          </Box>
        ))}
      </Stack>
      <Box mt={8} textAlign="center">
        <Text fontSize="xl" fontWeight="bold">Total: ${total}</Text>
        <Button colorScheme="teal" mt={4} size="lg" borderRadius="full">Checkout</Button>
      </Box>
    </Box>
  );
}
