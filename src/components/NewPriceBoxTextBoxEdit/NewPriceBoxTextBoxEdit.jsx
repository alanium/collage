import React, { useState } from "react";

export default function NewPriceBoxTextBoxEdit({ textBox, onUpdate }) {
  const [fontSize, setFontSize] = useState(textBox.fontSize || ''); // Default to an empty string if fontSize is undefined
  const [text, setText] = useState(textBox.text || '')
  const [draggable, setDraggable] = useState(textBox.draggable);
  const [resizable, setResizable] = useState(textBox.resizable);

  const handleTextInputChange = (event) => {
    setText(event.target.value);
  };

  const handleDraggableResizable = () => {
    setDraggable(!draggable);
    setResizable(!resizable);
  };

  const handleFontSizeInputChange = (event) => {
    const newSize = parseInt(event.target.value);
  setFontSize(newSize);
  };

  const handleUpdate = () => {
    onUpdate({
      ...textBox,
      fontSize: fontSize,
      text: text,
      draggable: draggable,
      resizable: resizable,
    });
    
  };

  return (
    <div style={{ position: "absolute", top: 0, left: 0 }}>
      <input
        type="text"
        value={text}
        onChange={(e) => handleTextInputChange(e)}
        placeholder="Enter text"
      />
      <input
        type="number"
        value={fontSize}
        onChange={(e) => handleFontSizeInputChange(e)}
        placeholder="Font Size"
      />

      <button onClick={handleDraggableResizable}>Toggle Resizable</button>
      <button onClick={handleUpdate}>Update</button>
    </div>
  );
}
