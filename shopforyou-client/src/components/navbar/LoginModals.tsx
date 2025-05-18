import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Input, VStack, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { loginUser } from "../../services/loginService";

export const LoginModal = ({ isOpen, onClose, onLoginSuccess }: { isOpen: boolean; onClose: () => void; onLoginSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const loginResponse = await loginUser({
        identifier: formData.email,
        password: formData.password,
      });
      localStorage.setItem("jwtToken", loginResponse.token);
      toast({
        title: "Login successful",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onLoginSuccess(); // Trigger page reload after login
      onClose();
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Login</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <VStack spacing={4}>
              <Input
                placeholder="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
              <Input
                placeholder="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
            </VStack>
            {/* Hidden submit button to allow Enter key to trigger login */}
            <button type="submit" style={{ display: 'none' }} aria-hidden="true" />
          </form>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="teal"
            mr={3}
            onClick={handleLogin}
            isLoading={isLoading}
          >
            Login
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
