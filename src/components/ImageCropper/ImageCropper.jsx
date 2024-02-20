import React, { useRef, useEffect } from "react";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.min.css";
import styles from "./ImageCropper.module.css";
import { getDownloadURL, getStorage, listAll, ref, uploadBytes } from "firebase/storage";

 const ImageCropper = ({
  src,
  setIsCroppingImage,
  selectedColumn,
  setSelectedColumn,
  imageIndex,
  selectedCardIndex,
  imageFolder,
}) => {
  const imageRef = useRef(null);
  const cropper = useRef(null);
  const storage = getStorage();

  useEffect(() => {
    if (!src) return;

    cropper.current = new Cropper(imageRef.current, {
      viewMode: 2,
      dragMode: 'move',
      autoCropArea: 1,
      background: false,
      crop(event) {
        console.log(event.detail.x);
        console.log(event.detail.y);
        console.log(event.detail.width);
        console.log(event.detail.height);
      },
    });

    return () => {
      cropper.current.destroy();
    };
  }, [src]);

  const isImageNameIncluded = async (imageName) => {
    const imagesRef = ref(storage, `images/${imageFolder}`);
  
    try {
      const result = await listAll(imagesRef);
      const items = result.items;
      const names = items.map((item) => item.name);
  
      console.log(names);
  
      return names.includes(imageName);
    } catch (error) {
      console.log(error);
      return false; // Return false in case of any error
    }
  };

  const handleSave = async () => {
    const imageName = prompt("Name the image");
    if (imageName !== null) {
      const imageExists = await isImageNameIncluded(imageName);
      if (!imageExists) {
        console.log(imageExists)
        // Upload the image if it doesn't exist
        const imageRef = ref(storage, `images/${imageFolder}/${imageName}`);
        cropper.current.getCroppedCanvas().toBlob(async (blob) => {
          try {
            await uploadBytes(imageRef, blob);
            console.log("Blob uploaded successfully");
            setIsCroppingImage(false);
  
            const newSelectedColumn = [...selectedColumn];
            const url = await getDownloadURL(
              ref(storage, `images/${imageFolder}/${imageName}`)
            );
            newSelectedColumn[selectedCardIndex].img[imageIndex].src = url;
            setSelectedColumn(newSelectedColumn);
          } catch (error) {
            console.log("Error uploading image:", error);
          }
        }, "image/png");
      } else {
        alert("Image with that name already exists.");
      }
    }
  };

  const handleCancel = () => {
    setIsCroppingImage(false);
  };

  return (
    <div className={styles.background}>
      <div className={styles.popupContainer}>
        <div>
          <img ref={imageRef} src={src} alt="Crop preview" />
        </div>
        <div className={styles.actionButtons}>
          <button onClick={autoCrop} className={styles.saveButton}>
            Crop automatically</button>
          <button onClick={handleSave} className={styles.saveButton}>
            Save
          </button>
          <button onClick={handleCancel} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;