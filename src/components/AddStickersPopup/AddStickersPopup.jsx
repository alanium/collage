import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import React from "react";
import styles from "./AddStickersPopup.module.css"

export default function AddStickersPopup ({stickers, setStickers, setPopup, uploadDataToFirebase, imageFolder}) {

    const storage = getStorage();

    const handleStickerUpload = (event) => {
        event.preventDefault();
        const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = (event) => {
            const file = event.target.files[0];

            if (file) {
              const uploadedImageRef = ref(
                storage,
                `images/${imageFolder}/stickers/${file.name}`
              );
              uploadBytes(uploadedImageRef, file).then((snapshot) => {
                getDownloadURL(
                    ref(storage, `images/${imageFolder}/stickers/${file.name}`)
                ).then((url) => {
                    const newStickers = [...stickers];
                    const newSticker = { src: url, zoom: 50, x: 0, y: 0, zIndex: 1 }
                    newStickers.push(newSticker)
                    setStickers(newStickers);
                    setPopup(15);
                    uploadDataToFirebase();
                });
            }).catch((error) => {
                // Handle upload error
                console.error('Error uploading file:', error);
            });
              ;
            }
          };
          input.click();
    }


    return (
        <div className={styles.background}>
          <div className={styles.popUp2} style={{ zIndex: "1" }}>
            <button
              className={styles.actionButton}
              onClick={(event) =>
                handleStickerUpload(event)
              }
              style={{ marginBottom: "10px" }}
            >
              Import from Device
            </button>
            <button
              className={styles.actionButton}
              style={{ marginBottom: "10px" }}
            >
              Import from Database, coming soon...
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