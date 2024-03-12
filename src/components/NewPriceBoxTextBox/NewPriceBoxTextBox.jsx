import React, { useEffect, useRef } from "react";
import interact from "interactjs";
import styles from "./NewPriceBoxTextBox.module.css"

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

  useEffect(() => {
    const textBoxElement = textBoxRef.current;
    let interactable = null;

    if (textBoxElement) {
      interactable = interact(textBoxElement);

      if (isDraggable) {
        interactable.draggable({
          modifiers: [
            interact.modifiers.restrictRect({
              restriction: "parent",
              endOnly: true,
            }),
          ],
          autoScroll: true,
          onmove: handleDragMove,
        });
      }

      // Add resizable property only when isResizable is true
      if (isResizable) {
        interactable.resizable({
          edges: { bottom: true, top: true, left: true, right: true },
          restrictEdges: {
            outer: "parent",
            endOnly: true,
          },
          inertia: true, // enables inertial throwing
          listeners: {
            move(event) {
              const target = event.target;
              let x = parseFloat(target.getAttribute("data-x")) || 0;
              let y = parseFloat(target.getAttribute("data-y")) || 0;

              // update the element's style
              target.style.width = event.rect.width + "px";
              target.style.height = event.rect.height + "px";

              // translate when resizing from top or left edges
              x += event.deltaRect.left;
              y += event.deltaRect.top;

              target.style.transform = `translate(${x}px, ${y}px)`;

              target.setAttribute("data-x", x);
              target.setAttribute("data-y", y);

              const dimensions = {
                width: event.rect.width,
                height: event.rect.height,
              };

              const position = { x, y };
              handleTextBoxChange(textBoxIndex, dimensions, position);
            },
          },
        });
      }
    }

    function handleDragMove(event) {
      const target = event.target;

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
    }
  }, []);

  const handleClick = () => {
    handleSelectedTextBox(textBoxIndex, textBoxIndex);

    // Get the transform style
    const transformStyle = textBoxRef.current.style.transform;

    let translateX = 0;
    let translateY = 0;
    // Check if transformStyle is defined
    if (transformStyle) {
      // Parse the transform style to extract translate values
      const translateMatch = transformStyle.match(
        /translate\(([^,]+),([^)]+)\)/
      );
      if (translateMatch && translateMatch.length === 3) {
        translateX = parseFloat(translateMatch[1]);
        translateY = parseFloat(translateMatch[2]);
      }
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
        height: `${
          oldPriceBox.text[textBoxIndex]
            ? oldPriceBox.text[textBoxIndex].size.height
            : 50
        }px`,
        width: `${
          oldPriceBox.text[textBoxIndex]
            ? oldPriceBox.text[textBoxIndex].size.width
            : 50
        }px`,
        left: initialPosition.left,
        fontSize: `${fontSize}px`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ transform: "scaleY(1.5)" }}>{text}</div>
    </div>
  );
}
