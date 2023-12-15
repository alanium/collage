// App.jsx
import React, {useState, useEffect} from 'react';
import styles from "./Grocery.module.css";

const MagazinePage = () => {
  const numColumns = 4;
  const numCardsPerColumn = 7;

  const [isEditingZoom, setIsEditingZoom] = useState(false);

  const initialOverlayTexts = Array(numColumns * numCardsPerColumn).fill('');
  const [overlayTexts, setOverlayTexts] = useState(initialOverlayTexts);

  // const initialOverlayCardTexts = Array(numColumns).fill().map(() => Array(numCardsPerColumn).fill(''));
  const initialOverlayCardTexts = Array.from({length: numColumns }, () => Array(numCardsPerColumn).fill(''))
  const [overlayCardTexts, setOverlayCardTexts] = useState(initialOverlayCardTexts);

  const initialOverlayCardTextsLeft = Array(numColumns).fill().map(() => Array(numCardsPerColumn).fill(''));
  const [overlayCardTextsLeft, setOverlayCardTextsLeft] = useState(initialOverlayCardTextsLeft);

  const [contextMenu, setContextMenu] = useState(null);

  let initialZoomLevels = Array.from({ length: numColumns }, () => Array(numCardsPerColumn).fill(100));
  initialZoomLevels[0] = Array(11).fill(100)
  const [zoomLevels, setZoomLevels] = useState(initialZoomLevels);
  

  let initialOverlayImages = Array.from({ length: numColumns }, () => Array(numCardsPerColumn).fill(null))
  initialOverlayImages[0] = Array(11).fill(null)
  console.log(initialOverlayImages)

  const [selectedImage, setSelectedImage] = useState(null);


  const [uploadedImages, setUploadedImages] = useState(initialOverlayImages);

  const handleOverlayTextClick = (cardIndex) => {
    const newText = prompt('Ingrese el nuevo texto:');
    if (newText !== null) {
      const newOverlayTexts = [...overlayTexts];
      newOverlayTexts[cardIndex] = newText;
      setOverlayTexts(newOverlayTexts);
    }
  };

  const handleOverlayCardClick = (columnIndex, cardIndex) => {
    const newText = prompt('Ingrese el nuevo texto para overlay-card:');
    if (newText !== null) {
      const newOverlayCardTexts = [...overlayCardTexts];
      newOverlayCardTexts[columnIndex][cardIndex] = newText;
      setOverlayCardTexts(newOverlayCardTexts);
    }
  };

  const handleOverlayCardTextLeftClick = (columnIndex, cardIndex) => {
    const newText = prompt('Ingrese el nuevo texto para overlay-card-text-left:');
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
            label: 'Eliminar',
            action: () => handleDeleteImage(columnIndex, cardIndex),
          },
        ];
  
        if (!isEditingZoom) {
          // Solo agrega la opción de editar si no se está editando el zoom
          contextMenuItems.unshift({
            label: 'Editar',
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
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
  
        input.onchange = (event) => {
          const file = event.target.files[0];
  
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const newUploadedImages = [...uploadedImages];
              // Calculate the correct index within the flattened array
              newUploadedImages[columnIndex][calculatedCardIndex] = e.target.result;
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
  
    const handleConfirmClick = () => {
      setIsEditingZoom(false);
    };
  
    return (
      <div className={styles.zoomSliderContainer}>
        <div className={styles.zoomSlider}>
          <input
            type="range"
            min="50"
            max="200"
            value={zoomLevels[columnIndex][cardIndex]}
            onChange={(e) => handleZoomChange(parseInt(e.target.value, 10))}
          />
        </div>
        <button className={styles.confirmButton} onClick={handleConfirmClick}>
          Confirmar
        </button>
      </div>
    );
  };
  

  
  const handleDeleteImage = (columnIndex, cardIndex) => {
    const confirmDelete = window.confirm('¿Seguro que desea eliminar la imagen?');
    if (confirmDelete) {
      const newUploadedImages = [...uploadedImages];
      // Calculate the correct index within the flattened array
      const calculatedCardIndex = columnIndex * numCardsPerColumn + cardIndex;
      newUploadedImages[columnIndex][calculatedCardIndex] = null;
      setUploadedImages(newUploadedImages);
    }
  };
  
  const ContextMenu = ({ x, y, items }) => (
    <div
      style={{
        position: 'fixed',
        top: `${y}px`,
        left: `${x}px`,
        backgroundColor: 'black',
        border: '1px solid black',
        zIndex: '1000',
        padding: '5px',
      }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          style={{ cursor: 'pointer' }}
          onClick={() => {
            item.action();
            setContextMenu(null);
          }}
        >
          {item.label}
        </div>
      ))}
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
        isEditingZoom && selectedImage && selectedImage.columnIndex === i && selectedImage.cardIndex === j;

  
        let imageSrc = uploadedImages[i][cardIndex];
  
        if (i === 0) {
          imageSrc = uploadedImages[0][cardIndex];
        }
  
        column.push(
          <div key={j} className={styles.card} onClick={(event) => handleCardClick(i, j, event)}>
            <img
              src={imageSrc}
              alt="Uploaded"
              className={styles.uploadedImage}
              style={{ transform: `scale(${zoomLevels[i][j] / 100})` }}
            />
            {renderOverlay && (
              <div className={styles.overlayCard} onClick={() => handleOverlayCardClick(i, j)}>
                {overlayCardTexts[i][j]}
              </div>
            )}
            {renderOverlay && (
              <div className={styles.overlayCardText} onClick={() => handleOverlayTextClick(cardIndex)}>
                {overlayTexts[cardIndex]}
              </div>
            )}
            {renderOverlay && (
              <div className={styles.overlayCardTextLeft} onClick={() => handleOverlayCardTextLeftClick(i, j)}>
                {overlayCardTextsLeft[i][j]}
              </div>
            )}
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
  
  

  return (
    <div className={styles.containerDivBorder}>
      <div className={styles.containerDiv}>
        <RenderCards />
        {contextMenu && (
          <ContextMenu x={contextMenu.x} y={contextMenu.y} items={contextMenu.items} />
        )}
        <div className={styles.overlay}>GROCERY</div>
      </div>
    </div>
  );
  
};

export default MagazinePage;
