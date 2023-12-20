import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from "./TripleBoxWithText.module.css";  // Replace with your actual CSS file

const TripleBox = ({ overlayCardTexts, setOverlayCardTexts, i, j, smallDivText, setSmallDivText}) => {
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(40);  // Initial font size

  const boxRef = useRef(null);
  const textRef = useRef(null);

  const handleOverlayCardClick = () => {
    const newText = prompt("Enter new amount:");
    if (newText != null) {
      const newOverlayCardTexts = [...overlayCardTexts];
      newOverlayCardTexts[i][j] = newText;
      setOverlayCardTexts(newOverlayCardTexts);
    }
  };

  const handleSmallDivClick = () => {
    const newText = prompt("Enter new text: ")
    if (newText != null) {
        const newSmallDivTexts = [...smallDivText];
        newSmallDivTexts[i][j] = newText;
        setSmallDivText(newText)
    }
  }

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
      id={`triple-box-${i}-${j}`}
      className={styles.containerBox}
      style={{display: overlayCardTexts[i][j] != null ? "flex" : "none" }}
      onClick={handleOverlayCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={styles.leftBox}
      >
            {overlayCardTexts[i][j] && overlayCardTexts[i][j].slice(0, overlayCardTexts[i][j].indexOf("."))}  
      </div>
      
      <div>
        {overlayCardTexts[i][j] && overlayCardTexts[i][j].slice(overlayCardTexts[i][j].indexOf("."), (overlayCardTexts[i][j].length - 1))}</div>
      <div
        onClick={handleSmallDivClick}
      >
        {smallDivText[i][j] && smallDivText[i][j]}
      </div>
    </div>
  );
};

export default TripleBox;