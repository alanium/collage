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
}) {
  useEffect(() => {
    const parentContainer = boxRef.current.parentElement;
    const parentWidth = parentContainer.clientWidth;
    const parentHeight = parentContainer.clientHeight;

    interact(boxRef.current)
      .resizable({
        edges: { top: true, left: true }, // Set only top and left edges to true
        restrictEdges: {
          outer: "parent",
          endOnly: true,
        },
        restrictSize: {
          min: { width: 50, height: 50 },
          max: { width: 400, height: 400 },
        },
        inertia: true,
      })
      .on("resizemove", dragMoveListener);
  }, []);

  return (
    <div
      ref={boxRef}
      style={{
        border: `1.7px solid ${priceBox.border}`,
        backgroundColor: priceBox.backgroundColor,
        color: priceBox.textColor, // Initial height
        // To show resize cursor
        width: `${oldPriceBox.width}px`,
        height: `${oldPriceBox.height}px`,
        right: "2px",
        bottom: "2px",
        boxSizing: "border-box",
        touchAction: "none",
        position: "absolute",
        borderRadius: "10px",
        overflow: "hidden",
        // To enable scrolling if content exceeds box size
      }}
    >
      {priceBox.text.map((textBox, index) => (
        <NewPriceBoxTextBox
          key={`textBox-${index}`}
          text={textBox.text}
          fontSize={textBox.fontSize}
          initialPosition={{ top: "10px", left: "10px" }}
          textBoxIndex={index}
          handleSelectedTextBox={handleSelectedTextBox}
          isDraggable={priceBox.text[index].draggable}
          isResizable={priceBox.text[index].resizable}
          handleTextBoxChange={handleTextBoxChange}
          oldPriceBox={oldPriceBox}
        />
      ))}
    </div>
  );
}
