import { createBrowserRouter } from "react-router-dom";
import Layout from "./pages/Layout";
import GroceryHomepage from "./pages/GroceryHomepage";
import GameDetailPage from "./pages/GameDetailPage";
import ErrorPage from "./pages/ErrorPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <GroceryHomepage /> },
      { path: "/games/:id", element: <GameDetailPage /> },
    ],
  },
]);

export default router;