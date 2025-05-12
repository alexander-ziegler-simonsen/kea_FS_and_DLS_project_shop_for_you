import { Heading, Button } from "@chakra-ui/react";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGroceryQueryStore from "../../groceryState";
import useCategories from "../category/useCategories";

const GroceryHeading = () => {
  const { categoryId } = useGroceryQueryStore((s) => s.groceryQuery);
  const { data: categories } = useCategories();
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

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
    <Heading as="h1" fontSize="5xl" paddingY={5} display="flex" alignItems="center" justifyContent="space-between">
      {categoryName}
      {isAdmin && (
        <Button colorScheme="teal" size="md" onClick={() => navigate('/new-grocery')}>
          Create Grocery
        </Button>
      )}
    </Heading>
  );
};

export default GroceryHeading;
