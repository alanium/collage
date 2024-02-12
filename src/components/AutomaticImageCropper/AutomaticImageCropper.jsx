import React, { useRef, useEffect, useState } from "react";
import styles from "./AutomaticImageCropper.module.css";

const AutomaticImageCropper = ({
  selectedCardColumn,
  cardIndex,
  imageIndex,
}) => {
  const canvasRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [downloadedImgSrc, setDownloadedImgSrc] = useState(null);
  const selectedImage = selectedCardColumn[cardIndex].img[imageIndex];

  useEffect(() => {
    const downloadImage = async () => {
      try {
        const response = await fetch(selectedImage.src);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setDownloadedImgSrc(url);
      } catch (error) {
        console.error("Error downloading image:", error);
      }
    };

    if (selectedImage.src) {
      downloadImage();
    }
  }, [selectedImage.src]);

  useEffect(() => {
    if (!downloadedImgSrc) return;

    const image = new Image();
    image.src = downloadedImgSrc;

    image.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return; // Check if canvas is available

      const ctx = canvas.getContext("2d");
      canvas.width = image.width;
      canvas.height = image.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        if (data[i] === 255 && data[i + 1] === 255 && data[i + 2] === 255) {
          data[i + 3] = 0;
        }
      }
      ctx.putImageData(imageData, 0, 0);

      setImageLoaded(true);
    };
  }, [downloadedImgSrc]);

  return (
    <div
      name={`image-${cardIndex}-${imageIndex}`}
      className={styles.uploadedImage}
      style={{
        transform: `scale(${selectedImage.zoom / 100}) translate(${
          selectedImage.x / (selectedImage.zoom / 100)
        }px, ${selectedImage.y / (selectedImage.zoom / 100)}px)`,
      }}
    >
      {downloadedImgSrc && (
        <canvas
          ref={canvasRef}
          style={{ maxHeight: "80%", maxWidth: "80%", backgroundColor: "transparent" }}
        />
      )}
    </div>
  );
};

export default AutomaticImageCropper;