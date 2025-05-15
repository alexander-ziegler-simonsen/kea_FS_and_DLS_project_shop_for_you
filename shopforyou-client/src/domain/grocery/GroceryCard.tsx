import { Card, CardBody, Heading, HStack, Image, Text, Button } from "@chakra-ui/react";
import noImagePlaceholder from "../../assets/no-image-placeholder-6f3882e0.webp";
import useCartStore from "../order/cartStore";

interface Grocery {
  id: string;
  name: string;
  image: string;
  price: number;
  category: string;
}

interface Props {
  grocery: Grocery;
}

const GroceryCard = ({ grocery }: Props) => {
  const imageUrl = (grocery.image) || noImagePlaceholder;
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = () => {
    addToCart({
      id: grocery.id,
      name: grocery.name,
      price: grocery.price,
      image: grocery.image,
    });
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
          <Button colorScheme="teal" size="sm" onClick={handleAddToCart}>
            Add
          </Button>
          <Text color="green.500" fontWeight="bold">${grocery.price.toFixed(2)}</Text>
        </HStack>
      </CardBody>
    </Card>
  );
};

export default GroceryCard;
