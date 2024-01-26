import React, { useState } from "react";
import styles from "./ImageToCloud.module.css";
import { getStorage, ref, uploadBytes } from "firebase/storage";

const ImageUploader = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const storage = getStorage();

  const handleUpload = async (imgName, selectedImage) => {
    try {
      const storageRef = ref(storage, `images/${imgName}`);
      await uploadBytes(storageRef, selectedImage);
      console.log("Upload successful");
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleButtonClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        setSelectedImage(file);
        const imgName = prompt("Enter the name of the image");
        if (imgName) {
          await handleUpload(imgName, file);
        } else {
          console.error("Image name is required");
        }
      }
    };
    input.click();
  };

  return (
    <button className={styles.uploadButton} onClick={handleButtonClick}>
      Upload Image To Cloud
    </button>
  );
};

export default ImageUploader;
