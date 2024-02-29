import React from "react";
import styles from "./RenderInfo.module.css"

export default function RenderInfo () {
    return (
      <div className={styles.infoTab}>
        <div>Info:</div>
        <div>
          <label>
            This tab explains how to use the functionalities of the page
          </label>
        </div>
        <div>
          Click on the plus sign to the left column to input the number of cards
          you want to have in the first column
        </div>
        <div>Click on a card to upload an image</div>
        <div>
          Click again on the uploaded image to open the context menu, where you
          can:
          <div>1- Edit the size and position of the image</div>
          <div>2- Show or hide the Price Box</div>
          <div>
            3- Manually change the Price Box Type (not recommended since it can
            lead to unwanted behaviour)
          </div>
          <div>4- Change the price box color</div>
          <div>5- upload a second image</div>
          <div>6- Cancel</div>
        </div>
        <div>
          Click on the Price Box, to write the content of the pricebox:
          <div>
            1. If you write "Number / $Number" the price box type 1 is
            automatically selected
          </div>
          <div>
            2. If you write "Number . Number + each/oz/lb/pk" the price box type
            2 is automatically selected
          </div>
          <div>
            3. If you write "Number for $ Number" the price box type 3 is
            automatically selected
          </div>
        </div>
      </div>
    );
  };