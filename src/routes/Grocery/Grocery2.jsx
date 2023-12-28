import React, { useState, useEffect, useRef } from "react";
import styles from "./Grocery.module.css";
import html2pdf from "html2pdf.js"; // Importa la biblioteca html2pdf
import FixedBox from "../../components/BoxWithText/BoxWithText";
import TripleBox from "../../components/TripleBoxWithText/TripleBoxWithText";
import { useNavigate } from "react-router-dom";

const Grocery = () => {
  const contextMenuRef = useRef(null);

  const [uploadedImages, setUploadedImages] = useState(
    Array(32)
      .fill()
      .map((_, index) => ({
        img: [
          { src: "", zoom: 100, x: 0, y: 0 },
          { src: "", zoom: 100, x: 0, y: 0 },
        ],
        index,
      }))
  );

  const [textBoxes, setTextBoxes] = useState(
    Array(32)
      .fill()
      .map((_, index) => ({
        text: { top: "", left: "", bottom: "", type: true },
        index,
      }))
  );

  const [priceBox, setPriceBox] = useState(
    Array(32)
      .fill()
      .map((_, index) => ({ render: index < 11 ? false : true, index }))
  );

  const [contextMenu, setContextMenu] = useState(null);

  const [isEditingZoom, setIsEditingZoom] = useState(false);

  const [selectedImage, setSelectedImage] = useState({});

  const navigate = useNavigate();

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

  const handleImageUpload = (event, cardIndex) => {
    // Added 'cardIndex' parameter
    event.preventDefault();
    const images = [...uploadedImages];
    images.map((image) => {
      if (image.index === cardIndex) {
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
              const newUploadedImages = [...uploadedImages];
              newUploadedImages[cardIndex].img[0].src = result;
              setUploadedImages(newUploadedImages);
            };

            reader.readAsDataURL(file);
          }
        };
        input.click();
      }
    });
  };

  useEffect(() => {
  }, [uploadedImages]);

  useEffect(() => {
    console.log("Component re-rendered");
  }, [priceBox]);

  const handleDeleteImage = (cardIndex, index) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete the image?"
    );

    if (confirmDelete) {
      setUploadedImages((prevImages) => {
        const newUploadedImages = [...prevImages];
        const imageToUpdate = newUploadedImages.find(
          (image) => image.index === cardIndex
        );

        if (imageToUpdate) {
          // Set the src value to an empty string when deleting
          imageToUpdate.img[index].src = "";
        }

        return newUploadedImages;
      });
    }
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

  const ZoomSlider = ({ cardIndex }) => {
    const handleZoomChange = (newZoom, index) => {
      const newUploadedImages = [...uploadedImages];
      newUploadedImages[cardIndex].img[index].zoom = newZoom;
      setUploadedImages(newUploadedImages);
    };
  
    const handlePositionChange = (changeAmount, index, axis) => {
      const newUploadedImages = [...uploadedImages];
      newUploadedImages[cardIndex].img[index][axis] += changeAmount;
      setUploadedImages(newUploadedImages);
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
                  uploadedImages[cardIndex].img[0].zoom - 5, 0
                )
              }
              className={styles.bttnGrid}
            >
              -
            </button>
            <button
              onClick={() =>
                handleZoomChange(
                  uploadedImages[cardIndex].img[0].zoom + 5, 0
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
                  uploadedImages[cardIndex].img[1].zoom - 5, 1
                )
              }
              className={styles.bttnGrid}
            >
              -
            </button>
            <button
              onClick={() =>
                handleZoomChange(
                  uploadedImages[cardIndex].img[1].zoom + 5, 1
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

  const handleContextMenu = (event, cardIndex, image) => {
    event.preventDefault()
    const contextMenuItems = [
      {
        label: "Delete 1",
        action: () => handleDeleteImage(cardIndex, 0),
      },
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

    if (uploadedImages[cardIndex].img[1].src == "") {
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
                const newUploadedImages = [...uploadedImages];
                newUploadedImages[cardIndex].img[1].src = e.target.result;

                setUploadedImages(newUploadedImages);
              };

              reader.readAsDataURL(file);
            }
          };

          input.click();
        },
      });
    } else if (uploadedImages[cardIndex].img[1].src != "") {
      // If both images uploaded, allow editing and deleting the second image
      contextMenuItems.push(
        {
          label: "Delete 2",
          action: () => handleDeleteImage(cardIndex, 1),
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

  const handleCardClick = (cardIndex, event) => {
    // Check if the click event target is not the card element
    if (!event.target.classList.contains(styles.card)) {
      return;
    }
  
    // Rest of the function logic for handling card clicks
    const images = [...uploadedImages];
    const image = uploadedImages[cardIndex];
  
    if (image.img[0].src === "") {
      handleImageUpload(event, cardIndex);
    } else {
      handleContextMenu(event, cardIndex, image);
    }
  };

  const showHidePriceBox = (cardIndex) => {
    
      const newPriceBox = [...priceBox];
      newPriceBox[cardIndex].render = !newPriceBox[cardIndex].render;
      setPriceBox(newPriceBox);
      
  }

  const switchBoxType = (cardIndex) => {
    const newTextBoxes = [...textBoxes];
    newTextBoxes[cardIndex].type =
      newTextBoxes[cardIndex].type === false ? true : false;
    setTextBoxes(newTextBoxes);
  };

  const handleTopText = (cardIndex) => {
    const newText = prompt("Input new text: ");
    if (newText != null) {
      const newTextBoxes = [...textBoxes];
      newTextBoxes[cardIndex].top = newText;
      setTextBoxes(newTextBoxes);
    }
  };

  const handleLeftText = (cardIndex) => {
    const newText = prompt("Input new text: ");
    if (newText != null) {
      const newTextBoxes = [...textBoxes];
      newTextBoxes[cardIndex].left = newText;
      setTextBoxes(newTextBoxes);
    }
  };

  const textBoxLeftStyle = (cardIndex, index) => {
    const textBox = textBoxes[cardIndex];
    if (
      textBox &&
      textBox.text &&
      typeof textBox.text.left !== 'undefined'
    ) {
      return index === 0
        ? styles.overlayCardTextFirstColumn
        : styles.overlayCardTextLeft;
    }
    // Handle the case where textBox or textBox.text or textBox.text.left is undefined
    return "";
  };

  const RenderCards = () => {
    const cards = [];

    for (let i = 0; i < 4; i++) {
      const numCards = i === 0 ? 11 : 7;
      const column = [];

      for (let j = 0; j < numCards; j++) {
        // Adjust the calculation for cardIndex based on the column index
        const cardIndex = i === 0 ? j : (i - 1) * 7 + 11 + j; // Adjusted calculation for subsequent columns
        const renderOverlay = i !== 0;
        const isEditingThisZoom =
          isEditingZoom &&
          selectedImage &&
          selectedImage.cardIndex === cardIndex;

        let images = uploadedImages[cardIndex];

        column.push(
          <div
            className={styles.card}
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

            {priceBox[cardIndex] && priceBox[cardIndex].render ? (
              <div className="priceBox">
              {textBoxes[cardIndex].type === true ? (
                <TripleBox
                key={`triple-box-${i}-${j}`}
                textBoxes={textBoxes}
                setTextBoxes={setTextBoxes}
                j={j}
                i={i}
                cardIndex={cardIndex}
              />
              ) : (
                <FixedBox
                key={`fixed-box-${i}-${j}`}
                textBoxes={textBoxes}
                setTextBoxes={setTextBoxes}
                j={j}
                i={i}
                cardIndex={cardIndex}
              />
              )}
                </div>
            ) : (
              null
            )}
            {renderOverlay && (
              <div
                className={styles.overlayCardText}
                onClick={() => handleTopText(cardIndex)}
              >
                {textBoxes[cardIndex].text.top}
              </div>
            )}
            <div
              className={textBoxLeftStyle(cardIndex, i)}
              onClick={() => handleLeftText(cardIndex)}
            >
              {textBoxes[cardIndex] && textBoxes[cardIndex].text ? (textBoxes[cardIndex].text.left) : ""}
            </div>
            {isEditingThisZoom && <ZoomSlider cardIndex={selectedImage.cardIndex} />}
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
};

export default Grocery;
