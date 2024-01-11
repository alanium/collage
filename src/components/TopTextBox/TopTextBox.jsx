import React, { useEffect, useState } from "react";
import styles from "./TopTextBox.module.css"

export default function TopTextBox ({textBoxes, setTextBoxes, cardIndex}) {

    const [fontSize, setFontSize] = useState(16);

    const handleTopText = () => {
        const newText = prompt("Input new text: ");
        if (newText !== null) {
          setTextBoxes((prevTextBoxes) => {
            const newStaticColumns = [...prevTextBoxes];
            newStaticColumns[cardIndex].text.top = newText;
            return newStaticColumns;
          });
        }
      };

      useEffect(() => {
        const textBoxElement = document.getElementById(`topTextBox-${cardIndex}`);
        if (textBoxElement) {
          const textHeight = textBoxElement.scrollHeight;
          const boxHeight = textBoxElement.offsetHeight;
    
          // Ajustar el tamaño de la fuente solo si es necesario
          if (textHeight > boxHeight) {
            const newFontSize = (fontSize * boxHeight) / textHeight;
            setFontSize(newFontSize);
          }
        }
      }, [textBoxes[cardIndex].text.top]);

    return (
        <div
              id={`topTextBox-${cardIndex}`}
              className={styles.overlayCardText}
              onClick={() => handleTopText()}
            >
              {textBoxes[cardIndex].text.top}
            </div>
    )
}