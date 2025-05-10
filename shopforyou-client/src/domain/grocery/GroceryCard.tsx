import { Card, CardBody, Heading, HStack, Image, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import getCroppedImageUrl from "../../services/image-url";
import noImagePlaceholder from "../../assets/no-image-placeholder-6f3882e0.webp";

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
  const imageUrl = getCroppedImageUrl(grocery.image) || noImagePlaceholder;

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
        <Heading fontSize="2xl">
          <Link to={`/groceries/${grocery.id}`}>{grocery.name}</Link>
        </Heading>
        <HStack justifyContent="space-between" mt={4}>
          <Text fontWeight="bold">Category: {grocery.category}</Text>
          <Text color="green.500" fontWeight="bold">${grocery.price.toFixed(2)}</Text>
        </HStack>
      </CardBody>
    </Card>
  );
};

export default GroceryCard;
