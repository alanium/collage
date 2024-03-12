import React, { useState, useEffect } from "react";
import styles from "./ControlButtons.module.css";
import { SketchPicker } from "react-color";


export default function NewPriceBoxControlButtons({
  setBackgroundColor,
  setTextColor,
  setBorder,
  addTextBox,
  removeTextBox,

}) {

  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState("#000000");
  const [selectedColorType, setSelectedColorType] = useState(null);

  const handleColorChange = (color) => {
    setCurrentColor(color.hex);
  };

  const handleColorPickerClose = () => {
    setDisplayColorPicker(false);
  };

  const handleColorPickerClick = (colorType) => {
    setSelectedColorType(colorType);
    setDisplayColorPicker(true);
  };

  const handleSetColor = () => {
    if (selectedColorType === "background" && setBackgroundColor) {
      setBackgroundColor(currentColor);
    }
    if (selectedColorType === "text" && setTextColor) {
      setTextColor(currentColor);
    }
    if (selectedColorType === "border" && setBorder) {
      setBorder(currentColor);
    }
    handleColorPickerClose();
  };

  return (
    <div className={styles.controlsContainer}>
      <div className={styles.controlsGroup}>
        <div className={styles.labelContainer}>
          <label>Add/Remove TextBox</label>
        </div>
        <div className={styles.buttonContainer}>
          <button onClick={addTextBox}>Add</button>
          <button onClick={removeTextBox}>Remove</button>
        </div>
      </div>
      <div className={styles.controlsGroup}>
        <div className={styles.labelContainer}>
          <label>Background Color</label>
        </div>
        <div className={styles.buttonContainer}>
          <button onClick={() => handleColorPickerClick("background")}>
            Pick Color
          </button>
        </div>
      </div>
      <div className={styles.controlsGroup}>
        <div className={styles.labelContainer}>
          <label>Text Color</label>
        </div>
        <div className={styles.buttonContainer}>
          <button onClick={() => handleColorPickerClick("text")}>
            Pick Color
          </button>
        </div>
      </div>
      <div className={styles.controlsGroup}>
        <div className={styles.labelContainer}>
          <label>Border Color</label>
        </div>
        <div className={styles.buttonContainer}>
          <button onClick={() => handleColorPickerClick("border")}>
            Pick Color
          </button>
          <button onClick={() => setBorder("transparent")}>No Border</button>
        </div>
      </div>
      
      {displayColorPicker && (
        <div className={styles.colorPicker}>
          <div className={styles.colorPickerWithButton}>
            <SketchPicker
              color={currentColor}
              onChange={handleColorChange}
            />
            <button onClick={handleSetColor}>Set Color</button>
          </div>
        </div>
      )}
    </div>
  );
}
