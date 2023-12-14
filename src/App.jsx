// App.jsx
import React from 'react';
import './App.css';

const MagazinePage = () => {
  const numColumns = 4;
  const numCardsPerColumn = 7;

  const columnWithCustomCards = 0;

  const renderCards = () => {
    const cards = [];
    for (let i = 0; i < numColumns; i++) {
      const numCards = i === columnWithCustomCards ? 11 : numCardsPerColumn;
      const column = [];
      for (let j = 0; j < numCards; j++) {
        const renderOverlay = i !== columnWithCustomCards; // No renderizar overlay en la primera columna
        column.push(
          <div key={j} className="card">
            {renderOverlay && (
              <div className="overlay-card">
                {/* Contenido del overlay-card */}
              </div>
            )}
            {renderOverlay && i !== columnWithCustomCards && (
              <div className="overlay-card-text">
              </div>
            )}
          </div>
        );
      }
      cards.push(
        <div key={i} className="card-column">
          {column}
        </div>
      );
    }
    return cards;
  };
  
  

  return (
    <div className='container-div-border'>
      <div className="container-div">
        {renderCards()}
        <div className="overlay">GROCERY</div>
      </div>
      
    </div>
  );
};

export default MagazinePage;
