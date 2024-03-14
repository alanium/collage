import React, { useEffect, useRef } from "react";
import interact from "@interactjs/interactjs";
import NewPriceBoxTextBox from "../NewPriceBoxTextBox/NewPriceBoxTextBox";

export default function NewModifiedPriceBox({
  priceBox,
  handleSelectedTextBox,
  handleTextBoxChange,
  dragMoveListener,
  oldPriceBox,
  boxRef,
  textBoxes,
  resizablePricebox
}) {


    useEffect(() => {
      const parentContainer = boxRef.current.parentElement;
      const parentWidth = parentContainer.clientWidth;
      const parentHeight = parentContainer.clientHeight;
  
      const interactInstance = interact(boxRef.current);
  
      if (resizablePricebox) {
        interactInstance.resizable({
          edges: { top: true, left: true },
          restrictEdges: {
            outer: "parent",
            endOnly: true,
          },
          restrictSize: {
            min: { width: 50, height: 50 },
            max: { width: 400, height: 400 },
          },
          inertia: true,
        }).on("resizemove", dragMoveListener);
      } else {
        interactInstance.resizable(false); // Disable resizable
      }
  
      // Cleanup function
    }, [boxRef, dragMoveListener, resizablePricebox]);
  
    // Function to toggle resizable property
  
  return (
    <div
      ref={boxRef}
      style={{
        border: `1.7px solid ${priceBox.border}`,
        backgroundColor: priceBox.backgroundColor,
        color: priceBox.textColor, // Initial height
        // To show resize cursor
        width: `${priceBox.width}px`,
        height: `${priceBox.height}px`,
        right: "2px",
        bottom: "2px",
        boxSizing: "border-box",
        touchAction: "none",
        position: "absolute",
        borderRadius: ( priceBox.borderRadius ? "10px" : "0px"),
        overflow: "hidden",
        justifyContent: "center", // Added for centering text
          alignItems: "center", 
        // To enable scrolling if content exceeds box size
      }}
    >
      {textBoxes.map((textBox, index) => (
        <>
        {textBoxes[index] && 
        <NewPriceBoxTextBox
        key={`textBox-${index}`}
        textBox={textBox}
        text={textBox.text}
        fontSize={textBox.fontSize}
        initialPosition={{ top: "10px", left: "10px" }}
        textBoxIndex={index}
        handleSelectedTextBox={handleSelectedTextBox}
        isDraggable={textBoxes[index].draggable}
        isResizable={textBoxes[index].resizable}
        handleTextBoxChange={handleTextBoxChange}
        priceBox={priceBox}
      />
        }
        </>
      ))}
    </div>
  );
}
