import React from "react";
import ReactDOM from "react-dom/client";
import Root from "./routes/root.tsx";
import "./styles/index.css";

import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import SmurfVillage from "./components/village/smurfVillage.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <>Oops :D</>,
    children: [
      {
        path: "accounts",
        element: <>Accounts</>,
      },
      {
        path: "village",
        element: <SmurfVillage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
