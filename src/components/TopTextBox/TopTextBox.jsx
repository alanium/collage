import React, { useEffect, useState } from "react";
import styles from "./TopTextBox.module.css";

export default function TopTextBox({ textBoxes, setTextBoxes, cardIndex, setPopup, setSelectedTextBox, setType, setSelectedImage }) {
  const [fontSize, setFontSize] = useState(14);

  const handleTopText = () => {
    setPopup(true);
    setSelectedImage({ cardIndex });
    setSelectedTextBox(textBoxes[cardIndex]);
    setType("top");
  };

  useEffect(() => {
    const textBoxElement = document.getElementById(`topTextBox-${cardIndex}`);
    if (textBoxElement) {
      const textContent = textBoxes[cardIndex].text.top;
      const lines = textContent.split('\n');
      const textHeight = textBoxElement.scrollHeight;
      const boxHeight = textBoxElement.offsetHeight;
      // Ajustar el tamaño de la fuente solo si es necesario
     
      const longestWord = lines.reduce((longest, currentLine) => {
        const words = currentLine.split(' ');
        const currentLongest = words.reduce((lineLongest, current) => (current.length > lineLongest.length ? current : lineLongest), '');
        return currentLongest.length > longest.length ? currentLongest : longest;
      }, '');

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
  }, [textBoxes[cardIndex].text.top, cardIndex, fontSize]);

  // Function to calculate the width of a text string
  const getTextWidth = (text, fontSize) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = `${fontSize}px sans-serif`;
    const lines = text.split('\n');
    return Math.max(...lines.map(line => context.measureText(line).width));
  };

  return (
    <div
      id={`topTextBox-${cardIndex}`}
      className={styles.overlayCardText}
      onClick={() => handleTopText()}
      style={{ fontSize: `${fontSize}px` }}
    >
      <div dangerouslySetInnerHTML={{ __html: textBoxes[cardIndex].text.top }} />
    </div>
  );
}