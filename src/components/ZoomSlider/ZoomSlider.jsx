import React from "react";
import styles from "./ZoomSlider.module.css"


const ZoomSlider = ({ cardIndex,  selectedColumn, setSelectedColumn, setIsEditingZoom }) => {

  const handleZoomChange = (newZoom, index) => {
      const newUploadedImages = [...selectedColumn];
      newUploadedImages[cardIndex].img[index].zoom = newZoom;
      setSelectedColumn(newUploadedImages);
  };

  const handlePositionChange = (changeAmount, index, axis) => {
      const newUploadedImages = [...selectedColumn];
      newUploadedImages[cardIndex].img[index][axis] += changeAmount;
      setSelectedColumn(newUploadedImages);
  };

  const handleConfirmClick = () => {
    setIsEditingZoom(false);
  };

  return (
    <div className={styles.sidebar}>
      {selectedColumn[cardIndex].img[0].src != "" ? (
        <div className={styles.zoomSliderContainer}>
          <label>Image 1</label>
          <div className={styles.zoomControlsGrid}>
            <button
              onClick={() =>
                handleZoomChange(
                  selectedColumn[cardIndex]
                    .img[0].zoom - 5,
                  0
                )
              }
              className={styles.bttnGrid}
            >
              -
            </button>
            <button
              onClick={() =>
                handleZoomChange(
                  selectedColumn[cardIndex]
                    .img[0].zoom + 5,
                  0
                )
              }
              className={styles.bttnGrid}
            >
              +
            </button>
            <button
              className={styles.bttnGrid}
              onClick={() => handlePositionChange(-5, 0, "y")}
            >
              up
            </button>
            <button
              className={styles.bttnGrid}
              onClick={() => handlePositionChange(5, 0, "y")}
            >
              down
            </button>
            <button
              className={styles.bttnGrid}
              onClick={() => handlePositionChange(-5, 0, "x")}
            >
              left
            </button>
            <button
              className={styles.bttnGrid}
              onClick={() => handlePositionChange(5, 0, "x")}
            >
              right
            </button>
          </div>
        </div>
      ) : null}

      {selectedColumn[cardIndex].img[1].src != "" ? (
        <div className={styles.zoomSliderContainer}>
          <label>Image 2</label>
          <div className={styles.zoomControlsGrid}>
            <button
              onClick={() =>
                handleZoomChange(
                  selectedColumn[cardIndex]
                    .img[1].zoom - 5,
                  1
                )
              }
              className={styles.bttnGrid}
            >
              -
            </button>
            <button
              onClick={() =>
                handleZoomChange(
                  selectedColumn[cardIndex]
                    .img[1].zoom + 5,
                  1
                )
              }
              className={styles.bttnGrid}
            >
              +
            </button>
            <button
              className={styles.bttnGrid}
              onClick={() => handlePositionChange(-5, 1, "y", 0)}
            >
              up
            </button>
            <button
              className={styles.bttnGrid}
              onClick={() => handlePositionChange(5, 1, "y")}
            >
              down
            </button>
            <button
              className={styles.bttnGrid}
              onClick={() => handlePositionChange(-5, 1, "x")}
            >
              left
            </button>
            <button
              className={styles.bttnGrid}
              onClick={() => handlePositionChange(5, 1, "x")}
            >
              right
            </button>
          </div>
        </div>
      ) : null}
      <div className={styles.zoomSliderContainer}>
        <button className={styles.confirmButton} onClick={handleConfirmClick}>
          OK
        </button>
      </div>
    </div>
  );
  };

  export default ZoomSlider;