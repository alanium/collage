import React from "react";
import styles from "./Sidebar.module.css"
import ImageUploader from "../ImageToCloud/ImageToCloud";

export default function Sidebar({
  handleConvertToPDF,
  setPopup,
  uploadDataToFirebase,
}) {
  return (
    <div>
      <button
        style={{
          width: "165px",
          position: "fixed",
          top: "20px",
          left: "15px",
          backgroundColor: "gray",
          color: "white",
        }}
        onClick={handleConvertToPDF}
      >
        Make PDF
      </button>
      <button
        style={{
          width: "165px",
          position: "fixed",
          top: "70px",
          left: "15px",
          backgroundColor: "gray",
          color: "white",
        }}
        onClick={() => setPopup(6)}
      >
        Back to Home
      </button>
      <div className={styles.sidebar} style={{ top: "120px" }}>
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
            onClick={() => setPopup(10)}
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
              zIndex: "1",
            }}
            onClick={() => setPopup(4)}
          >
            Report a Bug
          </button>
          <button
            style={{
              width: "165px",
              position: "relative",
              backgroundColor: "gray",
              color: "white",
              marginBottom: "10px",
            }}
            onClick={() => setPopup(3)}
          >
            Open Template Manager
          </button>

          <ImageUploader
            uploadDataToFirebase={uploadDataToFirebase}
            imageFolder="Grocery"
          />
          <button
            style={{
              width: "165px",
              position: "relative",
              backgroundColor: "gray",
              color: "white",
              marginBottom: "10px",
            }}
            onClick={() => setPopup(15)}
          >
            Edit Stickers
          </button>
        </div>
      </div>
    </div>
  );
}
