import {
    deleteObject,
  getBytes,
  getStorage,
  listAll,
  ref,
  updateMetadata,
  uploadBytes,
} from "firebase/storage";
import React, { useEffect, useState } from "react";
import styles from "./ManageTemplates.module.css";

export default function ManageTemplates({
  dynamicColumn,
  staticColumns,
  setDynamicColumn,
  setStaticColumns,
  templates,
  setTemplates,
  setPopup4,
}) {
  const storage = getStorage();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const templatesRef = ref(storage, "templates/");

  useEffect(() => {
    downloadTemplateFromCloud();
  }, []);

  const uploadTemplateToCloud = async () => {
    const fileName = prompt("Enter the name of the file");
    const fileContent = JSON.stringify({
      firstColumn: dynamicColumn,
      otherColumns: staticColumns,
    });

    // Validate file name and content
    if (!fileName || fileName.trim() === "") {
      console.error("File name is required");
      return;
    }

    const blob = new Blob([fileContent], { type: "text/plain" });

    if (fileName && blob) {
      try {
        const storageRef = ref(storage, `templates/${fileName}`);
        await uploadBytes(storageRef, blob);

        downloadTemplateFromCloud();
      } catch (error) {
        console.error("Error uploading file:", error.message);
      }
    } else {
      console.error("File name and content are required");
    }
  };

  const downloadTemplateFromCloud = (event) => {
    listAll(templatesRef)
      .then((result) => {
        // 'items' is an array that contains references to each item in the list
        const items = result.items;

        // Extract image names from references
        const names = items.map((item) => item.name);

        setTemplates(names);
        console.log(names);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleDeleteTemplate = () => {
    if (selectedTemplate == null) {
        console.error("No template selected");
        return;
    }

    const templateRef = ref(storage, `templates/${selectedTemplate}`)

    deleteObject(templateRef).then(() => {
        console.log("File deleted succesfully")

        downloadTemplateFromCloud();
    }).catch((error) => {
        console.log(error)
    })

  }

  const handleTemplateNameChange = async () => {
    if (selectedTemplate == null) {
      console.error("No template selected");
      return;
    }
  
    const templateRef = ref(storage, `templates/${selectedTemplate}`);
  
    try {
      const fileBytes = await getBytes(templateRef);
      // Convert the file bytes to a string
      const jsonString = new TextDecoder().decode(fileBytes);
  
      // Parse the JSON string
      const parsedResult = JSON.parse(jsonString);
  
      const fileName = prompt("Enter the new name of the file");
      if (!fileName || fileName.trim() === "") {
        console.error("File name is required");
        return;
      }

      if (fileName === selectedTemplate) {
        console.error("Please enter a different name");
        return;
      }
  
      const blob = new Blob([JSON.stringify(parsedResult)], { type: "text/plain" });
  
      if (fileName && blob) {
        const newStorageRef = ref(storage, `templates/${fileName}`);
        await uploadBytes(newStorageRef, blob);
        await deleteObject(templateRef);
        // After the deletion and upload, download the updated list of templates
        await downloadTemplateFromCloud();
      } else {
        console.error("File name and content are required");
      }
    } catch (error) {
      console.error("Error handling template name change:", error.message);
    }
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
    <div className={styles.background}>
      <div className={styles.popupContainer}>
        <div className={styles.sidebar}>
          <div>
            {templates != null &&
              templates.map((template) => (
                <div
                  onClick={() => setSelectedTemplate(template)}
                  style={{ backgroundColor: "white" }}
                  className={
                    selectedTemplate === template
                      ? `${styles.template} ${styles.selected}`
                      : styles.template
                  }
                >
                  <label>{template}</label>
                </div>
              ))}
          </div>
          <button onClick={uploadTemplateToCloud}>
            Upload Current Template
          </button>
          <button
            onClick={handleDeleteTemplate}
          >
            Delete Selected Template
          </button>
          <button
            onClick={handleTemplateNameChange}
          >
            Rename Selected Template
          </button>
          <button onClick={handleConfirmSelection}>
            Load Selected Template
          </button>
          <button onClick={() => setPopup4(false)}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
