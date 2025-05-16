import React from "react";
import { Button, FormControl, FormLabel, Input, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Select, Tag, TagLabel, TagCloseButton, HStack } from "@chakra-ui/react";

interface Category {
  id: number;
  name: string;
}

interface GroceryUpdateFormProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    name: string;
    price: string;
    description: string;
    amount: string;
    categoryIds: string[];
  };
  onInputChange: (field: string, value: any) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  categories: Category[];
}

const GroceryUpdateForm: React.FC<GroceryUpdateFormProps> = ({
  isOpen,
  onClose,
  formData,
  onInputChange,
  onFileChange,
  onSubmit,
  categories = [],
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [isAddingNewCategory, setIsAddingNewCategory] = React.useState(false);

  const handleAddCategory = () => {
    if (
      selectedCategory &&
      !formData.categoryIds.includes(selectedCategory)
    ) {
      onInputChange("categoryIds", [...formData.categoryIds, selectedCategory]);
      setSelectedCategory("");
      setIsAddingNewCategory(false);
    }
  };

  const handleRemoveCategory = (cat: string) => {
    onInputChange(
      "categoryIds",
      formData.categoryIds.filter((c) => c !== cat)
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Update Grocery</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={4}>
            <FormLabel>Name</FormLabel>
            <Input
              name="name"
              value={formData.name}
              onChange={(e) => onInputChange("name", e.target.value)}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Price</FormLabel>
            <Input
              name="price"
              type="number"
              value={formData.price}
              onChange={(e) => onInputChange("price", e.target.value)}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Description</FormLabel>
            <Input
              name="description"
              value={formData.description}
              onChange={(e) => onInputChange("description", e.target.value)}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Amount</FormLabel>
            <Input
              name="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => onInputChange("amount", e.target.value)}
            />
          </FormControl>
          <FormControl mb={4}>
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
                  .filter((cat) => !formData.categoryIds.includes(cat.name))
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
              {formData.categoryIds.map((cat) => (
                <Tag key={cat} colorScheme="teal" borderRadius="full">
                  <TagLabel>{cat}</TagLabel>
                  <TagCloseButton onClick={() => handleRemoveCategory(cat)} />
                </Tag>
              ))}
            </HStack>
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Upload Image</FormLabel>
            <Input
              type="file"
              accept="image/*"
              onChange={onFileChange}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={onSubmit} mr={3}>
            Done
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default GroceryUpdateForm;
