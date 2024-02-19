import React, { useRef, useEffect, useState } from "react";
import styles from "./AutomaticImageCropper.module.css";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

const AutomaticImageCropper = ({
  selectedCardColumn,
  setSelectedCardColumn,
  cardIndex,
  imageIndex,
  setIsAutomaticCropping
}) => {
  const canvasRef = useRef(null);
  const selectedImage = selectedCardColumn[cardIndex].img[imageIndex];
  const [downloadedSelectedImage, setDownloadedSelectedImage] = useState(null)
  const transparentCanvasRef = useRef(null);
  const storage = getStorage();
  const imagenSrc = selectedCardColumn[cardIndex].img[imageIndex].src
  const tempRef = ref(storage, "images/temp");
  const [transparentImageSrc, setTransparentImageSrc] = useState(null);

  useEffect(() => {
    const getImageFromFirebase = async () => {
      try {
        const imageUrl = await getDownloadURL(ref(storage, selectedCardColumn[cardIndex].img[imageIndex].src));
        const response = await fetch(imageUrl);
        const blob = await response.blob(); // Convert response to Blob
        return URL.createObjectURL(blob); // Create a local URL for the blob
      } catch (error) {
        console.error("Error downloading image:", error);
        return null;
      }
    };

    const processImage = async () => {
      const imageUrl = await getImageFromFirebase();
      if (imageUrl) {
        const image = new Image();
        image.src = imageUrl;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const transparentCanvas = transparentCanvasRef.current;
        const transparentCtx = transparentCanvas.getContext("2d");

        // Wait for the image to load before drawing it on the canvases
        image.onload = () => {
          const imageWidth = image.width;
          const imageHeight = image.height;
        
          // Set the dimensions of the canvases to match the image dimensions
          canvas.width = imageWidth;
          canvas.height = imageHeight;
          transparentCanvas.width = imageWidth;
          transparentCanvas.height = imageHeight;
        
          // Draw the image on the canvases
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        
          transparentCtx.drawImage(image, 0, 0, transparentCanvas.width, transparentCanvas.height);
        
          const imageData = transparentCtx.getImageData(
            0,
            0,
            transparentCanvas.width,
            transparentCanvas.height
          );
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            if (
              data[i] === 255 &&
              data[i + 1] === 255 &&
              data[i + 2] === 255
            ) {
              data[i + 3] = 0;
            }
          }
          transparentCtx.putImageData(imageData, 0, 0);

          // Convert the transparent canvas to a base64 image
          const transparentImageSrc = transparentCanvas.toDataURL("image/png");
          setTransparentImageSrc(transparentImageSrc);
        };
      }
    };

    processImage();
  }, [selectedCardColumn, cardIndex, imageIndex, storage]);
    
  

  const handleTransparentImageUpload = async () => {
    try {
      if (transparentImageSrc) {
        // Convert data URL to Blob
        const blob = await fetch(transparentImageSrc).then((res) => res.blob());

        // Create a File object from the Blob
        const file = new File([blob], `${Date.now()}_transparent_image.png`, {
          type: "image/png",
        });

        // Upload File to Firebase Storage
        const storageRef = ref(storage, `images/temp/${file.name}`);
        await uploadBytes(storageRef, file);
        console.log("Upload successful");
        await getDownloadURL(ref(storage, `images/temp/${file.name}`)).then(
          (url) => {
            const newCardColumn = [...selectedCardColumn];
            newCardColumn[cardIndex].img[imageIndex].src = url;
            setSelectedCardColumn(newCardColumn);
          }
        );
      } else {
        console.error("No transparent image to upload");
      }
    } catch (error) {
      console.error("Error uploading transparent image:", error);
    } finally {
      handleCancel()
    }
  };

  const handleCancel = () => {
    setIsAutomaticCropping(false)
  }

  return (
    <div
      name={`image-${cardIndex}-${imageIndex}`}
      className={styles.background}
    >
      <div className={styles.popupContainer}>
        <div>
          <canvas ref={canvasRef} />    
          <canvas
            ref={transparentCanvasRef}
            style={{ backgroundColor: "transparent" }}
          />         
        </div>
        <div className={styles.actionButtons}>
          <button onClick={handleTransparentImageUpload}>Crop Image</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AutomaticImageCropper;
