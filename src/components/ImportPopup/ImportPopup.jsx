import React, { useEffect } from "react";
import styles from "./ImportPopup.module.css"

export default function ImportPopup({
  setPopup,
  getImageList,
  handleImageUpload,
  selectedCardIndex,
  imgIndex,
}) {

  return (
    <div className={styles.background}>
      <div className={styles.popUp2} style={{ zIndex: "1" }}>
        <button
          className={styles.actionButton}
          onClick={(event) =>
            handleImageUpload(event, selectedCardIndex, imgIndex)
          }
          style={{ marginBottom: "10px" }}
        >
          Import from Device
        </button>
        <button
          className={styles.actionButton}
          onClick={(event) => getImageList(event)}
          style={{ marginBottom: "10px" }}
        >
          Import from Database
        </button>
        <button
          className={styles.actionButton}
          onClick={() => setPopup(0)}
        >
          Close
        </button>
      </div>
    </div>
  );
}
