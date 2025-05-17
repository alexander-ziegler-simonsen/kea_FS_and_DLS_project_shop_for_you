import { HStack, Image, Button, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import logo from "../../assets/logo.webp";
import ColorModeSwitch from "./ColorModeSwitch";
import SearchInput from "./SearchInput";
import { LoginModal, RegisterModal } from "./LoginModals";

const NavBar = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  // Check for JWT token in localStorage
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      try {
        const decoded: { username: string } = jwtDecode(token);
        setUsername(decoded.username);
      } catch (error) {
        console.error("Invalid token", error);
      }
    }
  }, []);

  const openLoginModal = () => setIsLoginOpen(true);
  const closeLoginModal = () => setIsLoginOpen(false);

  const openRegisterModal = () => setIsRegisterOpen(true);
  const closeRegisterModal = () => setIsRegisterOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    setUsername(null);
    window.location.reload(); // Reload the page after logout
  };

  const handleLoginSuccess = () => {
    window.location.reload(); // Reload the page after login
  };

  return (
    <HStack justifyContent="space-between" paddingX={3}>
      <Link to="/">
        <Image src={logo} boxSize="60px" />
      </Link>
      <SearchInput />
      <HStack spacing={4}>
        {username ? (
          <Menu>
            <MenuButton as={Button} colorScheme="teal">
              Welcome, {username}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </MenuList>
          </Menu>
        ) : (
          <>
            <Button onClick={openLoginModal} colorScheme="teal">
              Login
            </Button>
            <Button onClick={openRegisterModal} colorScheme="blue">
              Register
            </Button>
          </>
        )}
      </HStack>
      <ColorModeSwitch />

      <LoginModal isOpen={isLoginOpen} onClose={closeLoginModal} onLoginSuccess={handleLoginSuccess} />
      <RegisterModal isOpen={isRegisterOpen} onClose={closeRegisterModal} onLoginSuccess={handleLoginSuccess} />
    </HStack>
  );
};

export default NavBar;