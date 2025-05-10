import React from "react";
import {
  Box,
  Image,
  Text,
  Button,
  Stack,
  Heading,
} from "@chakra-ui/react";

const ProductPage: React.FC = () => {
  const handleAddToCart = () => {
    alert("The item has been added to your cart.");
  };

  return (
    <Box maxW="5xl" mx="auto" p={4} mt={10}>
      <Stack direction={{ base: "column", md: "row" }} spaceX={8} spaceY={8}>
        {/* Image & Badge */}
        <Box flexShrink={0}>
          <Image
            src="https://picsum.photos/200/400" 
            alt="Banan øko"
            borderRadius="lg"
          />
          <Box mt={4} p={2} border="1px solid #ccc" borderRadius="md" w="fit-content">
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/EU_Organic_Logo_Colour.svg/1200px-EU_Organic_Logo_Colour.svg.png"
              alt="Organic badge"
              boxSize="50px"
            />
            <Text fontSize="xs">EC-BIO-140<br/>Ikke-EU-Jordbrug</Text>
          </Box>
        </Box>

        {/* Details */}
        <Box flex={1}>
          <Heading size="lg">Banan øko.</Heading>
          <Text fontSize="sm" color="gray.500">1 stk. / Ecuador / Klasse 1</Text>

          <Text fontSize="2xl" fontWeight="bold" mt={4}>4,00 kr</Text>
          <Text fontSize="sm" color="gray.500">4,00 kr/Stk.</Text>

          <Button colorScheme="green" mt={4} onClick={handleAddToCart}>
            Læg i kurv
          </Button>

          <Button variant="ghost" mt={2}>
            Tilføj til indkøbsliste
          </Button>

          <Heading size="md" mt={6} mb={2}>Detaljer om varen</Heading>
          <ul>
            <li><b>Egnet til:</b> Morgenmad, Tilbehør, Madpakke, Mos, Snack</li>
            <li><b>Mærkninger:</b> Øko (europæisk)</li>
            <li><b>Klasse:</b> Klasse 1</li>
            <li><b>Oprindelsesland:</b> Ecuador</li>
            <li><b>Farve:</b> Gul</li>
            <li><b>Sort:</b> Cavendish</li>
            <li><b>Type:</b> Banan, Frugt</li>
          </ul>

          <Heading size="md" mt={6} mb={2}>Varebeskrivelse</Heading>
          <Text fontSize="sm" color="gray.600">
            text goes here.
          </Text>
        </Box>
      </Stack>
    </Box>
  );
};

export default ProductPage;
