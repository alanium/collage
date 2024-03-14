import React, { useState, useEffect, useRef } from "react";
import styles from "./NapervilleFreshMarket.module.css";
import html2pdf from "html2pdf.js"; // Importa la biblioteca html2pdf
import { useNavigate } from "react-router-dom";
import TextBoxLeft from "../../components/ParagraphBox/ParagraphBox";
import TopTextBox from "../../components/TopTextBox/TopTextBox";
import TextPopUp from "../../components/TextPopup/TextPopup";
import ImageUploader from "../../components/ImageToCloud/ImageToCloud";
import { getStorage, ref, listAll, uploadBytes, getDownloadURL } from "firebase/storage";
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
import NewPriceBox from "../../components/NewPriceBox/NewPriceBox";
import Sidebar from "../../components/Sidebar/Sidebar";
import ContextMenu from "../../components/ContextMenu/ContextMenu";
import ImportPopup from "../../components/ImportPopup/ImportPopup";
import BugReport from "../../components/BugReport/BugReport";
import ClosePopup from "../../components/ClosePopup/ClosePopup";
import RenderInfo from "../../components/RenderInfo/RenderInfo";
import NewPriceBoxEdit from "../../components/NewPriceBoxEdit/NewPriceBoxEdit";
import PriceBoxFromCloud from "../../components/PriceBoxFromCloud/PriceBoxFromCloud";
import IrregularImageCropper from "../../components/IrregularImageCropper/IrregularImageCropper";

const groceryRef = collection(db, "NapervilleFresh");
const templatesQuerySnapshot = await getDocs(groceryRef);

function NapervilleFreshMarket(
  uploadDataToFirebase,
  handleConvertToPDF,) {
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
          },
        },
        index,
      }))
  );

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
  const maintenance = true
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
  const templateCollection  = "NapervilleFresh"

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
            maxStaticIndex={maxStaticIndex}
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
      case 12:
        return (
          <NewPriceBoxEdit  
            oldPriceBox={
              selectedCardIndex > maxStaticIndex
                ? dynamicColumn[selectedCardIndex - maxStaticIndex].text
                    .priceBox
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
                dynamicColumn
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
                dynamicColumn
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
                dynamicColumn
              )
            }
            imageFolder={imageFolder}
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
          { src: "", zoom: 100, x: 0, y: 0 },
          { src: "", zoom: 100, x: 0, y: 0 },
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
          },
        },
        index: i + cardsInStatic,
      };
      cards.push(card);
    }
    setDynamicColumn(cards),
    () => {
      uploadDataToFirebase(
        templateCollection,
        templateName,
        staticColumns,
        dynamicColumn
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

  const handleCropImage = () => {
    setPopupState(8);
  };


  const handleContextMenu = (event, cardIndex, column, image) => {
    event.preventDefault();

    const selectedColumn =
      cardIndex > maxStaticIndex ? dynamicColumn : staticColumns;

    const index =
      cardIndex > maxStaticIndex ? cardIndex - cardsInStatic : cardIndex;

    const contextMenuItems = [
      {
        label: "New Edit Price Box",
        action: () => setPopupState(12),
      },
      {
        label: "Load Price Box From Cloud",
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
          await uploadDataToFirebase(
            templateCollection,
            templateName,
            staticColumns,
            dynamicColumn
          );
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
          await uploadDataToFirebase(
            templateCollection,
            templateName,
            staticColumns,
            dynamicColumn
          );
        },
      });
    }
    if (selectedColumn[index].img[0].src != "") {
      contextMenuItems.push(
        {
          label: "crop image 1",
          action: () => {
            setImgIndex(0);
            setSelectedCardIndex(cardIndex);
            handleCropImage(cardIndex, imgIndex);
          },
        },
        {
          label: "Delete Background of Image 1",
          action: () => {
            setImgIndex(0);
            setPopupState(7);
            setSelectedCardIndex(cardIndex);
          },
        },
        {
          label: "Precise Crop Image 1",
          action: () => {
            setImgIndex(0), setPopupState(14), setSelectedCardIndex(cardIndex);
          },
        }
      );
    }
    if (selectedColumn[index].img[1].src != "") {
      contextMenuItems.push(
        {
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
            setPopupState(7);
          },
        },
        {
          label: "Precise Crop Image 2",
          action: () => {
            setImgIndex(2), setPopupState(14), setSelectedCardIndex(cardIndex);
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
             <NewPriceBox
                priceBox={dynamicColumn[calculatedCardIndex].text.priceBox}
              />
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
            <NewPriceBox
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
            <NewPriceBox priceBox={staticColumns[cardIndex].text.priceBox} />

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
      { maintenance ? (
          <>
      {renderPopup(popupState)}
          <Sidebar
            handleConvertToPDF={handleConvertToPDF}
            setPopup={setPopupState}
          />

      <div id="magazineContainer" style={{position: "relative"}}>
        <div style={{ display: "grid" }} className={styles.containerDivBorder}>
          <RenderTopCards />
          <img
            style={{ zIndex:"1", width: "100%", position: "absolute", top: "150px" }}
            src="../src/assets/images/naperville.jpg"
          />
          <div style={{ position: "relative" }}>
            <div className={styles.containerDiv} style={{ width: "98%", height: "183%", position: "absolute", top: "-420px" }} ref={contextMenuRef}>
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
      </div>
        </>) : (
        <h1>In maintenance..</h1>
      )}
    </div>
  );
}

export default NapervilleFreshMarket;
