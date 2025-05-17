import { Tooltip, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Input, VStack, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { registerUser } from "../../services/registerService";
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

export const RegisterModal = ({ isOpen, onClose, onLoginSuccess }: { isOpen: boolean; onClose: () => void; onLoginSuccess?: () => void }) => {
  if (!isOpen) return null; // Prevent rendering if the modal is not open

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    address: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      await registerUser({ ...formData, role: "user" }); // Ensure role is always 'user'
      const loginResponse = await loginUser({
        identifier: formData.email,
        password: formData.password,
      });
      localStorage.setItem("jwtToken", loginResponse.token);
      toast({
        title: "Registration and login successful",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      if (typeof onLoginSuccess === "function") {
        onLoginSuccess(); // Trigger page reload after registration and login
      }
      onClose();
    } catch (error: any) {
      toast({
        title: "Registration or login failed",
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
        <ModalHeader>Register</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Tooltip label="Username must be at least 3 characters long" aria-label="Username tooltip">
              <Input
                placeholder="Name"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </Tooltip>
            <Tooltip label="Email must be a valid email address" aria-label="Email tooltip">
              <Input
                placeholder="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Tooltip>
            <Tooltip label="Password must be at least 6 characters long" aria-label="Password tooltip">
              <Input
                placeholder="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
            </Tooltip>
            <Input
              placeholder="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={handleRegister}
            isLoading={isLoading}
          >
            Register
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
