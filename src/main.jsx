import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css'
import Root from './routes/root.jsx';
import Grocery from './routes/Grocery2/Grocery.jsx';
import Liquor from './routes/Bakery & Liquor/Liquor/Liquor.jsx';

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
    path:"/liquor",
    element: <Liquor />
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);