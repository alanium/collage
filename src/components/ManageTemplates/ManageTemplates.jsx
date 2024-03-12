import React, { useEffect, useState } from "react";
import styles from "./ManageTemplates.module.css";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../routes/root";

export default function ManageTemplates({
  dynamicColumn,
  staticColumns,
  setDynamicColumn,
  setStaticColumns,
  setTemplates,
  setPopup,
  setCurrentTemplate,
  templateFolder,
  cardsInStatic,
}) {
  const [visibleTemplates, setVisibleTemplates] = useState(8);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [renderedTemplates, setRenderedTemplates] = useState([]);

  const uploadTemplateToFirestore = async () => {
    const templateName = prompt("Enter the name of the template");

    // Validate template name
    if (!templateName || templateName.trim() === "") {
      console.error("Template name is required");
      return;
    }

    try {
      // Create a reference to the template document
      const groceryCollectionRef = collection(db, templateFolder);

      // Add the document with the user-inputted template name as the document ID
      await setDoc(doc(groceryCollectionRef, templateName), {
        dynamicColumn: dynamicColumn,
        staticColumns: staticColumns,
        name: templateName,
      });

      downloadTemplateFromFirestore();
    } catch (error) {
      console.error("Error uploading template:", error.message);
    } finally {
      setPopup(0);
    }
  };

  const downloadTemplateFromFirestore = async () => {
    try {
      const groceryCollectionRef = collection(db, templateFolder);
      const templatesQuerySnapshot = await getDocs(groceryCollectionRef);

      const templateNames = [];
      templatesQuerySnapshot.forEach((doc) => {
        templateNames.push(doc.id);
      });

      setTemplates(templateNames);
      setRenderedTemplates(templateNames.slice(0, visibleTemplates));
    } catch (error) {
      console.error("Error fetching template names:", error.message);
    }
  };

  const handleCreateNewTemplate = async () => {
    try {
      // Prompt the user for a name for the template
      const templateName = prompt("Enter Name for the template:");

      // Ensure the user entered a name
      if (!templateName) {
        console.error("No template name provided.");
        return;
      }

      // Get a reference to the "Grocery" collection
      const templatesCollection = collection(db, templateFolder);

      // Add the document with the provided name
      await setDoc(doc(templatesCollection, templateName), {
        staticColumns: Array(staticColumns.length)
          .fill()
          .map((_, index) => ({
            img: [
              { src: "", zoom: 100, x: 0, y: 0 },
              { src: "", zoom: 100, x: 0, y: 0 },
            ],
            text: {
              top: "",
              left: "",
              priceBox: {
                text: [{
                  text: "XS/$X",
                  fontSize: 24,
                  draggable: true,
                  resizable: true,
                  position: { x: 10, y: 0 },
                  size: { x: 50, y: 50 },
                }],
                width: "100",
                height: "50",
                backgroundColor: "red",
                textColor: "white",
                border: "black",
              },
            },
            index,
          })),
        dynamicColumn: [],
      });

      console.log("Template added successfully!");

      // Load the newly created template
      await handleConfirmSelection(templateName);

      // Close the ManageTemplates component
      setPopup(0);
    } catch (error) {
      console.error("Error uploading template:", error.message);
    }
  };

  const handleDeleteTemplate = async (templateName) => {
    try {
      const templatesCollection = collection(db, templateFolder);
      const querySnapshot = await getDocs(templatesCollection);

      console.log("Template Name:", templateName);
      console.log("Query Snapshot:", querySnapshot.docs);

      const deletePromises = [];

      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        console.log("Document Data:", data);
        if (doc.id === templateName) {
          deletePromises.push(deleteDoc(doc.ref));
        }
      });

      await Promise.all(deletePromises);

      console.log("Templates deleted successfully");
      await downloadTemplateFromFirestore(); // Wait for download to finish
    } catch (error) {
      console.error("Error deleting template:", error.message);
    }
  };

  const handleTemplateNameChange = async (templateName) => {
    try {
      const newTemplateName = prompt("Enter the new name of the template");
      const newTemplateId = newTemplateName;

      if (
        !newTemplateName ||
        newTemplateName.trim() === "" ||
        !newTemplateId ||
        newTemplateId.trim() === ""
      ) {
        console.error("Template name and ID are required");
        return;
      }

      const templatesCollection = collection(db, templateFolder);
      const querySnapshot = await getDocs(templatesCollection);
      let templateDoc;

      console.log("Template Name:", templateName);
      console.log("Query Snapshot:", querySnapshot.docs);

      // Find the document with the provided templateName
      querySnapshot.docs.forEach((doc) => {
        if (doc.id === templateName) {
          templateDoc = doc;
        }
      });

      console.log("Template Doc:", templateDoc);

      if (templateDoc) {
        // Create a new document with the newTemplateId and newTemplateName
        await setDoc(doc(db, "Grocery", newTemplateId), {
          dynamicColumn: templateDoc.data().dynamicColumn,
          staticColumns: templateDoc.data().staticColumns,
          name: newTemplateName,
        });

        // Delete the old document
        await deleteDoc(doc(db, templateFolder, templateDoc.id));

        console.log("Template updated successfully");
        downloadTemplateFromFirestore();
      } else {
        console.error("Template not found");
      }
    } catch (error) {
      console.error("Error updating template:", error.message);
    }
  };

  const handleConfirmSelection = async (templateName) => {
    try {
      const templatesCollection = collection(db, templateFolder);
      const querySnapshot = await getDocs(templatesCollection);
      let templateDoc;

      console.log("Template Name:", templateName);
      console.log("Query Snapshot:", querySnapshot.docs);
      querySnapshot.docs.forEach((doc) => {
        if (doc.id === templateName) {
          templateDoc = doc;
        }
      });

      if (templateDoc) {
        const templateData = templateDoc.data();
        console.log(templateData.dynamicColumn);
        console.log(templateData.staticColumns);

        setCurrentTemplate(templateDoc.id);
        setDynamicColumn(templateData.dynamicColumn);
        setStaticColumns(templateData.staticColumns);
        setSelectedTemplate(null);
        setTemplates(null);
        setPopup(0);
      } else {
        console.error("Template not found");
      }
    } catch (error) {
      console.error("Error loading template:", error.message);
    } finally {
      setPopup(0);
    }
  };

  const loadMoreTemplates = () => {
    setVisibleTemplates((prevCount) => prevCount + 8);
  };

  const loadTemplate = (event) => {
    event.preventDefault();
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json"; // Corrected file extension
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const result = e.target.result;
          try {
            const parsedResult = JSON.parse(result);

            // Prompt user to enter the template name
            const templateName = prompt("Enter template name:");
            if (!templateName || templateName.trim() === "") {
              console.error("Template name is required");
              return;
            }

            // Save the template to Firestore
            const templatesCollection = collection(db, templateFolder);
            await addDoc(templatesCollection, {
              name: templateName,
              dynamicColumn: parsedResult.dynamicColumn,
              staticColumns: parsedResult.staticColumns,
            });

            // Refresh template list
            downloadTemplateFromFirestore();
          } catch (error) {
            console.error("Error parsing JSON:", error);
          }
        };
        reader.readAsText(file); // Use readAsText to read JSON content
      }
    };
    input.click();
  };

  const saveTemplate = async (event) => {
    const templateName = prompt("Enter template name:");
    if (!templateName || templateName.trim() === "") {
      console.error("Template name is required");
      return;
    }

    try {
      const templatesCollection = collection(db, templateFolder);
      const querySnapshot = await getDocs(templatesCollection);
      const templateDoc = querySnapshot.docs.find(
        (doc) => doc.data().name === templateName
      );

      if (templateDoc) {
        const templateData = templateDoc.data();

        // Create a Blob from the template data
        const blob = new Blob(
          [
            JSON.stringify({
              firstColumn: templateData.dynamicColumn,
              otherColumns: templateData.staticColumns,
            }),
          ],
          { type: "application/json" }
        );

        // Create a URL for the Blob and trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${templateName}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        console.error("Template not found");
      }
    } catch (error) {
      console.error("Error saving template:", error.message);
    }
  };

  useEffect(() => {
    downloadTemplateFromFirestore();
  }, []);

  return (
    <div className={styles.background}>
      <div className={styles.container}>
        <table >
          <thead>
            <tr >
              <th >Name</th>
              <th >Actions</th>
            </tr>
          </thead>
          <div style={{ overflowY: "auto", maxHeight: "400px" }}>
          <tbody >
            {renderedTemplates.map((template) => (
              <tr key={template}>
                <td onClick={() => setSelectedTemplate(template)}>
                  {template}
                </td>
                <td>
                  <button onClick={() => handleConfirmSelection(template)}>
                    Load
                  </button>
                  <button onClick={() => handleDeleteTemplate(template)}>
                    Delete
                  </button>
                  <button onClick={() => handleTemplateNameChange(template)}>
                    Rename
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          </div>
         
        </table>
        <button onClick={loadMoreTemplates}>Show More</button>
        <button onClick={handleCreateNewTemplate}>Create New Template</button>

        <button onClick={uploadTemplateToFirestore}>
          Upload Current Template
        </button>
        <button onClick={(event) => loadTemplate(event)}>
          Load Template From Computer
        </button>
        <button onClick={(event) => saveTemplate(event)}>
          Download Template To Computer
        </button>
        <button onClick={() => setPopup(0)}>Cancel</button>
      </div>
    </div>
  );
}
