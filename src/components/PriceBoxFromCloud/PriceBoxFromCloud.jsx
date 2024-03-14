import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import styles from "./PriceBoxFromCloud.module.css";
import { db } from "../../routes/root";

export default function PriceBoxFromCloud({
  setPopup,
  selectedColumn,
  setSelectedColumn,
  selectedCardIndex,
  cardsInStatic,
}) {
  const [visiblePriceBoxes, setVisiblePriceBoxes] = useState();
  const [priceBoxes, setPriceBoxes] = useState([]);
  const [renderedPriceBoxes, setRenderedPriceBoxes] = useState([]);
  const [selectedPriceBox, setSelectedPriceBox] = useState(null);
  const calculatedCardIndex =
    selectedCardIndex >= cardsInStatic
      ? selectedCardIndex - cardsInStatic
      : selectedCardIndex;

  const downloadPriceBoxesFromFirestore = async () => {
    try {
      const priceBoxesCollectionRef = collection(db, "priceBoxes");
      const templatesQuerySnapshot = await getDocs(priceBoxesCollectionRef);

      const templateNames = [];
      templatesQuerySnapshot.forEach((doc) => {
        templateNames.push(doc.id);
      });

      setPriceBoxes(templateNames);
      setRenderedPriceBoxes(templateNames.slice(0, visiblePriceBoxes));
    } catch (error) {
      console.error("Error fetching template names:", error.message);
    }
  };

  const handleConfirmSelection = async (priceBoxName) => {
    try {
      const priceBoxesCollection = collection(db, "priceBoxes");
      const querySnapshot = await getDocs(priceBoxesCollection);
      let priceBoxDoc;

      console.log("Template Name:", priceBoxName);
      console.log("Query Snapshot:", querySnapshot.docs);
      querySnapshot.docs.forEach((doc) => {
        if (doc.id === priceBoxName) {
          priceBoxDoc = doc;
        }
      });

      if (priceBoxDoc) {
        const priceBoxData = priceBoxDoc.data();

        console.log(priceBoxData);

        const newColumn = [...selectedColumn];

        newColumn[calculatedCardIndex].text.priceBox = { ...priceBoxData };

        setSelectedColumn(newColumn);
        setPopup(0);
      } else {
        console.error("Template not found");
      }
    } catch (error) {
      console.error("Error loading template:", error.message);
    } finally {
      setPopup(0);
    }
  };

  useEffect(() => {
    downloadPriceBoxesFromFirestore();
  }, []);

  return (
    <div className={styles.background}>
      <div className={styles.container}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <div style={{ overflowY: "auto", maxHeight: "400px" }}>
            <tbody>
              {renderedPriceBoxes.map((priceBox) => (
                <tr key={priceBox}>
                  <td onClick={() => setSelectedPriceBox(priceBox)}>
                    {priceBox}
                  </td>
                  <td>
                    <button onClick={() => handleConfirmSelection(priceBox)}>
                      Load
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </div>
        </table>
        <button onClick={() => setPopup(0)}>Cancel</button>
      </div>
    </div>
  );
}
