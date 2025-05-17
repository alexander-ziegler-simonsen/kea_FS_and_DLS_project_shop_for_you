import { Card, CardBody, Heading, HStack, Image, Text, Button } from "@chakra-ui/react";
import noImagePlaceholder from "../../assets/no-image-placeholder-6f3882e0.webp";
import useCartStore from "../order/cartStore";
import { Grocery } from "./Grocery";

interface Props {
  grocery: Grocery;
}

const GroceryCard = ({ grocery }: Props) => {
  const imageUrl = (grocery.image) || noImagePlaceholder;
  const addToCart = useCartStore((state) => state.addToCart);
  const cartQuantity = useCartStore((state) => {
    const item = state.items.find((i) => i.id === grocery.id);
    return item ? item.quantity : 0;
  });
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  const price = grocery.price ?? 0;

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const item = {
      id: String(grocery.id),
      name: grocery.name || "",
      price: grocery.price ?? 0,
      image: grocery.image || "",
      amount: grocery.amounts?.[0]?.amount ?? 0, // Pass correct amount to cart
    };
    addToCart(item);
  };

  return (
    <Card maxW="300px" borderRadius="lg" overflow="hidden">
      <Image 
        src={imageUrl} 
        alt={grocery.name} 
        width="100%" 
        height="200px" 
        objectFit="cover" 
        fallbackSrc={noImagePlaceholder} 
        onError={(e) => {
          e.currentTarget.src = noImagePlaceholder;
        }}
      />
      <CardBody>
        <Heading fontSize="2xl">{grocery.name}</Heading>
        <HStack justifyContent="space-between" mt={4}>
          {cartQuantity === 0 ? (
            <Button colorScheme="teal" size="sm" onClick={handleAddToCart}>
              Add to cart
            </Button>
          ) : (
            <HStack>
              <Button onClick={(e) => { e.stopPropagation(); e.preventDefault();
                if (cartQuantity > 1) {
                  decreaseQuantity(String(grocery.id));
                } else if (cartQuantity === 1) {
                  removeFromCart(String(grocery.id));
                }
              }} colorScheme="teal" size="sm" borderRadius="full" minW={8} minH={8} fontSize="lg">-</Button>
              <Text fontWeight="bold">{cartQuantity}</Text>
              <Button onClick={(e) => { e.stopPropagation(); e.preventDefault(); increaseQuantity(String(grocery.id)); }} colorScheme="teal" size="sm" borderRadius="full" minW={8} minH={8} fontSize="lg">+</Button>
              <Button variant="ghost" colorScheme="red" size="sm" onClick={(e) => { e.stopPropagation(); e.preventDefault(); removeFromCart(String(grocery.id)); }}>
                &#10005;
              </Button>
            </HStack>
          )}
          <Text color="green.500" fontWeight="bold">${price.toFixed(2)}</Text>
        </HStack>
      </CardBody>
    </Card>
  );
};

export default GroceryCard;
