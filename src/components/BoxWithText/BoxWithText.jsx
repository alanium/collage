import React, { useState, useEffect, useRef } from 'react';
import styles from "./BoxWithText.module.css";

const FixedBox = ({ overlayCardTexts, setOverlayCardTexts, i, j }) => {
  const [isEditing, setIsEditing] = useState(false);

  const boxRef = useRef(null);
  const textRef = useRef(null);

  const handleOverlayCardClick = () => {
    const newText = prompt("Enter new amount:");
    if (newText !== null) {
      const newOverlayCardTexts = [...overlayCardTexts];
      newOverlayCardTexts[i][j] = newText;
      setOverlayCardTexts(newOverlayCardTexts);
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
  }, [overlayCardTexts[i][j]]);

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
        display: overlayCardTexts[i][j] !== null ? "flex" : "none",
      }}
      onClick={handleOverlayCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={textRef}
        style={{
          fontSize: '1rem', // Start with a standard size
        }}
      >
        {overlayCardTexts[i][j]}
      </div>
    </div>
  );
};

export default FixedBox;