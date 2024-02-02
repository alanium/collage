import React, { useEffect, useRef, useState } from "react";
import interact from "interactjs";
import styles from "./ResizableImage.module.css";

const ResizableImage = ({ cardIndex, selectedColumn, setSelectedColumn, setIsEditingZoom }) => {
  const imageRefs = useRef([useRef(null), useRef(null)]);
  const [imageCoords, setImageCoords] = useState([
    { x: 0, y: 0, zoom: 100 },
    { x: 0, y: 0, zoom: 100 },
  ]);

  useEffect(() => {
    // Obtener las coordenadas iniciales de las imágenes
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

  useEffect(() => {
    imageRefs.current.forEach((ref, index) => {
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
    });
  }, [cardIndex, imageCoords, updateImageProperties]);

  const handleConfirmClick = () => {
    setIsEditingZoom(false);
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.zoomSliderContainer}>
        {selectedColumn[cardIndex].img.slice(0, 2).map((image, index) => (
          <div key={index}>
            <label>{`Image ${index + 1}`}</label>
            <div className={styles.zoomControlsGrid}>
              <button onClick={() => handleZoomChange(-5, index)} className={styles.bttnGrid}>
                Zoom -
              </button>
              <button onClick={() => handleZoomChange(5, index)} className={styles.bttnGrid}>
                Zoom +
              </button>
            </div>
            <img
              id={`image-${cardIndex}-${index + 1}`}
              ref={imageRefs.current[index]}
              className="draggable"
              src={image.src}
              alt={`Image ${index + 1} - ${cardIndex}`}
              style={{
                zIndex: "0",
                maxWidth: "100%",
                maxHeight: "100%",
                position: "absolute",
                left: `${imageCoords[index].x}px`,
                top: `${imageCoords[index].y}px`,
                transform: `scale(${imageCoords[index].zoom / 100})`,
              }}
            />
          </div>
        ))}
      </div>
      <div className={styles.zoomSliderContainer}>
        <button className={styles.confirmButton} onClick={handleConfirmClick}>
          OK
        </button>
      </div>
    </div>
  );
};

export default ResizableImage;