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
  const [imageResolution, setImageResolution] = useState({});
  const [containerResolution, setContainerResolution] = useState({});

  useEffect(() => {
    // Obtener las coordenadas iniciales de las imágenes
    renderContainerBox();
    renderImageSize();
    renderImageSize1();
    const initialImageCoords = selectedColumn[cardIndex].img.map((image) => ({
      x: image.x,
      y: image.y,
      zoom: image.zoom || 100,
    }));

    // Establecer las coordenadas iniciales en el estado
    setImageCoords(initialImageCoords);
  }, [cardIndex, selectedColumn]);

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

  const handleZoomChange = (deltaZoom, index) => {
    const newZoom = imageCoords[index].zoom + deltaZoom;
    setImageCoords((prevCoords) => {
      const newCoords = [...prevCoords];
      newCoords[index] = { ...newCoords[index], zoom: newZoom };
      return newCoords;
    });
    updateImageProperties(cardIndex, index, { zoom: newZoom });
  };

  const renderContainerBox = () => {
    const elementToCopy = document.getElementsByName(`card-${cardIndex}`)[0];

    // Get the computed styles of the element
    const computedStyles = window.getComputedStyle(elementToCopy);

    // Iterate over the computed styles and copy them
    const stylesToCopy = {};
    for (let i = 0; i < computedStyles.length; i++) {
      const propertyName = computedStyles[i];
      const propertyValue = computedStyles.getPropertyValue(propertyName);
      stylesToCopy[propertyName] = propertyValue;
    }

    // You can now use stylesToCopy object to apply styles elsewhere
    setContainerResolution({
      width: Number(stylesToCopy.width.replace("px", "")),
      height: Number(stylesToCopy.height.replace("px", "")),
    });
    console.log(imageResolution);
  };

  const renderImageSize1 = () => {
    console.log(`image-${cardIndex}-1`);
    const elementToCopy = document.getElementsByName(`image-${cardIndex}-1`)[0];

    // Get the computed styles of the element
    const computedStyles = window.getComputedStyle(elementToCopy);

    // Iterate over the computed styles and copy them
    const stylesToCopy = {};
    for (let i = 0; i < computedStyles.length; i++) {
      const propertyName = computedStyles[i];
      const propertyValue = computedStyles.getPropertyValue(propertyName);
      stylesToCopy[propertyName] = propertyValue;
    }
    console.log(stylesToCopy.scale);
    // You can now use stylesToCopy object to apply styles elsewhere
    setImageResolution({
      width: Number(stylesToCopy.width.replace("px", "")),
      height: Number(stylesToCopy.height.replace("px", "")),
    });
  };

  const renderImageSize = () => {
    console.log(`image-${cardIndex}-0`);
    const elementToCopy = document.getElementsByName(`image-${cardIndex}-0`)[0];

    // Get the computed styles of the element
    const computedStyles = window.getComputedStyle(elementToCopy);

    // Iterate over the computed styles and copy them
    const stylesToCopy = {};
    for (let i = 0; i < computedStyles.length; i++) {
      const propertyName = computedStyles[i];
      const propertyValue = computedStyles.getPropertyValue(propertyName);
      stylesToCopy[propertyName] = propertyValue;
    }
    console.log(stylesToCopy.scale);
    // You can now use stylesToCopy object to apply styles elsewhere
    setImageResolution({
      width: Number(stylesToCopy.width.replace("px", "")),
      height: Number(stylesToCopy.height.replace("px", "")),
    });
  };

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
                x: imageCoords[index].x + dx,
                y: imageCoords[index].y + dy,
                zoom: imageCoords[index].zoom,
              };
              setImageCoords((prevCoords) => {
                const newCoordsArray = [...prevCoords];
                newCoordsArray[index] = newCoords;
                return newCoordsArray;
              });
              updateImageProperties(cardIndex, index, newCoords);
            },
          },
        });
      }
    });
  }, [cardIndex, imageCoords, updateImageProperties]);

  const handleConfirmClick = () => {
    setIsEditingZoom(false);
  };

  return (
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
                    style={{ backgroundColor: "white" }}
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
                      height: imageResolution.height,
                      width: imageResolution.width,
                      transform: `translate(${imageCoords[index].x}px, ${
                        imageCoords[index].y
                      }px) scale(${imageCoords[index].zoom / 100})`,
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
  );
};

export default ResizableImage;
