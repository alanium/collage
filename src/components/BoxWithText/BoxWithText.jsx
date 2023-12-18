import React, { useState, useEffect } from 'react';
import styles from "./BoxWithText.module.css";  // Replace with your actual CSS file

const FixedBox = () => {
  const [text, setText] = useState('Click to edit');
  const [fontSize, setFontSize] = useState(32);  // Initial font size

  const handleDoubleClick = () => {
    const newText = prompt('Enter text:', text);
    if (newText !== null) {
      setText(newText || '');
    }
  };

  useEffect(() => {
    adjustFontSize();
  }, [text]);

  const adjustFontSize = () => {
    const box = document.getElementById('fixed-box');
    const boxWidth = box.clientWidth;
    const boxHeight = box.clientHeight;

    const tempDiv = document.createElement('div');
    tempDiv.style.fontSize = `${fontSize}px`;
    tempDiv.style.padding = '8px';  // Add padding
    tempDiv.style.boxSizing = 'border-box';  // Include padding and border in total width and height
    tempDiv.style.position = 'absolute';
    tempDiv.style.visibility = 'hidden';
    document.body.appendChild(tempDiv);

    // Set the temp div content to the current text
    tempDiv.innerHTML = text;

    let newFontSize = fontSize;
    let safetyCounter = 0; // Safety counter to prevent an infinite loop

    // Check if text exceeds the bounds of the box
    while (
      (tempDiv.offsetWidth > boxWidth || tempDiv.offsetHeight > boxHeight) &&
      safetyCounter < 1000 // Add a limit to prevent an infinite loop
    ) {
      newFontSize--;
      tempDiv.style.fontSize = `${newFontSize}px`;
      safetyCounter++;
    }

    // If text is too small, increase font size without exceeding the box
    while (
      (tempDiv.offsetWidth < boxWidth && tempDiv.offsetHeight < boxHeight) &&
      newFontSize < 32 // Adjust the upper limit as needed
    ) {
      newFontSize++;
      tempDiv.style.fontSize = `${newFontSize}px`;
    }

    setFontSize(newFontSize);

    document.body.removeChild(tempDiv);
  };

  return (
    <div
      id="fixed-box"
      className={styles.box}
      style={{ fontSize: `${fontSize}px` }}
      onClick={handleDoubleClick}
    >
      {text}
    </div>
  );
};

export default FixedBox;