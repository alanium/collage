import React, { useEffect, useRef, useState } from "react";
import styles from "./Delicatessen&Fish&Taqueria.module.css";
import { useNavigate } from "react-router-dom";
import TextBoxLeft from "../../components/ParagraphBox/ParagraphBox";
import TopTextBox from "../../components/TopTextBox/TopTextBox";
import TextPopUp from "../../components/TextPopup/TextPopup";
import { getStorage, ref, listAll, uploadBytes } from "firebase/storage";
import ImageFromCloud from "../../components/ImageFromCloud/ImageFromCloud";
import ResizableImage from "../../components/ResizableImage/ResizableImage";
import ManageTemplates from "../../components/ManageTemplates/ManageTemplates";
import { db } from "../root";
import AutomaticImageCropper from "../../components/AutomaticImageCropper/AutomaticImageCropper";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import ImageCropper from "../../components/ImageCropper/ImageCropper";
import Sidebar from "../../components/Sidebar/Sidebar";
import ImportPopup from "../../components/ImportPopup/ImportPopup";
import BugReport from "../../components/BugReport/BugReport";
import ClosePopup from "../../components/ClosePopup/ClosePopup";
import RenderInfo from "../../components/RenderInfo/RenderInfo";
import ContextMenu from "../../components/ContextMenu/ContextMenu";

const groceryRef = collection(db, "Deli&Taqueria");
const templatesQuerySnapshot = await getDocs(groceryRef);

export default function DelicatessenAndMore({
  uploadDataToFirebase,
  handleConvertToPDF,
  renderPriceBox,
}) {
  const cardsInStatic = 26;
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
  const [selectedImage, setSelectedImage] = useState({});
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [type, setType] = useState("");
  const [templates, setTemplates] = useState(null);
  const [images, setImages] = useState(null);
  const [imgIndex, setImgIndex] = useState(null);
  const [selectedTextBox, setSelectedTextBox] = useState({});
  const [templateName, setTemplateName] = useState(templatesQuerySnapshot[0]);
  const [popupState, setPopupState] = useState(3);

  const maintenance = true
  const templateCollection = "Deli&Taqueria";
  const storage = getStorage();
  const imageFolder =
 ( selectedCardIndex < 12 || selectedCardIndex > maxStaticIndex
    ? "deli"
    : (selectedCardIndex > 11 && selectedCardIndex < 20
    ? "seafood"
    : "taqueria"));
  
  const imagesRef = ref(
    storage,
    `images/${
      imageFolder
    }`
  );
  
  const navigate = useNavigate();
  const contextMenuRef = useRef(null);

  useEffect(() => {
    const unsubscribeStaticColumns = onSnapshot(
      doc(db, `Deli&Taqueria/${templateName}`),
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
      doc(db, `Deli&Taqueria/${templateName}`),
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
    setDynamicColumn(cards);
    () => {
      uploadDataToFirebase(templateCollection,
        templateName,
        staticColumns,
        dynamicColumn,);
    };
  };

  const renderPopup = (popupNumber) => {
    switch (popupNumber) {
      case 0:
        return null;
      case 1:
        return (
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
            setPopup={setPopupState}
            cardIndex={selectedImage}
            type={type}
            maxCardPosition={maxStaticIndex}
            uploadDataToFirebase={uploadDataToFirebase}
            templateName={templateName}
            staticColumns={staticColumns}
            dynamicColumn={dynamicColumn}
            templateCollection={templateCollection}
          />
        );
      case 2:
        return (
          <ImportPopup
            getImageList={getImageList}
            setPopup={setPopupState}
            handleImageUpload={handleImageUpload}
            selectedCardIndex={selectedCardIndex}
            imgIndex={imgIndex}
          />
        );
      case 3:
        return (
          <ManageTemplates
            dynamicColumn={dynamicColumn}
            staticColumns={staticColumns}
            setDynamicColumn={setDynamicColumn}
            setStaticColumns={setStaticColumns}
            templates={templates}
            setTemplates={setTemplates}
            setPopup={setPopupState}
            db={db}
            setCurrentTemplate={setTemplateName}
            templateFolder={templateCollection}
            templateName={templateName}
          />
        );
      case 4:
        return <BugReport setPopup={setPopupState} />;
      case 6:
        return <ClosePopup setPopup={setPopupState} />;
      case 7:
        return (
          <AutomaticImageCropper
            selectedCardColumn={
              selectedCardIndex > maxStaticIndex ? dynamicColumn : staticColumns
            }
            setSelectedCardColumn={
              selectedCardIndex > maxStaticIndex
                ? setDynamicColumn
                : setStaticColumns
            }
            cardIndex={selectedCardIndex}
            imageIndex={imgIndex}
            setPopup={setPopupState}
            uploadDataToFirebase={uploadDataToFirebase}
            maxStaticIndex={maxStaticIndex}
            templateName={templateName}
            staticColumns={staticColumns}
            dynamicColumn={dynamicColumn}
            templateCollection={templateCollection}
            imageFolder={imageFolder}
          />
        );
      case 8:
        return (
          <ImageCropper
            src={
              selectedCardIndex > maxStaticIndex
                ? dynamicColumn[selectedCardIndex - cardsInStatic].img[imgIndex]
                    .src
                : staticColumns[selectedCardIndex].img[imgIndex].src
            }
            setPopup={setPopupState}
            selectedColumn={
              selectedCardIndex > maxStaticIndex ? dynamicColumn : staticColumns
            }
            setSelectedColumn={
              selectedCardIndex > maxStaticIndex
                ? setDynamicColumn
                : setStaticColumns
            }
            selectedCardIndex={selectedCardIndex}
            imageIndex={imgIndex}
            imageFolder={imageFolder}
            templateCollection={templateCollection}
            uploadDataToFirebase={uploadDataToFirebase}
            templateName={templateName}
            staticColumns={staticColumns}
            dynamicColumn={dynamicColumn}
          />
        );
      case 9:
        return (
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
            setPopup={setPopupState}
            cardNumber={selectedImage.cardIndex}
            imageFolder={imageFolder}
            uploadDataToFirebase={uploadDataToFirebase}
            templateCollection={templateCollection}
            templateName={templateName}
            staticColumns={staticColumns}
            dynamicColumn={dynamicColumn}
          />
        );
      case 10:
        return <RenderInfo />;
      case 11:
        return (
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
            staticColumns={staticColumns}
            dynamicColumn={dynamicColumn}
            templateName={templateName}
            imgIndex={imgIndex}
            maxCardPosition={maxStaticIndex}
            templateCollection={templateCollection}
            imageFolder={imageFolder}
            setPopup={setPopupState}
            uploadDataToFirebase={uploadDataToFirebase}
          />
        );
    }
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
              const uploadedImageRef = ref(
                storage,
                `images/${imageFolder}/${file.name}`
              );
              uploadBytes(uploadedImageRef, file).then((snapshot) => {
                getDownloadURL(
                  ref(storage, `images/${imageFolder}/${file.name}`)
                )
                  .then((url) => {
                    const newDynamicColumn = [...dynamicColumn];
                    newDynamicColumn[cardIndex].img[img].src = url;
                    setDynamicColumn(newDynamicColumn);
                  })
                  .then(() => {
                    uploadDataToFirebase(
                      templateCollection,
                      templateName,
                      staticColumns,
                      dynamicColumn
                    );
                  });
                console.log("Uploaded a blob or file!");
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
              const uploadedImageRef = ref(
                storage,
                `images/${imageFolder}/${file.name}`
              );
              uploadBytes(uploadedImageRef, file).then((snapshot) => {
                getDownloadURL(
                  ref(storage, `images/${imageFolder}/${file.name}`)
                )
                  .then((url) => {
                    console.log(file.name);
                    console.log(url);
                    const newStaticColumns = [...staticColumns];
                    newStaticColumns[cardIndex].img[img].src = url;
                    setStaticColumns(newStaticColumns);
                  })
                  .then(() => {
                    uploadDataToFirebase(
                      templateCollection,
                      templateName,
                      staticColumns,
                      dynamicColumn
                    );
                  });
              });
            }
          };
          input.click();
        }
      });
    }
    setPopupState(0);
  };

  const handleCropImage = () => {
    setPopupState(8);
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
            setPopupState(0);
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
            setPopupState(0);
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
    uploadDataToFirebase(templateCollection,
      templateName,
      staticColumns,
      dynamicColumn);
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
    uploadDataToFirebase(templateCollection,
      templateName,
      staticColumns,
      dynamicColumn);
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
    uploadDataToFirebase(templateCollection,
      templateName,
      staticColumns,
      dynamicColumn);
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
    uploadDataToFirebase(templateCollection,
      templateName,
      staticColumns,
      dynamicColumn);
  };

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
          setPopupState(9);
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
          setPopupState(2);
          setSelectedCardIndex(cardIndex);
        },
      });
    } else if (selectedColumn[index].img[1].src != "") {
      // If both images uploaded, allow editing and deleting the second image
      contextMenuItems.push({
        label: "Delete 2",
        action: async () => {
          await handleDeleteImage(cardIndex, 1);
          await uploadDataToFirebase(templateCollection,
            templateName,
            staticColumns,
            dynamicColumn);
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
          setImgIndex(1), setPopupState(7);
        },
      });
    }
    if (selectedColumn[index].img[0].src == "") {
      contextMenuItems.push({
        label: "Upload 1",
        action: () => {
          setImgIndex(0);
          setPopupState(2);
          setSelectedCardIndex(cardIndex);
        },
      });
    }
    if (selectedColumn[index].img[0].src != "") {
      contextMenuItems.push({
        label: "Delete 1",
        action: async () => {
          await handleDeleteImage(cardIndex, 0);
          await uploadDataToFirebase(templateCollection,
            templateName,
            staticColumns,
            dynamicColumn);
        },
      },{
        label: "crop image 1",
        action: () => {
          setImgIndex(0);
          handleCropImage(cardIndex, imgIndex);
        },
      },
      {
        label: "Delete Background of Image 1",
        action: () => {
          setImgIndex(0), setPopupState(7);
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

    const auxIndex =
      cardIndex > maxStaticIndex ? cardIndex - cardsInStatic : cardIndex;

    if (!event.target.classList.contains(styles.card)) {
      return;
    }
    const image = (cardIndex > maxStaticIndex ? dynamicColumn : staticColumns)[
      auxIndex
    ];

    if (image.img[0].src === "" && image.img[1].src === "") {
      setPopupState(2)
      setSelectedCardIndex(cardIndex);
    } else {
      handleContextMenu(event, cardIndex, image);
      setSelectedCardIndex(cardIndex);
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
      .then(() => setPopupState(11))
      .catch((error) => {
        console.log(error);
      });
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
                    dynamicColumn[calculatedCardIndex].text.priceBoxBorder,
                    templateCollection,
                    templateName,
                    staticColumns,
                    dynamicColumn
                  )}
                </div>
              ) : null}
              <TextBoxLeft
                textBoxes={dynamicColumn}
                setTextBoxes={setDynamicColumn}
                cardIndex={cardIndex}
                setPopup={setPopupState}
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
    for (let i = 0; i < 4; i++) {
      const column = [];

      for (let j = 0; j < 2; j++) {
        const cardIndex = j + i * 2 + 12;

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
                  staticColumns[cardIndex].text.priceBoxBorder,
                  templateCollection,
                  templateName,
                  staticColumns,
                  dynamicColumn,
                )}
              </div>
            ) : null}

            <TopTextBox
              textBoxes={staticColumns}
              setTextBoxes={setStaticColumns}
              cardIndex={cardIndex}
              setPopup={setPopupState}
              setSelectedTextBox={setSelectedTextBox}
              setType={setType}
              setSelectedImage={setSelectedImage}
              index={cardIndex}
            />

            <TextBoxLeft
              textBoxes={staticColumns}
              setTextBoxes={setStaticColumns}
              cardIndex={cardIndex}
              setPopup={setPopupState}
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

  const RenderTaqueria = () => {
    const cards = [];

    for (let i = 0; i < 5; i++) {
      const column = [];

      for (let j = 0; j < 1; j++) {
        const cardIndex = j + i * 1 + 20;

        let images = staticColumns[cardIndex].img;

        const textBoxes = [];

        staticColumns.map((card) => {
          textBoxes.push(card.text);
        });

        column.push(
          <div
            name={`card-${cardIndex}`}
            className={styles.taqueriaCard}
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
                  staticColumns[cardIndex].text.priceBoxBorder,
                  templateCollection,
                  templateName,
                  staticColumns,
                  dynamicColumn,
                )}
              </div>
            ) : null}

            <TopTextBox
              textBoxes={staticColumns}
              setTextBoxes={setStaticColumns}
              cardIndex={cardIndex}
              setPopup={setPopupState}
              setSelectedTextBox={setSelectedTextBox}
              setType={setType}
              setSelectedImage={setSelectedImage}
              index={cardIndex}
            />

            <TextBoxLeft
              textBoxes={staticColumns}
              setTextBoxes={setStaticColumns}
              cardIndex={cardIndex}
              setPopup={setPopupState}
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
        <div
          key={i}
          style={{ borderRight: "1px solid black" }}
          className={styles.taqueriaColumn}
        >
          {column}
        </div>
      );
    }

    const images = staticColumns[25].img;
    cards.push(
      <div
        style={{ borderLeft: "1px solid black" }}
        className={styles.taqueriaColumn}
      >
        <div
          name={`card-${25}`}
          className={styles.taqueriaCard}
          key={25}
          onClick={(event) => handleCardClick(25, event)}
        >
          {staticColumns[25].img[0] && ( // Check if img[0] exists before rendering
            <img
              name={`image-${25}-0`}
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
              name={`image-${25}-1`}
              src={images[1] ? images[1].src : ""}
              className={styles.uploadedImage}
              style={{
                transform: `scale(${images[1].zoom / 100}) translate(${
                  images[1].x / (images[1].zoom / 100)
                }px, ${images[1].y / (images[1].zoom / 100)}px)`,
              }}
            />
          )}
          {staticColumns[25] && staticColumns[25].text.renderPriceBox ? (
            <div className="priceBox">
              {renderPriceBox(
                staticColumns[25].text.priceBoxType,
                staticColumns,
                setStaticColumns,
                25,
                staticColumns[25].text.priceBoxColor,
                staticColumns[25].text.priceBoxBorder,
                templateCollection,
                templateName,
                staticColumns,
                dynamicColumn
              )}
            </div>
          ) : null}

          <TopTextBox
            textBoxes={staticColumns}
            setTextBoxes={setStaticColumns}
            cardIndex={25}
            setPopup={setPopupState}
            setSelectedTextBox={setSelectedTextBox}
            setType={setType}
            setSelectedImage={setSelectedImage}
            index={25}
          />

          <TextBoxLeft
            textBoxes={staticColumns}
            setTextBoxes={setStaticColumns}
            cardIndex={25}
            setPopup={setPopupState}
            setSelectedTextBox={setSelectedTextBox}
            setType={setType}
            setSelectedImage={setSelectedImage}
            index={25}
            maxCardPosition={maxStaticIndex}
          />
        </div>
      </div>
    );
    return cards;
  };

  const RenderCards = () => {
    const cards = [];

    for (let i = 0; i < 3; i++) {
      const column = [];

      for (let j = 0; j < 4; j++) {
        const cardIndex = j + i * 4;

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
                  staticColumns[cardIndex].text.priceBoxBorder,
                  templateCollection,
                  templateName,
                  staticColumns,
                  dynamicColumn
                )}
              </div>
            ) : null}

            <TopTextBox
              textBoxes={staticColumns}
              setTextBoxes={setStaticColumns}
              cardIndex={cardIndex}
              setPopup={setPopupState}
              setSelectedTextBox={setSelectedTextBox}
              setType={setType}
              setSelectedImage={setSelectedImage}
              index={cardIndex}
            />

            <TextBoxLeft
              textBoxes={staticColumns}
              setTextBoxes={setStaticColumns}
              cardIndex={cardIndex}
              setPopup={setPopupState}
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
      { !maintenance ? (
          <>
     {renderPopup(popupState)}
          <Sidebar
            handleConvertToPDF={handleConvertToPDF}
            setPopup={setPopupState}
          />
      <div
        id="magazineContainer"
        style={{ display: "grid" }}
        className={styles.containerDivBorder}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            height: "129%",
          }}
        >
          <div style={{ width: "80%" }}>
            <div className={styles.containerDiv} ref={contextMenuRef}>
              <RenderCards />
              <div className={styles.overlay}>DELICATESSEN</div>
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
              <div className={styles.secondOverlay}>SMOKED FISH</div>
              <RenderLiquorCards />
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <div className={styles.thirdContainerDiv}>
              <RenderDynamicColumn />
            </div>
            <div className={styles.thirdOverlay}>DELI SPECIALITIES</div>
          </div>
        </div>
        <div
          style={{ position: "relative", top: "390px" }}
          className={styles.fourthContainerDiv}
        >
          <div className={styles.fourthOverlay}>NAPERVILLE TAQUERIA</div>
          <div className={styles.fifthOverlay}>HABIBI SHAWARMA</div>
          <RenderTaqueria />
        </div>
      </div>
      </>) : (
        <h1>In maintenance..</h1>
      )}
    </div>
  );
}
