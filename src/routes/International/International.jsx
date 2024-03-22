import React, { useState, useEffect, useRef } from "react";
import styles from "./International.module.css";
import { useNavigate } from "react-router-dom";
import TextBoxLeft from "../../components/ParagraphBox/ParagraphBox";
import TopTextBox from "../../components/TopTextBox/TopTextBox";
import TextPopUp from "../../components/TextPopup/TextPopup";
import {
  getStorage,
  ref,
  listAll,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
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
import Sidebar from "../../components/Sidebar/Sidebar";
import ContextMenu from "../../components/ContextMenu/ContextMenu";
import ImportPopup from "../../components/ImportPopup/ImportPopup";
import BugReport from "../../components/BugReport/BugReport";
import ClosePopup from "../../components/ClosePopup/ClosePopup";
import NewPriceBoxEdit from "../../components/NewPriceBoxEdit/NewPriceBoxEdit";
import PriceBoxFromCloud from "../../components/PriceBoxFromCloud/PriceBoxFromCloud";
import IrregularImageCropper from "../../components/IrregularImageCropper/IrregularImageCropper";
import NewPriceBox from "../../components/NewPriceBox/NewPriceBox";
import EditStickers from "../../components/EditStickers/EditStickers";
import AddStickersPopup from "../../components/AddStickersPopup/AddStickersPopup";

const groceryRef = collection(db, "International");
const templatesQuerySnapshot = await getDocs(groceryRef);

function International({
  uploadDataToFirebase,
  handleConvertToPDF,
  renderPriceBox,
}) {
  const cardsInStatic = 21;
  const maxStaticIndex = 20;
  const templateCollection = "International";

  const [staticColumns, setStaticColumns] = useState(
    Array(21)
      .fill()
      .map((_, index) => ({
        img: [
          { src: "", zoom: 100, x: 0, y: 0, zIndex: -1 },
          { src: "", zoom: 100, x: 0, y: 0, zIndex: -1 },
        ],
        text: {
          top: "",
          left: "",
          priceBox: {
            text: [
              {
                text: "XS/$X",
                fontSize: 24,
                draggable: true,
                resizable: true,
                position: { x: 10, y: 0 },
                size: { x: 50, y: 50 },
              },
            ],
            width: "100",
            height: "50",
            backgroundColor: "red",
            textColor: "white",
            border: "black",
            borderRadius: true,
          },
        },
        index,
      }))
  );
  const [stickers, setStickers] = useState([])
  const [dynamicColumn, setDynamicColumn] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedImage, setSelectedImage] = useState({});
  const [selectedTextBox, setSelectedTextBox] = useState({});
  const [selectedCardIndex, setSelectedCardIndex] = useState({});
  const [type, setType] = useState("");
  const [templates, setTemplates] = useState(null);
  const [images, setImages] = useState(null);
  const [imgIndex, setImgIndex] = useState(null);
  const [templateName, setTemplateName] = useState(templatesQuerySnapshot[0]);
  const [popupState, setPopupState] = useState(3);

  const storage = getStorage();
  const imagesRef = ref(storage, "images/International");
  const templatesRef = ref(storage, "templates/");
  const navigate = useNavigate();
  const contextMenuRef = useRef(null);

  useEffect(() => {
    const unsubscribeStaticColumns = onSnapshot(
      doc(db, `${templateCollection}/${templateName}`),
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
      doc(db, `${templateCollection}/${templateName}`),
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

    const unsubscribeStickers = onSnapshot(
      doc(db, `${templateCollection}/${templateName}`),
      (snapshot) => {
        if (snapshot.exists()) {
          setStickers(snapshot.data().stickers);
        }
      }
    );

    return () => {
      unsubscribeStaticColumns();
      unsubscribeDynamicColumn();
      unsubscribeStickers();
    };
  }, [templateName]);

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
            imageFolder={templateCollection}
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
            templateCollection={templateCollection}
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
            imageFolder={templateCollection}
            templateCollection={templateCollection}
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
            imageFolder={templateCollection}
            uploadDataToFirebase={uploadDataToFirebase}
            templateName={templateName}
            staticColumns={staticColumns}
            dynamicColumn={dynamicColumn}
            templateCollection={templateCollection}
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
            imageFolder={templateCollection}
            uploadDataToFirebase={uploadDataToFirebase}
            templateName={templateName}
            staticColumns={staticColumns}
            dynamicColumn={dynamicColumn}
            templateCollection={templateCollection}
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
            imageFolder={templateCollection}
            setPopup={setPopupState}
            uploadDataToFirebase={uploadDataToFirebase}
            templateCollection={templateCollection}
          />
        );
      case 12:
        return (
          <NewPriceBoxEdit
            oldPriceBox={
              selectedCardIndex > maxStaticIndex
                ? dynamicColumn[selectedCardIndex - cardsInStatic].text.priceBox
                : staticColumns[selectedCardIndex].text.priceBox
            }
            setSelectedColumn={
              selectedCardIndex > maxStaticIndex
                ? setDynamicColumn
                : setStaticColumns
            }
            selectedColumn={
              selectedCardIndex > maxStaticIndex ? dynamicColumn : staticColumns
            }
            selectedCardIndex={selectedCardIndex}
            cardsInStatic={cardsInStatic}
            setPopup={setPopupState}
            uploadDataToFirebase={() =>
              uploadDataToFirebase(
                templateCollection,
                templateName,
                staticColumns,
                dynamicColumn,
                stickers
              )
            }
          />
        );
      case 13:
        return (
          <PriceBoxFromCloud
            setPopup={setPopupState}
            setSelectedColumn={
              selectedCardIndex > maxStaticIndex
                ? setDynamicColumn
                : setStaticColumns
            }
            selectedColumn={
              selectedCardIndex > maxStaticIndex ? dynamicColumn : staticColumns
            }
            selectedCardIndex={selectedCardIndex}
            cardsInStatic={cardsInStatic}
            uploadDataToFirebase={() =>
              uploadDataToFirebase(
                templateCollection,
                templateName,
                staticColumns,
                dynamicColumn,
                stickers
              )
            }
          />
        );
      case 14:
        return (
          <IrregularImageCropper
            setPopup={setPopupState}
            setSelectedColumn={
              selectedCardIndex > maxStaticIndex
                ? setDynamicColumn
                : setStaticColumns
            }
            selectedColumn={
              selectedCardIndex > maxStaticIndex ? dynamicColumn : staticColumns
            }
            selectedCardIndex={selectedCardIndex}
            cardsInStatic={cardsInStatic}
            imgIndex={imgIndex}
            uploadDataToFirebase={() =>
              uploadDataToFirebase(
                templateCollection,
                templateName,
                staticColumns,
                dynamicColumn,
                stickers
              )
            }
            imageFolder={templateCollection}
          />
        );
        case 15:
          return <EditStickers setPopup={setPopupState} stickers={stickers} />;
        case 16:
          return (
            <AddStickersPopup
              setPopup={setPopupState}
              stickers={stickers}
              setStickers={setStickers}
              uploadDataToFirebase={() => uploadDataToFirebase(
                templateCollection,
                  templateName,
                  staticColumns,
                  dynamicColumn,
                  stickers
              )}
              imageFolder={"International"}
            />
          );
        case 17:
          return (
            <StikersFromCloud
              setPopup={setPopupState}
              stickers={stickers}
              setStickers={setStickers}
              uploadDataToFirebase={() =>
                uploadDataToFirebase(
                  templateCollection,
                  templateName,
                  staticColumns,
                  dynamicColumn,
                  stickers
                )
              }
            />
          );
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
          { src: "", zoom: 100, x: 0, y: 0, zIndex: -1 },
          { src: "", zoom: 100, x: 0, y: 0, zIndex: -1 },
        ],
        text: {
          top: "",
          left: "",
          priceBox: {
            text: [
              {
                text: "XS/$X",
                fontSize: 24,
                draggable: true,
                resizable: true,
                position: { x: 10, y: 0 },
                size: { x: 50, y: 50 },
              },
            ],
            width: "100",
            height: "50",
            backgroundColor: "red",
            textColor: "white",
            border: "black",
            borderRadius: true,
          },
        },
        index: i + 21,
      };
      cards.push(card);
    }
    setDynamicColumn(cards),
      () => {
        uploadDataToFirebase(
          templateCollection,
          templateName,
          staticColumns,
          dynamicColumn,
          stickers
        );
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
              const uploadedImageRef = ref(
                storage,
                `images/${templateCollection}/${file.name}`
              );
              uploadBytes(uploadedImageRef, file).then((snapshot) => {
                getDownloadURL(
                  ref(storage, `images/${templateCollection}/${file.name}`)
                ).then((url) => {
                  const newDynamicColumn = [...dynamicColumn];
                  const lastImg =
                    newDynamicColumn[cardIndex].img[
                      newDynamicColumn[cardIndex].img.length - 1
                    ];
                  console.log(url);
                  const updatedImg = {
                    src: url,
                    ...lastImg, // Copying other properties from the last image object
                  };
                  newDynamicColumn[cardIndex].img.push(updatedImg);
                  setDynamicColumn(newDynamicColumn);
                  setPopupState(0);
                  uploadDataToFirebase(
                    templateCollection,
                    templateName,
                    staticColumns,
                    newDynamicColumn,
                    stickers
                  );
                });
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
                `images/${templateCollection}/${file.name}`
              );
              uploadBytes(uploadedImageRef, file).then((snapshot) => {
                getDownloadURL(
                  ref(storage, `images/${templateCollection}/${file.name}`)
                ).then((url) => {
                  const newStaticColumns = [...staticColumns];
                  const lastImg =
                    newStaticColumns[cardIndex].img[
                      newStaticColumns[cardIndex].img.length - 1
                    ];
                  const updatedImg = {
                    ...lastImg,
                    src: url, // Copying other properties from the last image object
                  };
                  newStaticColumns[cardIndex].img.push(updatedImg);
                  console.log(updatedImg);
                  setStaticColumns(newStaticColumns);
                  setPopupState(0);
                  uploadDataToFirebase(
                    templateCollection,
                    templateName,
                    newStaticColumns,
                    dynamicColumn,
                    stickers
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

            imageToUpdate.img.splice(index, 1);
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
            imageToUpdate.img.splice(index, 1);
          }

          return newStaticColumns;
        });
      }
    }
  };

  const handleCropImage = () => {
    setPopupState(8);
  };

  const handleContextMenu = (event, cardIndex, column, image) => {
    event.preventDefault();

    const selectedColumn =
      cardIndex > maxStaticIndex ? dynamicColumn : staticColumns;

    const index =
      cardIndex > maxStaticIndex ? cardIndex - maxStaticIndex - 1 : cardIndex;

    const contextMenuItems = [
      {
        label: "PriceBox",
      },
      {
        label: "Edit",
        action: () => setPopupState(12),
      },
      {
        label: "Load",
        action: () => setPopupState(13),
      },
      { type: "divider" },
      {
        label: "Move Images",
        action: () => {
          setPopupState(9);
          setSelectedImage({ cardIndex });
        },
      },
      { type: "divider" },
      {
        label: "Image " + (selectedColumn[index].img.length + 1),
      },
      {
        label: "Upload",
        action: () => {
          setImgIndex(selectedColumn[index].img.length + 1);
          setPopupState(2);
          setSelectedCardIndex(cardIndex);
        },
      },
    ];

    selectedColumn[index].img.map((img, index) => {
      contextMenuItems.push(
        { type: "divider" },
        {
          label: "Image " + (index + 1),
        },
        {
          label: "Delete",
          action: async () => {
            await handleDeleteImage(cardIndex, index);
            await uploadDataToFirebase(
              templateCollection,
              templateName,
              staticColumns,
              dynamicColumn,
              stickers
            );
          },
        },
        {
          label: "Crop-Square",
          action: () => {
            setImgIndex(index);
            setSelectedCardIndex(cardIndex);
            handleCropImage(cardIndex, imgIndex);
          },
        },
        {
          label: "Auto-crop",
          action: () => {
            setImgIndex(index);
            setSelectedCardIndex(cardIndex);
            setPopupState(7);
          },
        },
        {
          label: "Freehand",
          action: () => {
            setImgIndex(index),
              setPopupState(14),
              setSelectedCardIndex(cardIndex);
          },
        }
      );
    });

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

    if (image.img.length === 0) {
      setPopupState(2);
      setSelectedCardIndex(cardIndex);
      console.log(selectedCardIndex);
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

          if (cardIndex - 21 <= 0) {
            console.log(cardIndex);
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
             {images.img.map((img, index) => (
                <img
                  name={`image-${cardIndex}-${index}`}
                  src={images.img[index] ? images.img[index].src : ""}
                  className={styles.uploadedImage}
                  style={{
                    transform: `scale(${
                      images.img[index].zoom / 100
                    }) translate(${
                      images.img[index].x / (images.img[index].zoom / 100)
                    }px, ${
                      images.img[index].y / (images.img[index].zoom / 100)
                    }px)`,
                    zIndex: images.img[index].zIndex,
                  }}
                />
              ))}
              <NewPriceBox
                cardIndex={cardIndex}
                priceBox={
                  dynamicColumn[cardIndex - cardsInStatic].text.priceBox
                }
              />
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

  const RenderCards = () => {
    const cards = [];

    for (let i = 0; i < 3; i++) {
      const column = [];

      for (let j = 0; j < 7; j++) {
        const cardIndex = j + i * 7;

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
            {images.map((img, index) => (
              <img
                name={`image-${cardIndex}-${index}`}
                src={img ? img.src : ""}
                className={styles.uploadedImage}
                style={{
                  transform: `scale(${img.zoom / 100}) translate(${
                    img.x / (img.zoom / 100)
                  }px, ${img.y / (img.zoom / 100)}px)`,
                  zIndex: img.zIndex,
                }}
              />
            ))}

            <NewPriceBox
              cardIndex={cardIndex}
              priceBox={staticColumns[cardIndex].text.priceBox}
            />

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
              maxCardPosition={20}
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
    cards.push(<RenderDynamicColumn />);
    return cards;
  };

  return (
    <div className={styles.body}>
      {renderPopup(popupState)}
      <Sidebar
        handleConvertToPDF={handleConvertToPDF}
        setPopup={setPopupState}
      />
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
    </div>
  );
}

export default International;
