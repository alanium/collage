import React, { useState, useEffect } from "react";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import styles from "./ImageFromCloud.module.css";
import { RiLoader5Fill } from "react-icons/ri";

export default function ImageFromCloud({
  images,
  cardIndex,
  selectedColumn,
  setSelectedColumn,
  setImages,
  imgIndex,
  maxCardPosition,
  imageFolder,
  uploadDataToFirebase
}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [downloadedImageUrl, setDownloadedImageUrl] = useState(null);
  const [imagesPreview, setImagesPreview] = useState([]);
  const [visibleImages, setVisibleImages] = useState(32);
  const [renderedImages, setRenderedImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [containerToLeft, setContainerToLeft] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [delayedShowContent, setDelayedShowContent] = useState(false); // Estado para controlar el retraso de la visualización del contenido
  const storage = getStorage();
  const containerWithPreviewStyle = {
    width: renderedImages.length > 0 ? "" : "10%",
  };

  const handleImageChange = (event, imagePreview) => {
    event.preventDefault();
    setSelectedImage(imagePreview);
    setPreviewImage(imagePreview);
    setContainerToLeft(true);
  };

  const handleConfirmSelection = (event) => {
    const newSelectedColumn = [...selectedColumn];
    const calculatedCardIndex =
      cardIndex > maxCardPosition
        ? cardIndex - (maxCardPosition + 1)
        : cardIndex;
    newSelectedColumn[calculatedCardIndex].img[imgIndex].src = selectedImage;
    setSelectedColumn(newSelectedColumn);
    setSelectedImage(null);
    setImages(null);
    setPreviewImage(null);
    setContainerToLeft(false);
    uploadDataToFirebase()
  };

  const loadMoreImages = () => {
    setVisibleImages((prevCount) => prevCount + 32);
  };

  const handleClosePopup = () => {
    setImages(null);
    setSelectedImage(null);
    setPreviewImage(null);
    setContainerToLeft(false);
  };

  const renderImages = () => {
    Promise.all(
      images.map((imageName) =>
        getDownloadURL(ref(storage, `images/${imageFolder}/${imageName}`))
      )
    )
      .then((urls) => {
        setImagesPreview(urls);
        setShowLoading(false); // Aquí marcamos que la carga ha finalizado y podemos mostrar el contenido
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

  // Mostrar el contenido solo si delayedShowContent es true
  if (showLoading) {
    return (
      <div className={styles.background}>
        <div className={styles.containerWithPreview}>
          <div className={styles.loadingContainer}>
            <RiLoader5Fill className={styles.loadingSpinner} />{" "}
            {/* Utiliza el ícono de carga giratorio */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.background}>
      <div className={styles.containerWithPreview}>
        {renderedImages.length > 0 && (
          <div className={`${styles.container} ${containerToLeft ? styles.containerToLeft : ""}`}>
            <h1 className={styles.title}>Database Explorer</h1>
            <hr />
            <div className={styles.gridContainer}>
              {renderedImages.map((imagePreview, index) => (
                <div
                  key={index}
                  className={styles.gridItem}
                  onClick={(event) => handleImageChange(event, imagePreview)}
                >
                  <img
                    key={index}
                    className={
                      imagePreview === selectedImage
                        ? `${styles.image} ${styles.selected}`
                        : styles.image
                    }
                    src={imagePreview}
                    alt={`Image ${index}`}
                  />
                </div>
              ))}
            </div>
            {visibleImages < images.length && (
              <button className={styles.confirmButton} onClick={loadMoreImages}>
                Show More
              </button>
            )}
            <button
              className={styles.confirmButton}
              onClick={handleConfirmSelection}
            >
              Confirm Selection
            </button>
            <button className={styles.confirmButton} onClick={handleClosePopup}>
              Cancel
            </button>
          </div>
        )}

        {previewImage && (
          <div className={styles.previewContainer}>
            <img
              src={previewImage}
              alt="Preview"
              className={styles.previewImage}
            />
          </div>
        )}
      </div>
    </div>
  );
}