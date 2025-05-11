import { Heading, Spinner } from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import GroceryAttributes from "../domain/grocery/GroceryAttributes";
import useGrocery from "../domain/grocery/useGrocery";

const GroceryDetailPage = () => {
  const { id } = useParams();
  const { data: grocery, error, isLoading } = useGrocery(Number(id));

  if (isLoading) return <Spinner />;
  if (error || !grocery) throw error;

  return (
    <>
      
      <Heading>{grocery.names.map(name => name.name).join(", ")}</Heading>
      <img
        src={grocery.images[0]?.image || ""}
        alt={grocery.names[0]?.name || "Grocery Image"}
        style={{ maxWidth: "20%", borderRadius: "8px", marginBottom: "16px" }}
      />
      <GroceryAttributes grocery={grocery} />
    </>
  );
};

export default GroceryDetailPage;
