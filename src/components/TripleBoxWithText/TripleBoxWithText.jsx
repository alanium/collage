import React, { useState, useEffect, useRef } from 'react';
import styles from "./TripleBoxWithText.module.css";  

const TripleBox = ({ overlayCardTexts, setOverlayCardTexts, i, j }) => {
  const [topBoxFontSize, setTopBoxFontSize] = useState(50);
  const [bottomBoxFontSize, setBottomBoxFontSize] = useState(10);
  const [leftBoxFontSize, setLeftBoxFontSize] = useState(60);
  const [isEditing, setIsEditing] = useState(false);

  const containerRef = useRef(null);
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
    adjustTextSize(bottomBoxRef, [overlayCardTexts[i][j]], setBottomBoxFontSize);
  }, [overlayCardTexts[i][j]]);

  const adjustTextSize = (boxRef, content, setFontSize) => {
    const box = boxRef.current;
  
    if (!box) return;
  
    const isBottomBox = boxRef === bottomBoxRef;
    const boxWidth = box.clientWidth;
    const boxHeight = box.clientHeight;
  
    box.style.fontSize = '2rem';
  
    let newFontSizeValue = 50;
  
    // Set maximum and minimum font size
    const maximumFontSize = 60;
    const minimumFontSize = 23;
    const bottomBoxMinimumFontSize = 10;
  
    while (
      (box.scrollWidth > boxWidth || box.scrollHeight > boxHeight) &&
      newFontSizeValue > (isBottomBox ? bottomBoxMinimumFontSize : minimumFontSize)
    ) {
      newFontSizeValue -= 1;
      box.style.fontSize = `${newFontSizeValue}px`;
    }
  
    // Ensure font size does not exceed the maximum
    setFontSize(Math.min(newFontSizeValue, maximumFontSize));
  
    // Adjust font size for left box dynamically based on overflow
    if (!isBottomBox) {
      const leftBoxContainer = containerRef.current;
      const leftBoxContainerWidth = leftBoxContainer.clientWidth;
  
      // Check if left box overflows
      if (box.scrollWidth > leftBoxContainerWidth) {
        // Adjust font size for left box based on overflow
        const ratio = leftBoxContainerWidth / box.scrollWidth;
        const adjustedFontSize = Math.floor(newFontSizeValue * ratio);
        box.style.fontSize = `${adjustedFontSize}px`;
        setFontSize(adjustedFontSize);
      }
    }
  };
  

  const handleOverlayCardClick = () => {
    const newText = prompt("Ingrese el nuevo monto:");
    if (newText != null) {
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

  return (
    <div
      ref={containerRef}
      id={`triple-box-${i}-${j}`}
      className={`${styles.containerBox} ${isEditing ? styles.editing : ''}`}
      style={{ display: overlayCardTexts[i][j] != null ? "flex" : "none" }}
      onClick={handleOverlayCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={styles.leftBox}
        ref={leftBoxRef}
        style={{ fontSize: `${leftBoxFontSize}px` }}
      >
        {overlayCardTexts[i][j] && overlayCardTexts[i][j].split(".")[0]}
      </div>
      <div className={styles.topButtomBox}>
        <div
          className={styles.topBox}
          ref={topBoxRef}
          style={{ fontSize: `${topBoxFontSize}px` }}
        >
          {overlayCardTexts[i][j] && overlayCardTexts[i][j].split(".")[1]?.split(" ")[0]}
        </div>
        <div
          className={styles.bottomBox}
          ref={bottomBoxRef}
          style={{ fontSize: `${bottomBoxFontSize}px` }}
        >
          {overlayCardTexts[i][j] && overlayCardTexts[i][j].includes(" ") ? (
            overlayCardTexts[i][j].slice(
              overlayCardTexts[i][j].indexOf(" ") + 1
            )
          ) : (
            overlayCardTexts[i][j]
          )}
        </div>
      </div>
    </div>
  );
};

export default TripleBox;