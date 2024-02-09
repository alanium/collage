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
  templateFolder
}) {
  const storage = getStorage();
  const [visibleTemplates, setVisibleTemplates] = useState(8);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [renderedTemplates, setRenderedTemplates] = useState([]);
  const templatesRef = ref(storage, `templates/${templateFolder}`);

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
        const storageRef = ref(storage, `templates/${templateFolder}/${fileName}`);
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

  const downloadTemplateFromCloud = () => {
    listAll(templatesRef)
      .then((result) => {
        const items = result.items;
        const names = items.map((item) => item.name);
        setTemplates(names);
        setRenderedTemplates(names.slice(0, visibleTemplates));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleDeleteTemplate = (templateName) => {
    const templateRef = ref(storage, `templates/${templateFolder}/${templateName}`);

    deleteObject(templateRef)
      .then(() => {
        console.log("File deleted successfully");
        downloadTemplateFromCloud();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleTemplateNameChange = async (templateName) => {
    const templateRef = ref(storage, `templates/${templateFolder}/${templateName}`);

    try {
      const fileBytes = await getBytes(templateRef);
      const jsonString = new TextDecoder().decode(fileBytes);

      const newFileName = prompt("Enter the new name of the file");
      if (!newFileName || newFileName.trim() === "") {
        console.error("File name is required");
        return;
      }

      if (newFileName === templateName) {
        console.error("Please enter a different name");
        return;
      }

      const blob = new Blob([jsonString], { type: "text/plain" });

      if (newFileName && blob) {
        const newStorageRef = ref(storage, `templates/${templateFolder}/${newFileName}`);
        await uploadBytes(newStorageRef, blob);
        await deleteObject(templateRef);
        downloadTemplateFromCloud();
      } else {
        console.error("File name and content are required");
      }
    } catch (error) {
      console.error("Error handling template name change:", error.message);
    } finally {
      setPopup4(false);
    }
  };

  const handleConfirmSelection = (templateName) => {
    const templateRef = ref(storage, `templates/${templateFolder}/${templateName}`);
    getBytes(templateRef)
      .then((fileBytes) => {
        const jsonString = new TextDecoder().decode(fileBytes);

        try {
          const parsedResult = JSON.parse(jsonString);
          setDynamicColumn(parsedResult.firstColumn);
          setStaticColumns(parsedResult.otherColumns);
          setSelectedTemplate(null);
          setTemplates(null);
        } catch (error) {
          console.error("Error parsing JSON:", error.message);
        } finally {
          setPopup4(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching template:", error.message);
      });
  };

  const loadMoreTemplates = () => {
    setVisibleTemplates((prevCount) => prevCount + 8);
  };

  const loadTemplate = (event) => {
    event.preventDefault();
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json"; // Corrected file extension
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target.result;
          try {
            const parsedResult = JSON.parse(result);
            setStaticColumns(parsedResult.otherColumns);
            setDynamicColumn(parsedResult.firstColumn);
          } catch (error) {
            console.error("Error parsing JSON:", error);
          }
        };
        reader.readAsText(file); // Use readAsText to read JSON content
      }
    };
    input.click();
  };

  const saveTemplate = (event) => {
    const newText = prompt("Enter template name: ");
    if (newText) {
      const blob = new Blob(
        [
          JSON.stringify({
            firstColumn: dynamicColumn,
            otherColumns: staticColumns,
          }),
        ],
        { type: "application/json" }
      );
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${newText}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  useEffect(() => {
    downloadTemplateFromCloud();
  }, []);

  return (
    <div className={styles.background}>
      <div className={styles.container}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {renderedTemplates.map((template) => (
              <tr key={template}>
                <td onClick={() => setSelectedTemplate(template)}>{template}</td>
                <td>
                  <button onClick={() => handleConfirmSelection(template)}>Load</button>
                  <button onClick={() => handleDeleteTemplate(template)}>Delete</button>
                  <button onClick={() => handleTemplateNameChange(template)}>Rename</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={loadMoreTemplates}>Show More</button>

        <button onClick={uploadTemplateToCloud}>Upload Current Template</button>
        <button
              onClick={(event) => loadTemplate(event)}
        >
              Load Template From Computer
        </button>
        <button
              onClick={(event) => saveTemplate(event)}
        >
              Download Template To Computer
        </button>
        <button onClick={() => setPopup4(false)}>Cancel</button>
      </div>
    </div>
  );
}