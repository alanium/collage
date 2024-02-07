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
  const [visibleTemplates, setVisibleTemplates] = useState(8);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [renderedTemplates, setRenderedTemplates] = useState([]);
  const templatesRef = ref(storage, "templates/");

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
      } finally {
        setPopup4(false);
      }
    } else {
      console.error("File name and content are required");
      setPopup4(false);
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
        setRenderedTemplates(names.slice(0, visibleTemplates));
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

    const templateRef = ref(storage, `templates/${selectedTemplate}`);

    deleteObject(templateRef)
      .then(() => {
        console.log("File deleted succesfully");

        downloadTemplateFromCloud();
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(setPopup4(false));
  };

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

      const blob = new Blob([JSON.stringify(parsedResult)], {
        type: "text/plain",
      });

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
    } finally {
      setPopup4(false);
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
        } finally {
          setPopup4(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching template:", error.message);
        // Handle the error, e.g., set an error state or display a message to the user
      });
  };

  const loadMoreImages = () => {
    setVisibleTemplates((prevCount) => prevCount + 8);
  };

  useEffect(() => {
    downloadTemplateFromCloud();
  }, []);

  const handleUpdateTemplate = async () => {
    if (selectedTemplate == null) {
      console.error("No template selected");
      return;
    }

    const answer = prompt(
      "This action will REPLACE the selected template with the current one you're working with. Write REPLACE if you want to proceed"
    );

    if (answer.toLowerCase() !== "replace") {
      return;
    }

    try {
      const templateRef = ref(storage, `templates/${selectedTemplate}`);
      await deleteObject(templateRef);

      const fileContent = JSON.stringify({
        firstColumn: dynamicColumn,
        otherColumns: staticColumns,
      });

      // Validate file name and content
      if (!selectedTemplate || selectedTemplate.trim() === "") {
        console.error("File name is required");
        return;
      }

      const blob = new Blob([fileContent], { type: "text/plain" });

      if (selectedTemplate && blob) {
        const storageRef = ref(storage, `templates/${selectedTemplate}`);
        await uploadBytes(storageRef, blob);

        downloadTemplateFromCloud();
      } else {
        console.error("File name and content are required");
      }
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      setPopup4(false);
    }
  };

  return (
    <div className={styles.background}>
      <div className={styles.container}>
        <div>
          {renderedTemplates.length != 0 &&
            renderedTemplates.map((template) => (
              <div
                onClick={() => setSelectedTemplate(template)}
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
        <button onClick={uploadTemplateToCloud}>Upload Current Template</button>
        <button onClick={handleUpdateTemplate}>Update Selected Template</button>
        <button onClick={handleDeleteTemplate}>Delete Selected Template</button>
        <button onClick={handleTemplateNameChange}>
          Rename Selected Template
        </button>
        <button onClick={loadMoreImages}>Show More</button>
        <button onClick={handleConfirmSelection}>Load Selected Template</button>
        <button onClick={() => setPopup4(false)}>Cancel</button>
      </div>
    </div>
  );
}
