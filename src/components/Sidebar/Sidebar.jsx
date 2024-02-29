import React from "react";
import styles from "./Sidebar.module.css"

export default function Sidebar({
  handleConvertToPDF,
  setPopup3,
  setInfo,
  setPopup5,
  setPopup4,
  uploadDataToFirebase,
  info
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
        onClick={() => setPopup3(true)}
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
            onClick={() => setInfo(!info)}
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
            onClick={() => setPopup5(true)}
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
            onClick={() => setPopup4(true)}
          >
            Open Template Manager
          </button>

          <ImageUploader
            uploadDataToFirebase={uploadDataToFirebase}
            imageFolder="Grocery"
          />
        </div>
      </div>
    </div>
  );
}
