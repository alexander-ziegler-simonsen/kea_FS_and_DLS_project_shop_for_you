import { Heading, Button, IconButton, Badge, Box } from "@chakra-ui/react";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useGroceryQueryStore from "../../groceryState";
import useCategories from "../category/useCategories";
import { FaShoppingCart } from "react-icons/fa";
import OrderDrawer, { OrderDrawerHandle } from "../order/OrderDrawer";

const GroceryHeading = () => {
  const { categoryId } = useGroceryQueryStore((s) => s.groceryQuery);
  const { data: categories } = useCategories();
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const drawerRef = useRef<OrderDrawerHandle>(null);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      try {
        const decoded: { role: string } = jwtDecode(token);
        setIsAdmin(decoded.role === "admin");
      } catch (error) {
        console.error("Invalid token", error);
      }
    }
  }, []);

  const categoryName = categoryId
    ? categories?.results?.find((category: { id: number; name: string }) => category.id === Number(categoryId))?.name || "All Groceries"
    : "All Groceries";

  return (
    <>
      <Heading as="h1" fontSize="5xl" paddingY={5} display="flex" alignItems="center" justifyContent="space-between">
        {categoryName}
        <Box display="flex" alignItems="center" gap={4}>
          {isAdmin && (
            <Button colorScheme="teal" size="md" onClick={() => navigate('/new-grocery')}>
              Create Grocery
            </Button>
          )}
          <Box position="relative" display="flex" alignItems="center">
            <IconButton
              aria-label="Shopping Cart"
              icon={<FaShoppingCart />} 
              colorScheme="teal"
              size="md"
              onClick={() => drawerRef.current?.open()}
            />
            <Badge
              position="absolute"
              top="0"
              right="0"
              transform="translate(40%, -40%)"
              colorScheme="red"
              borderRadius="full"
              px={1}
              py={0}
              fontSize="0.65em"
              zIndex={1}
              minW="18px"
              minH="18px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontWeight="bold"
            >
              3
            </Badge>
          </Box>
        </Box>
      </Heading>
      <OrderDrawer ref={drawerRef} />
    </>
  );
};

export default GroceryHeading;
