"use client";
import React, { useState, useEffect } from "react";
import "../style/external_user.css";
import "../style/datepicker_new.css";
import { useSelector } from "react-redux";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Sidebarpartida from "./new_partida";
import Card from "./card_detalle_suma";
import { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
registerLocale("es", es);
import "primereact/resources/themes/saga-blue/theme.css"; //tema
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //iconos
import "../style/custom_confirmation.css";
import {
  Crown,
  List,
  Calendar,
  User,
  Ticket,
  AudioLines,
  Cylinder,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";
import Treedetallesuma from "./tree_detalle_suma";
import Hidebyrol from "./hiddenroles";
import Select from "react-select";

const Partidadetalle = ({
  users,
  id,
  idKey,
  nivel,
  index,
  indexsub,
  tareaIndex,
  subtareaIndex,
  nombre,
  cantidad,
  unidad,
  idbyproyect,
}) => {
  const [autoIncremento, setAutoIncremento] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);

  const userStore = useSelector((state) => state.user);
  const saludo = userStore.user ? `${userStore.user.names}` : "";

  // console.log("proyecto id", idbyproyect);

  useEffect(() => {
    let intervalo;
    if (autoIncremento) {
      intervalo = setInterval(() => {
        setFormData((formData) => ({
          ...formData,
          cant_partidas:
            autoIncremento === "incremento"
              ? formData.cant_partidas + 1
              : Math.max(0, formData.cant_partidas - 1),
        }));
      }, 100);
    }
    return () => clearInterval(intervalo);
  }, [autoIncremento]);

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const returnalzada = () => {
    window.history.back();
  };

  return (
    <div className="flex flex-col max-w-full h-full bg-[#5C7891] bg-opacity-75 overflow-hidden">
      <div className="flex-grow justify-center items-center font-zen-kaku bg-[#FAFAFA] p-4 select-none">
        {/* <div className="text-2xl font-bold text-black mb-4 ml-4 select-none mt-6 font-zen-kaku">¡Hola {saludo || 'Test'}! 👋</div> */}
        <div className="mt-6"></div>
        <div className="flex items-center justify-between gap-4 mb-8 select-none font-zen-kaku">
          <label
            htmlFor="filtroSelect"
            className="col-span-1 text-base font-bold text-black ml-4 select-none font-zen-kaku"
          >
            Detalle de <span className="text-[#5C7891] text-lg">{nombre}</span>{" "}
            ({nivel})
          </label>
        </div>
        <div className="bg-white rounded-xl shadow-lg mx-auto max-w-full grid grid-flow-col custom-container">
          <div className="text-[#635F60] font-bold text-base">
            <Card
              index={index}
              indexsub={indexsub}
              tareaIndex={tareaIndex}
              subtareaIndex={subtareaIndex}
              nombre={nombre}
              cantidad={cantidad}
              unidad={unidad}
            />
          </div>
          <form className="mx-auto font-zen-kaku py-2 max-w-full">
            <div className="bg-white">
              <div className="flex justify-between items-center p-4">
                <div className="flex space-x-4 z-50 font-zen-kaku max-w-full overflow-hidden">
                  <div className="flex flex-nowrap mb-3 border-b-2 border-[#DDD9D8] pb-2 mr-4 ml-4 rounded-sm"></div>
                </div>
              </div>
              <div className="flex justify-start items-center gap-4 ">
                <div className="group z-40">
                  <button
                    type="button"
                    onClick={returnalzada}
                    className="flex items-center transition-all ease-linear duration-150 z-40  rounded-lg p-2 pl-2 pr-2 h-8 text-sm font-semibold text-[#5C7891] group-hover:text-teal-600 group-hover:border-gray-300"
                  >
                    <ChevronLeft className="group" color="#5C7891" />
                    Volver a la pagina anterior
                  </button>
                </div>
              </div>
              <div className="p-4 text-[#635F60] font-bold text-base">
                <Treedetallesuma
                  id={id}
                  idKey={idKey}
                  Hidebyrol={Hidebyrol}
                  id_proyecto={idbyproyect}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Partidadetalle;
