// This component renders a Drawer that opens from the right when triggered
import { Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, useDisclosure } from "@chakra-ui/react";
import { ReactNode, forwardRef, useImperativeHandle, useRef } from "react";
import useCartStore from "./cartStore";

export interface OrderDrawerHandle {
  open: () => void;
  close: () => void;
}

const OrderDrawer = forwardRef<OrderDrawerHandle, { children?: ReactNode }>((props, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  useImperativeHandle(ref, () => ({ open: onOpen, close: onClose }));
  const cartItems = useCartStore((state) => state.items);

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Shopping Cart</DrawerHeader>
        <DrawerBody>
          {cartItems.length === 0 ? (
            "Your cart is empty."
          ) : (
            <ul>
              {cartItems.map((item) => (
                <li key={item.id} style={{ marginBottom: 12 }}>
                  <strong>{item.name}</strong> x{item.quantity} <br />
                  ${item.price.toFixed(2)} each
                </li>
              ))}
            </ul>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
});

export default OrderDrawer;
