import React, { useState, useCallback, useEffect } from "react";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import Cropper from "react-easy-crop";
import styles from "./ImageCropper.module.css"

const ImageCropper = ({ src, setIsCroppingImage, selectedColumn, setSelectedColumn, selectedCardIndex }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [downloadedImgSrc, setDownloadedImgSrc] = useState(null)
  const [croppedArea, setCroppedArea] = useState(null);
  const [buttonType, setButtonType] = useState(0);
  const [aspectRatio, setAspectRatio] = useState({ x: 16, y: 9 });

  const storage = getStorage();

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    console.log(croppedArea, croppedAreaPixels);
    setCroppedArea(croppedAreaPixels);
  }, []);

  const changeCropAreaWidth = (increment) => {
    setAspectRatio((prevAspectRatio) => ({
      x: increment ? prevAspectRatio.x + 1 : prevAspectRatio.x - 1,
      y: prevAspectRatio.y,
    }));
  };

  const changeCropAreaHeight = (increment) => {
    setAspectRatio((prevAspectRatio) => ({
      x: prevAspectRatio.x,
      y: increment ? prevAspectRatio.y + 1 : prevAspectRatio.y - 1,
    }));
  };


  useEffect(() => {
    const downloadImage = async () => {
      try {
        const response = await fetch(src);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setDownloadedImgSrc(url);
      } catch (error) {
        console.error("Error downloading image:", error);
      }
    };

    if (src) {
      downloadImage();
    }
  }, []);


  const handleButton = (type) => {
    // Toggle between different button types
    switch (type) {
      case 0:
        uploadToFirebase();
        break;
      case 1:
        changeCropAreaWidth(true);
        break;
      case 2:
        changeCropAreaWidth(false);
        break;
      case 3:
        changeCropAreaHeight(true);
        break;
      case 4:
        changeCropAreaHeight(false);
        break;
      default:
        break;
    }
  };

  const uploadToFirebase = async () => {
    if (!croppedArea) return; // Ensure croppedArea is defined
    const imageRef = ref(storage, "images/cropped-image-test")
    const canvas = document.createElement("canvas");
    const image = new Image();
    image.src = downloadedImgSrc;
    image.onload = () => {
      canvas.width = croppedArea.width;
      canvas.height = croppedArea.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        image,
        croppedArea.x,
        croppedArea.y,
        croppedArea.width,
        croppedArea.height,
        0,
        0,
        croppedArea.width,
        croppedArea.height
      );
      canvas.toBlob(async (blob) => {
        await uploadBytes(imageRef, blob).then((snapshot) => {
          console.log("blob uploaded")
        })
        setIsCroppingImage(false)
        const newSelectedColumn=[...selectedColumn]
        getDownloadURL(ref(storage, 'images/cropped-image-test'))
          .then((url) => {
            newSelectedColumn[selectedCardIndex].img[0].src = url
            setSelectedColumn(newSelectedColumn)
          })
          .catch((error) => {
            console.log(error)
          })
        
      }, "image/png");
    };
  };

  return (
    <div className={styles.background}>
      <div className={styles.popupContainer}>
      <div>
        <Cropper
          image={downloadedImgSrc}
          crop={crop}
          zoom={zoom}
          zoomSpeed={0.01}
          aspect={aspectRatio.x / aspectRatio.y}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
        />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        <button onClick={() => handleButton(2)}>Make Crop Area Taller</button>
        <button onClick={() => handleButton(1)}>Make Crop Area Shorter</button>
        <button onClick={() => handleButton(3)}>Make Crop Area Thinner</button>
        <button onClick={() => handleButton(4)}>Make Crop Area Wider</button>
        <button onClick={() => handleButton(0)}>Download</button>
      </div>
      </div>
      
    </div>
  );
};

export default ImageCropper;
