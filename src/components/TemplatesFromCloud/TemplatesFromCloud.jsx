import React, { useState } from "react";
import { getStorage, ref, getBytes, getDownloadURL } from "firebase/storage";
import styles from "./TemplatesFromCloud.module.css"

export default function TemplatesFromCloud({ templates, setDynamicColumn, setStaticColumns, setTemplates }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const storage = getStorage();

  const handleTemplateChange = (event) => {
    const selectedTemplateName = event.target.value;
    const selectedImageObject = templates.find((template) => template === selectedTemplateName);
    setSelectedTemplate(selectedImageObject);
  };

  const handleConfirmSelection = (event) => {
    event.preventDefault();
  
    if (selectedTemplate == null) {
      console.error("No template selected");
      return;
    }
    
    const templateRef = ref(storage, `templates/${selectedTemplate}`);
    getBytes(templateRef)
    .then((fileBytes) => {
      // Convert the file bytes to a string
      const jsonString = new TextDecoder().decode(fileBytes);
      
      try {
        // Parse the JSON string
        const parsedResult = JSON.parse(jsonString);
        setDynamicColumn(parsedResult.firstColumn);
        setStaticColumns(parsedResult.otherColumns);
        setSelectedTemplate(null);
        setTemplates(null);
      } catch (error) {
        console.error("Error parsing JSON:", error.message);
        // Handle the error, e.g., set an error state or display a message to the user
      }
    })
    .catch((error) => {
      console.error("Error fetching template:", error.message);
      // Handle the error, e.g., set an error state or display a message to the user
    });
  };

  return (
    <form className={styles.popupContainer}>
      <select  onChange={handleTemplateChange} value={selectedTemplate ? selectedTemplate : ""}>
        <option disabled value="">
          Select an image
        </option>
        {templates.map((template) => (
          <option key={template}>{template}</option>
        ))}
      </select>
      <button onClick={handleConfirmSelection}>Confirm Selection</button>
    </form>
  );
}