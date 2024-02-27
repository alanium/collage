import React, { useState, useEffect, useRef } from "react";
import styles from "./NapervilleFreshMarket.module.css";
import html2pdf from "html2pdf.js"; // Importa la biblioteca html2pdf
import FixedBox from "../../components/BoxWithText/BoxWithText";
import TripleBox from "../../components/TripleBoxWithText/TripleBoxWithText";
import { useNavigate } from "react-router-dom";
import AmountForPrice from "../../components/AmountForPrice/AmountForPrice";
import TextBoxLeft from "../../components/ParagraphBox/ParagraphBox";
import TopTextBox from "../../components/TopTextBox/TopTextBox";
import TextPopUp from "../../components/TextPopup/TextPopup";
import ImageUploader from "../../components/ImageToCloud/ImageToCloud";
import { getStorage, ref, listAll, uploadBytes } from "firebase/storage";
import ImageFromCloud from "../../components/ImageFromCloud/ImageFromCloud";
import ResizableImage from "../../components/ResizableImage/ResizableImage";
import ManageTemplates from "../../components/ManageTemplates/ManageTemplates";
import ImageCropper from "../../components/ImageCropper/ImageCropper";
import AutomaticImageCropper from "../../components/AutomaticImageCropper/AutomaticImageCropper";
import { db } from "../root";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore";

const groceryRef = collection(db, "NapervilleFresh");
const templatesQuerySnapshot = await getDocs(groceryRef);

function NapervilleFreshMarket() {
  const cardsInStatic = 30;
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
  const [selectedImage, setSelectedImage] = useState({});
  const [selectedTextBox, setSelectedTextBox] = useState({});
  const [selectedCardIndex, setSelectedCardIndex] = useState({});
  const [isCroppingImage, setIsCroppingImage] = useState(false);
  const [isAutomaticCropping, setIsAutomaticCropping] = useState(false);
  const [info, setInfo] = useState(false);
  const [popup, setPopup] = useState(false);
  const [type, setType] = useState("");
  const [popup2, setPopup2] = useState(false);
  const [popup4, setPopup4] = useState(false);
  const [templates, setTemplates] = useState(null);
  const [images, setImages] = useState(null);
  const [imgIndex, setImgIndex] = useState(null);
  const [templateName, setTemplateName] = useState(templatesQuerySnapshot[0]);

  const storage = getStorage();
  const imagesRef = ref(
    storage,
    selectedCardIndex > 15 && selectedCardIndex < 30
      ? "images/produce"
      : "images/produce"
  );
  const templatesRef = ref(storage, "templates/");
  const navigate = useNavigate();
  const contextMenuRef = useRef(null);

  useEffect(() => {
    const unsubscribeStaticColumns = onSnapshot(
      doc(db, `NapervilleFresh/${templateName}`),
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
      doc(db, `NapervilleFresh/${templateName}`),
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
      await setDoc(doc(db, `NapervilleFresh/${templateName}`), {
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

      container.style.top = "-100px";
      // Generar PDF desde el clon
      await html2pdf().from(container).set(pdfOptions).save();

      container.style.top = "0";
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
    setDynamicColumn(cards),
      () => {
        uploadDataToFirebase();
      };
  };

  const handleImageUpload = (event, cardIndex, img) => {
    // Added 'cardIndex' parameter
    event.preventDefault();
    if (cardIndex > maxStaticIndex) {
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
                newDynamicColumn[cardIndex - cardsInStatic].img[img].src =
                  result;
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

    if (cardIndex > maxStaticIndex) {
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
    if (cardIndex > maxStaticIndex) {
      const newDynamicColumn = [...dynamicColumn];
      newDynamicColumn[cardIndex - cardsInStatic].text.renderPriceBox =
        !newDynamicColumn[cardIndex - cardsInStatic].text.renderPriceBox;
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
    if (cardIndex > maxStaticIndex) {
      const newDynamicColumn = [...dynamicColumn];
      if (newDynamicColumn[cardIndex - cardsInStatic].text.priceBoxType < 2) {
        newDynamicColumn[cardIndex - cardsInStatic].text.priceBoxType++;
      } else {
        newDynamicColumn[cardIndex - cardsInStatic].text.priceBoxType = 0; // Reset to 0 if it's already 3
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
    if (cardIndex > maxStaticIndex) {
      const newDynamicColumn = [...dynamicColumn];
      newDynamicColumn[cardIndex - cardsInStatic].text.priceBoxColor =
        !newDynamicColumn[cardIndex - cardsInStatic].text.priceBoxColor;
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
    if (cardIndex > maxStaticIndex) {
      const newDynamicColumn = [...dynamicColumn];
      newDynamicColumn[cardIndex - cardsInStatic].text.priceBoxBorder =
        !newDynamicColumn[cardIndex - cardsInStatic].text.priceBoxBorder;
      setDynamicColumn(newDynamicColumn);
    } else {
      const newStaticColumns = [...staticColumns];
      newStaticColumns[cardIndex].text.priceBoxBorder =
        !newStaticColumns[cardIndex].text.priceBoxBorder;
      setStaticColumns(newStaticColumns);
    }
    uploadDataToFirebase();
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
      contextMenuItems.push(
        {
          label: "Delete 2",
          action: async () => {
            await handleDeleteImage(cardIndex, 1);
            await uploadDataToFirebase();
          },
        },
        {
          label: "crop image 2",
          action: () => {
            setImgIndex(1);
            handleCropImage(cardIndex, imgIndex);
          },
        },
        {
          label: "Delete Background of Image 2",
          action: () => {
            setImgIndex(1), setIsAutomaticCropping(true);
          },
        }
      );
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
      contextMenuItems.push(
        {
          label: "Delete 1",
          action: async () => {
            await handleDeleteImage(cardIndex, 0);
            await uploadDataToFirebase();
          },
        },
        {
          label: "crop image 1",
          action: () => {
            setImgIndex(0);
            handleCropImage(cardIndex, imgIndex);
          },
        },
        {
          label: "Delete Background of Image 1",
          action: () => {
            setImgIndex(0), setIsAutomaticCropping(true);
          },
        }
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

    setImgIndex(0);

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
      setSelectedCardIndex(cardIndex);
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
        priceBoxBorder={priceBoxBorder}
        uploadDataToFirebase={uploadDataToFirebase}
      />,
    ];

    return priceBoxes[number];
  };

  const RenderTopCards = () => {
    return (
      <div
        style={{ position: "relative", zIndex: "1", width: "98%" }}
        className={styles.topContainerDiv}
      >
        <img
          style={{ width: "50%" }}
          src="../src/assets/images/0130__0205__digital-scaled.jpg"
        />
        <RenderDynamicColumn />
      </div>
    );
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
      <div className={styles.topCardColumn}>
        {dynamicColumn.map((card) => {
          const cardIndex = card.index;
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
              style={{ border: "none" }}
              key={cardIndex}
              onClick={(event) => handleCardClick(cardIndex, event)}
            >
              {images.img[0] && ( // Check if img[0] exists before rendering
                <img
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
                  src={images.img[1] ? images.img[1].src : ""}
                  className={styles.uploadedImage}
                  style={{
                    transform: `scale(${images.img[1].zoom / 100}) translate(${
                      images.img[1].x / (images.img[1].zoom / 100)
                    }px, ${images.img[1].y / (images.img[1].zoom / 100)}px)`,
                  }}
                />
              )}
              {dynamicColumn[cardIndex - cardsInStatic] &&
              dynamicColumn[cardIndex - cardsInStatic].text.renderPriceBox ? (
                <div className="priceBox">
                  {renderPriceBox(
                    dynamicColumn[cardIndex - cardsInStatic].text.priceBoxType,
                    dynamicColumn,
                    setDynamicColumn,
                    cardIndex - cardsInStatic,
                    dynamicColumn[cardIndex - cardsInStatic].text.priceBoxColor,
                    dynamicColumn[cardIndex - cardsInStatic].text.priceBoxBorder
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

  const RenderCardsSecondColumn = () => {
    const cards = [];

    for (let i = 0; i < 2; i++) {
      const column = [];

      for (let j = 0; j < 6; j++) {
        const cardIndex = j + i * 6 + 18;

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
        <div key={i + 1} className={styles.cardSecondColumn}>
          {column}
        </div>
      );
    }
    return cards;
  };

  const RenderCards = () => {
    const cards = [];

    for (let i = 0; i < 2; i++) {
      const column = [];

      for (let j = 0; j < 8; j++) {
        const cardIndex = j + i * 8;

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
          type={type}
          maxCardPosition={maxStaticIndex}
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
          imageFolder={
            selectedCardIndex > 15 && selectedCardIndex < 30
              ? "produce"
              : "produce"
          }
          uploadDataToFirebase={uploadDataToFirebase}
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
      {popup4 ? (
        <ManageTemplates
          dynamicColumn={dynamicColumn}
          staticColumns={staticColumns}
          setDynamicColumn={setDynamicColumn}
          setStaticColumns={setStaticColumns}
          templates={templates}
          setTemplates={setTemplates}
          setPopup4={setPopup4}
          templateFolder="NapervilleFreshMarket"
        />
      ) : null}
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
            selectedImage.cardIndex > maxStaticIndex
              ? dynamicColumn
              : staticColumns
          }
          setSelectedColumn={
            selectedImage.cardIndex > maxStaticIndex
              ? setDynamicColumn
              : setStaticColumns
          }
          selectedCardIndex={selectedCardIndex}
          imageIndex={imgIndex}
          imageFolder={
            selectedCardIndex > 15 && selectedCardIndex < 30
              ? "produce"
              : "produce"
          }
          uploadDataToFirebase={uploadDataToFirebase}
        />
      )}
      {isAutomaticCropping && (
        <AutomaticImageCropper
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
          cardIndex={selectedCardIndex}
          imageIndex={imgIndex}
          setIsAutomaticCropping={setIsAutomaticCropping}
          uploadDataToFirebase={uploadDataToFirebase}
        />
      )}

      <div className={styles.sidebar} style={{ top: "1maxStaticIndexpx" }}>
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
            onClick={() => navigate("/")}
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
              selectedCardIndex > 15 && selectedCardIndex < 30
                ? "produce"
                : "produce"
            }
          />
        </div>
      </div>

      <div
        id="magazineContainer"
        style={{ justifyContent: "center", position: "relative" }}
      >
        <div style={{ display: "grid" }} className={styles.containerDivBorder}>
          <div style={{ justifyContent: "center", maxHeight: "40%" }}>
            <RenderTopCards />
            <img
              style={{ zIndex: "1", width: "100%" }}
              src="../src/assets/images/naperville.jpg"
            />
          </div>
          <div
            className={styles.containerDiv}
            style={{ width: "98%", height: "183%" }}
            ref={contextMenuRef}
          >
            <RenderCards />
            <RenderCardsSecondColumn />
            {contextMenu && (
              <ContextMenu
                x={contextMenu.x}
                y={contextMenu.y}
                items={contextMenu.items}
                onClose={() => setContextMenu(null)}
              />
            )}
          </div>
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
          imageFolder={
            selectedCardIndex > 15 && selectedCardIndex < 30
              ? "produce"
              : "produce"
          }
          uploadDataToFirebase={uploadDataToFirebase}
        />
      ) : null}
    </div>
  );
}

export default NapervilleFreshMarket;
