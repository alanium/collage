import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css'
import Root from './routes/root.jsx';
import Grocery from './routes/Grocery2/Grocery.jsx';
import BakeryLiquor from './routes/Bakery & Liquor/BakeryAndBeverages/BakeryAndBeverages.jsx';
import International from './routes/International/International.jsx';
import DairyAndSnacks from './routes/Dairy&Snacks/Dairy&Snacks.jsx';
import FrozenAndBeverages from './routes/Frozen&Beverages/Frozen&Beverages.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
  },
  {
    path:"/grocery",
    element: <Grocery />
  },
  {
    path:"/liquor&bakery",
    element: <BakeryLiquor />
  },
  {
    path:"/international",
    element: <International />
  },
  {
    path:"/Dairy&Snacks",
    element: <DairyAndSnacks />
  },
  {
    path:"/Frozen&Beverages",
    element: <FrozenAndBeverages />
  }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);