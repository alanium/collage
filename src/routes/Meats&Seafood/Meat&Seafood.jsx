import React, { useEffect, useRef, useState } from "react";
import styles from "./Meat&Seafood.module.css";
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
import { getStorage, ref, listAll, uploadBytes, getDownloadURL } from "firebase/storage";
import ImageFromCloud from "../../components/ImageFromCloud/ImageFromCloud";
import ResizableImage from "../../components/ResizableImage/ResizableImage";
import ManageTemplates from "../../components/ManageTemplates/ManageTemplates";
import ImageCropper from "../../components/ImageCropper/ImageCropper";
import { db } from "../root";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import AutomaticImageCropper from "../../components/AutomaticImageCropper/AutomaticImageCropper";

const groceryRef = collection(db, "Meats&Seafood");
const templatesQuerySnapshot = await getDocs(groceryRef);

export default function MeatAndSeafood() {
  const cardsInStatic = 18;
  const maxStaticIndex = cardsInStatic - 1;

  const [staticColumns, setStaticColumns] = useState(
    Array(cardsInStatic)
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
  const [isCroppingImage, setIsCroppingImage] = useState(false);
  const [isAutomaticCropping, setIsAutomaticCropping] = useState(false);
  const [selectedImage, setSelectedImage] = useState({});
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [info, setInfo] = useState(false);
  const [popup, setPopup] = useState(false);
  const [type, setType] = useState("");
  const [popup2, setPopup2] = useState(false);
  const [popup3, setPopup3] = useState(false);
  const [popup4, setPopup4] = useState(false);
  const [templates, setTemplates] = useState(null);
  const [images, setImages] = useState(null);
  const [imgIndex, setImgIndex] = useState(null);
  const [selectedTextBox, setSelectedTextBox] = useState({});
  const [templateName, setTemplateName] = useState(templatesQuerySnapshot[0]);

  const maintenance = false
  const imageFolder = (selectedCardIndex > maxStaticIndex ? "seafood" : "meat")
  const storage = getStorage();
  const imagesRef = ref(
    storage,
    selectedCardIndex > maxStaticIndex ? "images/seafood" : "images/meat"
  );
  const templatesRef = ref(storage, "templates/");
  const navigate = useNavigate();
  const contextMenuRef = useRef(null);

  useEffect(() => {
    const unsubscribeStaticColumns = onSnapshot(
      doc(db, `Meats&Seafood/${templateName}`),
      (snapshot) => {
        if (snapshot.exists()) {
          console.log(
            "Static Columns Snapshot:",
            snapshot.data().staticColumns
          );
          setStaticColumns(snapshot.data().staticColumns);
        }
      }
    );

    const unsubscribeDynamicColumn = onSnapshot(
      doc(db, `Meats&Seafood/${templateName}`),
      (snapshot) => {
        if (snapshot.exists()) {
          console.log(
            "Dynamic Column Snapshot:",
            snapshot.data().dynamicColumn
          );
          setDynamicColumn(snapshot.data().dynamicColumn);
        }
      }
    );

    return () => {
      unsubscribeStaticColumns();
      unsubscribeDynamicColumn();
    };
  }, [templateName]);

  const uploadDataToFirebase = async () => {
    try {
      // Upload staticColumns to a document in "Grocery" collection
      await setDoc(doc(db, `Meats&Seafood/${templateName}`), {
        staticColumns: staticColumns,
        dynamicColumn: dynamicColumn,
      });

      console.log("Data uploaded successfully!");
    } catch (error) {
      console.error("Error uploading data:", error);
    }
  };

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

      container.style.top = "0";
      // Generar PDF desde el clon
      await html2pdf().from(container).set(pdfOptions).save();

      container.style.top = "100px";
    }
  };

  const downloadExternalImages = async (container) => {
    const images = container.querySelectorAll("img");
    const promises = [];

    images.forEach((img) => {
      if (
        img.src &&
        new URL(img.src).host != window.location.host &&
        img.src.startsWith("http")
      ) {
        promises.push(
          new Promise((resolve, reject) => {
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
          })
        );
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
        index: i + cardsInStatic,
      };
      cards.push(card);
    }
    setDynamicColumn([...cards]),
      () => {
        uploadDataToFirebase();
      };
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
              const uploadedImageRef = ref(storage, `images/${imageFolder}/${file.name}`)
              uploadBytes(uploadedImageRef, file).then((snapshot) => {
                getDownloadURL(ref(storage, `images/${imageFolder}/${file.name}` ))
                .then((url) => {
                  const newDynamicColumn = [...dynamicColumn];
                  newDynamicColumn[cardIndex].img[img].src = url;
                  setDynamicColumn(newDynamicColumn);
                })
                console.log('Uploaded a blob or file!');
              });
             
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
              const uploadedImageRef = ref(storage, `images/${imageFolder}/${file.name}`)
              uploadBytes(uploadedImageRef, file).then((snapshot) => {
                getDownloadURL(ref(storage, `images/${imageFolder}/${file.name}` ))
                .then((url) => {
                  const newStaticColumns = [...staticColumns];
                  newStaticColumns[cardIndex].img[img].src = url;
                  setStaticColumns(newStaticColumns);
                })
              });
            }
          };
          input.click();
        }
      });
    }
    setPopup2(false);
    uploadDataToFirebase()
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

    if (cardIndex > 17) {
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
    const calculatedCardIndex = cardIndex - cardsInStatic;

    if (cardIndex > maxStaticIndex) {
      const newDynamicColumn = [...dynamicColumn];
      newDynamicColumn[calculatedCardIndex].text.renderPriceBox =
        !newDynamicColumn[calculatedCardIndex].text.renderPriceBox;
      setDynamicColumn(newDynamicColumn);
    } else {
      const newStaticColumns = [...staticColumns];
      newStaticColumns[cardIndex].text.renderPriceBox =
        !newStaticColumns[cardIndex].text.renderPriceBox;
      setStaticColumns(newStaticColumns);
    }
    uploadDataToFirebase();
  };

  const switchBoxType = (cardIndex) => {
    console.log("switchBoxType");

    const calculatedCardIndex = cardIndex - cardsInStatic;
    if (cardIndex > maxStaticIndex) {
      const newDynamicColumn = [...dynamicColumn];
      if (newDynamicColumn[calculatedCardIndex].text.priceBoxType < 2) {
        newDynamicColumn[calculatedCardIndex].text.priceBoxType++;
      } else {
        newDynamicColumn[calculatedCardIndex].text.priceBoxType = 0; // Reset to 0 if it's already 3
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
    uploadDataToFirebase();
  };

  const changePriceBoxColor = (cardIndex) => {
    const calculatedCardIndex = cardIndex - cardsInStatic;

    if (cardIndex > maxStaticIndex) {
      const newDynamicColumn = [...dynamicColumn];
      newDynamicColumn[calculatedCardIndex].text.priceBoxColor =
        !newDynamicColumn[calculatedCardIndex].text.priceBoxColor;
      setDynamicColumn(newDynamicColumn);
    } else {
      const newStaticColumns = [...staticColumns];
      newStaticColumns[cardIndex].text.priceBoxColor =
        !newStaticColumns[cardIndex].text.priceBoxColor;
      setStaticColumns(newStaticColumns);
    }
    uploadDataToFirebase();
  };

  const changePriceBoxBorder = (cardIndex) => {
    const calculatedCardIndex = cardIndex - cardsInStatic;

    if (cardIndex > maxStaticIndex) {
      const newDynamicColumn = [...dynamicColumn];
      newDynamicColumn[calculatedCardIndex].text.priceBoxBorder =
        !newDynamicColumn[calculatedCardIndex].text.priceBoxBorder;
      setDynamicColumn(newDynamicColumn);
    } else {
      const newStaticColumns = [...staticColumns];
      newStaticColumns[cardIndex].text.priceBoxBorder =
        !newStaticColumns[cardIndex].text.priceBoxBorder;
      setStaticColumns(newStaticColumns);
    }
    uploadDataToFirebase();
  };

  const handleCropImage = () => {
    setIsCroppingImage(true);
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

    const selectedColumn =
      cardIndex > maxStaticIndex ? dynamicColumn : staticColumns;

    const index =
      cardIndex > maxStaticIndex ? cardIndex - cardsInStatic : cardIndex;

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
      },
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
        action: async () => {
          await handleDeleteImage(cardIndex, 1);
          await uploadDataToFirebase();
        },
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
        action: async () => {
          await handleDeleteImage(cardIndex, 0);
          await uploadDataToFirebase();
        },
      });
    }
    if (selectedColumn[index].img[0].src != "") {
      contextMenuItems.push({
        label: "crop image 1",
        action: () => {
          setImgIndex(0);
          setSelectedCardIndex(cardIndex);
          handleCropImage(cardIndex, imgIndex);
          console.log(selectedCardIndex)
        },
      },
      {
        label: "Delete Background of Image 1",
        action: () => {
          setImgIndex(0); setIsAutomaticCropping(true);
          setSelectedCardIndex(cardIndex);
        },
      });
    }
    if (selectedColumn[index].img[1].src != "") {
      contextMenuItems.push({
        label: "crop image 2",
        action: () => {
          setImgIndex(1);
          setSelectedCardIndex(cardIndex);
          handleCropImage(cardIndex, imgIndex);
        },
      },
      {
        label: "Delete Background of Image 2",
        action: () => {
          setImgIndex(1);
          setSelectedCardIndex(cardIndex);
          setIsAutomaticCropping(true);
        },
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
    setSelectedCardIndex(cardIndex);
    const auxIndex =
      cardIndex > maxStaticIndex ? cardIndex - cardsInStatic : cardIndex;

    if (!event.target.classList.contains(styles.card)) {
      return;
    }
    const image = (cardIndex > maxStaticIndex ? dynamicColumn : staticColumns)[
      auxIndex
    ];

    if (image.img[0].src === "" && image.img[1].src === "") {
      setPopup2(true);
      
    } else {
      handleContextMenu(event, cardIndex, image);
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
        maxStaticIndex={maxStaticIndex}
        priceBoxBorder={priceBoxBorder}
        uploadDataToFirebase={uploadDataToFirebase}
      />,
      <TripleBox
        key={`fixed-box-${cardIndex}`}
        textBoxes={column}
        setTextBoxes={setColumn}
        backgroundColor={backgroundColor}
        i={cardIndex}
        cardIndex={cardIndex}
        maxStaticIndex={maxStaticIndex}
        priceBoxBorder={priceBoxBorder}
        uploadDataToFirebase={uploadDataToFirebase}
      />,
      <AmountForPrice
        key={`fixed-box-${cardIndex}`}
        textBoxes={column}
        setTextBoxes={setColumn}
        backgroundColor={backgroundColor}
        i={cardIndex}
        cardIndex={cardIndex}
        maxStaticIndex={maxStaticIndex}
        priceBoxBorder={priceBoxBorder}
        uploadDataToFirebase={uploadDataToFirebase}
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

          const calculatedCardIndex = cardIndex - cardsInStatic;
          const isEditingThisZoom =
            isEditingZoom &&
            selectedImage &&
            selectedImage.cardIndex !== undefined &&
            selectedImage.cardIndex === cardIndex;

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
                      images.img[0].x / (images.img[0].zoom / 100)
                    }px, ${images.img[0].y / (images.img[0].zoom / 100)}px)`,
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
                      images.img[1].x / (images.img[1].zoom / 100)
                    }px, ${images.img[1].y / (images.img[1].zoom / 100)}px)`,
                  }}
                />
              )}
              {dynamicColumn[calculatedCardIndex] &&
              dynamicColumn[calculatedCardIndex].text.renderPriceBox ? (
                <div className="priceBox">
                  {renderPriceBox(
                    dynamicColumn[calculatedCardIndex].text.priceBoxType,
                    dynamicColumn,
                    setDynamicColumn,
                    calculatedCardIndex,
                    dynamicColumn[calculatedCardIndex].text.priceBoxColor,
                    dynamicColumn[calculatedCardIndex].text.priceBoxBorder
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
                index={cardIndex - cardsInStatic}
                maxCardPosition={maxStaticIndex}
              />
            </div>
          );
        })}
        {cards}
      </div>
    );
  };

  const RenderLiquorCards = () => {
    const cards = [];
    for (let i = 0; i < 3; i++) {
      const column = [];

      for (let j = 0; j < 3; j++) {
        const cardIndex = j + i * 3 + 9;

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
                    images[0].x / (images[0].zoom / 100)
                  }px, ${images[0].y / (images[0].zoom / 100)}px)`,
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
                    images[1].x / (images[1].zoom / 100)
                  }px, ${images[1].y / (images[1].zoom / 100)}px)`,
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
              maxCardPosition={maxStaticIndex}
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
    return cards;
  };

  const RenderCards = () => {
    const cards = [];

    for (let i = 0; i < 3; i++) {
      const column = [];

      for (let j = 0; j < 3; j++) {
        const cardIndex = j + i * 3;

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
                    images[0].x / (images[0].zoom / 100)
                  }px, ${images[0].y / (images[0].zoom / 100)}px)`,
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
                    images[1].x / (images[1].zoom / 100)
                  }px, ${images[1].y / (images[1].zoom / 100)}px)`,
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
              maxCardPosition={maxStaticIndex}
            />
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
    <div className={styles.body}>
      { maintenance ? (
          <>
      {popup ? (
        <TextPopUp
          textBox={
            selectedImage.cardIndex > maxStaticIndex
              ? dynamicColumn
              : staticColumns
          }
          setTextBox={
            selectedImage.cardIndex > maxStaticIndex
              ? setDynamicColumn
              : setStaticColumns
          }
          setPopup={setPopup}
          cardIndex={selectedImage}
          maxCardPosition={maxStaticIndex}
          type={type}
          uploadDataToFirebase={uploadDataToFirebase}
        />
      ) : null}
      {isEditingZoom && (
        <ResizableImage
          cardIndex={
            selectedImage.cardIndex > maxStaticIndex
              ? selectedImage.cardIndex - cardsInStatic
              : selectedImage.cardIndex
          }
          selectedColumn={
            selectedImage.cardIndex > maxStaticIndex
              ? dynamicColumn
              : staticColumns
          }
          setSelectedColumn={
            selectedImage.cardIndex > maxStaticIndex
              ? setDynamicColumn
              : setStaticColumns
          }
          setIsEditingZoom={setIsEditingZoom}
          cardNumber={selectedImage.cardIndex}
          imageFolder={selectedCardIndex > maxStaticIndex ? "meat" : "seafood"}
          uploadDataToFirebase={uploadDataToFirebase}
        />
      )}
      {isCroppingImage && (
        <ImageCropper
          src={
            selectedCardIndex > maxStaticIndex
              ? dynamicColumn[selectedCardIndex - cardsInStatic].img[imgIndex]
                  .src
              : staticColumns[selectedCardIndex].img[imgIndex].src
          }
          setIsCroppingImage={setIsCroppingImage}
          selectedColumn={
            selectedCardIndex > maxStaticIndex
              ? dynamicColumn
              : staticColumns
          }
          setSelectedColumn={
            selectedCardIndex > maxStaticIndex
              ? setDynamicColumn
              : setStaticColumns
          }
          selectedCardIndex={selectedCardIndex}
          imageIndex={imgIndex}
          imageFolder={selectedCardIndex > maxStaticIndex ? "meat" : "seafood"}
          uploadDataToFirebase={uploadDataToFirebase}
          maxStaticIndex={maxStaticIndex}
        />
      )}
      {isAutomaticCropping && (
        <AutomaticImageCropper
          selectedCardColumn={
            selectedCardIndex > maxStaticIndex
              ? dynamicColumn
              : staticColumns
          }
          setSelectedCardColumn={
            selectedCardIndex > maxStaticIndex
              ? setDynamicColumn
              : setStaticColumns
          }
          cardIndex={selectedCardIndex}
          imageIndex={imgIndex}
          setIsAutomaticCropping={setIsAutomaticCropping}
          uploadDataToFirebase={uploadDataToFirebase}
          maxStaticIndex={maxStaticIndex}
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
        <div
          className={styles.popUp2}
          style={{ top: "40%", left: "50%", zIndex: "1" }}
        >
          <div>Do you really wish to go back?</div>
          <div>
            <button onClick={() => navigate("/")}>Yes</button>
            <button onClick={() => setPopup3(false)}>No</button>
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
          db={db}
          setCurrentTemplate={setTemplateName}
          templateFolder="Meats&Seafood"
          cardsInStatic={cardsInStatic}
        />
      ) : null}

      <div className={styles.sidebar} style={{ top: "0px" }}>
        <div
          style={{
            position: "relative",
            left: "px",
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
            onClick={handleConvertToPDF}
          >
            Make PDF
          </button>
          <button
            style={{
              width: "165px",
              position: "relative",
              backgroundColor: "gray",
              color: "white",
              marginBottom: "10px",
              zIndex: "1",
            }}
            onClick={() => setPopup3(true)}
          >
            Back to Home
          </button>
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

          <ImageUploader
            uploadDataToFirebase={uploadDataToFirebase}
            imageFolder={
              selectedCardIndex > maxStaticIndex ? "seafood" : "meat"
            }
          />
        </div>
      </div>

      <div
        id="magazineContainer"
        className={styles.containerDivBorder}
        style={{ display: "flex", justifyContent: "flex-start" }}
      >
        <div style={{ width: "80%" }}>
          <div className={styles.containerDiv} ref={contextMenuRef}>
            <RenderCards />
            <div className={styles.overlay}>MEAT DEPARTMENT</div>
            {contextMenu && (
              <ContextMenu
                x={contextMenu.x}
                y={contextMenu.y}
                items={contextMenu.items}
                onClose={() => setContextMenu(null)}
              />
            )}
          </div>

          <div className={styles.secondContainerDiv}>
            <div className={styles.secondOverlay}>CERTIFIED HALAL MEAT</div>
            <RenderLiquorCards />
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <div className={styles.thirdContainerDiv}>
            <RenderDynamicColumn />
          </div>
          <div className={styles.thirdOverlay}>SEAFOOD</div>
        </div>
      </div>
      {info ? <RenderInfo /> : null}
      {images != null ? (
        <ImageFromCloud
          images={images}
          cardIndex={selectedCardIndex}
          selectedColumn={
            selectedCardIndex > maxStaticIndex ? dynamicColumn : staticColumns
          }
          setSelectedColumn={
            selectedCardIndex > maxStaticIndex
              ? setDynamicColumn
              : setStaticColumns
          }
          setImages={setImages}
          imgIndex={imgIndex}
          maxCardPosition={maxStaticIndex}
          imageFolder={selectedCardIndex > maxStaticIndex ? "seafood" : "meat"}
          uploadDataToFirebase={uploadDataToFirebase}
        />
      ) : null}</>) : (
        <h1>In maintenance..</h1>
      )}
    </div>
  );
}
