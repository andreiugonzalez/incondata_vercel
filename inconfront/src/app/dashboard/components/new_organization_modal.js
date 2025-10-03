'use client';

import { useState } from 'react';
const { useRouter } = require('next/navigation');

const Modalorganization = ({ isOpen }) => {

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [internalUserDrawer, setInternalUserDrawer] = useState(false);
    const [IsModalVisible, setIsModalVisible] = useState(true);
    const [userType, setUserType] = useState('interno');
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
        console.log(formData);
    };

    const handleChange = (e) => {
        setUserType(e.target.value);

        setIsModalVisible(false);

        if (e.target.value === 'interno') {
            router.push('/dashboard/organization_interno');
        }
        else {
            router.push('/dashboard/organization_external');
        }
    };

    return (
        <>
            {IsModalVisible && (<div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                <div className="relative w-100 my-6 mx-auto max-w-3xl">
                    {/*content*/}
                    <div className="border-0 rounded-lg p-4 shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                        {/*header*/}
                        <div className="flex items-start justify-between p-4 rounded-t">
                            <h3 className="text-3xl font-semibold font-zen-kaku select-none">
                                + Nueva organización
                            </h3>

                        </div>
                        {/*body*/}
                        <form className='h-100 w-100' onSubmit={onSubmit}>
                            <div className='flex flex-wrap mb-6'>
                                <div className='w-full px-3'>
                                    <select
                                        className="w-full px-3 py-2 bg-white font-zen-kaku border rounded hover:border-black ease-linear transition-all duration-200"
                                        id="userType"
                                        name="userType"
                                        aria-label="Campo de seleccion tipo de organización"
                                        onChange={handleChange}
                                        defaultValue=""
                                        required
                                    >
                                        <option className='font-zen-kaku' value="" disabled default>Selecciona tipo de organización:</option>
                                        <option className='font-zen-kaku' value="interno">Interno</option>
                                        {/* <option className='font-zen-kaku' value="externo">Externo</option> */}
                                    </select>
                                </div>
                            </div>
                        </form>
                        <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                            <button
                                className="text-red-500 background-transparent hover:text-red-300 font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 font-zen-kaku"
                                type="button"
                                onClick={() => isOpen(false)}
                            >
                                Cerrar
                            </button>

                        </div>
                    </div>
                </div>
            </div>)}
            <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
    );
};

export default Modalorganization;
