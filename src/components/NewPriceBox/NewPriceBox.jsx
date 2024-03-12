import React from "react";
import styles from "./NewPriceBox.module.css"

export default function NewPriceBox({ priceBox }) {

  return (
    <>
    {priceBox ? (
      <div
      
      style={{
        border: `1.7px solid ${priceBox.border}`,
        backgroundColor: priceBox.backgroundColor,
        color: priceBox.textColor,
        width: `${priceBox.width}px` ,
        height: `${priceBox.height}px`,
        right: "2px",
        bottom: "2px",
        boxSizing: "border-box",
        touchAction: "none",
        position: "absolute",
        borderRadius: "10px",
        overflow: "hidden",
        zIndex: "10",
      }}
    >
      {priceBox.text.map((textBox, index) => (
        <div
        key={index}
        className={styles.textBox} // Ensure unique keys for each child element
        style={{
          transform: `translate(${textBox.position.x + 10}px, ${textBox.position.y}px)`,
          width: `${textBox.size.width}px`, // Using dimensions from NewPriceBoxTextBox
          height: `${textBox.size.height}px`, // Using dimensions from NewPriceBoxTextBox
          fontSize: `${textBox.fontSize}px`,
          boxSizing: "border-box",
          touchAction: "none",
          position: "absolute",
          display: "flex", // Added for centering text
          justifyContent: "center", // Added for centering text
          alignItems: "center", // Added for centering text
          }}
        >
          <div style={{ transform: "scaleY(1.5)" }}>{textBox.text}</div>
        </div>
      ))}
    </div>
    ) : null}
      
    </>
    
  );
}
