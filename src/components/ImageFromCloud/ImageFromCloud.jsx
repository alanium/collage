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
  stickers,
  templateName,
  staticColumns,
  dynamicColumn,
  setPopup,
  uploadDataToFirebase,
  templateCollection,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagesPreview, setImagesPreview] = useState([]);
  const [visibleImages, setVisibleImages] = useState(30);
  const [renderedImages, setRenderedImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [containerToLeft, setContainerToLeft] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState("");
  const [imageNames, setImageNames] = useState([]);
  const imagesPerPage = 30;
  const totalImages = images.length;
  const totalPages = Math.ceil(totalImages / imagesPerPage);
  const storage = getStorage();

  const handleImageChange = (event, imagePreview, imageName) => {
    event.preventDefault();
    setSelectedImage(imagePreview);
    setPreviewImage(imagePreview);
    setContainerToLeft(true);
  };

  const handleSearchInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredImages = imagesPreview.filter((imagePreview, index) => {
    return imageNames[index].toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleConfirmSelection = (event) => {
    const newSelectedColumn = [...selectedColumn];
    const calculatedCardIndex =
      cardIndex > maxCardPosition
        ? cardIndex - (maxCardPosition + 1)
        : cardIndex;
    newSelectedColumn[calculatedCardIndex].img.push({ src: selectedImage, zoom: 100, x: 0, y: 0, zIndex: -1 })
    setSelectedColumn(newSelectedColumn);
    setSelectedImage(null);
    setImages(null);
    setPreviewImage(null);
    setContainerToLeft(false);
    setPopup(0);
    uploadDataToFirebase(
      templateCollection,
      templateName,
      staticColumns,
      dynamicColumn,
      stickers
    );
  };

  const loadMoreImages = () => {
    setVisibleImages((prevCount) => prevCount + 30);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setVisibleImages(page * imagesPerPage);
    }
  };

  const handleInputChange = (event) => {
    setInputPage(event.target.value);
  };

  const goToEnteredPage = () => {
    const enteredPage = parseInt(inputPage);
    if (!isNaN(enteredPage) && enteredPage >= 1 && enteredPage <= totalPages) {
      setCurrentPage(enteredPage);
      setVisibleImages(enteredPage * imagesPerPage);
      setInputPage("");
    }
  };

  const handleInputKeyPress = (event) => {
    if (event.key === "Enter") {
      goToEnteredPage();
    }
  };

  const handleClosePopup = () => {
    setImages(null);
    setSelectedImage(null);
    setPreviewImage(null);
    setContainerToLeft(false);
    setPopup(0);
  };

  const renderImages = () => {
    const start = (currentPage - 1) * imagesPerPage;
    const end = start + imagesPerPage;
    Promise.all(
      images
        .slice(start, end)
        .map((imageName) =>
          getDownloadURL(ref(storage, `images/${imageFolder}/${imageName}`))
        )
    )
      .then((urls) => {
        setImagesPreview(urls);
        setImageNames(images.slice(start, end));
        setShowLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching images:", error);
      });
  };

  useEffect(() => {
    renderImages();
  }, [currentPage]);

  useEffect(() => {
    const copiedArray = imagesPreview.slice(
      0,
      Math.min(visibleImages, imagesPreview.length)
    );
    setRenderedImages(copiedArray);
  }, [imagesPreview, visibleImages]);

  useEffect(() => {
    setInputPage(String(currentPage));
  }, [currentPage]);

  if (showLoading) {
    return (
      <div className={styles.background}>
        <div className={styles.containerWithPreview}>
          <div className={styles.loadingContainer}>
            <RiLoader5Fill className={styles.loadingSpinner} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.background}>
      <div className={styles.containerWithPreview}>
        {renderedImages.length > 0 && (
          <div
            className={`${styles.container} ${
              containerToLeft ? styles.containerToLeft : ""
            }`}
          >
            <h1 className={styles.title}>Database Explorer</h1>

            <div className={styles.pageNavigation}>
              <div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  placeholder="Search by name"
                  className={styles.searchInput}
                />
              </div>
              <div className={styles.centeredItems}>
                <button
                  className={styles.pageButton}
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <input
                  type="text"
                  value={inputPage}
                  onChange={handleInputChange}
                  onKeyPress={handleInputKeyPress}
                  className={styles.pageInput}
                  placeholder="Enter Page"
                />
                <span className={styles.pageText}>of {totalPages}</span>
                <button
                  className={styles.pageButton}
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>

            <hr />

            <div className={styles.gridContainer}>
              {filteredImages.map((imagePreview, index) => (
                <div
                  key={index}
                  className={styles.gridItem}
                  onClick={(event) =>
                    handleImageChange(event, imagePreview, imageNames[index])
                  }
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
                  <label>{imageNames[index]}</label>
                </div>
              ))}
            </div>

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
