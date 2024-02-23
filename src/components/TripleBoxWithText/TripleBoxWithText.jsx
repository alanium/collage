import React, { useState, useEffect, useRef } from 'react';
import styles from "./TripleBoxWithText.module.css";  

const TripleBox = ({ textBoxes, setTextBoxes , i, cardIndex, backgroundColor, maxStaticIndex, priceBoxBorder, uploadDataToFirebase }) => {
  const [topBoxFontSize, setTopBoxFontSize] = useState(50);
  const [bottomBoxFontSize, setBottomBoxFontSize] = useState(10);
  const [leftBoxFontSize, setLeftBoxFontSize] = useState(60);
  const [isEditing, setIsEditing] = useState(false);

  const containerRef = useRef(null);
  const topBoxRef = useRef(null);
  const bottomBoxRef = useRef(null);
  const leftBoxRef = useRef(null);

  const auxIndex = (cardIndex > maxStaticIndex ? cardIndex - (maxStaticIndex + 1) : cardIndex)

  useEffect(() => {
    adjustTextSize(leftBoxRef, textBoxes[auxIndex].text.left, setLeftBoxFontSize);
  }, textBoxes);

  useEffect(() => {
    adjustTextSize(topBoxRef, textBoxes[auxIndex].text.top, setTopBoxFontSize);
  }, textBoxes);

  useEffect(() => {
    adjustTextSize(bottomBoxRef, textBoxes[auxIndex].text.bottom, setBottomBoxFontSize);
  }, textBoxes);

  useEffect(() => {
    console.log(backgroundColor)
  }, [backgroundColor])

  const adjustTextSize = (boxRef, textBox ,setFontSize) => {
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
    const bottomBoxMinimumFontSize = 14;
  
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
  

  const handlePriceBoxClick = () => {
    const newText = prompt("Enter new amount: ");
    if (newText != null) {
      const newTextBoxes = [...textBoxes];
      newTextBoxes[auxIndex].text.bottom = newText;
      if (newText.includes("/")) {
        newTextBoxes[auxIndex].text.priceBoxType = 0
      } else if (newText.toLowerCase().includes("for")) {
        newTextBoxes[auxIndex].text.priceBoxType = 2
      }
      setTextBoxes(newTextBoxes);
      uploadDataToFirebase()
    }
  };


  const setTextColor = () => {
    return backgroundColor ? 'white' : 'red';
  };

  const setBorder = () => {
    return priceBoxBorder ? '1px solid black' : '0px solid black'
  }

  const handleMouseEnter = () => {
    setIsEditing(true);
  };

  const handleMouseLeave = () => {
    setIsEditing(false);
  };

  return (
    <div
      ref={containerRef}
      id={`triple-box-${i}`}
      className={`${styles.containerBox} ${isEditing ? styles.editing : ''}`}
      style={{
  
        border: setBorder(),
        display: textBoxes[auxIndex].text.bottom != null ? 'flex' : 'none',
        backgroundColor: backgroundColor ? 'red' : 'white', // Use setBackgroundColor directly here
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
        {textBoxes[auxIndex].text.bottom && textBoxes[auxIndex].text.bottom.split(".")[0]}
      </div>
      <div className={styles.topButtomBox}>
        <div
          className={styles.topBox}
          ref={topBoxRef}
          style={{ fontSize: `min(${topBoxFontSize}px, 22px)`}}
        >
          {textBoxes[auxIndex].text.bottom && textBoxes[auxIndex].text.bottom.split(".")[1]?.split(" ")[0]}
        </div>
        <div
          className={styles.bottomBox}
          ref={bottomBoxRef}
          style={{ fontSize: `${bottomBoxFontSize}px` }}
        >
          {textBoxes[auxIndex].text.bottom && textBoxes[auxIndex].text.bottom.includes(" ") ? (
            textBoxes[auxIndex].text.bottom.slice(
              textBoxes[auxIndex].text.bottom.indexOf(" ") + 1
            )
          ) : (
            textBoxes[auxIndex].text.bottom
          )}
        </div>
      </div>
    </div>
  );
};

export default TripleBox;
