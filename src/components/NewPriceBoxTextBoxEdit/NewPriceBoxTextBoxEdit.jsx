import React, { useState } from "react";
import styles from "./NewPriceBoxTextBoxEdit.module.css";

export default function NewPriceBoxTextBoxEdit({ textBox, onUpdate }) {
  const [fontSize, setFontSize] = useState(textBox.fontSize || "");
  const [text, setText] = useState(textBox.text || "");
  const [draggable, setDraggable] = useState(textBox.draggable);
  const [resizable, setResizable] = useState(textBox.resizable);

  const handleTextInputChange = (event) => {
    setText(event.target.value);
  };

  const handleDraggableResizable = () => {
    setDraggable(!draggable);
    setResizable(!resizable);
  
    onUpdate({
      ...textBox,
      fontSize: fontSize,
      text: text,
      draggable: !draggable,
      resizable: !resizable,
    });
  };


  const handleFontSizeInputChange = (event) => {
    const newSize = parseInt(event.target.value);
    setFontSize(newSize);
  };

  const handleSubmit = (event) => {
    event.preventDefault(); // Evita que el formulario se envíe

    onUpdate({
      ...textBox,
      fontSize: fontSize,
      text: text,
      draggable: draggable,
      resizable: resizable,
    });
  };

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <div className={styles.inputContainer}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            value={text}
            onChange={(e) => handleTextInputChange(e)}
            placeholder="Enter text"
          />
          <div className={styles.additionalText}>txt</div>
        </div>
        <div className={styles.inputWrapper}>
          <input
            type="number"
            value={fontSize}
            onChange={(e) => handleFontSizeInputChange(e)}
            placeholder="Font Size"
          />
          <div className={styles.additionalText}>px</div>
        </div>
      </div>
      <div className={styles.bttnContainer}>
        <div className={styles.bttn}>
          <button type="button" onClick={handleDraggableResizable}>Toggle Resizable</button>
        </div>
        <div className={styles.bttn}>
          <button type="submit">Update</button>
        </div>
      </div>
    </form>
  );
}

