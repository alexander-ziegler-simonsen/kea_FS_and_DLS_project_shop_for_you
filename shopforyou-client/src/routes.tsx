import { createBrowserRouter } from "react-router-dom";
import Layout from "./pages/Layout";
import GroceryHomepage from "./pages/GroceryHomepage";
import GroceryDetailPage from "./pages/GroceryDetailPage";
import ErrorPage from "./pages/ErrorPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <GroceryHomepage /> },
      { path: "/groceries/:id", element: <GroceryDetailPage /> },
    ],
  },
]);

export default router;