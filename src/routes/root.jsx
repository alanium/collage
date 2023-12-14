import React from "react";
import { useNavigate } from "react-router-dom";


export default function Root() {

    const navigate = useNavigate()

    return (
        <>
            <div>
                <h1>Collage App</h1>
            </div>
            <div>
                <h2>Choose the page you want to edit</h2>
            </div>
            <div>
                <button onClick={() => navigate("/grocery")} >Grocery</button>
            </div>
        </>
    )
}