import React, { useState, useEffect, useRef } from 'react';
import styles from "./AmountForPrice.module.css";

const AmountForPrice = ({ textBoxes, setTextBoxes, i, j, cardIndex, backgroundColor }) => {
    const [middleBoxFontSize, setMiddleBoxFontSize] = useState(50);
    const [rightBoxFontSize, setRightBoxFontSize] = useState(10);
    const [leftBoxFontSize, setLeftBoxFontSize] = useState(60);
    const [isEditing, setIsEditing] = useState(false);
    const containerRef = useRef(null);
    const middleBoxRef = useRef(null);
    const rightBoxRef = useRef(null);
    const leftBoxRef = useRef(null);
  
    const auxIndex = (cardIndex > 20 ? cardIndex - 21 : cardIndex)
  
    useEffect(() => {
      adjustTextSize(leftBoxRef, setLeftBoxFontSize);
    }, textBoxes);
  
    useEffect(() => {
      adjustTextSize(rightBoxRef, setRightBoxFontSize);
    }, textBoxes);

    const handlePriceBoxClick = () => {
        const newText = prompt("Enter new amount: ");
        if (newText != null) {
          const newTextBoxes = [...textBoxes];
          newTextBoxes[auxIndex].text.bottom = newText;
          if (newText.includes("/")) {
            newTextBoxes[auxIndex].text.priceBoxType = 0
          } else if (newText.includes("each") || newText.includes("lb") || newText.includes("pk") || newText.includes("oz")) {
            newTextBoxes[auxIndex].text.priceBoxType = 1
          }
          setTextBoxes(newTextBoxes);
        }
      };

      const handleMouseEnter = () => {
        setIsEditing(true);
      };
    
      const handleMouseLeave = () => {
        setIsEditing(false);
      };
  
      const adjustTextSize = (boxRef, setFontSize) => {
        const box = boxRef.current;
      
        if (!box) return;
      
        const boxWidth = box.clientWidth;
        const boxHeight = box.clientHeight;
      
        let fontSize = 44;
      
        while ((box.scrollWidth !== box.clientWidth && box.scrollHeight !== box.clientHeight)) {
          if (box.scrollWidth > box.clientWidth) {
            fontSize--;
          }
          if (box.scrollWidth < box.clientWidth) {
            fontSize++;
          }
          box.style.fontSize = `${fontSize}px`;
        }
        // Ensure font size does not exceed the maximum
        setFontSize(fontSize);
        // Adjust font size for left box dynamically based on overflow
      };

      const setBackgroundColor = () => {
        const color = backgroundColor ? 'red' : 'white';
      console.log('Background Color:', color);
      return color;
      };
    
      const setTextColor = () => {
        return backgroundColor ? 'white' : 'red';
      };
    
  return (
    <div
      ref={containerRef}
      id={`triple-box-${i}-${j}`}
      className={`${styles.containerBox} ${isEditing ? styles.editing : ''}`}
      style={{ display: textBoxes[auxIndex].text.bottom != null ? "flex" : "none",
        backgroundColor: setBackgroundColor(), // Use setBackgroundColor directly here
        color: setTextColor(), // Use setTextColor directly here
      }}
      onClick={handlePriceBoxClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={styles.leftBox}
        ref={leftBoxRef}
        style={{ fontSize: `${leftBoxFontSize}px` }}
      >
        {textBoxes[auxIndex].text.bottom && textBoxes[auxIndex].text.bottom.split(" ")[0]}
      </div>
        <div
          className={styles.middleBox}
          ref={middleBoxRef}
          style={{ fontSize: `10px` }}
        >
          {textBoxes[auxIndex].text.bottom && textBoxes[auxIndex].text.bottom.split(" ")[1].toUpperCase()}
        </div>
        <div
          className={styles.rightBox}
          ref={rightBoxRef}
          style={{ fontSize: `${rightBoxFontSize}px` }}
        >
          {textBoxes[auxIndex].text.bottom && textBoxes[auxIndex].text.bottom.split(" ")[2]}
        </div>
      </div>
  );
};

export default AmountForPrice;