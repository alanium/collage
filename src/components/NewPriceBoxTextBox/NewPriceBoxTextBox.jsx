import React, { useEffect, useRef, useState } from "react";
import interact from "interactjs";
import styles from "./NewPriceBoxTextBox.module.css";

export default function NewPriceBoxTextBox({
  initialPosition,
  text,
  fontSize,
  textBoxIndex,
  handleSelectedTextBox,
  isDraggable,
  textBox,
  handleTextBoxChange,
  priceBox,
}) {
  const textBoxRef = useRef(null);
  const [isFirstClick, setIsFirstClick] = useState(true);
  const [textBoxText, setTextBoxText] = useState(""); // Initialize with an empty string

  const handleDragMove = (event) => {
    const { target } = event;
    const x = (parseFloat(target.getAttribute("data-x")) || priceBox.text[textBoxIndex]?.position.x) + event.dx;
    const y = (parseFloat(target.getAttribute("data-y")) || priceBox.text[textBoxIndex]?.position.y) + event.dy;
  
    target.style.transform = `translate(${x}px, ${y}px)`;
    target.setAttribute("data-x", x);
    target.setAttribute("data-y", y);
  
    const dimensions = {
      width: event.rect.width,
      height: event.rect.height,
    };
  
    const position = { x, y };

  
    // Update text state
    setTextBoxText(text);
  
    console.log(priceBox.text[textBoxIndex].position);
  };

  const handleClick = (event) => {
    handleSelectedTextBox(textBoxIndex);
  };

  useEffect(() => {
    // Update textBoxText when text prop changes
    setTextBoxText(text || priceBox.text[textBoxIndex].text);
  }, [text]);

  useEffect(() => {
    const textBoxElement = textBoxRef.current;
    let interactable = null;
  
    if (textBoxElement) {
      interactable = interact(textBoxElement);
  
      if (isDraggable) {
        interactable.draggable({
          listeners: { move: handleDragMove },
          modifiers: [
            interact.modifiers.restrictRect({
              restriction: "parent",
              endOnly: true,
            }),
          ],
        }).on('dragend', () => {
          // Execute handleTextBoxChange when dragging ends
          const dimensions = {
            width: textBoxElement.offsetWidth,
            height: textBoxElement.offsetHeight,
          };
  
          const position = {
            x: parseFloat(textBoxElement.getAttribute("data-x")) || priceBox.text[textBoxIndex].position.x,
            y: parseFloat(textBoxElement.getAttribute("data-y")) || priceBox.text[textBoxIndex].position.y,
          };
  
          handleTextBoxChange(textBoxIndex, dimensions, position, textBoxText, fontSize);
        });
      }
    }
  
    return () => {
      if (interactable) {
        interactable.unset();
      }
    };
  }, [isDraggable, handleDragMove, handleTextBoxChange, priceBox, fontSize, textBoxIndex, textBoxText]); // Include handleDragMove in the dependency array

  // Transform style depends on priceBox, fontSize, and initialPosition


  return (
    <>
    {textBox && (
        <div
        ref={textBoxRef}
        onClick={handleClick}
        key={textBoxIndex}
        className={styles.textBox}
        style={{
          border: isDraggable ? "1px solid black" : "",
          backgroundColor: isDraggable ? "rgba(255, 255, 255, 0.5)" : "",
          padding: "0px",
          boxSizing: "border-box",
          touchAction: "none",
          position: "absolute",
          transform: `translate(${priceBox.text[textBoxIndex] && priceBox.text[textBoxIndex].position.x}px, ${priceBox.text[textBoxIndex] && priceBox.text[textBoxIndex].position.y}px`,
          top: "0px",
          height: "auto",
          width: "auto",
          left: initialPosition.left,
          fontSize: `${fontSize}px`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: "'Futura PT Condensed Extra Bold', sans-serif",
            transform: "scaleY(1.5)",
            display: "flex",
            alignItems: "center",
          }}
        >
          {textBoxText &&
            typeof textBoxText === "string" &&
            textBoxText.split("/").map((part, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <div
                    style={{
                      transform: "scaleY(1.0)",
                      fontSize: `${fontSize * 1}px`,
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
    )}
    </>
    
  );
}
