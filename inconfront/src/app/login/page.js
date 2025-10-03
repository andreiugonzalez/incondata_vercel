"use client";

import Link from "next/link";
import React from "react";
import ReactDOM from "react-dom";
import "../style/login.css";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

import Login_form from "../components/login";

export default function Login() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("Service worker registration failed:", error);
      });
    }
  }, []);
  return (
    <div className="relative h-full w-full max-h-full max-w-full">
      <div className="absolute inset-0">
        <Image
          src="/municipalidad.jpg" // Imagen de fondo de la municipalidad
          alt="Imagen de fondo"
          layout="fill"
          objectFit="cover"
          priority // Opcional: asegura que la imagen se cargue primero
        />
        <div className="absolute inset-0 bg-black opacity-60"></div>
      </div>

      <div className="relative z-10 flex flex-row items-center justify-between xl:min-h-full lg:min-h-full max-h-full p-8 responsive-mobil">
        <motion.div
          className="text-white lg:mb-32 xl:mb-32 max-w-lg md:max-w-sm sm:max-w-xs lg:max-w-lg xl:max-w-lg flex flex-col xl:justify-start lg:justify-start lg:items-start xl:items-start font-zen-kaku"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="reponsive-img">
            <h1
              className="mb-8 custom-mobil-img xl:mb-8 lg:mb-8 md:mb-0 md:w-56 md:ml-[4.5rem] lg:ml-[4.5rem] xl:ml-[4.5rem] xl:w-full lg:w-full font-zen-kaku font-extrabold text-7xl text-white select-none tracking-widest text-left uppercase"
              style={{ letterSpacing: "0.1em" }}
              title="Página de inicio de INCON"
            >
              INCON
            </h1>
          </div>
          <h1 className="text-4xl font-bold mb-4 select-none ml-[4.5rem] custom-tittle-login xl:text-4xl lg:text-4xl md:text-lg">
            Construyendo el futuro
          </h1>
          <p className="text-lg select-none ml-[4.6rem] custom-tittle-login2 xl:text-lg lg:text-lg md:text-base">
            En la infraestructura, cada día es una oportunidad de innovar y superar desafíos.  
            Nos dedicamos a construir un mundo más brillante; cada proyecto nos acerca un paso más a un mundo mejor.
          </p>
        </motion.div>

        <motion.div
          className="p-8 w-full h-full custom-padding-form"
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Login_form />
        </motion.div>
      </div>
    </div>
  );
}
