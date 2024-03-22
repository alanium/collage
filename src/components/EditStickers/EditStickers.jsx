import React, { useEffect, useState } from "react";
import styles from "./EditStickers.module.css";
import EditStickersButtons from "../EditStickersButtons/EditStickersButtons";
import interact from "interactjs";

export default function EditStickers({ stickers, setPopup }) {
  const [tempStickers, setTempStickers] = useState([...stickers]);
  const [selectedSticker, setSelectedSticker] = useState(null);

  useEffect(() => {
    interact('.draggable-img')
      .draggable({
        inertia: true,
        autoScroll: true,
        onmove: dragMoveListener
      });
  }, []);

  function dragMoveListener(event) {
    const target = event.target;
    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    target.style.webkitTransform = target.style.transform = `translate(${x}px, ${y}px)`;
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  }

  return (
    <div className={styles.background}>
      <EditStickersButtons selectedSticker={selectedSticker} setPopup={setPopup} />
      <div className={styles.container}>
        {tempStickers.map((sticker, index) => (
          <img
            key={`sticker-${index}`}
            src={sticker ? sticker.src : ""}
            className={`${styles.uploadedImage} draggable-img`} // Add the draggable class here
            style={{
              transform: `scale(${sticker.zoom / 100}) translate(${sticker.x / (sticker.zoom / 100)}px, ${sticker.y / (sticker.zoom / 100)}px)`,
              zIndex: sticker.zIndex
            }}
            onClick={() => setSelectedSticker(sticker)}
          />
        ))}
      </div>
    </div>
  );
}