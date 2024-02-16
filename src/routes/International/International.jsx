import React, { useState, useEffect, useRef } from "react";
import styles from "./International.module.css";
import html2pdf from "html2pdf.js"; // Importa la biblioteca html2pdf
import FixedBox from "../../components/BoxWithText/BoxWithText";
import TripleBox from "../../components/TripleBoxWithText/TripleBoxWithText";
import { useNavigate } from "react-router-dom";
import AmountForPrice from "../../components/AmountForPrice/AmountForPrice";
import TextBoxLeft from "../../components/ParagraphBox/ParagraphBox";
import TopTextBox from "../../components/TopTextBox/TopTextBox";
import TextPopUp from "../../components/TextPopup/TextPopup";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";
import ImageUploader from "../../components/ImageToCloud/ImageToCloud";
import { getStorage, ref, listAll, uploadBytes } from "firebase/storage";
import ImageFromCloud from "../../components/ImageFromCloud/ImageFromCloud";
import TemplatesFromCloud from "../../components/TemplatesFromCloud/TemplatesFromCloud";
import ZoomSlider from "../../components/ZoomSlider/ZoomSlider";
import ResizableImage from "../../components/ResizableImage/ResizableImage";
import ManageTemplates from "../../components/ManageTemplates/ManageTemplates";
import ImageCropper from "../../components/ImageCropper/ImageCropper";

const firebaseConfig = {
  apiKey: "AIzaSyDMKLSUrT76u5rS-lGY8up2ra9Qgo2xLvc",
  authDomain: "napervillecollageapp.firebaseapp.com",
  projectId: "napervillecollageapp",
  storageBucket: "napervillecollageapp.appspot.com",
  messagingSenderId: "658613882469",
  appId: "1:658613882469:web:23da7f1eb31c54a021808c",
  measurementId: "G-DNB21PCJ7T",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function International() {
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
          priceBoxType: 0,
          priceBoxColor: false,
          renderPriceBox: true,
          priceBoxBorder: true,
        },
        index,
      }))
  );

  const [dynamicColumn, setDynamicColumn] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [isEditingZoom, setIsEditingZoom] = useState(false);
  const [selectedImage, setSelectedImage] = useState({});
  const [selectedTextBox, setSelectedTextBox] = useState({});
  const [isCroppingImage, setIsCroppingImage] = useState(false)
  const [selectedCardIndex, setSelectedCardIndex] = useState({});

  const [info, setInfo] = useState(false);
  const [popup, setPopup] = useState(false);
  const [popup3, setPopup3] = useState(false);
  const [popup4, setPopup4] = useState(false);
  const [type, setType] = useState("");

  const [popup2, setPopup2] = useState(false);

  const [templates, setTemplates] = useState(null);

  const [images, setImages] = useState(null);

  const [imgIndex, setImgIndex] = useState(null);

  const storage = getStorage();

  const imagesRef = ref(storage, "images/International");

  const templatesRef = ref(storage, "templates/");

  const navigate = useNavigate();
  const contextMenuRef = useRef(null);

  const handleConvertToPDF = async () => {
    const container = document.getElementById("magazineContainer");

    if (container) {

        await downloadExternalImages(container);

        const pdfOptions = {
            filename: "grocery_magazine.pdf",
            image: { type: "png", quality: 1 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        };

        container.style.top = "0"
        // Generar PDF desde el clon
        await html2pdf().from(container).set(pdfOptions).save()

        container.style.top = "100px"
    }
  };

  const downloadExternalImages = async (container) => {
      const images = container.querySelectorAll("img");
      const promises = [];

      images.forEach((img) => {
          if (img.src.startsWith("http")) {
              promises.push(new Promise((resolve, reject) => {
                  const xhr = new XMLHttpRequest();
                  xhr.open("GET", img.src, true);
                  xhr.responseType = "blob";
                  xhr.onload = () => {
                      if (xhr.status === 200) {
                          const blob = xhr.response;
                          const urlCreator = window.URL || window.webkitURL;
                          const imageUrl = urlCreator.createObjectURL(blob);
                          img.src = imageUrl;
                          resolve();
                      } else {
                          reject(xhr.statusText);
                      }
                  };
                  xhr.onerror = () => {
                      reject(xhr.statusText);
                  };
                  xhr.send();
              }));
          }
      });
      await Promise.all(promises);
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
          priceBoxType: 0,
          priceBoxColor: false,
          renderPriceBox: false,
          priceBoxBorder: true,
        },
        index: i + 21,
      };
      cards.push(card);
    }
    setDynamicColumn(cards);
  };

  const handleImageUpload = (event, cardIndex, img) => {
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
                newDynamicColumn[cardIndex - 21].img[img].src = result;
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
                newStaticColumns[cardIndex].img[img].src = result;
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

          if (
            imageToUpdate.img[0].src == "" &&
            imageToUpdate.img[1].src == ""
          ) {
            setIsEditingZoom(false);
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

          if (
            imageToUpdate.img[0].src == "" &&
            imageToUpdate.img[1].src == ""
          ) {
            setIsEditingZoom(false);
          }

          return newStaticColumns;
        });
      }
    }
  };

  const showHidePriceBox = (cardIndex) => {
    if (cardIndex > 20) {
      const newDynamicColumn = [...dynamicColumn];
      newDynamicColumn[cardIndex - 21].text.renderPriceBox =
        !newDynamicColumn[cardIndex - 21].text.renderPriceBox;
      setDynamicColumn(newDynamicColumn);
    } else {
      const newStaticColumns = [...staticColumns];
      newStaticColumns[cardIndex].text.renderPriceBox =
        !newStaticColumns[cardIndex].text.renderPriceBox;
      setStaticColumns(newStaticColumns);
    }
  };

  const switchBoxType = (cardIndex) => {
    console.log("switchBoxType");
    if (cardIndex > 20) {
      const newDynamicColumn = [...dynamicColumn];
      if (newDynamicColumn[cardIndex - 21].text.priceBoxType < 2) {
        newDynamicColumn[cardIndex - 21].text.priceBoxType++;
      } else {
        newDynamicColumn[cardIndex - 21].text.priceBoxType = 0; // Reset to 0 if it's already 3
      }
      setDynamicColumn(newDynamicColumn);
    } else {
      const newStaticColumns = [...staticColumns];
      if (newStaticColumns[cardIndex].text.priceBoxType < 2) {
        newStaticColumns[cardIndex].text.priceBoxType++;
      } else {
        newStaticColumns[cardIndex].text.priceBoxType = 0;
      }
      setStaticColumns(newStaticColumns);
    }
  };

  const changePriceBoxColor = (cardIndex) => {
    if (cardIndex > 20) {
      const newDynamicColumn = [...dynamicColumn];
      newDynamicColumn[cardIndex - 21].text.priceBoxColor =
        !newDynamicColumn[cardIndex - 21].text.priceBoxColor;
      setDynamicColumn(newDynamicColumn);
    } else {
      const newStaticColumns = [...staticColumns];
      newStaticColumns[cardIndex].text.priceBoxColor =
        !newStaticColumns[cardIndex].text.priceBoxColor;
      setStaticColumns(newStaticColumns);
    }
  };

  const handleCropImage = () => {
    setIsCroppingImage(true)
  }

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
      {
        label: "Change PriceBox Border",
        action: () => changePriceBoxBorder(cardIndex),
      }
    ];

    if (selectedColumn[index].img[1].src == "") {
      // If only one image uploaded, allow uploading the second image
      contextMenuItems.push({
        label: "Upload Image 2",
        action: () => {
          setImgIndex(1);
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
        action: () => {
          setImgIndex(0);
          setPopup2(true);
          setSelectedCardIndex(cardIndex);
        },
      });
    }
    if (selectedColumn[index].img[0].src != "") {
      contextMenuItems.push({
        label: "Delete 1",
        action: () => handleDeleteImage(cardIndex, 0),
      });
    } if (selectedColumn[index].img[0].src != "") {
      contextMenuItems.push({
        label: "crop image 1",
        action: () => {
          setImgIndex(0)
          handleCropImage(cardIndex, imgIndex)},
      });
    } if (selectedColumn[index].img[1].src != "") {
      contextMenuItems.push({
        label: "crop image 2",
        action: () => {
          setImgIndex(1)
          handleCropImage(cardIndex, imgIndex)},
      });
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

    setImgIndex(0);

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

  const changePriceBoxBorder = (cardIndex) => {
    if (cardIndex > 20) {
      const newDynamicColumn = [...dynamicColumn];
      newDynamicColumn[cardIndex - 21].text.priceBoxBorder =
        !newDynamicColumn[cardIndex - 21].text.priceBoxBorder;
      setDynamicColumn(newDynamicColumn);
    } else {
      const newStaticColumns = [...staticColumns];
      newStaticColumns[cardIndex].text.priceBoxBorder =
        !newStaticColumns[cardIndex].text.priceBoxBorder;
      setStaticColumns(newStaticColumns);
    }
  }

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

  

  const renderPriceBox = (
    number,
    column,
    setColumn,
    cardIndex,
    backgroundColor,
    priceBoxBorder
  ) => {
    const priceBoxes = [
      <FixedBox
        key={`fixed-box-${cardIndex}`}
        textBoxes={column}
        setTextBoxes={setColumn}
        backgroundColor={backgroundColor}
        i={cardIndex}
        cardIndex={cardIndex}
        priceBoxBorder={priceBoxBorder}
      />,
      <TripleBox
        key={`fixed-box-${cardIndex}`}
        textBoxes={column}
        setTextBoxes={setColumn}
        backgroundColor={backgroundColor}
        i={cardIndex}
        cardIndex={cardIndex}
        priceBoxBorder={priceBoxBorder}
      />,
      <AmountForPrice
        key={`fixed-box-${cardIndex}`}
        textBoxes={column}
        setTextBoxes={setColumn}
        backgroundColor={backgroundColor}
        i={cardIndex}
        cardIndex={cardIndex}
        priceBoxBorder={priceBoxBorder}
      />,
    ];

    return priceBoxes[number];
  };

  const RenderDynamicColumn = () => {
    let cards = [];

    const isFirstColumnEmpty = dynamicColumn.length === 0;

    return isFirstColumnEmpty ? (
      <div
        className={styles.firstCardColumn}
        style={{ justifyContent: "center" }}
        onClick={(event) => handleDynamicColumns(event)}
      >
        <label style={{ fontSize: "84px", textAlign: "center", color: "gray" }}>
          +
        </label>
      </div>
    ) : (
      <div className={styles.firstCardColumn}>
        {dynamicColumn.map((card) => {
          const cardIndex = card.index;
          const isEditingThisZoom =
            isEditingZoom &&
            selectedImage &&
            selectedImage.cardIndex !== undefined &&
            selectedImage.cardIndex === cardIndex;

            if (cardIndex - 21 <= 0) {
              console.log(cardIndex)
            }

          let images = { ...card };

          cards.push(
            <div
              name={`card-${cardIndex}`}
              className={styles.card}
              style={{}}
              key={cardIndex}
              onClick={(event) => handleCardClick(cardIndex, event)}
            >
              {images.img[0] && ( // Check if img[0] exists before rendering
                <img
                  name={`image-${cardIndex}-0`}
                  src={images.img[0].src ? images.img[0].src : ""}
                  className={styles.uploadedImage}
                  style={{
                    transform: `scale(${images.img[0].zoom / 100}) translate(${
                      images.img[0].x / ( images.img[0].zoom / 100)
                    }px, ${images.img[0].y / ( images.img[0].zoom / 100)}px)`,
                  }}
                />
              )}

              {images.img[1] && ( // Check if img[1] exists before rendering
                <img
                  name={`image-${cardIndex}-1`}
                  src={images.img[1] ? images.img[1].src : ""}
                  className={styles.uploadedImage}
                  style={{
                    transform: `scale(${images.img[1].zoom / 100}) translate(${
                      images.img[1].x / ( images.img[1].zoom / 100)
                    }px, ${images.img[1].y / ( images.img[1].zoom / 100)}px)`,
                  }}
                />
              )}
              {dynamicColumn[cardIndex - 21] &&
              dynamicColumn[cardIndex - 21].text.renderPriceBox ? (
                <div className="priceBox">
                  {renderPriceBox(
                    dynamicColumn[cardIndex - 21].text.priceBoxType,
                    dynamicColumn,
                    setDynamicColumn,
                    cardIndex - 21,
                    dynamicColumn[cardIndex - 21].text.priceBoxColor,
                    staticColumns[cardIndex - 21].text.priceBoxBorder
                  )}
                </div>
              ) : null}
              <TextBoxLeft
                textBoxes={dynamicColumn}
                setTextBoxes={setDynamicColumn}
                cardIndex={cardIndex}
                setPopup={setPopup}
                setSelectedTextBox={setSelectedTextBox}
                setType={setType}
                setSelectedImage={setSelectedImage}
                index={cardIndex - 21}
                maxCardPosition={20}
              />
            </div>
          );
        })}
        {cards}
      </div>
    );
  };

  const RenderCards = () => {
    const cards = [];

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
          textBoxes.push(card.text);
        });

        column.push(
          <div
          name={`card-${cardIndex}`}
            className={styles.card}
            key={cardIndex}
            onClick={(event) => handleCardClick(cardIndex, event)}
          >
            {images[0] && ( // Check if img[0] exists before rendering
              <img
                name={`image-${cardIndex}-0`}
                src={images[0].src ? images[0].src : ""}
                className={styles.uploadedImage}
                style={{
                  transform: `scale(${images[0].zoom / 100}) translate(${
                    images[0].x / ( images[0].zoom / 100)
                  }px, ${images[0].y / ( images[0].zoom / 100)}px)`,
                }}
              />
            )}

            {images[1] && ( // Check if img[1] exists before rendering
              <img
                name={`image-${cardIndex}-1`}
                src={images[1] ? images[1].src : ""}
                className={styles.uploadedImage}
                style={{
                  transform: `scale(${images[1].zoom / 100}) translate(${
                    images[1].x / ( images[1].zoom / 100)
                  }px, ${images[1].y / ( images[1].zoom / 100)}px)`,
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
                  staticColumns[cardIndex].text.priceBoxColor,
                  staticColumns[cardIndex].text.priceBoxBorder
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
              index={cardIndex}
            />

            <TextBoxLeft
              textBoxes={staticColumns}
              setTextBoxes={setStaticColumns}
              cardIndex={cardIndex}
              setPopup={setPopup}
              setSelectedTextBox={setSelectedTextBox}
              setType={setType}
              setSelectedImage={setSelectedImage}
              index={cardIndex}
            />
          </div>
        );
      }

      cards.push(
        <div key={i} className={styles.cardColumn}>
          {column}
        </div>
      );
    }
    cards.push(<RenderDynamicColumn />)
    return cards;
  };

  return (
    <div>
      {popup ? (
        <TextPopUp
          textBox={selectedImage.cardIndex > 20 ? dynamicColumn : staticColumns}
          setTextBox={
            selectedImage.cardIndex > 20 ? setDynamicColumn : setStaticColumns
          }
          setPopup={setPopup}
          cardIndex={selectedImage}
          type={type}
          maxCardPosition={20}
        />
      ) : null}
      {isEditingZoom && (
        <ResizableImage 
          cardIndex={selectedImage.cardIndex > 20 ? selectedImage.cardIndex - 21 : selectedImage.cardIndex}
          selectedColumn={selectedImage.cardIndex > 20 ? dynamicColumn : staticColumns}
          setSelectedColumn={selectedImage.cardIndex > 20 ? setDynamicColumn : setStaticColumns}
          setIsEditingZoom={setIsEditingZoom}
          cardNumber={selectedImage.cardIndex}
          imageFolder="International"
          />
      )}
      {isCroppingImage && (
        <ImageCropper src={
          selectedCardIndex > 20 ? dynamicColumn[selectedCardIndex  - 21].img[imgIndex].src : staticColumns[selectedCardIndex ].img[imgIndex].src
        }
        setIsCroppingImage={
          setIsCroppingImage
        }
        selectedColumn={selectedCardIndex > 20 ? dynamicColumn : staticColumns}
        setSelectedColumn={
          selectedCardIndex > 20 ? setDynamicColumn : setStaticColumns
        }
        selectedCardIndex={selectedCardIndex}
        imageIndex={imgIndex}
        imageFolder="International"
        />
      )} 
      {popup2 ? (
        <div className={styles.popUp2} style={{ zIndex: "1" }}>
          <button
            className={styles.actionButton}
            onClick={(event) =>
              handleImageUpload(event, selectedCardIndex, imgIndex)
            }
          >
            Import from Device
          </button>
          <button
            className={styles.actionButton}
            onClick={(event) => getImageList(event)}
          >
            Import from Database
          </button>
          <button
            className={styles.closeButton}
            onClick={() => setPopup2(false)}
          >
            Close
          </button>
        </div>
      ) : null}

      {popup3 ? (
        <div className={styles.popUp2} style={{top: "40%", left: "50%", position: "absolute", zIndex: "1"}}>
          <div>
            Do you really wish to go back?
          </div>  
          <div>
            <button
              onClick={() => navigate("/")}
            >
              Yes
            </button>
            <button
              onClick={() => setPopup3(false)}
            >
              No
            </button>
          </div>
        </div>
      ) : null}
      {popup4 ? (
        <ManageTemplates
        dynamicColumn={dynamicColumn}
        staticColumns={staticColumns}
        setDynamicColumn={setDynamicColumn}
        setStaticColumns={setStaticColumns}
        templates={templates}
        setTemplates={setTemplates}
        setPopup4={setPopup4}
        templateFolder="International"
        />
      ): null}

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
        onClick={() => setPopup3(true)}
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
              color: "white",
              marginBottom: "10px",
            }}
            onClick={() => setPopup4(true)}
          >
            Open Template Manager
          </button>

          
          <ImageUploader imageFolder="International" />
        </div>
      </div>

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
          <div className={styles.overlay}>INTERNATIONAL</div>
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
          maxCardPosition={20}
          imageFolder="International"
        />
      ) : null}

    </div>
  );
}

export default International;
