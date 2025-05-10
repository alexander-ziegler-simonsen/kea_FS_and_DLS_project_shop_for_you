import { Menu, MenuButton, Button, MenuList, MenuItem } from "@chakra-ui/react";
import { BsChevronDown } from "react-icons/bs";
import useGameQueryStore from "../state";

const SortSelector = () => {
  const sortOrders = [
    { value: "", label: "Relevance" },
    { value: "-rating", label: "Average Rating" },
    { value: "-released", label: "Release Date" },
    { value: "-added", label: "Date Added" },
    { value: "name", label: "Name" },
    { value: "-metacritic", label: "Popularity" },
  ];

  const sortOrder = useGameQueryStore((s) => s.gameQuery.sortOrder);
  const onSelectSortOrder = useGameQueryStore((s) => s.setSortOrder);

  const selectedSortOrder = sortOrders.find(
    (order) => order.value === sortOrder
  );

  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<BsChevronDown />}>
        "Order by:" {selectedSortOrder?.label || "Relevance"}
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

export default SortSelector;