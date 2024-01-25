import React, { useState, useEffect } from "react";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import styles from "./ImageFromCloud.module.css";

export default function ImageFromCloud({
  images,
  cardIndex,
  selectedColumn,
  setSelectedColumn,
  setImages,
}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [downloadedImageUrl, setDownloadedImageUrl] = useState(null);
  const [imagesPreview, setImagesPreview] = useState([]);
  const [visibleImages, setVisibleImages] = useState(8);
  const storage = getStorage();

  const handleImageChange = (event, imagePreview) => {
    event.preventDefault()
    setSelectedImage(imagePreview);
  };

  const handleConfirmSelection = (event) => {
    event.preventDefault();
    // Do something with the selected image, for example, update state
    // or pass it to a parent component via a callback function
        const newSelectedColumn = [...selectedColumn];
        const calculatedCardIndex = cardIndex > 20 ? cardIndex - 21 : cardIndex;
        newSelectedColumn[calculatedCardIndex].img[0].src = selectedImage;
        setSelectedColumn(newSelectedColumn);
        setSelectedImage(null);
        setImages(null); // Reset selectedImage to null for future selections
  };

  const loadMoreImages = () => {
    setVisibleImages(prevCount => prevCount + 8);
  };

  const renderImages = () => {
    Promise.all(
      images.map((imageName) =>
        getDownloadURL(ref(storage, `images/${imageName}`))
      )
    )
      .then((urls) => {
        setImagesPreview(urls);
      })
      .catch((error) => {
        console.error("Error fetching images:", error);
      });
  };

  useEffect(() => {
    renderImages();
  }, []);

  return (   
      <div className={styles.container}>
      <h1>Explorador de Archivos</h1>
      <div className={styles.gridContainer}>
      {imagesPreview.map((imagePreview, index) => (
          <div
            key={index}
            className={`${styles.gridItem} ${index === selectedImage ? styles.selected : ''}`}
            onClick={() => handleImageClick(index)}
          >
            <img
              key={index}
              className={styles.image}
              onClick={(event) => handleImageChange(event, imagePreview)}
              src={imagePreview}
              alt={`Image ${index}`}
          />
          </div>
        ))}
      </div>
      {visibleImages < images.length && (
        <button onClick={loadMoreImages}>Ver más</button>
      )}
      <button onClick={handleConfirmSelection}>Confirm Selection</button>
    </div>
  );
}
