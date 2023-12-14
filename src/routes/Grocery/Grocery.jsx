// App.jsx
import React, {useState, useEffect} from 'react';
import styles from "./Grocery.module.css";

const MagazinePage = () => {
  const numColumns = 4;
  const numCardsPerColumn = 7;

  const initialOverlayTexts = Array(numColumns * numCardsPerColumn).fill('');
  const [overlayTexts, setOverlayTexts] = useState(initialOverlayTexts);

  // const initialOverlayCardTexts = Array(numColumns).fill().map(() => Array(numCardsPerColumn).fill(''));
  const initialOverlayCardTexts = Array.from({length: numColumns }, () => Array(numCardsPerColumn).fill(''))
  const [overlayCardTexts, setOverlayCardTexts] = useState(initialOverlayCardTexts);

  const initialOverlayCardTextsLeft = Array(numColumns).fill().map(() => Array(numCardsPerColumn).fill(''));
  const [overlayCardTextsLeft, setOverlayCardTextsLeft] = useState(initialOverlayCardTextsLeft);


  let initialOverlayImages = Array.from({ length: numColumns }, () => Array(numCardsPerColumn).fill(null))
  initialOverlayImages[0] = Array(11).fill(null)
  console.log(initialOverlayImages)

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
    // Check if the clicked element is the card itself or one of its children
    if (event.target === event.currentTarget) {
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
            const calculatedCardIndex = columnIndex * numCardsPerColumn + cardIndex;
            newUploadedImages[columnIndex][calculatedCardIndex] = e.target.result;
            setUploadedImages(newUploadedImages);
          };
  
          reader.readAsDataURL(file);
        }
      };
  
      input.click();
    }
  };

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
  
        // Create a variable to store the image source
        let imageSrc = uploadedImages[i][cardIndex];
  
        // If it's the first column, handle the images differently
        if (i === 0) {
          // For the first column, use the same image source for all cards
          imageSrc = uploadedImages[0][cardIndex];
        }
  
        column.push(
          <div key={j} className={styles.card} onClick={(event) => handleCardClick(i, j, event)}>
            {
              <img src={imageSrc} alt="Uploaded" className={styles.uploadedImage} />
            }
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
        <div className={styles.overlay}>GROCERY</div>
      </div>
      
    </div>
  );
};

export default MagazinePage;
