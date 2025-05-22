import { Spinner, Button, Flex } from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import GroceryAttributes from "../domain/grocery/GroceryAttributes";
import useGrocery from "../domain/grocery/useGrocery";
import GroceryUpdateForm from "../forms/GroceryUpdateForm";
import useCategories from "../domain/category/useCategories";
import type { Category } from "../domain/category/Category";
import ApiClient from "../services/grocery-api-client";

const groceryApi = new ApiClient<any>("/api/groceries");
const uploadApi = new ApiClient<any>("/api");

const GroceryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: grocery, error, isLoading } = useGrocery(Number(id));
  const { data: categoriesData } = useCategories();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUpdateFormVisible, setIsUpdateFormVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  // Defensive fallback for categories array (robust for all API shapes)
  let categories: Category[] = [];
  if (Array.isArray(categoriesData)) {
    categories = categoriesData;
  } else if (categoriesData && typeof categoriesData === 'object') {
    if (Array.isArray((categoriesData as any).categories)) {
      categories = (categoriesData as any).categories;
    } else if (Array.isArray((categoriesData as any).results)) {
      categories = (categoriesData as any).results;
    }
  }

  // Update formData to use categoryIds: string[]
  const [formData, setFormData] = useState({
    name: grocery?.names[0]?.name || "",
    price: String(grocery?.prices[0]?.price || ""),
    description: grocery?.descriptions[0]?.description || "",
    amount: String(grocery?.amounts[0]?.amount || ""),
    categoryIds: grocery?.categories?.map((cat) => cat.name) || [],
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
          const groceryData = await groceryApi.get(id);
          setFormData({
            name: groceryData.names[0]?.name || "",
            price: String(groceryData.prices[0]?.price || ""),
            description: groceryData.descriptions[0]?.description || "",
            amount: String(groceryData.amounts[0]?.amount || ""),
            categoryIds: groceryData.categories?.map((cat: any) => cat.name) || [],
          });
        } catch (error) {
          console.error("Failed to fetch grocery data:", error);
        }
      };
      fetchGroceryData();
    }
  }, [isUpdateFormVisible, id]);

  // Update input change handler for new formData structure
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpdate = async () => {
    setIsUpdateLoading(true);
    try {
      const formDataToSend: any = {
        names: [{ name: formData.name }],
        prices: [{ price: parseFloat(formData.price) }],
        descriptions: [{ description: formData.description }],
        amounts: [{ amount: parseInt(formData.amount, 10) }],
        categories: formData.categoryIds.map((name) => ({ name })),
      };
      if (selectedFile) {
        try {
          const imageFormData = new FormData();
          imageFormData.append("image", selectedFile);
          const serverResponse = await uploadApi.uploadFormData("/upload-to-imgur", imageFormData);
          const imageUrl = serverResponse.link;
          formDataToSend.images = [{ image: imageUrl }];
        } catch (error) {
          setIsUpdateLoading(false);
          console.error("Failed to upload image to the server:", error);
          alert("Failed to upload image. Please try again.");
          return;
        }
      }
      if (!id) throw new Error("No grocery ID provided");
      await groceryApi.update(id, formDataToSend);
      alert("Grocery item updated successfully.");
      setIsUpdateFormVisible(false);
      window.location.reload();
    } catch (error) {
      console.error("Failed to update grocery item:", error);
      alert("Failed to update grocery item.");
    } finally {
      setIsUpdateLoading(false);
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
      await groceryApi.delete(id);
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
        {/* Removed Heading with grocery name */}
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
      {/* Removed image here */}
      <GroceryAttributes grocery={grocery} />
      <GroceryUpdateForm
        isOpen={isUpdateFormVisible}
        onClose={() => setIsUpdateFormVisible(false)}
        formData={formData}
        onInputChange={handleInputChange}
        onFileChange={handleFileChange}
        onSubmit={handleUpdate}
        categories={categories}
        isLoading={isUpdateLoading}
      />
    </>
  );
};

export default GroceryDetailPage;
