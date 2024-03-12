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
  isResizable,
  handleTextBoxChange,
  oldPriceBox,
}) {
  const textBoxRef = useRef(null);
  const [isFirstClick, setIsFirstClick] = useState(true);

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
        });
      }
    }

    return () => {
      if (interactable) {
        interactable.unset();
      }
    };
  }, [isDraggable]);

  const handleDragMove = (event) => {
    const { target } = event;
    const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
    const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

    target.style.transform = `translate(${x}px, ${y}px)`;
    target.setAttribute("data-x", x);
    target.setAttribute("data-y", y);

    const dimensions = {
      width: event.rect.width,
      height: event.rect.height,
    };
    const position = { x, y };
    handleTextBoxChange(textBoxIndex, dimensions, position);
  };

  const handleClick = (event) => {
    event.stopPropagation();
    handleSelectedTextBox(textBoxIndex, textBoxIndex);

    if (isFirstClick) {
      const rect = textBoxRef.current.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;

      textBoxRef.current.setAttribute("data-x", offsetX);
      textBoxRef.current.setAttribute("data-y", offsetY);

      setIsFirstClick(false);
    }
  };

  return (
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
        transform: `translate(${
          oldPriceBox.text[textBoxIndex]
            ? oldPriceBox.text[textBoxIndex].position.x
            : 10
        }px, ${
          oldPriceBox.text[textBoxIndex]
            ? oldPriceBox.text[textBoxIndex].position.y
            : 10
        }px`,
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
        {text.split("/").map((part, index) => (
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
  );
}
