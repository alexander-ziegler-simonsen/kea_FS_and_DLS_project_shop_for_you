import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Input, Button as ChakraButton, FormControl, FormLabel } from "@chakra-ui/react";
import React from "react";

interface OrderDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  form: { username: string; email: string; address: string };
  setForm: React.Dispatch<React.SetStateAction<{ username: string; email: string; address: string }>>;
  onSubmit: (e: React.FormEvent) => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ isOpen, onClose, isSubmitting, form, setForm, onSubmit }) => (
  <Modal isOpen={isOpen} onClose={onClose} isCentered>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Enter your information</ModalHeader>
      <ModalCloseButton />
      <form onSubmit={onSubmit}>
        <ModalBody>
          <FormControl isRequired mb={2}>
            <FormLabel>Name</FormLabel>
            <Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
          </FormControl>
          <FormControl isRequired mb={2}>
            <FormLabel>Email</FormLabel>
            <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </FormControl>
          <FormControl isRequired mb={2}>
            <FormLabel>Address</FormLabel>
            <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <ChakraButton colorScheme="teal" mr={3} type="submit" isLoading={isSubmitting}>
            Submit Order
          </ChakraButton>
          <ChakraButton onClick={onClose} variant="ghost">Cancel</ChakraButton>
        </ModalFooter>
      </form>
    </ModalContent>
  </Modal>
);

export default OrderDetails;
