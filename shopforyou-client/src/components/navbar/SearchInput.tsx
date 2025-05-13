import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { useRef } from "react";
import { BsSearch } from "react-icons/bs";
import useGroceryQueryStore from "../../groceryState";

const SearchInput = () => {
  const ref = useRef<HTMLInputElement>(null);
  const onSearch = useGroceryQueryStore((s) => s.setSearchText);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(ref.current?.value || "");
      }}
    >
      <InputGroup>
        <InputLeftElement children={<BsSearch />} />
        <Input
          ref={ref}
          borderRadius={20}
          placeholder="Search groceries..."
          variant="filled"
        />
      </InputGroup>
    </form>
  );
};

export default SearchInput;