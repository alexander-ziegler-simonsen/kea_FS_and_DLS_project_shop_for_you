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
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
} from "@chakra-ui/react";

interface Category {
  id: number;
  name: string;
}

interface GroceryFormProps {
  initialValues: {
    name: string;
    image: File | null;
    categoryIds: string[];
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
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);

  useEffect(() => {
    setFormValues(initialValues);
  }, [initialValues]);

  const handleChange = (field: string, value: string | File | null | string[]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange("image", e.target.files ? e.target.files[0] : null);
  };

  const handleAddCategory = () => {
    if (
      selectedCategory &&
      !formValues.categoryIds.includes(selectedCategory)
    ) {
      handleChange("categoryIds", [...formValues.categoryIds, selectedCategory]);
      setSelectedCategory("");
      setIsAddingNewCategory(false);
    }
  };

  const handleRemoveCategory = (cat: string) => {
    handleChange(
      "categoryIds",
      formValues.categoryIds.filter((c) => c !== cat)
    );
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
          <FormControl isRequired={false}>
            <FormLabel>Add Category</FormLabel>
            <HStack>
              <Select
                placeholder="Select category"
                value={selectedCategory}
                onChange={(e) => {
                  if (e.target.value === "__add_new__") {
                    setSelectedCategory("");
                    setIsAddingNewCategory(true);
                  } else {
                    setSelectedCategory(e.target.value);
                  }
                }}
              >
                {categories
                  .filter((cat) => !formValues.categoryIds.includes(cat.name))
                  .map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                <option value="__add_new__">Add new category...</option>
              </Select>
              <Button onClick={handleAddCategory} colorScheme="teal" disabled={isAddingNewCategory && !selectedCategory}>
                Add
              </Button>
            </HStack>
            {isAddingNewCategory && (
              <Input
                mt={2}
                placeholder="Enter new category name"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && selectedCategory) {
                    handleAddCategory();
                    setIsAddingNewCategory(false);
                  }
                }}
                autoFocus
              />
            )}
            <FormLabel mt={2}>Selected Categories</FormLabel>
            <HStack wrap="wrap">
              {formValues.categoryIds.map((cat) => (
                <Tag key={cat} colorScheme="teal" borderRadius="full">
                  <TagLabel>{cat}</TagLabel>
                  <TagCloseButton onClick={() => handleRemoveCategory(cat)} />
                </Tag>
              ))}
            </HStack>
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
