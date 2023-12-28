



const ZoomSlider = ({ columnIndex, cardIndex, index, uploadedImages }) => {
    const calculatedCardIndex = columnIndex * numCardsPerColumn + cardIndex;

    const handleZoomChange = (newZoom) => {
      const newZoomLevels = [...zoomLevels];
      newZoomLevels[columnIndex][cardIndex][index] = newZoom;
      setZoomLevels(newZoomLevels);
    };

    const handlePositionChange = (changeAmount) => {
      const newImagePositions = [...imagePositions];
      newImagePositions[columnIndex][cardIndex][index] += changeAmount;
      setImagePositions(newImagePositions);
    };

    const handlePositionChangeY = (changeAmount) => {
      const newImagePositionsY = [...imagePositionsY];
      newImagePositionsY[columnIndex][cardIndex][index] += changeAmount;
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
              onClick={() =>
                handleZoomChange(zoomLevels[columnIndex][cardIndex][index] - 5)
              }
              className={styles.bttnGrid}
            >
              -
            </button>
            <button
              onClick={() =>
                handleZoomChange(zoomLevels[columnIndex][cardIndex][index] + 5)
              }
              className={styles.bttnGrid}
            >
              +
            </button>
            <button
              className={styles.bttnGrid}
              onClick={() => handlePositionChangeY(-5)}
            >
              up
            </button>
            <button
              className={styles.bttnGrid}
              onClick={() => handlePositionChangeY(5)}
            >
              down
            </button>
            <button
              className={styles.bttnGrid}
              onClick={() => handlePositionChange(-5)}
            >
              left
            </button>
            <button
              className={styles.bttnGrid}
              onClick={() => handlePositionChange(5)}
            >
              right
            </button>
          </div>
          <button className={styles.confirmButton} onClick={handleConfirmClick}>
            OK
          </button>
        </div>
      </div>
    );
  };