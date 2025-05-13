import {
  Button,
  Heading,
  HStack,
  List,
  ListItem,
  Spinner,
} from "@chakra-ui/react";
import { useState } from "react";
import { UseQueryResult } from "@tanstack/react-query";
import { Response } from "../services/api-client";

interface Props<T extends Item> {
  title: string;
  onSelectedItemId: (id?: number) => void;
  selectedItemId?: number;
  useDataHook: () => UseQueryResult<Response<T>, Error>;
}

interface Item {
  id: number;

  name: string;
}

const CustomList = <T extends Item>({
  onSelectedItemId,
  selectedItemId,
  title,
  useDataHook,
}: Props<T>) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data, isLoading, error } = useDataHook();

  const items = data?.results;

  const displayedItems = isExpanded ? items : items?.slice(0, 5);

  if (error) return null;

  if (isLoading) return <Spinner />;

  return (
    <>
      <Button variant="link" onClick={() => onSelectedItemId(undefined)}>
        <Heading>{title}</Heading>
      </Button>
      <List>
        {displayedItems?.map((item) => (
          <ListItem key={item.id} paddingY="5px">
            <HStack>

              <Button
                textAlign="left"
                whiteSpace="normal"
                colorScheme={selectedItemId === item.id ? "yellow" : "gray"}
                variant="link"
                fontSize="lg"
                onClick={() => onSelectedItemId(item.id)}
              >
                {item.name}
              </Button>
            </HStack>
          </ListItem>
        ))}
        <Button marginY="4" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? "Show less" : "Show more"}
        </Button>
      </List>
    </>
  );
};

export default CustomList;