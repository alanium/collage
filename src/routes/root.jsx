import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


export default function Root() {

    const navigate = useNavigate()

    const [mobile, setMobile] = useState(false)

    const esDispositivoMovilOTablet = () => {
        const anchoDePantalla = window.innerWidth;
        const esDispositivoMovil = anchoDePantalla <= 1100; // Consider anchos menores o iguales a 1100 as mobile or tablet
        setMobile(esDispositivoMovil);
    };

    useEffect(() => {
        const handleResize = () => {
            esDispositivoMovilOTablet();
        };

        // Attach the event listener
        window.addEventListener("resize", handleResize);

        // Call it initially to set the initial value
        esDispositivoMovilOTablet();

        // Detach the event listener on component unmount
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

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
            {mobile ? (
            <p>This page doesnt have mobile or tablet compatibility yet</p>
        ) : (
            null
      )}
        </>
    )
}