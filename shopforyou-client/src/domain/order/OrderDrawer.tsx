// This component renders a Drawer that opens from the right when triggered
import { Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerFooter, useDisclosure } from "@chakra-ui/react";
import { ReactNode, forwardRef, useImperativeHandle, useRef, useState } from "react";
import useCartStore from "./cartStore";
import { jwtDecode } from "jwt-decode";
import OrderDetails from "./OrderDetails";
import OrderApiClient from "../../services/order-api-client";
import ApiClient from "../../services/grocery-api-client";

export interface OrderDrawerHandle {
  open: () => void;
  close: () => void;
}

const OrderDrawer = forwardRef<OrderDrawerHandle, { children?: ReactNode }>((props, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  useImperativeHandle(ref, () => ({ open: onOpen, close: onClose }));
  const cartItems = useCartStore((state) => state.items);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", address: "" });
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();

  // Create ApiClient instances
  const orderApi = new OrderApiClient("/orders");
  const groceryApi = new ApiClient<any>("/api/groceries");

  const handleOrder = async () => {
    let username = "";
    let email = "";
    let address = "";
    const token = localStorage.getItem("jwtToken");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        username = decoded.username || "";
        email = decoded.email || "";
        address = decoded.address || "";
      } catch {
        openModal();
        return;
      }
    } else {
      openModal();
      return;
    }
    await submitOrder({ username, email, address });
  };

  const submitOrder = async (userData: { username: string; email: string; address: string }) => {
    setIsSubmitting(true);
    const totalprice = cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
    const orderlines = cartItems.map(item => ({
      groceryname: item.name,
      groceryamount: item.quantity,
      price: item.price * item.quantity
    }));
    try {
      // Check for stock before placing order
      const outOfStockItems = cartItems.filter(item => (item.amount ?? 0) - item.quantity < 0);
      if (outOfStockItems.length > 0) {
        const names = outOfStockItems.map(item => item.name).join(", ");
        alert(`Not enough stock for: ${names}`);
        setIsSubmitting(false);
        return;
      }
      await orderApi.post({
        username: userData.username,
        email: userData.email,
        address: userData.address,
        totalprice,
        orderlines
      });
      // Update grocery amounts in backend using ApiClient
      await Promise.all(cartItems.map(async (item) => {
        const newAmount = Math.max(0, (item.amount ?? 0) - item.quantity);
        await groceryApi.update(item.id, {
          amounts: [{ amount: newAmount }]
        });
      }));
      useCartStore.getState().clearCart();
      closeModal();
      onClose();
      window.location.reload();
    } catch (e) {
      alert("Order failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitOrder(form);
  };

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
                <li key={item.id} style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                  <div>
                    <strong>{item.name}</strong> x{item.quantity} <br />
                    ${item.price.toFixed(2)} each
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      style={{
                        background: '#eee',
                        border: 'none',
                        borderRadius: '50%',
                        width: 32,
                        height: 32,
                        fontSize: '1.3em',
                        cursor: 'pointer',
                        marginRight: 4,
                        color: 'black',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                        lineHeight: '32px',
                        fontWeight: 600,
                        verticalAlign: 'middle',
                      }}
                      onClick={() => useCartStore.getState().decreaseQuantity(item.id)}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      -
                    </button>
                    <span style={{ minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                    <button
                      style={{
                        background: '#eee',
                        border: 'none',
                        borderRadius: '50%',
                        width: 32,
                        height: 32,
                        fontSize: '1.3em',
                        cursor: 'pointer',
                        marginLeft: 4,
                        color: 'black',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                        lineHeight: '32px',
                        fontWeight: 600,
                        verticalAlign: 'middle',
                      }}
                      onClick={() => useCartStore.getState().increaseQuantity(item.id)}
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => useCartStore.getState().removeFromCart(item.id)}
                    aria-label={`Remove ${item.name} from cart`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: -16, // Move further right
                      background: 'transparent',
                      border: 'none',
                      color: 'red', // Make the × red
                      fontSize: '1.2em',
                      cursor: 'pointer',
                      padding: 0,
                      lineHeight: 1,
                      zIndex: 2,
                    }}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </DrawerBody>
        {/* Total Price Section */}
        {cartItems.length > 0 && (
          <DrawerFooter
            justifyContent="space-between"
            background="gray.900"
            borderTop="1px solid #222"
            paddingY={4}
            display="flex"
            alignItems="center"
          >
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1em' }}>
              Total: ${cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0).toFixed(2)}
            </span>
            <button
              style={{
                background: '#319795',
                color: 'white',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 20px',
                fontSize: '1em',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                marginLeft: '16px',
                opacity: isSubmitting ? 0.7 : 1,
              }}
              onClick={handleOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Ordering...' : 'Order'}
            </button>
          </DrawerFooter>
        )}
      </DrawerContent>
      {/* Modal for user info if no JWT */}
      <OrderDetails
        isOpen={isModalOpen}
        onClose={closeModal}
        isSubmitting={isSubmitting}
        form={form}
        setForm={setForm}
        onSubmit={handleFormSubmit}
      />
    </Drawer>
  );
});

export default OrderDrawer;
