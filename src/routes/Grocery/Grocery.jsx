import React, { useState, useEffect, useRef } from "react";
import styles from "./Grocery.module.css";
import html2pdf from "html2pdf.js"; // Importa la biblioteca html2pdf
import FixedBox from "../../components/BoxWithText/BoxWithText";
import TripleBox from "../../components/TripleBoxWithText/TripleBoxWithText";
import { useNavigate } from "react-router-dom";

const MagazinePage = () => {
  const numColumns = 4;
  const numCardsPerColumn = 7;
  
  const navigate = useNavigate()

  const [isEditingZoom, setIsEditingZoom] = useState(false);

  const initialOverlayTexts = Array(numColumns * numCardsPerColumn).fill("");
  const [overlayTexts, setOverlayTexts] = useState(initialOverlayTexts);

  // const initialOverlayCardTexts = Array(numColumns).fill().map(() => Array(numCardsPerColumn).fill(''));
  let initialOverlayCardTexts = Array.from({ length: numColumns }, () =>
    Array(numCardsPerColumn).fill("")
  );

  initialOverlayCardTexts[0] = Array(11).fill(null)
  const [overlayCardTexts, setOverlayCardTexts] = useState(
    initialOverlayCardTexts
  );

  let initialSmallDivText = Array.from({ length: numColumns }, () =>
    Array(numCardsPerColumn).fill("")
  );

  initialSmallDivText[0] = Array(11).fill("");

  const [smallDivText, setSmallDivText] = useState(initialSmallDivText);

  console.log(smallDivText);

  let initialPriceBoxRender = Array.from({ length: numColumns }, () =>
    Array(numCardsPerColumn).fill(false)
  );

  initialPriceBoxRender[0] = Array(11).fill(false);

  const [priceBoxRender, setPriceBoxRender] = useState(initialPriceBoxRender);

  let initialOverlayCardTextsLeft = Array(numColumns)
    .fill()
    .map(() => Array(numCardsPerColumn).fill(""));

  initialOverlayCardTextsLeft[0] = Array(11).fill("")
  const [overlayCardTextsLeft, setOverlayCardTextsLeft] = useState(
    initialOverlayCardTextsLeft
  );

  const [contextMenu, setContextMenu] = useState(null);

  const [imagePositionX, setImagePositionX] = useState(0);
  const [imagePositionY, setImagePositionY] = useState(0);
  const [imagePositionsY, setImagePositionsY] = useState(
    Array.from({ length: numColumns }, () => Array(numCardsPerColumn).fill(0))
  );

  const [imagePositions, setImagePositions] = useState(
    Array.from({ length: numColumns }, () => Array(numCardsPerColumn).fill(0))
  );

  let initialZoomLevels = Array.from({ length: numColumns }, () =>
    Array(numCardsPerColumn).fill(100)
  );
  initialZoomLevels[0] = Array(11).fill(100);
  const [zoomLevels, setZoomLevels] = useState(initialZoomLevels);

  let initialOverlayImages = Array.from({ length: numColumns }, () =>
    Array(numCardsPerColumn).fill(null)
  );
  initialOverlayImages[0] = Array(11).fill(null);

  const [selectedImage, setSelectedImage] = useState(null);

  const [uploadedImages, setUploadedImages] = useState(initialOverlayImages);

  const handleOverlayTextClick = (cardIndex) => {
    const newText = prompt("Ingrese el nuevo texto:");
    if (newText !== null) {
      const newOverlayTexts = [...overlayTexts];
      newOverlayTexts[cardIndex] = newText;
      setOverlayTexts(newOverlayTexts);
    }
  };

  const handleShowHideOverlayCard = (columnIndex, cardIndex) => {
    const newOverlayCardTexts = [...overlayCardTexts];
    newOverlayCardTexts[columnIndex][cardIndex] =
      newOverlayCardTexts[columnIndex][cardIndex] === null ? "" : null;
    setOverlayCardTexts(newOverlayCardTexts);
  };

  const handleSwithcBoxType = (columnIndex, cardIndex) => {
    const newPriceBoxRender = [...priceBoxRender];
    newPriceBoxRender[columnIndex][cardIndex] =
      newPriceBoxRender[columnIndex][cardIndex] === false ? true : false;
    setPriceBoxRender(newPriceBoxRender);
  };

  const handleOverlayCardTextLeftClick = (columnIndex, cardIndex) => {
    const newText = prompt(
      "Ingrese el nuevo texto para overlay-card-text-left:"
    );
    if (newText !== null) {
      const newOverlayCardTextsLeft = [...overlayCardTextsLeft];
      newOverlayCardTextsLeft[columnIndex][cardIndex] = newText;
      setOverlayCardTextsLeft(newOverlayCardTextsLeft);
    }
  };

  const handleCardClick = (columnIndex, cardIndex, event) => {
    event.preventDefault();
    const calculatedCardIndex = columnIndex * numCardsPerColumn + cardIndex;

    if (event.target === event.currentTarget) {
      if (uploadedImages[columnIndex][calculatedCardIndex]) {
        const contextMenuItems = [
          {
            label: "Delete",
            action: () => handleDeleteImage(columnIndex, cardIndex),
          },
          {
            label: "Show/Hide",
            action: () => handleShowHideOverlayCard(columnIndex, cardIndex),
          },
          {
            label: "Box1/Box2",
            action: () => handleSwithcBoxType(columnIndex, cardIndex),
          },
        ];

        if (!isEditingZoom) {
          // Solo agrega la opción de editar si no se está editando el zoom
          contextMenuItems.unshift({
            label: "Edit",
            action: () => {
              setIsEditingZoom(true);
              setSelectedImage({ columnIndex, cardIndex });
            },
          });
        }

        setContextMenu({
          x: event.clientX,
          y: event.clientY,
          items: contextMenuItems,
        });
      } else {
        // Otherwise, allow the user to upload a new image
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.onchange = (event) => {
          const file = event.target.files[0];

          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const newUploadedImages = [...uploadedImages];
              // Calculate the correct index within the flattened array
              newUploadedImages[columnIndex][calculatedCardIndex] =
                e.target.result;
              setUploadedImages(newUploadedImages);
            };

            reader.readAsDataURL(file);
          }
        };

        input.click();
      }
    }
  };

  const ZoomSlider = ({ columnIndex, cardIndex }) => {
    const calculatedCardIndex = columnIndex * numCardsPerColumn + cardIndex;
  
    const handleZoomChange = (newZoom) => {
      const newZoomLevels = [...zoomLevels];
      newZoomLevels[columnIndex][cardIndex] = newZoom;
      setZoomLevels(newZoomLevels);
    };
  
    const handlePositionChange = (changeAmount) => {
      const newImagePositions = [...imagePositions];
      newImagePositions[columnIndex][cardIndex] += changeAmount;
      setImagePositions(newImagePositions);
    };
  
    const handlePositionChangeY = (changeAmount) => {
      const newImagePositionsY = [...imagePositionsY];
      newImagePositionsY[columnIndex][cardIndex] += changeAmount;
      setImagePositionsY(newImagePositionsY);
    };
  
    const handleConfirmClick = () => {
      setIsEditingZoom(false);
    };
  
    return (
      <div className={styles.sidebar}>
        <div className={styles.zoomSliderContainer}>
          <div className={styles.zoomControlsGrid}>
            <button
              onClick={() => handleZoomChange(zoomLevels[columnIndex][cardIndex] - 5)}
              className={styles.bttnGrid} 
            >
              -
            </button>
            <button
              onClick={() => handleZoomChange(zoomLevels[columnIndex][cardIndex] + 5)}
              className={styles.bttnGrid} 
            >
              +
            </button>
            <button className={styles.bttnGrid} onClick={() => handlePositionChangeY(-5)}>up</button>
            <button className={styles.bttnGrid}  onClick={() => handlePositionChangeY(5)}>down</button>
            <button className={styles.bttnGrid}  onClick={() => handlePositionChange(-5)}>left</button>
            <button className={styles.bttnGrid}  onClick={() => handlePositionChange(5)}>right</button>
          </div>
          <button className={styles.confirmButton} onClick={handleConfirmClick}>
            OK
          </button>
        </div>
      </div>
    );
  };

  const handleDeleteImage = (columnIndex, cardIndex) => {
    const confirmDelete = window.confirm(
      "¿Seguro que desea eliminar la imagen?"
    );
    if (confirmDelete) {
      const newUploadedImages = [...uploadedImages];
      // Calculate the correct index within the flattened array
      const calculatedCardIndex = columnIndex * numCardsPerColumn + cardIndex;
      newUploadedImages[columnIndex][calculatedCardIndex] = null;
      setUploadedImages(newUploadedImages);
    }
  };

  const ContextMenu = ({ x, y, items, onClose }) => (
    <div
      style={{
        position: "fixed",
        top: `${y}px`,
        left: `${x}px`,
        color: "white",
        backgroundColor: "gray",
        border: "1px solid black",
        borderRadius: "5px",
        zIndex: "1000",
        padding: "5px",
      }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          style={{ cursor: "pointer" }}
          onClick={() => {
            item.action();
            onClose(); // Cierra el menú contextual al hacer clic en una opción
          }}
        >
          {item.label}
        </div>
      ))}
      <div
        style={{ cursor: "pointer", marginTop: "5px" }}
        onClick={() => onClose()} // Agrega una opción para cancelar y cerrar el menú contextual
      >
        Cancel
      </div>
    </div>
  );

  useEffect(() => {
    // Puedes hacer algo con overlayCardTexts después de cada cambio si es necesario
  }, [overlayCardTexts]);

  useEffect(() => {
    // Puedes hacer algo con overlayCardTextsLeft después de cada cambio si es necesario
  }, [overlayCardTextsLeft]);

  const columnWithCustomCards = 0;

  const RenderCards = () => {
    const cards = [];

    for (let i = 0; i < numColumns; i++) {
      const numCards = i === columnWithCustomCards ? 11 : numCardsPerColumn;
      const column = [];

      for (let j = 0; j < numCards; j++) {
        const cardIndex = i * numCardsPerColumn + j;
        const renderOverlay = i !== 0;
        const isEditingThisZoom =
          isEditingZoom &&
          selectedImage &&
          selectedImage.columnIndex === i &&
          selectedImage.cardIndex === j;

        let imageSrc = uploadedImages[i][cardIndex];

        if (i === 0) {
          imageSrc = uploadedImages[0][cardIndex];
        }

        column.push(
          <div
            key={j}
            className={styles.card}
            onClick={(event) => handleCardClick(i, j, event)}
          >
            <img
              src={imageSrc}
              className={styles.uploadedImage}
              style={{
                transform: `scale(${zoomLevels[i][j] / 100}) translate(${
                  imagePositions[i][j]
                }px, ${imagePositionsY[i][j]}px)`,
              }}
            />
            {priceBoxRender[i][j] ? (
              <TripleBox
                key={`triple-box-${i}-${j}`}
                overlayCardTexts={overlayCardTexts}
                setOverlayCardTexts={setOverlayCardTexts}
                handleShowHideOverlayCard={handleShowHideOverlayCard}
                cardIndex={cardIndex}
                smallDivText={smallDivText}
                setSmallDivTexts={setSmallDivText}
                setSmallDivText={setSmallDivText}
                j={j}
                i={i}
              />
            ) : (
              <FixedBox
                key={`fixed-box-${i}-${j}`}
                overlayCardTexts={overlayCardTexts}
                setOverlayCardTexts={setOverlayCardTexts}
                handleShowHideOverlayCard={handleShowHideOverlayCard}
                cardIndex={cardIndex}
                j={j}
                i={i}
              />
            )}
            {renderOverlay && (
              <div
                className={styles.overlayCardText}
                onClick={() => handleOverlayTextClick(cardIndex)}
              >
                {overlayTexts[cardIndex]}
              </div>
            )}
            <div
              className={
                  i === 0 ? styles.overlayCardTextFirstColumn : styles.overlayCardTextLeft
              }
                onClick={() => handleOverlayCardTextLeftClick(i, j)}
              >
              {overlayCardTextsLeft[i][j]}
            </div>
            {isEditingThisZoom && <ZoomSlider columnIndex={i} cardIndex={j} />}
          </div>
        );
      }

      cards.push(
        <div key={i} className={styles.cardColumn}>
          {column}
        </div>
      );
    }

    return cards;
  };

  const handleConvertToPDF = () => {
    const container = document.getElementById("magazineContainer");

    if (container) {
      const pdfOptions = {
        filename: "grocery_magazine.pdf",
        image: { type: "png", quality: 1 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      html2pdf().from(container).set(pdfOptions).save();
    }
  };

  const contextMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target)
      ) {
        // Cerrar el menú contextual si se hace clic fuera de él
        setContextMenu(null);
      }
    };

    // Agregar el event listener al documento
    document.addEventListener("mousedown", handleClickOutside);

    // Limpiar el event listener al desmontar el componente
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div>
      <button style={{ position: "absolute",top: "20px", left: "20px", backgroundColor: "gray", color: "white"}} onClick={handleConvertToPDF}>Convert to PDF</button>
      <button style={{ position: "absolute",top: "70px", left: "20px", backgroundColor: "gray", color: "white"}} onClick={() => navigate("/") }>Back to Home</button>

      <div id="magazineContainer" className={styles.containerDivBorder}>
        <div className={styles.containerDiv} ref={contextMenuRef}>
          <RenderCards />
          {contextMenu && (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              items={contextMenu.items}
              onClose={() => setContextMenu(null)}
            />
          )}
          <div className={styles.overlay}>GROCERY</div>
        </div>
      </div>
    </div>
  );
};

export default MagazinePage;
