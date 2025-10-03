'use client';

import Image from "next/image";

export default function organization() {
    return (
        <>
            <div className="min-h-screen flex items-center justify-center pb-20 bg-white">
                <div className="max-w mx-auto mt-10 p-6">
                    <div className="text-center mb-8">
                        <Image src={`/hola.png`} alt="Logo" width={180} height={180} className="mx-auto" style={{ filter: 'brightness(50%)' }}/>
                    </div>
                    <h5 className="text-sm mb-4 text-center text-gray-500 opacity-50 font-zen-kaku">1/3</h5>
                    <h2 className="text-2xl mb-4 text-center font-bold font-zen-kaku">Personaliza tu equipo</h2>
                    <p className="text-center text-gray-500 mb-8 w-full font-zen-kaku">Configure su organización para miembros que puedan unirse más tarde.</p>
                    <form className="text-center">
                        <div className="p-4">
                            <label htmlFor="nombre" className="block text-gray-700 mb-2 text-left font-zen-kaku">Nombre de la compañia<span className="text-red-500">*</span></label>
                            <input type="text" id="nombre" name="nombre" className="form-input w-full py-3 rounded-md border border-teal-500" style={{ paddingLeft: '10px' }} />
                        </div>
                        <div className="p-4">
                            <label htmlFor="email" className="block text-gray-700 mb-2 text-left font-zen-kaku">Tipo de compañía<span className="text-red-500">*</span></label>
                            <select type="email" id="email" name="email" className="form-input w-full py-3 px-3 rounded-md border border-teal-500">
                                <option value="1">Micro</option>
                                <option value="1">Pequeña</option>
                                <option value="2">Mediana</option>
                                <option value="3">Grande</option>
                            </select>
                        </div>
                        <div className="p-4">
                            <label htmlFor="mensaje" className="block text-gray-700 mb-2 text-left font-zen-kaku">Número de usuarios en el equipo<span className="text-red-500">*</span></label>
                            <input type="email" id="email" name="email" className="form-input w-full py-3 rounded-md border border-teal-500" style={{ paddingLeft: '10px' }} />
                        </div>
                        <div className="text-center">
                            <button type="submit" className="bg-teal-500 text-black px-20 mt-20 py-2 rounded-md hover:bg-teal-500 font-bold">Continuar</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}