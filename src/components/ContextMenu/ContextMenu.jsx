import React from "react";

export default function ContextMenu({
  x,
  y,
  items,
  onClose,
}) {
 
  return (
    <div
      style={{
        position: "absolute",
        top: `${y}px`,
        left: `${x}px`,
        border: "1px solid #ccc",
        background: "#fff",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
        borderRadius: "4px",
        padding: "5px",
        zIndex: "1000",
        color: "gray",
      }}
    >
      {items.map((item, index) => {
        if (item.type === "divider") {
          return (
            <div
              key={index}
              style={{
                borderTop: "1px solid #ccc",
                margin: "5px 0",
              }}
            ></div>
          );
        } else {
          return (
            <div
              key={index}
              style={{ cursor: "pointer", padding: "5px" }}
              onClick={() => {
                if (item.action) {
                  item.action();
                }
                onClose(); // Cierra el menú contextual al hacer clic en una opción
              }}
            >
              {item.label}
            </div>
          );
        }
      })}
      <div
        style={{
          cursor: "pointer",
          padding: "5px",
          borderTop: "1px solid #ccc",
          marginTop: "5px",
        }}
        onClick={() => onClose()} // Agrega una opción para cancelar y cerrar el menú contextual
      >
        Cancel
      </div>
    </div>
  );
}
