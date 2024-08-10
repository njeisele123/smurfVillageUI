import React from "react";
import ReactDOM from "react-dom/client";
import Root from "./routes/root.tsx";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import SmurfVillage from "./components/village/smurfVillage.tsx";
import { Accounts } from "./components/summoners/summoners.tsx";
import { AccountContextProvider } from "./contexts/accountContext.tsx";
import './scripts/apiTracker.ts'; // initialize API tracker
import { apiCallCount$ } from "./scripts/apiTracker.ts";
import House from "./components/houseInterior/house.tsx";



const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <>Oops :D</>,
    children: [
      {
        path: "accounts",
        element: <Accounts />,
      },
      {
        path: "village",
        element: <SmurfVillage />,
      },
      {
        path: "house",
        element: <House />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AccountContextProvider>
      <div
        id="toast"
        className="fixed top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-green-500 text-white px-4 py-2 rounded-b-lg shadow-lg transition-transform duration-300 ease-in-out"
      />
      <RouterProvider router={router} />
    </AccountContextProvider>
  </React.StrictMode>
);
