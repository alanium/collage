import React, { useState } from "react";
import styles from "./TextPopup.module.css"

export default function TextPopUp({textBox, setTextBox, setPopup, cardIndex, type, setSelectedImage, maxCardPosition, uploadDataToFirebase}) {
  const [text, setText] = useState("");

  const calculatedIndex = ( cardIndex.cardIndex  > maxCardPosition ? cardIndex.cardIndex  - (maxCardPosition + 1) : cardIndex.cardIndex )

  const handleChange = (event) => {
    setText(event.target.value);
  };

  const handleConfirm = (event) => {
    
    const newTextBox = [...textBox];
    console.log(textBox)
    console.log(calculatedIndex)
    newTextBox[calculatedIndex].text[type] = text
    
    setTextBox(newTextBox);
    uploadDataToFirebase()
    setPopup(false);
  };

  const handleCancel = (event) => {
    setPopup(false);
  };

  return (
    <div className={styles.centerContainer}>
      <div className={styles.popupContainer}>
        <textarea
          className={styles.textarea}
          value={text}
          onChange={handleChange}
          rows={5} // Set the number of visible rows as per your requirement
          cols={40} // Set the number of visible columns as per your requirement
          placeholder="Type your text here..."
        />
        <div>
          <button className={styles.button} onClick={handleConfirm}>Confirm</button>
          <button className={styles.button} onClick={handleCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
