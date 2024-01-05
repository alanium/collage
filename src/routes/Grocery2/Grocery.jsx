import React, { useState, useEffect, useRef } from "react";
import styles from "./Grocery.module.css";
import html2pdf from "html2pdf.js"; // Importa la biblioteca html2pdf
import FixedBox from "../../components/BoxWithText/BoxWithText";
import TripleBox from "../../components/TripleBoxWithText/TripleBoxWithText";
import { useNavigate } from "react-router-dom";

function Grocery() {
  const [staticColumns, setStaticColumns] = useState(
    Array(21)
      .fill()
      .map((_, index) => ({
        img: [
          { src: "", zoom: 100, x: 0, y: 0 },
          { src: "", zoom: 100, x: 0, y: 0 },
        ],
        text: {
          top: "",
          left: "",
          bottom: "",
          priceBoxType: true,
          renderPriceBox: true,
        },
        index
      }))
  );

  const contextMenuRef = useRef(null);

  const [dynamicColumn, setDynamicColumn] = useState([]);

  const [contextMenu, setContextMenu] = useState(null);

  const [isEditingZoom, setIsEditingZoom] = useState(false);

  const [selectedImage, setSelectedImage] = useState({});

  const navigate = useNavigate();

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

  const handleDynamicColumns = (event) => {
    const cardAmount = prompt(
      "Enter the amount of cards you want on the first column: "
    );

    let cards = [...dynamicColumn];

    for (let i = 0; i < Number(cardAmount); i++) {
      const card = {
        img: [
          { src: "", zoom: 100, x: 0, y: 0 },
          { src: "", zoom: 100, x: 0, y: 0 },
        ],
        text: {
          top: "",
          left: "",
          bottom: "",
          priceBoxType: true,
          renderPriceBox: false,
        },
        index: i + 21,
      };
      cards.push(card);
    }
    setDynamicColumn(cards);
  };

  const handleImageUpload = (event, cardIndex) => {
    // Added 'cardIndex' parameter
    event.preventDefault();
    if (cardIndex > 20) {
      const dynamicColumnCopy = [...dynamicColumn];
      dynamicColumnCopy.map((card) => {
      if (card.index === cardIndex) {
        // Changed 'event.target.key' to 'cardIndex'
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (event) => {
          const file = event.target.files[0];

          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target.result;
              const newDynamicColumn = [...dynamicColumn];
              newDynamicColumn[cardIndex - 21].img[0].src = result;
              setDynamicColumn(newDynamicColumn);
            };

            reader.readAsDataURL(file);
          }
        };
        input.click();
      }
    });
    } else {
      const staticColumnsCopy = [...staticColumns];
      staticColumnsCopy.map((card) => {
      if (card.index === cardIndex) {
        // Changed 'event.target.key' to 'cardIndex'
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (event) => {
          const file = event.target.files[0];

          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target.result;
              const newStaticColumns = [...staticColumns];
              newStaticColumns[cardIndex].img[0].src = result;
              setStaticColumns(newStaticColumns);
            };

            reader.readAsDataURL(file);
          }
        };
        input.click();
      }
    });
    }

    
    
  };



  const handleDeleteImage = (cardIndex, index) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete the image?"
    );

    if (cardIndex > 20) {
      if (confirmDelete) {
        setDynamicColumn((prevDynamicColumn) => {
          const newDynamicColumn = [...prevDynamicColumn];
          const imageToUpdate = newDynamicColumn.find(
            (image) => image.index === cardIndex
          );
  
          if (imageToUpdate) {
            // Set the src value to an empty string when deleting
            imageToUpdate.img[index].src = "";
          }
          return newDynamicColumn;
        });
      }
    } else {
      if (confirmDelete) {
        setStaticColumns((prevStaticColumns) => {
          const newStaticColumns = [...prevStaticColumns];
          const imageToUpdate = newStaticColumns.find(
            (image) => image.index === cardIndex
          );
  
          if (imageToUpdate) {
            // Set the src value to an empty string when deleting
            imageToUpdate.img[index].src = "";
          }
  
          return newStaticColumns;
        });
      }
    }
  };


  const showHidePriceBox = (cardIndex) => {
    if (cardIndex > 20) {
      const newDynamicColumn = [...dynamicColumn];
      newDynamicColumn[cardIndex - 21].text.renderPriceBox = !newDynamicColumn[cardIndex - 21].text.renderPriceBox;
      setDynamicColumn(newDynamicColumn);
    } else {
      const newStaticColumns = [...staticColumns];
      newStaticColumns[cardIndex].text.renderPriceBox = !newStaticColumns[cardIndex].text.renderPriceBox;
      setStaticColumns(newStaticColumns);
    }
  };
  
  const switchBoxType = (cardIndex) => {
    if (cardIndex > 20) {
     
        const newDynamicColumn = [...dynamicColumn]; // Adjust the index for the dynamic column
        newDynamicColumn[cardIndex - 21].text.priceBoxType = !newDynamicColumn[cardIndex - 21].text.priceBoxType;
        setDynamicColumn(newDynamicColumn);

    } else {
      setStaticColumns((prevStaticColumns) => {
        const newStaticColumns = [...prevStaticColumns];
        newStaticColumns[cardIndex].text.priceBoxType = !newStaticColumns[cardIndex].text.priceBoxType;
        return newStaticColumns;
      });
    }
  };


    

  const handleTopText = (cardIndex) => {
    const newText = prompt("Input new text: ");
    if (newText !== null) {
      setStaticColumns((prevStaticColumns) => {
        const newStaticColumns = [...prevStaticColumns];
        newStaticColumns[cardIndex].text.top = newText;
        return newStaticColumns;
      });
    }
  };

  const handleLeftText = (cardIndex) => {
    const newText = prompt("Input new text: ");

    if (cardIndex > 20) {
      if (newText !== null) {
        setDynamicColumn((prevDynamicColumn) => {
          const newTextBoxes = [...prevDynamicColumn];
          newTextBoxes[cardIndex - 21].text.left = newText;
          return newTextBoxes;
        });
      }
    } else {
      if (newText !== null) {
        setStaticColumns((prevStaticColumns) => {
          const newStaticColumns = [...prevStaticColumns];
          newStaticColumns[cardIndex].text.left = newText;
          return newStaticColumns;
        });
      }
    }
  };

  const ContextMenu = ({ x, y, items, onClose }) => (
    <div
      style={{
        position: "absolute",
        top: `${y}px`,
        left: `${x}px`,
        border: "1px solid #ccc",
        background: "#fff",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
        borderRadius: "4px",
        padding: "5px",
        zIndex: "1000"
      }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          style={{ cursor: "pointer", padding: "5px" }}
          onClick={() => {
            item.action();
            onClose(); // Cierra el menú contextual al hacer clic en una opción
          }}
        >
          {item.label}
        </div>
      ))}
      <div
        style={{ cursor: "pointer",
        padding: "5px",
        borderTop: "1px solid #ccc",
        marginTop: "5px", }}
        onClick={() => onClose()} // Agrega una opción para cancelar y cerrar el menú contextual
      >
        Cancel
      </div>
    </div>
  );

  const handleContextMenu = (event, cardIndex, column, image) => {
    event.preventDefault()

    const selectedColumn = (cardIndex > 20 ? dynamicColumn : staticColumns)

    const index = (cardIndex > 20 ? cardIndex - 21 : cardIndex)

    const contextMenuItems = [
      {
        label: "Edit ",
        action: () => {
          setIsEditingZoom(true);
          setSelectedImage({ cardIndex });
        },
      },
      {
        label: "Show/Hide",
        action: () => showHidePriceBox(cardIndex),
      },
      {
        label: "Box1/Box2",
        action: () => switchBoxType(cardIndex),
      },
    ];

    if (selectedColumn[index].img[1].src == "") {
      // If only one image uploaded, allow uploading the second image
      contextMenuItems.push({
        label: "Upload Image 2",
        action: () => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";

          input.onchange = (event) => {
            const file = event.target.files[0];

            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const newUploadedImages = [...selectedColumn];
                newUploadedImages[index].img[1].src = e.target.result;

                if (cardIndex > 20)
                  setDynamicColumn(newUploadedImages);
                else 
                  setStaticColumns(newUploadedImages)
              };

              reader.readAsDataURL(file);
            }
          };

          input.click();
        },
      });
    } else if (selectedColumn[index].img[1].src != "") {
      // If both images uploaded, allow editing and deleting the second image
      contextMenuItems.push(
        {
          label: "Delete 2",
          action: () => handleDeleteImage(cardIndex, 1),
        },
      );
    } if (selectedColumn[index].img[0].src == "") {
      contextMenuItems.push(
        {
          label: "Upload 1",
          action: () => handleImageUpload(event, cardIndex)
        }
      )
    } if (selectedColumn[index].img[0].src != "") {
      contextMenuItems.push(
        {
          label: "Delete 1",
          action: () => handleDeleteImage(cardIndex, 0),
        },
      );
    }

    const containerRect = contextMenuRef.current.getBoundingClientRect();
    setContextMenu({
      x: event.clientX - containerRect.left,
      y: event.clientY - containerRect.top,
      items: contextMenuItems,
    });
  };

  const ZoomSlider = ({ cardIndex }) => {

    const auxIndex = (cardIndex > 20? cardIndex - 21 : cardIndex)
    const handleZoomChange = (newZoom, index) => {
      if (cardIndex > 20) {
        const newUploadedImages = [...dynamicColumn];
        newUploadedImages[auxIndex].img[index].zoom = newZoom;
        setDynamicColumn(newUploadedImages);
      } else {
        const newUploadedImages = [...staticColumns];
        newUploadedImages[auxIndex].img[index].zoom = newZoom;
        setStaticColumns(newUploadedImages);
      }
    };
  
    const handlePositionChange = (changeAmount, index, axis) => {
      if (cardIndex > 20) {
        const newUploadedImages = [...dynamicColumn];
        newUploadedImages[auxIndex].img[index][axis] += changeAmount;
        setDynamicColumn(newUploadedImages);
      } else {
        const newUploadedImages = [...staticColumns];
        newUploadedImages[auxIndex].img[index][axis] += changeAmount;
        setStaticColumns(newUploadedImages);
      }
    };
  
    const handleConfirmClick = () => {
      setIsEditingZoom(false);
    };
  
    return (
      <div className={styles.sidebar}>
        <div className={styles.zoomSliderContainer}>
          <label>Image 1</label>
          <div className={styles.zoomControlsGrid}>
            <button
              onClick={() =>
                handleZoomChange(
                  (cardIndex > 20 ? dynamicColumn : staticColumns)[auxIndex].img[0].zoom - 5, 0
                )
              }
              className={styles.bttnGrid}
            >
              -
            </button>
            <button
              onClick={() =>
                handleZoomChange(
                  (cardIndex > 20 ? dynamicColumn : staticColumns)[auxIndex].img[0].zoom + 5, 0
                )
              }
              className={styles.bttnGrid}
            >
              +
            </button>
            <button
              className={styles.bttnGrid}
              onClick={() => handlePositionChange(-5, 0, 'y',)}
            >
              up
            </button>
            <button
              className={styles.bttnGrid}
              onClick={() => handlePositionChange(5, 0, 'y',)}
            >
              down
            </button>
            <button
              className={styles.bttnGrid}
              onClick={() => handlePositionChange(-5, 0, 'x')}
            >
              left
            </button>
            <button
              className={styles.bttnGrid}
              onClick={() => handlePositionChange(5, 0, 'x',)}
            >
              right
            </button>
          </div>
        </div>
        <div style={{top: "400px"}} className={styles.zoomSliderContainer}>
          <label>Image 2</label>
          <div className={styles.zoomControlsGrid}>
            <button
              onClick={() =>
                handleZoomChange(
                  (cardIndex > 20 ? dynamicColumn : staticColumns)[auxIndex].img[1].zoom - 5, 1
                )
              }
              className={styles.bttnGrid}
            >
              -
            </button>
            <button
              onClick={() =>
                handleZoomChange(
                  (cardIndex > 20 ? dynamicColumn : staticColumns)[auxIndex].img[1].zoom + 5, 1
                )
              }
              className={styles.bttnGrid}
            >
              +
            </button>
            <button
              className={styles.bttnGrid}
              onClick={() => handlePositionChange(-5, 1, 'y', 0)}
            >
              up
            </button>
            <button
              className={styles.bttnGrid}
              onClick={() => handlePositionChange(5, 1, 'y')}
            >
              down
            </button>
            <button
              className={styles.bttnGrid}
              onClick={() => handlePositionChange(-5, 1, 'x')}
            >
              left
            </button>
            <button
              className={styles.bttnGrid}
              onClick={() => handlePositionChange(5, 1, 'x')}
            >
              right
            </button>
          </div>
          <button
            className={styles.confirmButton}
            onClick={handleConfirmClick}
          >
            OK
          </button>
        </div>
      </div>
    );
  };

  const handleCardClick = (cardIndex, event) => {
    // Check if the click event target is not the card element

    const auxIndex = (cardIndex > 20 ? cardIndex - 21 : cardIndex)

    if (!event.target.classList.contains(styles.card)) {
      return;
    }
    const image = (cardIndex > 20 ? dynamicColumn : staticColumns)[auxIndex];
  
    if (image.img[0].src === "" && image.img[1].src  === "") {
      handleImageUpload(event, cardIndex);
    } else {
      handleContextMenu(event, cardIndex, image);
    }
  };


  const RenderDynamicColumn = () => {
    let cards = [];

    const isFirstColumnEmpty = dynamicColumn.length === 0

    return isFirstColumnEmpty ? (
      <div className={styles.cardColumn} onClick={(event) => handleDynamicColumns(event)}>
        <label>Click to input the number of Cards you want to have in the first Column</label>
      </div>
    ) : (
      <div className={styles.cardColumn}>
      {dynamicColumn.map((card) => {
        const cardIndex = card.index;
        const isEditingThisZoom =
            isEditingZoom &&
            selectedImage &&
            selectedImage.cardIndex !== undefined &&
            selectedImage.cardIndex === cardIndex;
        
        let images = {...card};
  
          cards.push(
          <div
              className = {styles.card}
              key={cardIndex}
              onClick={(event) => handleCardClick(cardIndex, event)}
            >
              {images.img[0] && ( // Check if img[0] exists before rendering
                <img
                  src={images.img[0].src ? images.img[0].src : ""}
                  className={styles.uploadedImage}
                  style={{
                    transform: `scale(${images.img[0].zoom / 100}) translate(${
                      images.img[0].x
                    }px, ${images.img[0].y}px)`,
                  }}
                />
              )}
  
              {images.img[1] && ( // Check if img[1] exists before rendering
                <img
                  src={images.img[1] ? images.img[1].src : ""}
                  className={styles.uploadedImage}
                  style={{
                    transform: `scale(${images.img[1].zoom / 100}) translate(${
                      images.img[1].x
                    }px, ${images.img[1].y}px)`,
                  }}
                />
              )}
               {dynamicColumn[cardIndex - 21] && dynamicColumn[cardIndex - 21].text.renderPriceBox ? (
                <div className="priceBox">
                {dynamicColumn[cardIndex - 21].text.priceBoxType === true ? (
                  <TripleBox
                  key={`triple-box-${cardIndex}`}
                  textBoxes={dynamicColumn}
                  setTextBoxes={setDynamicColumn}
                  i={cardIndex - 21}
                  cardIndex={cardIndex}
                />
                ) : (
                  <FixedBox
                  key={`fixed-box-${cardIndex}`}
                  textBoxes={dynamicColumn}
                  setTextBoxes={setDynamicColumn}
                  i={cardIndex - 21}
                  cardIndex={cardIndex}
                />
                )}
                  </div>
              ) : (
                null
              )}
              <div
                className={styles.overlayCardTextFirstColumn}
                onClick={() => handleLeftText(cardIndex)}
              >
                {dynamicColumn[cardIndex - 21].text.left}
              </div>
              {isEditingThisZoom && <ZoomSlider cardIndex={selectedImage.cardIndex} />}
        </div>
        )
      })}
      {cards}
    </div>)
  }

  const RenderCards = () => {

    const cards = [<RenderDynamicColumn />];

    for (let i = 0; i < 3; i++) {
      const column = [];


      for (let j = 0; j < 7; j++) {

        const cardIndex = j + i * 7;

        const isEditingThisZoom =
          isEditingZoom &&
          selectedImage &&
          selectedImage.cardIndex === cardIndex;

        let images = staticColumns[cardIndex].img;

        const textBoxes = [];


        staticColumns.map((card) => {
          textBoxes.push(card.text)
        })

        column.push(
          <div
            className = {styles.card}
            key={cardIndex}
            onClick={(event) => handleCardClick(cardIndex, event)}
          >
            {images[0] && ( // Check if img[0] exists before rendering
              <img
                src={images[0].src ? images[0].src : ""}
                className={styles.uploadedImage}
                style={{
                  transform: `scale(${images[0].zoom / 100}) translate(${
                    images[0].x
                  }px, ${images[0].y}px)`,
                }}
              />
            )}

            {images[1] && ( // Check if img[1] exists before rendering
              <img
                src={images[1] ? images[1].src : ""}
                className={styles.uploadedImage}
                style={{
                  transform: `scale(${images[1].zoom / 100}) translate(${
                    images[1].x
                  }px, ${images[1].y}px)`,
                }}
              />
            )}
             {staticColumns[cardIndex] && staticColumns[cardIndex].text.renderPriceBox ? (
              <div className="priceBox">
              {staticColumns[cardIndex].text.priceBoxType === true ? (
                <TripleBox
                key={`triple-box-${i}-${j}`}
                textBoxes={staticColumns}
                setTextBoxes={setStaticColumns}
                j={j}
                i={i}
                cardIndex={cardIndex}
              />
              ) : (
                <FixedBox
                key={`fixed-box-${i}-${j}`}
                textBoxes={staticColumns}
                setTextBoxes={setStaticColumns}
                j={j}
                i={i}
                cardIndex={cardIndex}
              />
              )}
                </div>
            ) : (
              null
            )}
            
              <div
                className={styles.overlayCardText}
                onClick={() => handleTopText(cardIndex)}
              >
                {staticColumns[cardIndex].text.top}
              </div>
           
            <div
              className={styles.overlayCardTextLeft}
              onClick={() => handleLeftText(cardIndex)}
            >
              {staticColumns[cardIndex].text.left}
            </div>
            {isEditingThisZoom && <ZoomSlider cardIndex={selectedImage.cardIndex} />}
          </div>
        )
      }

      cards.push(
        <div key={i+1} className={styles.cardColumn}>
          {column}
        </div>
      );
    }
    return cards;
  };

  return (
    <div>
      <button
        style={{
          width: "165px",
          position: "fixed",
          top: "20px",
          left: "15px",
          backgroundColor: "gray",
          color: "white",
        }}
        onClick={handleConvertToPDF}
      >
        Make PDF
      </button>
      <button
        style={{
          width: "165px",
          position: "fixed",
          top: "70px",
          left: "15px",
          backgroundColor: "gray",
          color: "white",
        }}
        onClick={() => navigate("/")}
      >
        Back to Home
      </button>
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
}

export default Grocery;
