import React, { useState, useEffect, useRef } from "react";
import styles from "./Grocery.module.css";
import FixedBox from "../../components/BoxWithText/BoxWithText";
import TripleBox from "../../components/TripleBoxWithText/TripleBoxWithText";
import { useNavigate } from "react-router-dom";
import AmountForPrice from "../../components/AmountForPrice/AmountForPrice";
import TextBoxLeft from "../../components/ParagraphBox/ParagraphBox";
import TopTextBox from "../../components/TopTextBox/TopTextBox";
import TextPopUp from "../../components/TextPopup/TextPopup";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  setDoc,
  doc,
  getDocs,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import ImageUploader from "../../components/ImageToCloud/ImageToCloud";
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

const groceryRef = collection(db, "Grocery");
const templatesQuerySnapshot = await getDocs(groceryRef);

function Grocery({ uploadDataToFirebase, handleConvertToPDF, renderPriceBox }) {
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
  const [isCroppingImage, setIsCroppingImage] = useState(false);
  const [isAutomaticCropping, setIsAutomaticCropping] = useState(false);
  const [selectedImage, setSelectedImage] = useState({});
  const [selectedTextBox, setSelectedTextBox] = useState({});
  const [selectedCardIndex, setSelectedCardIndex] = useState({});
  const [info, setInfo] = useState(false);
  const [popup, setPopup] = useState(false);
  const [type, setType] = useState("");
  const [popup2, setPopup2] = useState(false);
  const [popup3, setPopup3] = useState(false);
  const [popup4, setPopup4] = useState(true);
  const [popup5, setPopup5] = useState(false);
  const [templates, setTemplates] = useState(null);
  const [images, setImages] = useState(null);
  const [imgIndex, setImgIndex] = useState(null);
  const [templateName, setTemplateName] = useState(templatesQuerySnapshot[0]);

  const storage = getStorage();
  const imagesRef = ref(storage, "images/Grocery");
  const maxStaticIndex = 20;
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
              const uploadedImageRef = ref(
                storage,
                `images/Grocery/${file.name}`
              );
              uploadBytes(uploadedImageRef, file).then((snapshot) => {
                getDownloadURL(
                  ref(storage, `images/Grocery/${file.name}`)
                ).then((url) => {
                  const newDynamicColumn = [...dynamicColumn];
                  newDynamicColumn[cardIndex].img[img].src = url;
                  setDynamicColumn(newDynamicColumn);
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
                getDownloadURL(
                  ref(storage, `images/Grocery/${file.name}`)
                ).then((url) => {
                  const newStaticColumns = [...staticColumns];
                  newStaticColumns[cardIndex].img[img].src = url;
                  setStaticColumns(newStaticColumns);
                });
              });
            }
          };
          input.click();
        }
      });
    }
    setPopup2(false);
    uploadDataToFirebase("Grocery");
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
    uploadDataToFirebase();
  };

  const switchBoxType = (cardIndex) => {
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
    uploadDataToFirebase();
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
    uploadDataToFirebase();
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
    uploadDataToFirebase();
  };

  const handleCropImage = () => {
    setIsCroppingImage(true);
  };

  const handleContextMenu = (event, cardIndex, column, image) => {
    event.preventDefault();

    const selectedColumn =
      cardIndex > maxStaticIndex ? dynamicColumn : staticColumns;

    const index =
      cardIndex > maxStaticIndex ? cardIndex - maxStaticIndex - 1 : cardIndex;

    const contextMenuItems = [
      {
        label: "Show/Hide Price Box",
        action: () => showHidePriceBox(cardIndex),
      },
      {
        label: "Change Price Box Type",
        action: () => switchBoxType(cardIndex),
      },
      {
        label: "Change Price Box Color",
        action: () => changePriceBoxColor(cardIndex),
      },
      {
        label: "Change Price Box Border",
        action: () => changePriceBoxBorder(cardIndex),
      },
      { type: "divider" },
      {
        label: "Move Images",
        action: () => {
          setIsEditingZoom(true);
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
          setPopup2(true);
          setSelectedCardIndex(cardIndex);
        },
      });
    } else if (selectedColumn[index].img[1].src != "") {
      contextMenuItems.push({
        label: "Delete Image 2",
        action: async () => {
          await handleDeleteImage(cardIndex, 1);
          await uploadDataToFirebase();
        },
      });
    }
    if (selectedColumn[index].img[0].src == "") {
      contextMenuItems.push({
        label: "Upload Image 1",
        action: () => {
          setImgIndex(0);
          setPopup2(true);
          setSelectedCardIndex(cardIndex);
        },
      });
    }
    if (selectedColumn[index].img[0].src != "") {
      contextMenuItems.push({
        label: "Delete Image 1",
        action: async () => {
          await handleDeleteImage(cardIndex, 0);
          await uploadDataToFirebase();
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
            setImgIndex(0), setIsAutomaticCropping(true);
            setSelectedCardIndex(cardIndex);
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
            setIsAutomaticCropping(true);
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

    const auxIndex = cardIndex > 20 ? cardIndex - 21 : cardIndex;

    if (!event.target.classList.contains(styles.card)) {
      return;
    }
    const image = (cardIndex > 20 ? dynamicColumn : staticColumns)[auxIndex];

    if (image.img[0].src === "" && image.img[1].src === "") {
      setPopup2(true);
      setSelectedCardIndex(cardIndex);
      console.log(selectedCardIndex);
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
        setPopup2(false);
      })
      .then(setPopup2(false))
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
              {dynamicColumn[cardIndex - 21] &&
              dynamicColumn[cardIndex - 21].text.renderPriceBox ? (
                <div className="priceBox">
                  {renderPriceBox(
                    dynamicColumn[cardIndex - 21].text.priceBoxType,
                    dynamicColumn,
                    setDynamicColumn,
                    cardIndex - 21,
                    dynamicColumn[cardIndex - 21].text.priceBoxColor,
                    dynamicColumn[cardIndex - 21].text.priceBoxBorder
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
          textBoxes.push(card.text);
        });

        column.push(
          <div
            name={`card-${cardIndex}`}
            className={styles.card}
            key={cardIndex}
            onClick={(event) => handleCardClick(cardIndex, event)}
          >
            {/* {images[0] && images[0].src != "" && ( // Check if img[0] exists before rendering
              <AutomaticImageCropper
                selectedCardColumn={staticColumns}
                cardIndex={cardIndex}
                imageIndex={0}
              />
            )}

            {images[1] && images[1].src != "" && ( // Check if img[1] exists before rendering
               <AutomaticImageCropper
               selectedCardColumn={staticColumns}
               cardIndex={cardIndex}
               imageIndex={1}
             />
            )} */}
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
          textBox={selectedImage.cardIndex > 20 ? dynamicColumn : staticColumns}
          setTextBox={
            selectedImage.cardIndex > 20 ? setDynamicColumn : setStaticColumns
          }
          setPopup={setPopup}
          cardIndex={selectedImage}
          type={type}
          maxCardPosition={20}
          uploadDataToFirebase={uploadDataToFirebase}
        />
      ) : null}

      {isEditingZoom && (
        <ResizableImage
          cardIndex={
            selectedImage.cardIndex > 20
              ? selectedImage.cardIndex - 21
              : selectedImage.cardIndex
          }
          selectedColumn={
            selectedImage.cardIndex > 20 ? dynamicColumn : staticColumns
          }
          setSelectedColumn={
            selectedImage.cardIndex > 20 ? setDynamicColumn : setStaticColumns
          }
          setIsEditingZoom={setIsEditingZoom}
          cardNumber={selectedImage.cardIndex}
          imageFolder="Grocery"
          uploadDataToFirebase={uploadDataToFirebase}
        />
      )}
      {isCroppingImage && (
        <ImageCropper
          src={
            selectedCardIndex > 20
              ? dynamicColumn[selectedCardIndex - 21].img[imgIndex].src
              : staticColumns[selectedCardIndex].img[imgIndex].src
          }
          setIsCroppingImage={setIsCroppingImage}
          selectedColumn={
            selectedCardIndex > 20 ? dynamicColumn : staticColumns
          }
          setSelectedColumn={
            selectedCardIndex > 20 ? setDynamicColumn : setStaticColumns
          }
          selectedCardIndex={selectedCardIndex}
          imageIndex={imgIndex}
          imageFolder="Grocery"
          uploadDataToFirebase={uploadDataToFirebase}
        />
      )}
      {isAutomaticCropping && (
        <AutomaticImageCropper
          selectedCardColumn={
            selectedCardIndex > 20 ? dynamicColumn : staticColumns
          }
          setSelectedCardColumn={
            selectedCardIndex > 20 ? setDynamicColumn : setStaticColumns
          }
          cardIndex={selectedCardIndex}
          imageIndex={imgIndex}
          setIsAutomaticCropping={setIsAutomaticCropping}
          uploadDataToFirebase={uploadDataToFirebase}
          maxStaticIndex={20}
        />
      )}
      {popup2 ? (
        <ImportPopup
          getImageList={getImageList}
          setPopup2={setPopup2}
          handleImageUpload={handleImageUpload}
          selectedCardIndex={selectedCardIndex}
          imgIndex={imgIndex}
        />
      ) : null}
      {popup3 ? <ClosePopup setPopup3={setPopup3} /> : null}
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
          templateFolder="Grocery"
        />
      ) : null}
      {popup5 ? <BugReport setPopup5={setPopup5} /> : null}

      <Sidebar
        handleConvertToPDF={handleConvertToPDF}
        setInfo={setInfo}
        info={info}
        setPopup3={setPopup3}
        setPopup4={setPopup4}
        setPopup5={setPopup5}
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
          imageFolder="Grocery"
          uploadDataToFirebase={uploadDataToFirebase}
        />
      ) : null}
    </div>
  );
}

export default Grocery;
