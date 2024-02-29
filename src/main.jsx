import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css'
import { Root } from './routes/root.jsx';
import Grocery from './routes/Grocery2/Grocery.jsx';
import BakeryLiquor from './routes/Bakery & Liquor/BakeryAndBeverages/BakeryAndBeverages.jsx';
import International from './routes/International/International.jsx';
import DairyAndSnacks from './routes/Dairy&Snacks/Dairy&Snacks.jsx';
import FrozenAndBeverages from './routes/Frozen&Beverages/Frozen&Beverages.jsx';
import MeatAndSeafood from './routes/Meats&Seafood/Meat&Seafood.jsx';
import DelicatessenAndMore from './routes/Delicatessen&Fish&Taqueria/Delicatessen&Fish&Taqueria.jsx';
import NapervilleFreshMarket from './routes/NapervilleFreshMarket/NapervilleFreshMarket.jsx';
import  html2pdf  from 'html2pdf.js';
import AmountForPrice from './components/AmountForPrice/AmountForPrice.jsx';
import TripleBox from './components/TripleBoxWithText/TripleBoxWithText.jsx';
import FixedBox from './components/BoxWithText/BoxWithText.jsx';


const uploadDataToFirebase = async (folderName) => {
  try {
    // Upload staticColumns to a document in "Grocery" collection
    await setDoc(doc(db, `${folderName}/${templateName}`), {
      staticColumns: staticColumns,
      dynamicColumn: dynamicColumn,
    });

    console.log("Data uploaded successfully!");
  } catch (error) {
    console.error("Error uploading data:", error);
  }
};

const handleConvertToPDF = async () => {
  const container = document.getElementById("magazineContainer");

  if (container) {
      await downloadExternalImages(container);

      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
      }).replace(/\//g, '_').replace(/,/g, '').replace(/:/g, '_').replace(/ /g, '_');

      const filename = `grocery_${formattedDate}.pdf`;

      const pdfOptions = {
          filename: filename,
          image: { type: "png", quality: 1 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      // Get the original top value
      const originalTop = container.style.top;

      console.log(originalTop);

      // Ensure container's position property is set
      const computedStyle = window.getComputedStyle(container);
      const position = computedStyle.getPropertyValue('position');
      if (position === 'static') {
          container.style.position = 'relative'; // or 'absolute' depending on your layout needs
      }

      container.style.top = "0";

      // Generate PDF from the container
      await html2pdf().from(container).set(pdfOptions).save();

      // Reset the top value to the original
      container.style.top = originalTop;
  }
};

const downloadExternalImages = async (container) => {
  const images = container.querySelectorAll("img");
  console.log(images);
  const promises = [];

  images.forEach((img) => {
    if (
      img.src &&
      new URL(img.src).host != window.location.host &&
      img.src.startsWith("http")
    ) {
      console.log(img.src);
      promises.push(
        new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("GET", img.src, true);
          xhr.responseType = "blob";
          xhr.onload = () => {
            if (xhr.status === 200) {
              const blob = xhr.response;
              const urlCreator = window.URL || window.webkitURL;
              const imageUrl = urlCreator.createObjectURL(blob);
              img.src = imageUrl;
              resolve();
            } else {
              reject(xhr.statusText);
            }
          };
          xhr.onerror = () => {
            reject(xhr.statusText);
          };
          xhr.send();
        })
      );
    }
  });
  await Promise.all(promises);
};

const renderPriceBox = (
  number,
  column,
  setColumn,
  cardIndex,
  backgroundColor,
  priceBoxBorder
) => {
  const priceBoxes = [
    <FixedBox
      key={`fixed-box-${cardIndex}`}
      textBoxes={column}
      setTextBoxes={setColumn}
      backgroundColor={backgroundColor}
      i={cardIndex}
      cardIndex={cardIndex}
      priceBoxBorder={priceBoxBorder}
      uploadDataToFirebase={uploadDataToFirebase}
    />,
    <TripleBox
      key={`fixed-box-${cardIndex}`}
      textBoxes={column}
      setTextBoxes={setColumn}
      backgroundColor={backgroundColor}
      i={cardIndex}
      cardIndex={cardIndex}
      priceBoxBorder={priceBoxBorder}
      uploadDataToFirebase={uploadDataToFirebase}
    />,
    <AmountForPrice
      key={`fixed-box-${cardIndex}`}
      textBoxes={column}
      setTextBoxes={setColumn}
      backgroundColor={backgroundColor}
      i={cardIndex}
      cardIndex={cardIndex}
      priceBoxBorder={priceBoxBorder}
      uploadDataToFirebase={uploadDataToFirebase}
    />,
  ];

  return priceBoxes[number];
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
  },
  {
    path:"/grocery",
    element: <Grocery handleConvertToPDF={handleConvertToPDF} uploadDataToFirebase={uploadDataToFirebase} renderPriceBox={renderPriceBox} />
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
  },
  {
    path:"/Meat&Seafood",
    element: <MeatAndSeafood />
  },
  {
    path:"/Delicatessen&More",
    element: <DelicatessenAndMore />
  },
  {
    path:"/NapervilleFreshMarket",
    element: <NapervilleFreshMarket />
  }
]);
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);