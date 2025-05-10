import { Menu, MenuButton, Button, MenuList, MenuItem } from "@chakra-ui/react";
import { BsChevronDown } from "react-icons/bs";
import useGroceryQueryStore from "../groceryState";

const GrocerySortSelector = () => {
  const sortOrders = [
    { value: "name-asc", label: "Name: A to Z" },
    { value: "name-desc", label: "Name: Z to A" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
  ];

  const sortOrder = useGroceryQueryStore((s) => s.groceryQuery.sortOrder);
  const onSelectSortOrder = useGroceryQueryStore((s) => s.setSortOrder);

  const selectedSortOrder = sortOrders.find(
    (order) => order.value === sortOrder
  );

  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<BsChevronDown />}>
        "Order by:" {selectedSortOrder?.label || "Price: Low to High"}
      </MenuButton>
      <MenuList>
        {sortOrders?.map((order) => (
          <MenuItem
            key={order.value}
            onClick={() => onSelectSortOrder(order.value)}
          >
            {order.label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default GrocerySortSelector;
