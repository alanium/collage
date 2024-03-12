import React, { useState, useRef, useEffect } from "react";
import styles from "./IrregularImageCropper.module.css";
import {
  getBytes,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";

const IrregularImageCropper = ({
  setPopup,
  selectedColumn,
  setSelectedColumn,
  selectedCardIndex,
  cardsInStatic,
  imgIndex,
  uploadDataToFirebase,
  imageFolder,
}) => {
  const [drawing, setDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const [imageData, setImageData] = useState(null);
  const [closedPath, setClosedPath] = useState(false);
  const [containerResolution, setContainerResolution] = useState({});
  const storage = getStorage();

  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const draggedPointIndex = useRef(null);

  const calculatedCardIndex =
    selectedCardIndex > cardsInStatic
      ? selectedCardIndex - cardsInStatic
      : selectedCardIndex;

  const imageSrc = selectedColumn[calculatedCardIndex].img[imgIndex].src;

  const renderContainerBox = () => {
    const elementToCopy = document.getElementsByName(
      `card-${selectedCardIndex}`
    )[0];
    const computedStyles = window.getComputedStyle(elementToCopy);
    const stylesToCopy = {};
    for (let i = 0; i < computedStyles.length; i++) {
      const propertyName = computedStyles[i];
      const propertyValue = computedStyles.getPropertyValue(propertyName);
      stylesToCopy[propertyName] = propertyValue;
    }
    setContainerResolution({
      width: Number(stylesToCopy.width.replace("px", "")) + 4,
      height: Number(stylesToCopy.height.replace("px", "")) + 5,
    });
  };

  useEffect(() => {
    renderContainerBox();
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const image = imageRef.current;

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      if (points.length >= 1) {
        context.save();
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          context.lineTo(points[i].x, points[i].y);
        }
        if (closedPath) {
          context.closePath();
          context.clip();
        }
        context.rect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "rgba(0, 0, 0, 0.3)";
        context.fill();
        context.restore();
        context.strokeStyle = "#3399ff"; // Color del borde
        context.lineWidth = 2;
        context.stroke();
        for (let i = 0; i < points.length; i++) {
          context.fillStyle = "#ffffff"; // Color de relleno blanco
          const squareSize = 7; // Tamaño del cuadrado
          context.fillRect(
            points[i].x - squareSize / 2,
            points[i].y - squareSize / 2,
            squareSize,
            squareSize
          );
          context.strokeStyle = "#3399ff"; // Color del borde
          context.strokeRect(
            points[i].x - squareSize / 2,
            points[i].y - squareSize / 2,
            squareSize,
            squareSize
          );
        }
      }
    };

    draw();
  }, [points, closedPath, imageData]);

  const handleMouseDown = (event) => {
    const { offsetX, offsetY } = event.nativeEvent;
    if (closedPath) {
      const clickedPointIndex = points.findIndex((point) => {
        const distance = Math.sqrt(
          (point.x - offsetX) ** 2 + (point.y - offsetY) ** 2
        );
        return distance <= 5; // Radius of 5 pixels for clicking
      });
      if (clickedPointIndex !== -1) {
        draggedPointIndex.current = clickedPointIndex;
        setDrawing(true);
      }
    } else {
      setDrawing(true);
      const clickedPointIndex = points.findIndex((point) => {
        const distance = Math.sqrt(
          (point.x - offsetX) ** 2 + (point.y - offsetY) ** 2
        );
        return distance <= 5; // Radius of 5 pixels for clicking
      });
      if (clickedPointIndex !== -1) {
        draggedPointIndex.current = clickedPointIndex;
      } else {
        setPoints([...points, { x: offsetX, y: offsetY }]);
      }
    }
  };

  const handleMouseUp = () => {
    setDrawing(false);
    draggedPointIndex.current = null;
  };

  const handleMouseMove = (event) => {
    if (drawing && draggedPointIndex.current !== null) {
      const { offsetX, offsetY } = event.nativeEvent;
      const newPoints = [...points];
      newPoints[draggedPointIndex.current] = { x: offsetX, y: offsetY };
      setPoints(newPoints);
    }
  };

  const handleDownload = async () => {
    const imageName = prompt("Enter the name of the image");
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Obtener las dimensiones originales de la imagen
    const originalWidth = imageRef.current.width;
    const originalHeight = imageRef.current.height;

    // Encontrar los límites del área recortada
    const minX = Math.min(...points.map((point) => point.x));
    const minY = Math.min(...points.map((point) => point.y));
    const maxX = Math.max(...points.map((point) => point.x));
    const maxY = Math.max(...points.map((point) => point.y));

    // Calcular las dimensiones del canvas recortado
    const croppedWidth = maxX - minX;
    const croppedHeight = maxY - minY;

    // Calcular la relación de escala
    const scaleX = originalWidth / canvas.width;
    const scaleY = originalHeight / canvas.height;

    // Crear un nuevo canvas para contener la imagen recortada con las mismas dimensiones que la región recortada
    const croppedCanvas = document.createElement("canvas");
    const croppedCtx = croppedCanvas.getContext("2d");
    croppedCanvas.width = croppedWidth * scaleX;
    croppedCanvas.height = croppedHeight * scaleY;

    // Recortar el contexto del canvas al área de la máscara de recorte
    croppedCtx.beginPath();
    croppedCtx.moveTo(
      (points[0].x - minX) * scaleX,
      (points[0].y - minY) * scaleY
    );
    for (let i = 1; i < points.length; i++) {
      croppedCtx.lineTo(
        (points[i].x - minX) * scaleX,
        (points[i].y - minY) * scaleY
      );
    }
    croppedCtx.closePath();
    croppedCtx.clip();

    // Dibujar la imagen original en el nuevo canvas recortado
    croppedCtx.drawImage(
      imageRef.current,
      -minX * scaleX,
      -minY * scaleY,
      originalWidth,
      originalHeight
    );

    // Descargar la imagen recortada

    const imageStorageRef = ref(storage, `images/${imageFolder}/${imageName}`);

    const imageData = croppedCanvas.toDataURL("image/png");

    // Create a Blob from the data URL
    const byteCharacters = atob(imageData.split(",")[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "image/png" });

    // Upload the image blob to Firebase Storage
    uploadBytes(imageStorageRef, blob).then(() => {
      // Get the download URL of the uploaded image
      getDownloadURL(imageStorageRef).then((url) => {
        // Update the source URL of the image in the selected column
        const newSelectedColumn = [...selectedColumn];
        newSelectedColumn[calculatedCardIndex].img[imgIndex].src = url;
        setSelectedColumn(newSelectedColumn);
        uploadDataToFirebase();
      });
    });
  };

  const handleUndo = () => {
    if (points.length > 0 && !closedPath) {
      const newPoints = [...points];
      newPoints.pop(); // Remove the last point
      setPoints(newPoints);
    }
  };

  return (
    <div className={styles.background}>
      <div
        className={styles.popupContainer}
        style={{
          position: "relative",
          height: `${containerResolution.height}px`,
          width: `${containerResolution.width}px`,
        }}
      >
        <img
          ref={imageRef}
          src={imageSrc}
          alt="Source"
          crossOrigin="anonymous"
          style={{ display: "none" }}
          onLoad={() => setImageData(imageRef.current)}
        />
        <canvas
          ref={canvasRef}
          width={containerResolution.width}
          height={containerResolution.height}
          style={{ border: "1px solid #000" }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        />
        <button onClick={handleDownload}>Accept</button>
        <button onClick={handleUndo}>Undo</button>
        <button onClick={() => setPopup(0)}>Cancel</button>
      </div>
    </div>
  );
};

export default IrregularImageCropper;
