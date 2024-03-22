import React, { useState, useEffect, useRef } from "react";
import styles from "./TextPopup.module.css";

export default function TextPopUp({
  textBox,
  setTextBox,
  setPopup,
  cardIndex,
  type,
  setSelectedImage,
  maxCardPosition,
  uploadDataToFirebase,
  templateCollection,
  templateName,
  staticColumns,
  dynamicColumn,
  stickers
}) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null); // Ref for textarea

  useEffect(() => {
    // Focus on the textarea when the component mounts
    textareaRef.current.focus();
  }, []); // Empty dependency array ensures this effect runs only once after the initial render

  const calculatedIndex =
    cardIndex.cardIndex > maxCardPosition
      ? cardIndex.cardIndex - (maxCardPosition + 1)
      : cardIndex.cardIndex;

  const handleChange = (event) => {
    setText(event.target.value);
  };

  const handleConfirm = (event) => {
    const newTextBox = [...textBox];
    newTextBox[calculatedIndex].text[type] = text;

    setTextBox(newTextBox);
    uploadDataToFirebase(
      templateCollection,
      templateName,
      staticColumns,
      dynamicColumn,
      stickers
    );
    setPopup(false);
  };

  const handleCancel = (event) => {
    setPopup(0);
  };

  return (
    <div className={styles.centerContainer}>
      <div className={styles.popupContainer}>
        <textarea
          ref={textareaRef} // Connect the ref to the textarea element
          className={styles.textarea}
          value={text}
          onChange={handleChange}
          rows={5} // Set the number of visible rows as per your requirement
          cols={40} // Set the number of visible columns as per your requirement
          placeholder="Type your text here..."
        />
        <div>
          <button className={styles.button} onClick={handleConfirm}>
            Confirm
          </button>
          <button className={styles.button} onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
