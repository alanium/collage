import React, { useEffect, useRef, useState } from "react";
import styles from "./Liquor.module.css"
import { getStorage, listAll, ref } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import TemplatesFromCloud from "../../../components/TemplatesFromCloud/TemplatesFromCloud";
import ImageFromCloud from "../../../components/ImageFromCloud/ImageFromCloud";
import ImageUploader from "../../../components/ImageToCloud/ImageToCloud";
import TextBoxLeft from "../../../components/ParagraphBox/ParagraphBox";
import TopTextBox from "../../../components/TopTextBox/TopTextBox";
import AmountForPrice from "../../../components/AmountForPrice/AmountForPrice";
import TripleBox from "../../../components/TripleBoxWithText/TripleBoxWithText";
import FixedBox from "../../../components/BoxWithText/BoxWithText";
import TextPopUp from "../../../components/TextPopup/TextPopup";
import { html2pdf } from "html2pdf.js";

export default function Liquor() {


  const [staticColumns, setStaticColumns] = useState(
    Array(16)
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
          priceBoxType: 0,
          priceBoxColor: false,
          renderPriceBox: true,
        },
        index,
      }))
  );

  const [contextMenu, setContextMenu] = useState(null);
  const [isEditingZoom, setIsEditingZoom] = useState(false);
  const [selectedImage, setSelectedImage] = useState({});
  const [selectedTextBox, setSelectedTextBox] = useState({});
  const [selectedCardIndex, setSelectedCardIndex] = useState({});
  const [info, setInfo] = useState(false);
  const [popup, setPopup] = useState(false);
  const [type, setType] = useState("");
  const [popup2, setPopup2] = useState(false);
  const [templates, setTemplates] = useState(null);
  const [images, setImages] = useState(null);
  const [imgIndex, setImgIndex] = useState(null);



  const storage = getStorage();
  const imagesRef = ref(storage, "images/");
  const templatesRef = ref(storage, "templates/");
  const navigate = useNavigate();
  const contextMenuRef = useRef(null);



  const handleConvertToPDF = () => {
    const container = document.getElementById("magazineContainer");
  
    if (container) {
      // Clone the container
      const containerClone = container.cloneNode(true);
      containerClone.id = "magazineClone";
  
      // Apply the specified styles to the clone
      containerClone.style.display = "flex";
      containerClone.style.alignItems = "center";
      containerClone.style.justifyContent = "center";
      containerClone.style.position = "relative";
      containerClone.style.zIndex = "0";
      containerClone.style.width = "21cm";
      containerClone.style.height = "14.8cm";
      containerClone.style.backgroundColor = "white";
      containerClone.style.top = "0"
      // Apply overflow hidden to the clone with a height of 100px
      containerClone.style.overflow = "hidden";
      
      document.body.appendChild(containerClone);
  
      const pdfOptions = {
        filename: "grocery_magazine.pdf",
        image: { type: "png", quality: 1 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };
  
      // Generate PDF from the clone
      html2pdf().from(containerClone).set(pdfOptions).save();
  
      // Remove the clone from the DOM after generating PDF
      containerClone.parentNode.removeChild(containerClone);
    }
  };

  const handleImageUpload = (event, cardIndex, img) => {
    // Added 'cardIndex' parameter
    event.preventDefault();
    
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
                newStaticColumns[cardIndex].img[img].src = result;
                setStaticColumns(newStaticColumns);
              };
              reader.readAsDataURL(file);
            }
          };
          input.click();
        }
      });
  };

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

  const RenderInfo = () => {
    return (
      <div className={styles.infoTab}>
        <div>Info:</div>
        <div>
          <label>
            This tab explains how to use the functionalities of the page
          </label>
        </div>
        <div>
          Click on the plus sign to the left column to input the number of cards
          you want to have in the first column
        </div>
        <div>Click on a card to upload an image</div>
        <div>
          Click again on the uploaded image to open the context menu, where you
          can:
          <div>1- Edit the size and position of the image</div>
          <div>2- Show or hide the Price Box</div>
          <div>
            3- Manually change the Price Box Type (not recommended since it can
            lead to unwanted behaviour)
          </div>
          <div>4- Change the price box color</div>
          <div>5- upload a second image</div>
          <div>6- Cancel</div>
        </div>
        <div>
          Click on the Price Box, to write the content of the pricebox:
          <div>
            1. If you write "Number / $Number" the price box type 1 is
            automatically selected
          </div>
          <div>
            2. If you write "Number . Number + each/oz/lb/pk" the price box type
            2 is automatically selected
          </div>
          <div>
            3. If you write "Number for $ Number" the price box type 3 is
            automatically selected
          </div>
        </div>
      </div>
    );
  };

  const handleDeleteImage = (cardIndex, index) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete the image?"
    );
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

          if (
            imageToUpdate.img[0].src == "" &&
            imageToUpdate.img[1].src == ""
          ) {
            setIsEditingZoom(false);
          }
          return newStaticColumns;
        });
      }
  };

  const showHidePriceBox = (cardIndex) => {
      const newStaticColumns = [...staticColumns];
      newStaticColumns[cardIndex].text.renderPriceBox =
      !newStaticColumns[cardIndex].text.renderPriceBox;
      setStaticColumns(newStaticColumns);
  };

  const switchBoxType = (cardIndex) => {
    console.log("switchBoxType");
    
      const newStaticColumns = [...staticColumns];
      if (newStaticColumns[cardIndex].text.priceBoxType < 2) {
        newStaticColumns[cardIndex].text.priceBoxType++;
      } else {
        newStaticColumns[cardIndex].text.priceBoxType = 0;
      }
      setStaticColumns(newStaticColumns);
    
  };

  const changePriceBoxColor = (cardIndex) => {
    
      const newStaticColumns = [...staticColumns];
      newStaticColumns[cardIndex].text.priceBoxColor =
        !newStaticColumns[cardIndex].text.priceBoxColor;
      setStaticColumns(newStaticColumns);
    
  };

  const handleCardClick = (cardIndex, event) => {
    setImgIndex(0)
    const auxIndex = cardIndex > 20 ? cardIndex - 21 : cardIndex;
    if (!event.target.classList.contains(styles.card)) {
      return;
    }
    const image = (cardIndex > 20 ? dynamicColumn : staticColumns)[auxIndex];

    if (image.img[0].src === "" && image.img[1].src === "") {
      setPopup2(true);
      setSelectedCardIndex(cardIndex);
    } else {
      handleContextMenu(event, cardIndex, image);
    }
  };

  const saveTemplate = (event) => {
    const newText = prompt("Enter template name: ");
    if (newText) {
      const blob = new Blob(
        [
          JSON.stringify({
            columns: staticColumns,
          }),
        ],
        { type: "application/json" }
      );
      const url = URL.createObjectURL(blob);
  
      const a = document.createElement("a");
      a.href = url;
      a.download = `${newText}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getImageList = () => {
    listAll(imagesRef)
      .then((result) => {
        // 'items' is an array that contains references to each item in the list
        const items = result.items;

        // Extract image names from references
        const names = items.map((item) => item.name);

        setImages(names);
        console.log(names);
      })
      .then(() => setPopup2(false))
      .catch((error) => {
        console.log(error);
      });
  };

  const loadTemplate = (event) => {
    event.preventDefault();
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json"; // Corrected file extension
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target.result;
          try {
            const parsedResult = JSON.parse(result);
            setStaticColumns(parsedResult.columns);
          } catch (error) {
            console.error("Error parsing JSON:", error);
          }
        };
        reader.readAsText(file); // Use readAsText to read JSON content
      }
    };
    input.click();
  };

  const uploadTemplateToCloud = async () => {
    const fileName = prompt('Enter the name of the file');
    const fileContent = JSON.stringify({
      columns: staticColumns,
    });
  
    // Validate file name and content
    if (!fileName || fileName.trim() === "") {
      console.error("File name is required");
      return;
    }
  
    const blob = new Blob([fileContent], { type: "text/plain" });
  
    if (fileName && blob) {
      try {
        const storageRef = ref(storage, `templates/${fileName}`);
        await uploadBytes(storageRef, blob);
        console.log("File uploaded successfully");
      } catch (error) {
        console.error("Error uploading file:", error.message);
      }
    } else {
      console.error("File name and content are required");
    }
  };

  const downloadTemplateFromCloud = (event) => {
    listAll(templatesRef)
      .then((result) => {

        const items = result.items;
        const names = items.map((item) => item.name);
        setTemplates(names);
        console.log(names);

      })
      .catch((error) => {
        console.log(error);
      });
  };

  const renderPriceBox = (
    number,
    column,
    setColumn,
    cardIndex,
    backgroundColor
  ) => {
    const priceBoxes = [
      <FixedBox
        key={`fixed-box-${cardIndex}`}
        textBoxes={column}
        setTextBoxes={setColumn}
        backgroundColor={backgroundColor}
        i={cardIndex}
        cardIndex={cardIndex}
      />,
      <TripleBox
        key={`fixed-box-${cardIndex}`}
        textBoxes={column}
        setTextBoxes={setColumn}
        backgroundColor={backgroundColor}
        i={cardIndex}
        cardIndex={cardIndex}
      />,
      <AmountForPrice
        key={`fixed-box-${cardIndex}`}
        textBoxes={column}
        setTextBoxes={setColumn}
        backgroundColor={backgroundColor}
        i={cardIndex}
        cardIndex={cardIndex}
      />,
    ];

    return priceBoxes[number];
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
        zIndex: "1000",
        color: "gray",
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
        style={{
          cursor: "pointer",
          padding: "5px",
          borderTop: "1px solid #ccc",
          marginTop: "5px",
        }}
        onClick={() => onClose()} // Agrega una opción para cancelar y cerrar el menú contextual
      >
        Cancel
      </div>
    </div>
  );

  const handleContextMenu = (event, cardIndex, column, image) => {
    event.preventDefault();

    const selectedColumn = cardIndex > 20 ? dynamicColumn : staticColumns;

    const index = cardIndex > 20 ? cardIndex - 21 : cardIndex;

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
        label: "Box1/Box2/Box3",
        action: () => switchBoxType(cardIndex),
      },
      {
        label: "Change PriceBox Color",
        action: () => changePriceBoxColor(cardIndex),
      },
    ];

    if (selectedColumn[index].img[1].src == "") {
      // If only one image uploaded, allow uploading the second image
      contextMenuItems.push({
        label: "Upload Image 2",
        action: () => {
          setImgIndex(1)
          setPopup2(true);
          setSelectedCardIndex(cardIndex);
        },
      });
    } else if (selectedColumn[index].img[1].src != "") {
      // If both images uploaded, allow editing and deleting the second image
      contextMenuItems.push({
        label: "Delete 2",
        action: () => handleDeleteImage(cardIndex, 1),
      });
    }
    if (selectedColumn[index].img[0].src == "") {
      contextMenuItems.push({
        label: "Upload 1",
        action: () => { setImgIndex(0)
          setPopup2(true);
          setSelectedCardIndex(cardIndex);},
      });
    }
    if (selectedColumn[index].img[0].src != "") {
      contextMenuItems.push({
        label: "Delete 1",
        action: () => handleDeleteImage(cardIndex, 0),
      });
    }

    const containerRect = contextMenuRef.current.getBoundingClientRect();
    setContextMenu({
      x: event.clientX - containerRect.left,
      y: event.clientY - containerRect.top,
      items: contextMenuItems,
    });
  };

  const ZoomSlider = ({ cardIndex }) => {
    const auxIndex = cardIndex > 20 ? cardIndex - 21 : cardIndex;

    const column = cardIndex > 20 ? dynamicColumn : staticColumns;

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
        {column[auxIndex].img[0].src != "" ? (
          <div className={styles.zoomSliderContainer}>
            <label>Image 1</label>
            <div className={styles.zoomControlsGrid}>
              <button
                onClick={() =>
                  handleZoomChange(
                    (cardIndex > 20 ? dynamicColumn : staticColumns)[auxIndex]
                      .img[0].zoom - 5,
                    0
                  )
                }
                className={styles.bttnGrid}
              >
                -
              </button>
              <button
                onClick={() =>
                  handleZoomChange(
                    (cardIndex > 20 ? dynamicColumn : staticColumns)[auxIndex]
                      .img[0].zoom + 5,
                    0
                  )
                }
                className={styles.bttnGrid}
              >
                +
              </button>
              <button
                className={styles.bttnGrid}
                onClick={() => handlePositionChange(-5, 0, "y")}
              >
                up
              </button>
              <button
                className={styles.bttnGrid}
                onClick={() => handlePositionChange(5, 0, "y")}
              >
                down
              </button>
              <button
                className={styles.bttnGrid}
                onClick={() => handlePositionChange(-5, 0, "x")}
              >
                left
              </button>
              <button
                className={styles.bttnGrid}
                onClick={() => handlePositionChange(5, 0, "x")}
              >
                right
              </button>
            </div>
          </div>
        ) : null}

        {column[auxIndex].img[1].src != "" ? (
          <div className={styles.zoomSliderContainer}>
            <label>Image 2</label>
            <div className={styles.zoomControlsGrid}>
              <button
                onClick={() =>
                  handleZoomChange(
                    (cardIndex > 20 ? dynamicColumn : staticColumns)[auxIndex]
                      .img[1].zoom - 5,
                    1
                  )
                }
                className={styles.bttnGrid}
              >
                -
              </button>
              <button
                onClick={() =>
                  handleZoomChange(
                    (cardIndex > 20 ? dynamicColumn : staticColumns)[auxIndex]
                      .img[1].zoom + 5,
                    1
                  )
                }
                className={styles.bttnGrid}
              >
                +
              </button>
              <button
                className={styles.bttnGrid}
                onClick={() => handlePositionChange(-5, 1, "y", 0)}
              >
                up
              </button>
              <button
                className={styles.bttnGrid}
                onClick={() => handlePositionChange(5, 1, "y")}
              >
                down
              </button>
              <button
                className={styles.bttnGrid}
                onClick={() => handlePositionChange(-5, 1, "x")}
              >
                left
              </button>
              <button
                className={styles.bttnGrid}
                onClick={() => handlePositionChange(5, 1, "x")}
              >
                right
              </button>
            </div>
          </div>
        ) : null}
        <div className={styles.zoomSliderContainer}>
          {column[auxIndex].img[0].src != "" ? (
            <button
              className={styles.confirmButton}
              style={{ backgroundColor: "red" }}
              onClick={() => handleDeleteImage(cardIndex, 0)}
            >
              Delete 1
            </button>
          ) : null}

          {column[auxIndex].img[1].src != "" ? (
            <button
              className={styles.confirmButton}
              style={{ backgroundColor: "red" }}
              onClick={() => handleDeleteImage(cardIndex, 1)}
            >
              Delete 2
            </button>
          ) : null}
          <button className={styles.confirmButton} onClick={handleConfirmClick}>
            OK
          </button>
        </div>
      </div>
    );
  };

  const RenderCards = () => {
    const cards = [];

    for (let i = 0; i < 4; i++) {
      const column = [];

      for (let j = 0; j < 4; j++) {
        const cardIndex = j + i * 4;

        const isEditingThisZoom =
          isEditingZoom &&
          selectedImage &&
          selectedImage.cardIndex === cardIndex;

        let images = staticColumns[cardIndex].img;

        const textBoxes = [];

        staticColumns.map((card) => {
          textBoxes.push(card.text);
        });

        column.push(
          <div
            className={styles.card}
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
            {staticColumns[cardIndex] &&
            staticColumns[cardIndex].text.renderPriceBox ? (
              <div className="priceBox">
                {renderPriceBox(
                  staticColumns[cardIndex].text.priceBoxType,
                  staticColumns,
                  setStaticColumns,
                  cardIndex,
                  staticColumns[cardIndex].text.priceBoxColor
                )}
              </div>
            ) : null}

            <TopTextBox
              textBoxes={staticColumns}
              setTextBoxes={setStaticColumns}
              cardIndex={cardIndex}
              setPopup={setPopup}
              setSelectedTextBox={setSelectedTextBox}
              setType={setType}
              setSelectedImage={setSelectedImage}
            />

            <TextBoxLeft
              textBoxes={staticColumns}
              setTextBoxes={setStaticColumns}
              cardIndex={cardIndex}
              setPopup={setPopup}
              setSelectedTextBox={setSelectedTextBox}
              setType={setType}
              setSelectedImage={setSelectedImage}
            />
            {isEditingThisZoom && (
                  <ZoomSlider cardIndex={selectedImage.cardIndex} />
                )}
          </div>
        );
      }

      cards.push(
        <div key={i + 1} className={styles.cardColumn}>
          {column}
        </div>
      );
    }
    return cards;
  };

  return (
    <div >
      {popup ? (
        <TextPopUp
          textBox={selectedImage.cardIndex > 20 ? dynamicColumn : staticColumns}
          setTextBox={
            selectedImage.cardIndex > 20 ? setDynamicColumn : setStaticColumns
          }
          setPopup={setPopup}
          cardIndex={selectedImage}
          type={type}
        />
      ) : null}

      {popup2 ? (
        <div className={styles.infoTab} style={{ zIndex: "1" }}>
          <label>
            Do you wish to upload an image from your machine or use an image
            from the database?
          </label>
          <button
            onClick={(event) => handleImageUpload(event, selectedCardIndex, imgIndex)}
          >
            Import from your device
          </button>
          <button onClick={(event) => getImageList(event)}>
            Import from database
          </button>
          <button onClick={() => setPopup2(false)}>Close</button>
        </div>
      ) : null}

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
      <div className={styles.sidebar} style={{ top: "120px" }}>
        <div
          style={{
            position: "relative",
            left: "12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            padding: "3px",
          }}
        >
          <button
            style={{
              width: "165px",
              position: "relative",
              backgroundColor: "gray",
              color: "white",
              marginBottom: "10px",
              zIndex: "1",
            }}
            onClick={() => setInfo(!info)}
          >
            Info
          </button>
          
          <button
            style={{
              width: "165px",
              position: "relative",
              backgroundColor: "gray",
              marginBottom: "10px",
              color: "white",
            }}
            onClick={(event) => saveTemplate(event)}
          >
            Download Template
          </button>
          <button
            style={{
              width: "165px",
              position: "relative",
              backgroundColor: "gray",
              color: "white",
              marginBottom: "10px",
            }}
            onClick={(event) => loadTemplate(event)}
          >
            Load Template
          </button>
          <button
            style={{
              width: "165px",
              position: "relative",
              backgroundColor: "gray",
              color: "white",
              marginBottom: "10px",
            }}
            onClick={(event) => uploadTemplateToCloud(event)}
          >
            Upload Template To Cloud
          </button>
          <button
            style={{
              width: "165px",
              position: "relative",
              backgroundColor: "gray",
              color: "white",
              marginBottom: "10px",
            }}
            onClick={(event) => downloadTemplateFromCloud(event)}
          >
            Download Template From Cloud
          </button>
          <ImageUploader />
        </div>
      </div>

      <div id="magazineContainer" className={styles.containerDivBorder}>
        <div  className={styles.containerDiv} ref={contextMenuRef}>
          <RenderCards />

          {contextMenu && (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              items={contextMenu.items}
              onClose={() => setContextMenu(null)}
            />
          )}
          <div className={styles.overlay}>LIQUOR</div>
        </div>
      </div>
      {info ? <RenderInfo /> : null}
      {images != null ? (
        <ImageFromCloud
          images={images}
          cardIndex={selectedCardIndex}
          selectedColumn={
            selectedCardIndex > 20 ? dynamicColumn : staticColumns
          }
          setSelectedColumn={
            selectedCardIndex > 20 ? setDynamicColumn : setStaticColumns
          }
          setImages={setImages}
          imgIndex={imgIndex}
        />
      ) : null}
      {templates != null ? (
        <TemplatesFromCloud
          templates={templates}
          setDynamicColumn={setDynamicColumn}
          setStaticColumns={setStaticColumns}
          setTemplates={setTemplates}
        />
      ) : null}
    </div>
  );
}
