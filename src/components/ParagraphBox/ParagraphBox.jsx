import React, { useEffect, useState } from "react";
import styles from "./TextBoxLeft.module.css";

export default function TextBoxLeft({ textBoxes, setTextBoxes, cardIndex }) {
  const calculatedIndex = cardIndex > 20 ? cardIndex - 21 : cardIndex;

  const [fontSize, setFontSize] = useState(14);

  const handleLeftText = () => {
    const newText = prompt("Input new text: ");
    if (newText !== null) {
      setTextBoxes((prevTextBoxes) => {
        const newTextBoxes = [...prevTextBoxes];
        newTextBoxes[calculatedIndex].text.left = newText;
        return newTextBoxes;
      });
    }
  };

  const textBoxLeftStyle = () => {
    const textBox = textBoxes[calculatedIndex];
    if (typeof textBox.text.left !== "undefined") {
      return cardIndex > 20
        ? styles.overlayCardTextFirstColumn
        : styles.overlayCardTextLeft;
    }
    return "";
  };

  useEffect(() => {
    const textBoxElement = document.getElementById(`textBoxLeft-${cardIndex}`);
    if (textBoxElement) {
      const textHeight = textBoxElement.scrollHeight;
      const boxHeight = textBoxElement.offsetHeight;

      // Ajustar el tamaño de la fuente solo si es necesario
      if (textHeight > boxHeight) {
        const newFontSize = (fontSize * boxHeight) / textHeight;
        setFontSize(newFontSize);
      }
    }
  }, [textBoxes[calculatedIndex].text.left]);

  return (
    <div
      id={`textBoxLeft-${cardIndex}`}
      className={textBoxLeftStyle()}
      onClick={() => handleLeftText()}
      style={{ fontSize: `${fontSize}px` }}
    >
      {textBoxes[calculatedIndex].text.left}
    </div>
  );
}
