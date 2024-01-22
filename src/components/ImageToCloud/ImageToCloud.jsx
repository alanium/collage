import React, { useState } from "react";
import styles from "./ImageToCloud.module.css";
import { getStorage, ref, uploadBytes } from "firebase/storage";

const ImageUploader = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const storage = getStorage();

  const imagesRef = ref(storage, "images");

  const handleUpload = () => {
    const imgName = prompt("Enter the name of the image");

    if (imgName && selectedImage) {
      const storageRef = ref(storage, `images/${imgName}`);
      uploadBytes(storageRef, selectedImage)
        
    } else {
      console.error("Image name and file are required");
    }
  };

  const handleButtonClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        setSelectedImage(file);
        handleUpload();
      }
    };
    input.click();
  };

  return (
    <button className={styles.uploadButton} onClick={handleButtonClick}>
      Choose and Upload Image
    </button>
  );
};

export default ImageUploader;
