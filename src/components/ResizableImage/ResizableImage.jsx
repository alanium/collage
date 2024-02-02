import React, { useEffect, useRef, useState } from "react";
import interact from "interactjs";
import styles from "./ResizableImage.module.css";

const ResizableImage = ({
  cardIndex,
  selectedColumn,
  setSelectedColumn,
  setIsEditingZoom,
}) => {
  const imageRefs = useRef([useRef(null), useRef(null)]);
  const [imageCoords, setImageCoords] = useState([
    { x: 0, y: 0, zoom: 100 },
    { x: 0, y: 0, zoom: 100 },
  ]);
  const [tempImageCoords, setTempImageCoords] = useState([...imageCoords]); // Temporary state
  const [containerResolution, setContainerResolution] = useState({});

  useEffect(() => {
    renderContainerBox();
    const initialImageCoords = selectedColumn[cardIndex].img.map((image) => ({
      x: image.x,
      y: image.y,
      zoom: image.zoom || 100,
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
                x: tempImageCoords[index].x + dx,
                y: tempImageCoords[index].y + dy,
                zoom: tempImageCoords[index].zoom,
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

  const handleConfirmClick = () => {
    setImageCoords(tempImageCoords); // Apply temporary state
    tempImageCoords.forEach((coords, index) => {
      updateImageProperties(cardIndex, index, coords); // Call updateImageProperties
    });
    setIsEditingZoom(false);
  };

  const updateImageProperties = (cardIndex, imageIndex, properties) => {
    setSelectedColumn((prevSelectedColumn) => {
      const newSelectedColumn = [...prevSelectedColumn];
      newSelectedColumn[cardIndex].img[imageIndex] = {
        ...newSelectedColumn[cardIndex].img[imageIndex],
        ...properties,
      };
      return newSelectedColumn;
    });
  };

  const renderContainerBox = () => {
    const elementToCopy = document.getElementsByName(`card-${cardIndex}`)[0];
    const computedStyles = window.getComputedStyle(elementToCopy);
    const stylesToCopy = {};
    for (let i = 0; i < computedStyles.length; i++) {
      const propertyName = computedStyles[i];
      const propertyValue = computedStyles.getPropertyValue(propertyName);
      stylesToCopy[propertyName] = propertyValue;
    }

    console.log(stylesToCopy.width, stylesToCopy.height)
    setContainerResolution({
      width: Number(stylesToCopy.width.replace("px", "")),
      height: Number(stylesToCopy.height.replace("px", "")),
    });
  };

  return (
    <div className={styles.popupContainer}>
      <div
      className={styles.sidebar}
      style={{
        height: `${containerResolution.height}px`,
        width: `${containerResolution.width}px`,
      }}
    >
      <div className={styles.zoomSliderContainer}>
        {selectedColumn[cardIndex].img.slice(0, 2).map((image, index) => (
          <div key={index}>
            {image.src != "" ? (
              <div>
                <div>
                  <div
                    className={styles.zoomControlsGrid}
                    
                  >
                    <button
                      onClick={() => handleZoomChange(-5, index)}
                      className={styles.bttnGrid}
                    >
                      Zoom -
                    </button>
                    <button
                      onClick={() => handleZoomChange(5, index)}
                      className={styles.bttnGrid}
                    >
                      Zoom +
                    </button>
                  </div>
                </div>
                <div>
                  <img
                    id={`image-${cardIndex}-${index + 1}`}
                    ref={imageRefs.current[index]}
                    className={styles.draggableImage}
                    src={image.src}
                    alt={`Image ${index + 1} - ${cardIndex}`}
                    style={{
                      transform: `translate(${tempImageCoords[index].x}px, ${
                        tempImageCoords[index].y
                      }px) scale(${tempImageCoords[index].zoom / 100})`,
                    }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <button className={styles.confirmButton} onClick={handleConfirmClick}>
        OK
      </button>
    </div>
    </div>
    
  );
};

export default ResizableImage;