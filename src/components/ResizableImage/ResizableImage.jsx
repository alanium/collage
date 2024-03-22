import React, { useEffect, useRef, useState } from "react";
import interact from "interactjs";
import styles from "./ResizableImage.module.css";

const ResizableImage = ({
  cardIndex,
  selectedColumn,
  setSelectedColumn,
  setPopup,
  cardNumber,
  uploadDataToFirebase,
  templateCollection,
  templateName,
  staticColumns,
  dynamicColumn,
  stickers
}) => {
  const imgAmount = selectedColumn[cardIndex].img.length;
  const imageRefs = useRef(
    Array(imgAmount)
      .fill()
      .map((_, index) => useRef(null))
  );
  const [imageCoords, setImageCoords] = useState(
    Array(imgAmount)
      .fill()
      .map((_, index) => ({ x: 0, y: 0, zoom: 100, zIndex: -1 }))
  );
  const [tempImageCoords, setTempImageCoords] = useState([...imageCoords]); // Temporary state
  const [containerResolution, setContainerResolution] = useState({});

  useEffect(() => {
    renderContainerBox();
    const initialImageCoords = selectedColumn[cardIndex].img.map((image) => ({
      x: image.x || 0, // Default to 0 if x is undefined
      y: image.y || 0, // Default to 0 if y is undefined
      zoom: image.zoom || 100,
      zIndex: image.zIndex || -1,
    }));
    setImageCoords(initialImageCoords);
    setTempImageCoords(initialImageCoords); // Initialize temporary state
  }, [cardIndex, selectedColumn]);

  useEffect(() => {
    imageRefs.current.forEach((ref, index) => {
      if (ref.current != null) {
        interact(ref.current).draggable({
          inertia: true,
          autoScroll: true,
          listeners: {
            move: (event) => {
              const { dx, dy } = event;
              const newCoords = {
                x: tempImageCoords[index].x + dx || 0, // Default to 0 if x is undefined
                y: tempImageCoords[index].y + dy || 0, // Default to 0 if y is undefined
                zoom: tempImageCoords[index].zoom,
                zIndex: tempImageCoords[index].zIndex || -1, // Default to 1 if zIndex is undefined
              };
              setTempImageCoords((prevCoords) => {
                const newCoordsArray = [...prevCoords];
                newCoordsArray[index] = newCoords;
                return newCoordsArray;
              });
            },
          },
        });
      }
    });
  }, [tempImageCoords]);

  const handleZoomChange = (deltaZoom, index) => {
    const newZoom = tempImageCoords[index].zoom + deltaZoom;
    setTempImageCoords((prevCoords) => {
      const newCoords = [...prevCoords];
      newCoords[index] = { ...newCoords[index], zoom: newZoom };
      return newCoords;
    });
  };

  const handleZindexChange = (deltaIndex, index) => {
    const newZIndex = tempImageCoords[index].zIndex + deltaIndex;
    if (newZIndex <= -1 && newZIndex >= -imageCoords.length) {
      setTempImageCoords((prevCoords) => {
        const newCoords = [...prevCoords];
        newCoords[index] = { ...newCoords[index], zIndex: newZIndex };
        return newCoords;
      });
    }
  };

  const handleConfirmClick = async () => {
    setImageCoords(tempImageCoords); // Apply temporary state
    tempImageCoords.forEach(async (coords, index) => {
      await updateImageProperties(cardIndex, index, coords); // Call updateImageProperties
    });
    await uploadDataToFirebase(
      templateCollection,
      templateName,
      staticColumns,
      dynamicColumn,
      stickers
    );
    setPopup(0);
  };

  const updateImageProperties = (cardIndex, imageIndex, properties) => {
    setSelectedColumn((prevSelectedColumn) => {
      const newSelectedColumn = [...prevSelectedColumn];
      newSelectedColumn[cardIndex].img[imageIndex] = {
        ...newSelectedColumn[cardIndex].img[imageIndex],
        ...properties,
      };
      console.log(newSelectedColumn);
      return newSelectedColumn;
    });
  };

  const renderContainerBox = () => {
    const elementToCopy = document.getElementsByName(`card-${cardNumber}`)[0];
    const computedStyles = window.getComputedStyle(elementToCopy);
    const stylesToCopy = {};
    for (let i = 0; i < computedStyles.length; i++) {
      const propertyName = computedStyles[i];
      const propertyValue = computedStyles.getPropertyValue(propertyName);
      stylesToCopy[propertyName] = propertyValue;
    }

    setContainerResolution({
      width: Number(stylesToCopy.width.replace("px", "")) + 4,
      height: Number(stylesToCopy.height.replace("px", "")) + 5,
    });
  };

  return (
    <div className={styles.background}>
      <div className={styles.popupContainer}>
        <div className={styles.zoomSliderContainer}>
          {selectedColumn[cardIndex].img.map((image, index) =>
            image.src !== "" ? (
              <div
                className={styles.zoomControlGrid}
                key={`image-controls-${index}`}
              >
                <label className={styles.imageLabel}>
                  {index === 0 ? "Image 1" : "Image 2"}
                </label>
                <div className={styles.buttonGroup}>
                  <button
                    className={styles.zoomControlGridButtons}
                    onClick={() => handleZoomChange(5, index)}
                  >
                    Zoom +
                  </button>
                  <button
                    className={styles.zoomControlGridButtons}
                    onClick={() => handleZoomChange(-5, index)}
                  >
                    Zoom -
                  </button>
                </div>

                <div className={styles.buttonGroup}>
                  <button
                    className={styles.zoomControlGridButtons}
                    onClick={() => handleZindexChange(1, index)}
                  >
                    Move Up
                  </button>
                  <button
                    className={styles.zoomControlGridButtons}
                    onClick={() => handleZindexChange(-1, index)}
                  >
                    Move Down
                  </button>
                </div>
              </div>
            ) : null
          )}
        </div>
        <div
          className={styles.imageContainer}
          style={{
            height: `${containerResolution.height}px`,
            width: `${containerResolution.width}px`,
            position: "absolute",
          }}
        >
          <div className={styles.images}>
            {selectedColumn[cardIndex].img.map((image, index) =>
              image.src !== "" ? (
                <img
                  key={`image-${cardIndex}-${index + 1}`}
                  ref={imageRefs.current[index]}
                  className={styles.draggableImage}
                  src={image.src}
                  alt={`Image ${index + 1} - ${cardIndex}`}
                  style={{
                    transform: `translate(${tempImageCoords[index].x}px, ${
                      tempImageCoords[index].y
                    }px) scale(${tempImageCoords[index].zoom / 100})`,
                    zIndex: tempImageCoords[index].zIndex,
                  }}
                />
              ) : null
            )}
          </div>
        </div>
      </div>
      <div className={styles.bttnContainer}>
        <button onClick={handleConfirmClick}>OK</button>
        <button onClick={() => setPopup(0)}>Back</button>
      </div>
    </div>
  );
};

export default ResizableImage;
