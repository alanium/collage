import React, { useState, useEffect, useRef } from "react";
import styles from "./Grocery.module.css";
import { useNavigate } from "react-router-dom";
import TextBoxLeft from "../../components/ParagraphBox/ParagraphBox";
import TopTextBox from "../../components/TopTextBox/TopTextBox";
import TextPopUp from "../../components/TextPopup/TextPopup";
import { collection, onSnapshot, doc, getDocs } from "firebase/firestore";
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
import BugReport from "../../components/BugReport/BugReport";
import AutomaticImageCropper from "../../components/AutomaticImageCropper/AutomaticImageCropper";
import ImageCropper from "../../components/ImageCropper/ImageCropper";
import { db } from "../root";
import RenderInfo from "../../components/RenderInfo/RenderInfo";
import ContextMenu from "../../components/ContextMenu/ContextMenu";
import ImportPopup from "../../components/ImportPopup/ImportPopup";
import ClosePopup from "../../components/ClosePopup/ClosePopup";
import Sidebar from "../../components/Sidebar/Sidebar";
import NewPriceBoxEdit from "../../components/NewPriceBoxEdit/NewPriceBoxEdit";
import NewPriceBox from "../../components/NewPriceBox/NewPriceBox";
import PriceBoxFromCloud from "../../components/PriceBoxFromCloud/PriceBoxFromCloud";
import IrregularImageCropper from "../../components/IrregularImageCropper/IrregularImageCropper";

const groceryRef = collection(db, "Grocery");
const templatesQuerySnapshot = await getDocs(groceryRef);

function Grocery({ uploadDataToFirebase, handleConvertToPDF, renderPriceBox }) {
  const maxStaticIndex = 20;
  const cardsInStatic = 21;
  const templateCollection = "Grocery";
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

  const storage = getStorage();
  const imagesRef = ref(storage, "images/Grocery");
  const navigate = useNavigate();
  const contextMenuRef = useRef(null);

  useEffect(() => {
    const unsubscribeStaticColumns = onSnapshot(
      doc(db, `Grocery/${templateName}`),
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
      doc(db, `Grocery/${templateName}`),
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
        index: i + 21,
      };
      cards.push(card);
    }
    setDynamicColumn([...cards]),
      () => {
        uploadDataToFirebase(
          "Grocery",
          templateName,
          staticColumns,
          dynamicColumn
        );
      };
  };

  const renderPopup = (popupNumber) => {
    switch (popupNumber) {
      case 0:
        return "";
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
            imageFolder="Grocery"
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
            templateFolder="Grocery"
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
            imageFolder="Grocery"
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
            imageFolder="Grocery"
            uploadDataToFirebase={uploadDataToFirebase}
            templateName={templateName}
            maxStaticIndex={maxStaticIndex}
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
            imageFolder="Grocery"
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
            imageFolder="Grocery"
            templateCollection={templateCollection}
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
            uploadDataToFirebase={() => uploadDataToFirebase(
              "Grocery",
              templateName,
              staticColumns,
              dynamicColumn
            )}
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
            uploadDataToFirebase={() => uploadDataToFirebase(
              "Grocery",
              templateName,
              staticColumns,
              dynamicColumn
            )}
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
            uploadDataToFirebase={() => uploadDataToFirebase(
              "Grocery",
              templateName,
              staticColumns,
              dynamicColumn
            )}
            imageFolder={"Grocery"}
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
                `images/Grocery/${file.name}`
              );
              uploadBytes(uploadedImageRef, file).then((snapshot) => {
                getDownloadURL(ref(storage, `images/Grocery/${file.name}`))
                  .then((url) => {
                    const newDynamicColumn = [...dynamicColumn];
                    newDynamicColumn[cardIndex].img[img].src = url;
                    setDynamicColumn(newDynamicColumn);
                  })
                  .then(() => {
                    uploadDataToFirebase(
                      "Grocery",
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
                `images/Grocery/${file.name}`
              );
              uploadBytes(uploadedImageRef, file).then((snapshot) => {
                getDownloadURL(ref(storage, `images/Grocery/${file.name}`))
                  .then((url) => {
                    const newStaticColumns = [...staticColumns];
                    newStaticColumns[cardIndex].img[img].src = url;
                    setStaticColumns(newStaticColumns);
                  })
                  .then(() => {
                    uploadDataToFirebase(
                      "Grocery",
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

    () => setSelectedCardIndex(null);
    () => setSelectedImage(null);

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
      cardIndex > maxStaticIndex ? cardIndex - maxStaticIndex - 1 : cardIndex;

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
      contextMenuItems.push({
        label: "Delete Image 2",
        action: async () => {
          await handleDeleteImage(cardIndex, 1);
          await uploadDataToFirebase(
            "Grocery",
            templateName,
            staticColumns,
            dynamicColumn
          );
        },
      });
    }
    if (selectedColumn[index].img[0].src == "") {
      contextMenuItems.push({
        label: "Upload Image 1",
        action: () => {
          setImgIndex(0);
          setPopupState(2);
          setSelectedCardIndex(cardIndex);
        },
      });
    }
    if (selectedColumn[index].img[0].src != "") {
      contextMenuItems.push({
        label: "Delete Image 1",
        action: async () => {
          await handleDeleteImage(cardIndex, 0);
          await uploadDataToFirebase(
            "Grocery",
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
          label: "Crop Image 1",
          action: () => {
            setImgIndex(0);
            setSelectedCardIndex(cardIndex);
            handleCropImage(cardIndex, imgIndex);
          },
        },
        {
          label: "Delete Background of Image 1",
          action: () => {
            setImgIndex(0), setPopupState(7);
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
          label: "Crop Image 2",
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
        onClick={async (event) => handleDynamicColumns(event)}
      >
        <label style={{ fontSize: "84px", textAlign: "center", color: "gray" }}>
          +
        </label>
      </div>
    ) : (
      <div className={styles.firstCardColumn}>
        {dynamicColumn.map((card) => {
          const cardIndex = card.index;

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
                  src={
                    images.img[0].src
                      ? images.img[0].src
                      : "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                  }
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
                  src={
                    images.img[1]
                      ? images.img[1].src
                      : "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                  }
                  className={styles.uploadedImage}
                  style={{
                    transform: `scale(${images.img[1].zoom / 100}) translate(${
                      images.img[1].x / (images.img[1].zoom / 100)
                    }px, ${images.img[1].y / (images.img[1].zoom / 100)}px)`,
                  }}
                />
              )}

              <NewPriceBox
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
    const cards = [<RenderDynamicColumn />];

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
            {images[0] && ( // Check if img[0] exists before rendering
              <img
                name={`image-${cardIndex}-0`}
                src={
                  images[0].src
                    ? images[0].src
                    : "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                }
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
                src={
                  images[1]
                    ? images[1].src
                    : "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                }
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
          <div className={styles.overlay}>GROCERY</div>
        </div>
      </div>
    </div>
  );
}

export default Grocery;
