import React from "react";
import { useNavigate } from "react-router-dom";
import './Root.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faGlobe, faWineBottle, faCheese, faSnowflake, faFish, faUtensils, faBuilding } from '@fortawesome/free-solid-svg-icons';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import config from "../../config.json";

 const firebaseConfig = config;
 const app = initializeApp(firebaseConfig);
 const db = getFirestore(app);

  function Root() {
    const navigate = useNavigate();
    
    return (
        <div className="root-container">
            <button className="edit-button grocery" onClick={() => navigate("/grocery")}>
                <FontAwesomeIcon icon={faShoppingCart} className="icon" />
                <span>Grocery</span>
            </button>
            <button className="edit-button international" onClick={() => navigate("/international")}>
                <FontAwesomeIcon icon={faGlobe} className="icon" />
                <span>International</span>
            </button>
            <button className="edit-button liquor" onClick={() => navigate("/liquor&bakery")}>
                <FontAwesomeIcon icon={faWineBottle} className="icon" />
                <span>Bakery & Beverages</span>
            </button>
            <button className="edit-button dairy" onClick={() => navigate("/Dairy&Snacks")}>
                <FontAwesomeIcon icon={faCheese} className="icon" />
                <span>Dairy & Snacks</span>
            </button>
            <button className="edit-button frozen" onClick={() => navigate("/Frozen&Beverages")}>
                <FontAwesomeIcon icon={faSnowflake} className="icon" />
                <span>Frozen & Beverages</span>
            </button>
            <button className="edit-button meat" onClick={() => navigate("/Meat&Seafood")}>
                <FontAwesomeIcon icon={faFish} className="icon" />
                <span>Meat & Seafood</span>
            </button>
            <button className="edit-button delicatessen" onClick={() => navigate("/Delicatessen&More")}>
                <FontAwesomeIcon icon={faUtensils} className="icon" />
                <span>Delicatessen & More</span>
            </button>
            <button className="edit-button market" onClick={() => navigate("/NapervilleFreshMarket")}>
                <FontAwesomeIcon icon={faBuilding} className="icon" />
                <span>Naperville Fresh Market</span>
            </button>
        </div>
    );
}

export { Root, db };