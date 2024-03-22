import React from "react";
import styles from "./EditStickersButtons.module.css"

export default function EditStickersButtons({ stickers, setPopup }) {



  return (
    <div className={styles.container}>
      <div className={styles.buttonsContainer} style={{display: "grid", width: "165px"}}>
        <button>Make Bigger</button>
        <button>Make Smaller</button>
        <button>Move Up</button>
        <button>Move Down</button>
      </div>
      <div style={{display: "grid", width: "165px"}}>
        <button onClick={(() => setPopup(16)) }>Add Sticker</button>
        <button onClick={() => setPopup(0)}>Close</button>
      </div>
    </div>
  );
}
