import React, { useState, useEffect, useRef } from 'react';
import styles from "./BoxWithText.module.css";

const FixedBox = ({ textBoxes, setTextBoxes, i, cardIndex, backgroundColor, maxStaticIndex, priceBoxBorder  }) => {
  const [isEditing, setIsEditing] = useState(false);

  const boxRef = useRef(null);
  const textRef = useRef(null);

  const index = (cardIndex > maxStaticIndex  ? cardIndex - (maxStaticIndex  + 1) : cardIndex)

  const handlePriceBoxClick = () => {
    const newText = prompt("Enter new amount: ");
    if (newText != null) {
      const newTextBoxes = [...textBoxes];
      if (newText.toLowerCase().includes("for")) {
        newTextBoxes[index].text.priceBoxType = 2
      } else if (newText.includes("each") || newText.includes("lb") || newText.includes("pk") || newText.includes("oz") || newText.includes("ct")) {
        newTextBoxes[index].text.priceBoxType = 1
      }
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
  }, [textBoxes[index].text.bottom]);

  const adjustTextSize = () => {
    const box = boxRef.current;
    const text = textRef.current;
  
    if (!box || !text) return;
  
    // Set the font size to 50px
    let fontSize = 50;
  
    // Ensure the text container occupies 100% of the box width and height
    text.style.width = '100%';
    text.style.height = '100%';
    text.style.fontSize = `${fontSize}px`;
  
    // Check if the text still overflows after resizing, and reduce the font size further if needed
    while ((text.scrollWidth !== box.clientWidth && text.scrollHeight !== box.clientHeight)) {

      if (text.scrollWidth > box.clientWidth) {
        fontSize--;
      }
  
      if (text.scrollWidth < box.clientWidth) {
        fontSize++;
      }
  
      text.style.fontSize = `${fontSize}px`;

    }
  }

  const setBorder = () => {
    return priceBoxBorder ? '1px solid black' : '0px solid black'
  }

  const setBackgroundColor = () => {
    const color = backgroundColor ? 'red' : 'white';
  return color;
  };

  const setTextColor = () => {
    return backgroundColor ? 'white' : 'red';
  };
  
  return (
    <div
      ref={boxRef}
      id={`fixed-box-${i}`}
      className={`${styles.box} ${isEditing ? styles.editing : ''}`}
      style={{ 
        border: setBorder(),
        display: textBoxes[index].text.bottom != null ? "flex" : "none",
        backgroundColor: setBackgroundColor(), // Use setBackgroundColor directly here
        color: setTextColor(), // Use setTextColor directly here
      }}
      onClick={handlePriceBoxClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={textRef}
        className={styles.textContainer}
      >
        {textBoxes[index].text.bottom}
      </div>
    </div>
  );
};

export default FixedBox;