import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Alert,
  AlertIcon,
  SimpleGrid,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
} from "@chakra-ui/react";

interface Category {
  id: number;
  name: string;
}

interface GroceryFormProps {
  initialValues: {
    name: string;
    image: File | null;
    categoryId: string;
    price: string;
    description: string;
    amount: string;
  };
  categories: Category[];
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: any;
  onSubmit: (values: any) => void;
  buttonLabel?: string;
  heading: string;
  successMessage?: string;
}

const GroceryForm = ({
  initialValues,
  categories,
  isLoading,
  isSuccess,
  isError,
  error,
  onSubmit,
  buttonLabel = "Add Grocery",
  heading,
  successMessage = "Grocery added successfully!",
}: GroceryFormProps) => {
  const [formValues, setFormValues] = useState(initialValues);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  useEffect(() => {
    setFormValues(initialValues);
  }, [initialValues]);

  const handleChange = (field: string, value: string | File | null) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange("image", e.target.files ? e.target.files[0] : null);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "add-new") {
      setIsAddingCategory(true);
      handleChange("categoryId", "");
    } else {
      handleChange("categoryId", e.target.value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formValues);
  };

  return (
    <Box w="100%" mx="auto" mt={8} p={4} borderWidth={1} borderRadius="md">
      <Heading mb={6} size="lg">
        {heading}
      </Heading>
      {isSuccess && (
        <Alert status="success" mb={4}>
          <AlertIcon />
          {successMessage}
        </Alert>
      )}
      {isError && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {(error as any)?.response?.data?.error || "Failed to add grocery."}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              value={formValues.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Image</FormLabel>
            <Input type="file" onChange={handleFileChange} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Category</FormLabel>
            {isAddingCategory ? (
              <Input
                type="text"
                value={formValues.categoryId}
                onChange={(e) => handleChange("categoryId", e.target.value)}
                placeholder="Enter new category"
              />
            ) : (
              <Select
                value={formValues.categoryId}
                onChange={handleCategoryChange}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
                <option value="add-new">Add New Category</option>
              </Select>
            )}
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Price</FormLabel>
            <Input
              type="number"
              value={formValues.price}
              onChange={(e) => handleChange("price", e.target.value)}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea
              value={formValues.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Amount</FormLabel>
            <Input
              type="number"
              value={formValues.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
            />
          </FormControl>
        </SimpleGrid>
        <Button mt={6} type="submit" colorScheme="teal" isLoading={isLoading}>
          {buttonLabel}
        </Button>
      </form>
    </Box>
  );
};

export default GroceryForm;
