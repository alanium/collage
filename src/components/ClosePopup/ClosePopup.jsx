import React from "react";
import styles from "./ClosePopup.module.css"
import {  useNavigate } from "react-router-dom";

export default function ClosePopup ({setPopup}) {

  
const navigate = useNavigate();

    return (
        <div className={styles.backgroundPopUp2}>
        <div className={styles.popUp2}>
          <p>Do you really wish to go back?</p>
          <div>
            <button
              className={styles.popUp2Button}
              onClick={() => navigate("/")}
            >
              Yes
            </button>
            <button
              className={styles.popUp2Button}
              onClick={() => setPopup(0)}
            >
              No
            </button>
          </div>
        </div>
      </div>
    )
}