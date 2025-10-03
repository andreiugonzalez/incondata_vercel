import Image from 'next/image';
import { Upload, BriefcaseBusiness } from 'lucide-react';
import React, { useState } from 'react';


function NewMinaDoc() {

    const [uploadText, setUploadText] = useState('Subir foto');
    const [imagenPerfil, setImagenPerfil] = useState(null);
    const [profileFile, setProfileFile] = useState(null);

    const manejarCambioImagen = async (evento) => {
        console.log("manejarCambioImagen");
        const archivo = evento.target.files[0];
        console.log(archivo)
        if (archivo && archivo.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagenPerfil(reader.result);
            };
            reader.readAsDataURL(archivo);
            setUploadText('Cambiar foto');
            setProfileFile(archivo);
        }
    };

    return (
        <>
            <form className='mx-auto px-20' style={{ width: "37vw" }}>
                <>
                    <div className='flex flex-wrap mb-6'>
                        <div className='w-full px-3 mb-6 md:mb-0'>
                            <label className='font-zen-kaku flex justify-center select-none'>Agregar foto de perfil</label>
                        </div>
                    </div>
                    <div className='flex justify-center mb-3'>
                        <div className="relative w-32 h-32 rounded-full bg-[#D2E7E4] bg-opacity-80 border-[#7FC3BB] border-4 flex items-center justify-center overflow-hidden transition-transform transform-gpu hover:scale-110">
                            {imagenPerfil ? (
                                <Image src={imagenPerfil} alt="Foto de perfil" layout='fill' objectFit='cover' />
                            ) : (
                                <BriefcaseBusiness size={60} color="#87ACA7" />
                            )}
                        </div>

                    </div>

                    <div className='flex flex-wrap mb-3 mt-14'>
                        <div className='w-full px-3 md:mb-0'>
                            <label htmlFor="fileUpload" className="flex items-center px-4 py-3 border border-teal-500 rounded-lg cursor-pointer font-zen-kaku text-sm hover:shadow-lg select-none hover:border-teal-800 ease-linear transition-all duration-150">
                                <Upload color="#000000" className="mr-2 h-5 w-5" />
                                {uploadText}
                            </label>
                            <input type="file" id="fileUpload" className='hidden' onChange={manejarCambioImagen} aria-label="Agregar foto de perfil"/>

                        </div>
                    </div>
                </>
            </form>
        </>
    )
}

export default NewMinaDoc;