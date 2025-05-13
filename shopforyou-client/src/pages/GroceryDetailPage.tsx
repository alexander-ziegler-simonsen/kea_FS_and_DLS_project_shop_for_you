import { Heading, Spinner, Button, Flex } from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import GroceryAttributes from "../domain/grocery/GroceryAttributes";
import useGrocery from "../domain/grocery/useGrocery";
import axios from "axios";

const GroceryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: grocery, error, isLoading } = useGrocery(Number(id));
  const [isAdmin, setIsAdmin] = useState(false);

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

  const handleDelete = async () => {
    if (!id) {
      console.error("No ID found for the grocery item.");
      return;
    }
    const confirmDelete = window.confirm("Are you sure you want to delete this grocery item?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:3005/api/groceries/${id}`);
      alert("Grocery item deleted successfully.");
      navigate("/"); // Redirect to homepage
    } catch (error: any) {
      console.error("Failed to delete grocery item:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      }
      alert("Failed to delete grocery item.");
    }
  };

  if (isLoading) return <Spinner />;
  if (error || !grocery) throw error;

  return (
    <>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading>{grocery.names.map(name => name.name).join(", ")}</Heading>
        {isAdmin && (
          <Flex>
            <Button colorScheme="yellow" mr={2}>Update</Button>
            <Button colorScheme="red" onClick={handleDelete}>Delete</Button>
          </Flex>
        )}
      </Flex>
      <img
        src={grocery.images[0]?.image || ""}
        alt={grocery.names[0]?.name || "Grocery Image"}
        style={{ maxWidth: "20%", borderRadius: "8px", marginBottom: "16px" }}
      />
      <GroceryAttributes grocery={grocery} />
    </>
  );
};

export default GroceryDetailPage;
