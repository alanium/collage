import React, { useEffect, useState } from "react";
import styles from "./TextBoxLeft.module.css";

export default function TextBoxLeft({
  textBoxes,
  setTextBoxes,
  cardIndex,
  setPopup,
  setSelectedTextBox,
  setType,
  setSelectedImage,
  index,
  maxCardPosition,
}) {
  const calculatedIndex = index;

  const [fontSize, setFontSize] = useState(14);

  const handleLeftText = () => {
    setPopup(1);
    setSelectedImage({ cardIndex });
    setSelectedTextBox(textBoxes[cardIndex]);
    setType("left");
  };

  const textBoxLeftStyle = () => {
    const textBox = textBoxes[calculatedIndex];
    if (textBoxes[calculatedIndex]) {
      return cardIndex > maxCardPosition
        ? styles.overlayCardTextFirstColumn
        : styles.overlayCardTextLeft;
    }
    return "";
  };

  useEffect(() => {
    const textBoxElement = document.getElementById(`textBoxLeft-${cardIndex}`);
    const currentTextBox = textBoxes[calculatedIndex];

    if (
      textBoxElement &&
      currentTextBox &&
      currentTextBox.text &&
      currentTextBox.text.left
    ) {
      // Rest of your code
      const textContent = textBoxes[calculatedIndex].text.left;
      const lines = textContent.split("\n");
      const textHeight = textBoxElement.scrollHeight;
      const boxHeight = textBoxElement.offsetHeight;
      // Ajustar el tamaño de la fuente solo si es necesario

      const longestWord = lines.reduce((longest, currentLine) => {
        const words = currentLine.split(" ");
        const currentLongest = words.reduce(
          (lineLongest, current) =>
            current.length > lineLongest.length ? current : lineLongest,
          ""
        );
        return currentLongest.length > longest.length
          ? currentLongest
          : longest;
      }, "");

      // Check if the longest word is more than 10 characters
      if (longestWord.length > 10) {
        const boxWidth = textBoxElement.offsetWidth;
        const textWidth = getTextWidth(longestWord, fontSize);

        // Check if the text width is greater than the box width
        if (textWidth > boxWidth) {
          // Calculate the new font size based on the ratio of the box width and text width
          const newFontSize = (fontSize * boxWidth) / textWidth;
          setFontSize(newFontSize);
        }
      }
      if (textHeight > boxHeight) {
        const newFontSize = (fontSize * boxHeight) / textHeight;
        setFontSize(newFontSize);
      }
    }
  }, [textBoxes[calculatedIndex].text.left, cardIndex, fontSize]);

  // Function to calculate the width of a text string
  const getTextWidth = (text, fontSize) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = `${fontSize}px sans-serif`;
    const lines = text.split("\n");
    return Math.max(...lines.map((line) => context.measureText(line).width));
  };

  return (
    <div
      id={`textBoxLeft-${cardIndex}`}
      className={textBoxLeftStyle()}
      onClick={() => handleLeftText()}
      style={{
        fontSize: `${fontSize}px`,
        width: `${
          textBoxes[calculatedIndex].text.priceBoxType == 2 ? "65px" : "50%"
        }`,
      }}
    >
      <div
        dangerouslySetInnerHTML={{
          __html: textBoxes[calculatedIndex].text.left,
        }}
      />
    </div>
  );
}
