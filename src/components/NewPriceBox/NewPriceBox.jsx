import React from "react";
import styles from "./NewPriceBox.module.css";

export default function NewPriceBox({ cardIndex, priceBox }) {
  return (
    <>
      {priceBox ? (
        <div
          style={{
            border: `1.7px solid ${priceBox.border}`,
            backgroundColor: priceBox.backgroundColor,
            color: priceBox.textColor,
            width: `${priceBox.width}px`,
            height: `${priceBox.height}px`,
            right: "5px",
            bottom: "5px",
            boxSizing: "border-box",
            touchAction: "none",
            position: "absolute",
            borderRadius: priceBox.borderRadius ? "10px" : "0px",
            overflow: "hidden",
            zIndex: "10",
          }}
          name={`pricebox_${cardIndex}`}
        >
          {priceBox.text.map((textBox, index) => (
            <div
              key={index}
              className={styles.textBox} // Ensure unique keys for each child element
              style={{
                transform: `translate(${textBox.position.x}px, ${textBox.position.y}px)`,
                width: `${textBox.size.width}px`, // Using dimensions from NewPriceBoxTextBox
                height: `${textBox.size.height}px`, // Using dimensions from NewPriceBoxTextBox
                fontSize: `${textBox.fontSize}px`,
                boxSizing: "border-box",
                touchAction: "none",
                right: "5pxs",
                position: "absolute",
                display: "flex", // Added for centering text
                justifyContent: "center", // Added for centering text
                alignItems: "center", // Added for centering text
              }}

            >
              <div
                style={{
                  fontFamily: "'Futura PT Condensed Extra Bold', sans-serif",
                  transform: "scale(1.4, 1.8)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {textBox.text.split("/").map((part, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && (
                      <div
                        style={{
                          transform: "scaleY(1.0)",
                          fontSize: `${textBox.fontSize * 1.0}px`,
                          fontFamily: "'Encode Sans', sans-serif",
                        }}
                      >
                        /
                      </div>
                    )}
                    {part}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}
