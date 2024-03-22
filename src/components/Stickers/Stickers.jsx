import React from "react";
import styles from "./Stickers.module.css"

export default function Stickers({stickers}) {
  const [stickers, setStickers] = useState([]);

  return (
    <div className={styles.container} >
      {stickers.map((sticker) => (
        <img
          src={sticker.src}
          style={{
            transform: `scale(${sticker.zoom / 100}) translate(${
              sticker.x / (sticker.zoom / 100)
            }px, ${sticker.y / (sticker.zoom / 100)}px)`,
            zIndex: sticker.zIndex,
          }}
        />
      ))}
    </div>
  );
}
