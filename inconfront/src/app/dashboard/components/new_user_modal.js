"use client";

import { useState } from "react";
import Drawer from "./new_user_externo";
import InternalUserDrawer from "./internal_user_drawer";
import { X } from "lucide-react";
const { useRouter } = require("next/navigation");

// MODAL COMENTADO PARA PRESERVAR FUNCIONALIDAD FUTURA
// Este modal permite seleccionar entre usuario interno y externo
// Actualmente deshabilitado ya que se redirige directamente a usuario interno

const Modal = ({ isOpen }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [internalUserDrawer, setInternalUserDrawer] = useState(false);
  const [IsModalVisible, setIsModalVisible] = useState(true);
  const [userType, setUserType] = useState("interno");
  const router = useRouter();

  const toggleDrawer = () => {
    isOpen(false);
    setDrawerOpen(!drawerOpen);
  };

  const toggleInternalUserDrawer = () => {
    isOpen(false);
    setInternalUserDrawer(!internalUserDrawer);
  };

  const onSubmit = (e) => {
    e.preventDefault();
  };

  const handleChange = (e) => {
    setUserType(e.target.value);

    setIsModalVisible(false);

    if (e.target.value === "interno") {
      router.push("/dashboard/internaluser");
    } else {
      router.push("/dashboard/externaluser");
    }
  };

  return (
    <>
      {/* CÓDIGO COMENTADO - Modal de selección de tipo de usuario */}
      {/* 
      {drawerOpen && (
        <Drawer
          isOpen={drawerOpen}
          onClose={toggleDrawer}
          userType={userType}
          setModalVisible={isOpen}
        />
      )}
      {internalUserDrawer && (
        <InternalUserDrawer
          isOpen={internalUserDrawer}
          onClose={toggleInternalUserDrawer}
          userType={userType}
          setModalVisible={isOpen}
        />
      )}
      {IsModalVisible && (
        <>
          <div className=" justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-100 my-6 mx-auto max-w-3xl">
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                <div className="flex items-center justify-between p-5 rounded-t font-zen-kaku">
                  <h3 className="text-3xl font-semibold">+ Nuevo usuario</h3>
                  <button
                    className="p-1 ml-auto bg-transparent border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => isOpen(false)}
                  >
                    <span className="text-black text-2xl">
                      <X className="stroke-black transition-all ease-linear duration-150 hover:scale-110" />
                    </span>
                  </button>
                </div>
                <form className="h-100 w-100" onSubmit={onSubmit}>
                  <div className="flex flex-wrap mb-6 font-zen-kaku p-4">
                    <div className="w-full px-3">
                      <select
                        className="w-full  px-3 py-2 border rounded bg-white hover:border-black ease-linear transition-all duration-150"
                        id="userType"
                        name="userType"
                        onChange={handleChange}
                        defaultValue=""
                        required
                        aria-label="Seleccionar tipo de usuario"
                      >
                        <option value="" disabled default>
                          Selecciona tipo de usuario:
                        </option>
                        <option value="interno">Interno</option>
                        <option value="externo">Externo</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      )}
      */}
    </>
  );
};

export default Modal;
