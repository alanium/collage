import React, { useRef, useEffect } from "react";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.min.css";
import styles from "./ImageCropper.module.css";
import { getDownloadURL, getMetadata, getStorage, ref, uploadBytes } from "firebase/storage";

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

  const isImageNameValid = async (imageName) => {
    try {
      const imageRef = ref(storage, `images/${imageFolder}/${imageName}`);
      const metadata = await getMetadata(imageRef);
      return !!metadata;
    } catch (error) {
      console.error("Error checking image validity:", error);
      return false;
    }
  };

  const handleSave = async () => {
    const imageName = prompt("Name the image");
    if (imageName && imageName.trim() !== "") {
      const isValid = await isImageNameValid(imageName);
      if (isValid) {
        const imageRef = ref(storage, `images/${imageFolder}/${imageName}`);
        cropper.current.getCroppedCanvas().toBlob(async (blob) => {
          try {
            await uploadBytes(imageRef, blob);
            setIsCroppingImage(false);
            const updatedColumn = selectedColumn.map((column, index) => {
              if (index === selectedCardIndex) {
                return {
                  ...column,
                  img: column.img.map((img, i) => {
                    if (i === imageIndex) {
                      return { ...img, src: url };
                    }
                    return img;
                  }),
                };
              }
              return column;
            });
            setSelectedColumn(updatedColumn);
          } catch (error) {
            console.error("Error uploading image:", error);
          }
        }, "image/png");
      } else {
        alert("Image name is invalid or already exists.");
      }
    } else {
      alert("Please provide a valid image name.");
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