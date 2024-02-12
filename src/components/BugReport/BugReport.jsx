import React, { useState } from "react";
import emailjs from "emailjs-com";
import styles from "./BugReport.module.css";

function BugReport({ setPopup5 }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Configurar los parámetros para enviar el correo
    const templateParams = {
      from_name: email,
      to_name: "alan.mg.dev@gmail.com",
      message: message,
    };

    // Enviar el correo utilizando Email.js
    emailjs
      .send(
        "service_l7vg318",
        "template_smay5a7",
        templateParams,
        "ALARNV5ONwgU9C19t"
      )
      .then((response) => {
        console.log(
          "Correo enviado con éxito!",
          response.status,
          response.text
        );
      })
      .catch((error) => {
        console.error("Error al enviar el correo:", error);
      });

    // Limpiar el formulario después del envío
    setEmail("");
    setMessage("");
    setPopup5(false)
  };

  const handleClose = (e) => {
    setPopup5(false)
  }

  return (
    <div className={styles.background}>
      <div className={styles.sidebar}>
        <h1>Report a Bug</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Your Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <br />
          <label>
            Message:
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </label>
          <br />
          <button type="submit">Send</button>
          
        </form>
        <button onClick={handleClose} >Close</button>
      </div>
    </div>
  );
}

export default BugReport;
