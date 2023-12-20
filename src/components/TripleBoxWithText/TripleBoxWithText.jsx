import React, { useState, useEffect, useRef } from 'react';
import styles from "./TripleBoxWithText.module.css";  // Replace with your actual CSS file

const TripleBox = ({ overlayCardTexts, setOverlayCardTexts, i, j, smallDivText, setSmallDivText }) => {
  const [topBoxFontSize, setTopBoxFontSize] = useState(40);
  const [bottomBoxFontSize, setBottomBoxFontSize] = useState(40);
  const [leftBoxFontSize, setLeftBoxFontSize] = useState(40);

  const topBoxRef = useRef(null);
  const bottomBoxRef = useRef(null);
  const leftBoxRef = useRef(null);

  useEffect(() => {
    adjustTextSize(leftBoxRef, overlayCardTexts[i][j], setLeftBoxFontSize);
  }, [overlayCardTexts[i][j]]);

  useEffect(() => {
    adjustTextSize(topBoxRef, overlayCardTexts[i][j], setTopBoxFontSize);
  }, [overlayCardTexts[i][j]]);

  useEffect(() => {
    adjustTextSize(bottomBoxRef, smallDivText[i][j], setBottomBoxFontSize);
  }, [smallDivText[i][j]]);

  const adjustTextSize = (boxRef, content, setFontSize) => {
    const box = boxRef.current;

    if (!box) return;

    const boxWidth = box.clientWidth;
    const boxHeight = box.clientHeight;

    box.style.fontSize = '2rem'; // Start with a standard size

    let newFontSizeValue = 30; // Set a minimum font size

    // Check if the text content exceeds the limits of the box
    while (
      (box.scrollWidth > boxWidth || box.scrollHeight > boxHeight) &&
      newFontSizeValue > 1  // Adjust the lower limit as needed
    ) {
      newFontSizeValue -= 1;
      box.style.fontSize = `${newFontSizeValue}px`;
    }

    // Update the font size state
    setFontSize(newFontSizeValue);
  };

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

  return (
    <div
      id={`triple-box-${i}-${j}`}
      className={styles.containerBox}
      style={{ display: overlayCardTexts[i][j] != null ? "flex" : "none" }}
      onClick={handleOverlayCardClick}
    >
      <div
        className={styles.leftBox}
        ref={leftBoxRef}
        style={{ fontSize: `${leftBoxFontSize}px` }}
      >
        {overlayCardTexts[i][j] && overlayCardTexts[i][j].slice(0, overlayCardTexts[i][j].indexOf("."))}
      </div>
      <div>
        <div
          className={styles.topBox}
          ref={topBoxRef}
          style={{ fontSize: `${topBoxFontSize}px` }}
        >
          {overlayCardTexts[i][j] && overlayCardTexts[i][j].slice(overlayCardTexts[i][j].indexOf("."), (overlayCardTexts[i][j].length)).split(".")}
        </div>
        <div
          onClick={handleSmallDivClick}
          className={styles.bottomBox}
          ref={bottomBoxRef}
          style={{ fontSize: `${bottomBoxFontSize}px` }}
        >
          {smallDivText[i][j] && smallDivText[i][j]}
        </div>
      </div>
    </div>
  );
};

export default TripleBox;