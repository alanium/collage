import React, { useState, useEffect } from "react";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import styles from "./ImageFromCloud.module.css";

export default function ImageFromCloud({
  images,
  cardIndex,
  selectedColumn,
  setSelectedColumn,
  setImages,
  imgIndex,
  maxCardPosition,
  imageFolder
}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [downloadedImageUrl, setDownloadedImageUrl] = useState(null);
  const [imagesPreview, setImagesPreview] = useState([]);
  const [visibleImages, setVisibleImages] = useState(8);
  const [renderedImages, setRenderedImages] = useState([]);
  const storage = getStorage();

  const handleImageChange = (event, imagePreview) => {
    event.preventDefault();
    setSelectedImage(imagePreview);
  };

  const handleConfirmSelection = (event) => {
    const newSelectedColumn = [...selectedColumn];
    const calculatedCardIndex = cardIndex > maxCardPosition ? cardIndex - (maxCardPosition + 1) : cardIndex;
    newSelectedColumn[calculatedCardIndex].img[imgIndex].src = selectedImage;
    setSelectedColumn(newSelectedColumn);
    setSelectedImage(null);
    setImages(null); // Reset selectedImage to null for future selections
  };

  const loadMoreImages = () => {
    setVisibleImages((prevCount) => prevCount + 8);
  };

  const renderImages = () => {
    Promise.all(
      images.map((imageName) =>
        getDownloadURL(ref(storage, `images/${imageFolder}/${imageName}`))
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

  useEffect(() => {
    const copiedArray = imagesPreview.slice(0, visibleImages);
    setRenderedImages(copiedArray);
  }, [imagesPreview, visibleImages]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Database Explorer</h1>
      <hr></hr>
      <div className={styles.gridContainer}>
        {renderedImages.map((imagePreview, index) => (
          <div
            key={index}
            className={styles.gridItem}
            onClick={() => handleImageChange(index)}
          >
            <img
              key={index}
              className={imagePreview === selectedImage ? `${styles.image} ${styles.selected}` : styles.image}
              onClick={(event) => handleImageChange(event, imagePreview)}
              src={imagePreview}
              alt={`Image ${index}`}
            />
          </div>
        ))}
      </div>
      {visibleImages < images.length && (
        <button className={styles.showMoreButton} onClick={loadMoreImages}>
          Show More
        </button>
      )}
      <button className={styles.confirmButton} onClick={handleConfirmSelection}>
        Confirm Selection
      </button>
    </div>
      );
}