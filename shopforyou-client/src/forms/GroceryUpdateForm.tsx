import React from "react";
import { Button, FormControl, FormLabel, Input, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from "@chakra-ui/react";

interface GroceryUpdateFormProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    name: string;
    price: string;
    description: string;
    amount: string;
    type: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

const GroceryUpdateForm: React.FC<GroceryUpdateFormProps> = ({
  isOpen,
  onClose,
  formData,
  onInputChange,
  onFileChange,
  onSubmit,
}) => {
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
              onChange={onInputChange}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Price</FormLabel>
            <Input
              name="price"
              type="number"
              value={formData.price}
              onChange={onInputChange}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Description</FormLabel>
            <Input
              name="description"
              value={formData.description}
              onChange={onInputChange}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Amount</FormLabel>
            <Input
              name="amount"
              type="number"
              value={formData.amount}
              onChange={onInputChange}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Type</FormLabel>
            <Input
              name="type"
              value={formData.type}
              onChange={onInputChange}
            />
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
