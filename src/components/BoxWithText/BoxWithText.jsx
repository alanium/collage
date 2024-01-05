import React, { useState, useEffect, useRef } from 'react';
import styles from "./BoxWithText.module.css";

const FixedBox = ({ textBoxes, setTextBoxes, i, j, cardIndex }) => {
  const [isEditing, setIsEditing] = useState(false);

  const boxRef = useRef(null);
  const textRef = useRef(null);

  const index = (cardIndex > 20? cardIndex - 21 : cardIndex)

  const handlePriceBoxClick = () => {
    const newText = prompt("Enter new amount: ");
    if (newText != null) {
      const newTextBoxes = [...textBoxes];
      newTextBoxes[index].text.bottom = newText;
      setTextBoxes(newTextBoxes);
    }
  };

  const handleMouseEnter = () => {
    setIsEditing(true);
  };

  const handleMouseLeave = () => {
    setIsEditing(false);
  };

  useEffect(() => {
    adjustTextSize();
  }, [textBoxes[index]]);

  const adjustTextSize = () => {
    const box = boxRef.current;
    const text = textRef.current;

    if (!box || !text) return;

    const boxWidth = box.clientWidth;
    const boxHeight = box.clientHeight;

    text.style.fontSize = '2rem'; // Start with a standard size

    let newFontSizeValue = 30; // Set a minimum font size

    // Verifica si el texto excede los límites del cuadro
    while (
      (text.offsetWidth > boxWidth || text.offsetHeight > boxHeight) &&
      newFontSizeValue > 1  // Adjust the lower limit as needed
    ) {
      newFontSizeValue -= 1;
      text.style.fontSize = `${newFontSizeValue}px`;
    }
  };

  return (
    <div
      ref={boxRef}
      id={`fixed-box-${i}-${j}`}
      className={`${styles.box} ${isEditing ? styles.editing : ''}`}
      style={{
        display: textBoxes[index].text.bottom !== null ? "flex" : "none",
      }}
      onClick={handlePriceBoxClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={textRef}
        style={{
          fontSize: '1rem', // Start with a standard size
        }}
      >
        {textBoxes[index].text.bottom}
      </div>
    </div>
  );
};

export default FixedBox;