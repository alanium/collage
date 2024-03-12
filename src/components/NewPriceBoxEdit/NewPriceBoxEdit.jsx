import React, { useEffect, useRef, useState } from "react";
import styles from "./NewPriceBoxEdit.module.css";
import NewPriceBoxControlButtons from "../NewPriceBoxControlButtons/ControlButtons";
import NewModifiedPriceBox from "../NewModifiedPriceBox/NewModifiedPriceBox";
import NewPriceBoxTextBoxEdit from "../NewPriceBoxTextBoxEdit/NewPriceBoxTextBoxEdit";
import interact from "interactjs";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../../routes/root";

export default function NewPriceBoxEdit({
  oldPriceBox,
  selectedColumn,
  setSelectedColumn,
  selectedCardIndex,
  setPopup,
  cardsInStatic,
  uploadDataToFirebase
}) {
  const [priceBox, setPriceBox] = useState(oldPriceBox);
  const [isClosing, setIsClosing] = useState(false)
  const [selectedTextBox, setSelectedTextBox] = useState(null);
  const [selectedTextBoxIndex, setSelectedTextBoxIndex] = useState(null)
  const [containerResolution, setContainerResolution] = useState({});
  const boxRef = useRef(null);
  const [boxDimensions, setBoxDimensions] = useState({
    width: oldPriceBox.width,
    height: oldPriceBox.height
  });

  const [textBoxes, setTextBoxes] = useState([...oldPriceBox.text]);

  const calculatedCardIndex = selectedCardIndex > cardsInStatic ? selectedCardIndex - cardsInStatic : selectedCardIndex

  const handleTextBoxChange = (index, dimensions, position) => {
    
    const newTextBoxes = [...priceBox.text]
    newTextBoxes[index].size = {...dimensions}
    newTextBoxes[index].position = {...position}
    console.log(newTextBoxes)

    setTextBoxes(newTextBoxes)
  };


  const uploadPriceBoxToFirestore = async () => {
    const priceBoxName = prompt("Enter the name of the template");
    const newPriceBox = {...priceBox, width: boxDimensions.width, height: boxDimensions.height}
    newPriceBox.text = [...textBoxes]

    // Validate template name
    if (!priceBoxName || priceBoxName.trim() === "") {
      console.error("Template name is required");
      return;
    }

    try {
      // Create a reference to the template document
      const priceBoxesRef = collection(db, "priceBoxes");

      // Add the document with the user-inputted template name as the document ID
      await setDoc(doc(priceBoxesRef, priceBoxName), 
        newPriceBox
      );
      console.log("Uploaded to Firebase", newPriceBox)
    } catch (error) {
      console.error("Error uploading template:", error.message);
    } finally {
      setPopup(0);
    }
  };
  

  const addTextBox = () => {
    const newText = prompt("Enter new text");
    if (newText) {
      // Check if the user provided input
      setPriceBox((prevPriceBox) => ({
        ...prevPriceBox,
        text: [
          ...prevPriceBox.text,
          {
            text: newText,
            fontSize: 16,
            draggable: true,
            resizable: true,
            position: { x: 10, y: 0 },
            size: { x: 50, y: 50 },
          },
        ], // Use spread operator to update text array
      }));
    }
  };

  const setBackgroundColor = (color) => {
    setPriceBox((prevPriceBox) => ({
      ...prevPriceBox,
      backgroundColor: color,
    }));
  };

  const setTextColor = (color) => {
    setPriceBox((prevPriceBox) => ({
      ...prevPriceBox,
      textColor: color,
    }));
  };

  const setBorder = (color) => {
    setPriceBox((prevPriceBox) => ({
      ...prevPriceBox,
      border: color,
    }));
  };

  const removeTextBox = () => {
    setPriceBox((prevPriceBox) => {
      const updatedText = [...prevPriceBox.text]; // Create a copy of text array
      updatedText.pop(); // Remove the last item
      return {
        ...prevPriceBox,
        text: updatedText, // Update the text array
      };
    });
  };

  const handleSelectedTextBox = (textBoxIndex, index) => {
    setSelectedTextBoxIndex(index)
    setSelectedTextBox(textBoxes[index]);
  };

  useEffect(() => {
    if (isClosing) {
       // Unset interact
       interact(boxRef.current).unset();
    }
  }, [isClosing]);

  const saveAndClose = () => {

    const newPriceBox = {...priceBox, width: boxDimensions.width, height: boxDimensions.height}

    const newColumn = [...selectedColumn]

    newPriceBox.text = [...textBoxes]

    newColumn[calculatedCardIndex].text.priceBox = {...newPriceBox}

    setSelectedColumn(newColumn)

    uploadDataToFirebase
    setPopup(0)
  };

  const renderContainerBox = () => {
    const elementToCopy = document.getElementsByName(`card-${selectedCardIndex}`)[0];
    const computedStyles = window.getComputedStyle(elementToCopy);
    const stylesToCopy = {};
    for (let i = 0; i < computedStyles.length; i++) {
      const propertyName = computedStyles[i];
      const propertyValue = computedStyles.getPropertyValue(propertyName);
      stylesToCopy[propertyName] = propertyValue;
    }
    setContainerResolution({
      width: Number(stylesToCopy.width.replace("px", "")) + 4,
      height: Number(stylesToCopy.height.replace("px", "")) + 5,
    });

  }

  function dragMoveListener(event) {
    const target = event.target;

    const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
    const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

    target.style.width = event.rect.width + "px";
    target.style.height = event.rect.height + "px";
    target.style.transform = `translate(${event.deltaRect.left}px, ${event.deltaRect.top}px)`;

    target.setAttribute("data-x", x);
    target.setAttribute("data-y", y);

    setBoxDimensions({
      width: event.rect.width,
      height: event.rect.height
    });
  }
  

  useEffect(() => {
    renderContainerBox();
  }, [])

  return (
    <>
      <div className={styles.background}>
        <div className={styles.popupContainer} style={{ position: "relative", height: `${containerResolution.height}px`,
            width: `${containerResolution.width}px`, }}>
         <NewModifiedPriceBox
            priceBox={priceBox}
            handleSelectedTextBox={handleSelectedTextBox}
            boxDimensions={boxDimensions}
            isClosing={isClosing}
            boxRef={boxRef}
            dragMoveListener={dragMoveListener}
            handleTextBoxChange={handleTextBoxChange}
            oldPriceBox={oldPriceBox}
          />
          
        </div>
        <NewPriceBoxControlButtons
          setBackgroundColor={setBackgroundColor}
          setBorder={setBorder}
          setTextColor={setTextColor}
          addTextBox={addTextBox}
          removeTextBox={removeTextBox}
        />
        {selectedTextBox && ( // Render TextBoxEditor if selectedTextBox is truthy
          <NewPriceBoxTextBoxEdit
            textBox={selectedTextBox}
            selectedTextBoxIndex={selectedTextBoxIndex}
            textBoxes={textBoxes}
            setTextBoxes={setTextBoxes}
            onUpdate={(updatedTextBox) => {
              const updatedTextArray = textBoxes.map((textBox, index) => {
                if (index === selectedTextBoxIndex) {
                  return updatedTextBox;
                }
                return textBox;
              });
              setTextBoxes([...updatedTextArray]);
              setPriceBox((prevPriceBox) => ({
                ...prevPriceBox,
                text: [...updatedTextArray]
              }))

              
              setSelectedTextBox(null); // Deselect the TextBox after update
            }}
          />
        )}
        <button onClick={saveAndClose}>Save And Close</button>
        <button onClick={uploadPriceBoxToFirestore}>Upload To Cloud</button>
        <button onClick={() => setPopup(0)}>Cancel</button>
      </div>
    </>
  );
}
