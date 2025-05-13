import { Heading, Spinner, Button, Flex } from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import GroceryAttributes from "../domain/grocery/GroceryAttributes";
import useGrocery from "../domain/grocery/useGrocery";
import axios from "axios";
import GroceryUpdateForm from "../forms/GroceryUpdateForm";

const GroceryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: grocery, error, isLoading } = useGrocery(Number(id));
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUpdateFormVisible, setIsUpdateFormVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: grocery?.names[0]?.name || "",
    price: String(grocery?.prices[0]?.price || ""),
    description: grocery?.descriptions[0]?.description || "",
    amount: String(grocery?.amounts[0]?.amount || ""),
    type: grocery?.categories[0]?.name || "",
  });

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

  useEffect(() => {
    if (isUpdateFormVisible && id) {
      const fetchGroceryData = async () => {
        try {
          const response = await axios.get(`http://localhost:3005/api/groceries/${id}`);
          const groceryData = response.data;
          setFormData({
            name: groceryData.names[0]?.name || "",
            price: String(groceryData.prices[0]?.price || ""),
            description: groceryData.descriptions[0]?.description || "",
            amount: String(groceryData.amounts[0]?.amount || ""),
            type: groceryData.categories[0]?.name || "",
          });
        } catch (error) {
          console.error("Failed to fetch grocery data:", error);
        }
      };

      fetchGroceryData();
    }
  }, [isUpdateFormVisible, id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpdate = async () => {
    try {
      const formDataToSend: {
        names: { name: string }[];
        prices: { price: number }[];
        descriptions: { description: string }[];
        amounts: { amount: number }[];
        categories: { name: string }[];
        images?: { image: string }[];
      } = {
        names: [{ name: formData.name }],
        prices: [{ price: parseFloat(formData.price) }],
        descriptions: [{ description: formData.description }],
        amounts: [{ amount: parseInt(formData.amount, 10) }],
        categories: [{ name: formData.type }],
      };

      if (selectedFile) {
        try {
          const imageFormData = new FormData();
          imageFormData.append("image", selectedFile);

          const serverResponse = await axios.post(
            "http://localhost:3005/api/upload-to-imgur", // Server endpoint for Imgur upload
            imageFormData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          const imageUrl = serverResponse.data.link; // Get the Imgur link from the server response
          formDataToSend.images = [{ image: imageUrl }];
        } catch (error) {
          console.error("Failed to upload image to the server:", error);
          alert("Failed to upload image. Please try again.");
          return;
        }
      }

      await axios.post(
        `http://localhost:3005/api/groceries/update/${id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      alert("Grocery item updated successfully.");
      setIsUpdateFormVisible(false);
      window.location.reload(); // Reload to reflect changes
    } catch (error: any) {
      console.error("Failed to update grocery item:", error);
      alert("Failed to update grocery item.");
    }
  };

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
      navigate("/", { replace: true }); // Redirect to homepage
      window.location.reload(); // Trigger a reload
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
            <Button
              colorScheme="yellow"
              mr={2}
              onClick={() => setIsUpdateFormVisible(true)}
            >
              Update
            </Button>
            <Button colorScheme="red" onClick={handleDelete}>
              Delete
            </Button>
          </Flex>
        )}
      </Flex>
      <img
        src={grocery.images[0]?.image || ""}
        alt={grocery.names[0]?.name || "Grocery Image"}
        style={{ maxWidth: "20%", borderRadius: "8px", marginBottom: "16px" }}
      />
      <GroceryAttributes grocery={grocery} />
      <GroceryUpdateForm
        isOpen={isUpdateFormVisible}
        onClose={() => setIsUpdateFormVisible(false)}
        formData={{
          name: formData.name,
          price: formData.price,
          description: formData.description,
          amount: formData.amount,
          type: formData.type,
        }}
        onInputChange={handleInputChange}
        onFileChange={handleFileChange}
        onSubmit={handleUpdate}
      />
    </>
  );
};

export default GroceryDetailPage;
