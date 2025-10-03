'use client';

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import {
    updateUser, getPaises, getRegionesPorPais, getComunasPorRegion, getAfp, getSalud, getEstado_civil,
    getCodTelefono, getOrganizacion, getRelacion, getPuesto, getGrupo, postUserProf, postUserDoc
} from '@/app/services/user';

function NewMinaForm({minaData, paises, users, organizations  }) {

    const [isSearchable, setIsSearchable] = useState(true);
    const [selectedPais, setSelectedPais] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [selectedComuna, setSelectedComuna] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedOrganization, setSelectedOrganization] = useState(null);

    const [regiones, setRegiones] = useState([]);
    const [comunas, setComunas] = useState([]);
    const [formData, setFormData] = useState({});
    const [paisOptions, setPaisOptions] = useState([]);
    const [userOptions, setUserOptions] = useState([]);
    const [organizationOptions, setOrganizationOptions] = useState([]);

    const handleInput = (e) => {
        const fieldName = e.target.name;
        const fieldValue = e.target.value;
        setFormData((prevState) => ({
            ...prevState,
            [fieldName]: fieldValue
        }));
    }

    const handleSelect = (selectedOption, actionMeta) => {
        const fieldName = actionMeta.name;
        const fieldValue = selectedOption ? selectedOption.value : null;
        setFormData((prevState) => ({
            ...prevState,
            [fieldName]: fieldValue
        }));

        switch (fieldName) {
            case 'id_comuna':
                setSelectedComuna(selectedOption);
                break;
            case 'id_usuario':
                setSelectedUser(selectedOption);
                break;
            case 'id_organizacion':
                setSelectedOrganization(selectedOption);
                break;
            default:
                break;
        }
    };

    const handleSelectPais = (selectedOption) => {
        setSelectedPais(selectedOption);
        setFormData((prevState) => ({
            ...prevState,
            id_pais: selectedOption ? selectedOption.value : null,
            id_region: null,
            id_comuna: null
        }));
        setRegiones(selectedOption ? selectedOption.regiones_pais : []);
        setSelectedRegion(null);
        setComunas([]);
        setSelectedComuna(null);
    };

    const handleSelectRegion = (selectedOption) => {
        setSelectedRegion(selectedOption);
        setFormData((prevState) => ({
            ...prevState,
            id_region: selectedOption ? selectedOption.value : null,
            id_comuna: null
        }));
        setComunas(selectedOption ? selectedOption.comunas_regions : []);
        setSelectedComuna(null);
    };

    useEffect(() => {
        if (minaData) {
            setFormData({ ...minaData });

            const paisSeleccionado = paisOptions.find(pais => pais.value === minaData.id_pais);
            setSelectedPais(paisSeleccionado || null);

            if (paisSeleccionado) {
                setRegiones(paisSeleccionado.regiones_pais || []);
            } else {
                setRegiones([]);
            }

            const regionSeleccionada = paisSeleccionado?.regiones_pais?.find(region => region.id_region === minaData.id_region);
            setSelectedRegion(regionSeleccionada || null);

            if (regionSeleccionada) {
                setComunas(regionSeleccionada.comunas_regions || []);
            } else {
                setComunas([]);
            }

            const comunaSeleccionada = regionSeleccionada?.comunas_regions?.find(comuna => comuna.id_comuna === minaData.id_comuna);
            setSelectedComuna(comunaSeleccionada || null);

            const usuarioSeleccionado = userOptions.find(user => user.value === minaData.id_usuario);
            setSelectedUser(usuarioSeleccionado || null);

            const organizacionSeleccionada = organizationOptions.find(org => org.value === minaData.id_organizacion);
            setSelectedOrganization(organizacionSeleccionada || null);
        }
        fetchOptions();
    }, [minaData, paisOptions, userOptions, organizationOptions]);

    const fetchOptions = async () => {
        try {
            const [paises, users, organizations] = await Promise.all([
                getPaises(),
                getUsers(),
                getOrganizacion()
            ]);

            setPaisOptions(paises.map(pais => ({
                value: pais.id_pais,
                label: pais.NombrePais,
                regiones_pais: pais.regiones_pais
            })));

            setUserOptions(users.map(user => ({ value: user.id, label: user.nombre })));
            setOrganizationOptions(organizations.map(org => ({ value: org.id, label: org.nombre })));
        } catch (error) {
            console.error('Error fetching options:', error);
        }
    };

    return (
        <form className='mx-auto px-10 font-zen-kaku ml-64 md:w-4/4' style={{ marginTop: "-90px" }}>
            <div className='flex flex-wrap mb-3'>
                <div className='w-full px-3 md:mb-0 z-50'>
                    <label className='font-zen-kaku font-semibold'>
                        | Nombre de la obra |
                    </label>
                    <input className="w-full px-3 py-2  rounded border border-[#5C7891] font-zen-kaku z-10" id="grid-first-name" type="text" placeholder="Ingresar nombre de obra" name='nombre' aria-label="Nombre de la Obra" onChange={handleInput} value={formData.name} />
                </div>
            </div>
            <div className='flex flex-row mb-3 '>
                <div className='w-full md:w-1/2 px-3 md:mb-0 z-50'>
                    <label className='font-zen-kaku z-50 font-semibold'>
                        Ubicación
                    </label>
                    <input className="w-full px-3 py-2 z-50 rounded border border-gray-300 font-zen-kaku" id="grid-first-name" type="text" placeholder="Ingrese ubicación" name='ubicacion' aria-label="Ubicación" onChange={handleInput} value={formData.direccion} />
                </div>
            </div>
            <div className='flex flex-nowrap mb-3 mt-1'>
                <div className='w-full md:w-1/3  px-3 md:mb-0 z-50'>
                    <label className='font-zen-kaku font-semibold'>
                        País
                    </label>
                    <Select
                        className={`basic-single font-zen-kaku`}
                        classNamePrefix="select"
                        isSearchable={isSearchable}
                        name="id_pais"
                        placeholder="Seleccione país"
                        options={paises.map(pais => ({
                            label: pais.NombrePais,
                            value: pais.id_pais,
                            regiones_pais: pais.regiones_pais
                        }))}
                        onChange={handleSelectPais}
                        value={selectedPais}
                        aria-label="Seleccione el país"
                    />
                </div>
                <div className='w-full md:w-1/3 px-3 md:mb-0'>
                    <label className='font-zen-kaku font-semibold'>
                        Región
                    </label>
                    <Select
                        className={`basic-single font-zen-kaku`}
                        classNamePrefix="select"
                        isSearchable={isSearchable}
                        name="id_region"
                        placeholder="Seleccione región"
                        options={regiones.map(region => ({
                            label: region.nombre,
                            value: region.id_region,
                            comunas_regions: region.comunas_regions
                        }))}
                        onChange={handleSelectRegion}
                        isDisabled={!selectedPais}
                        value={selectedRegion}
                        aria-label="Seleccione la región"
                    />
                </div>
                <div className='w-full md:w-1/3 px-3 md:mb-0'>
                    <label className='font-zen-kaku font-semibold'>
                        Comuna
                    </label>
                    <Select
                        className={`basic-single font-zen-kaku`}
                        classNamePrefix="select"
                        isSearchable={isSearchable}
                        name="id_comuna"
                        placeholder="Seleccione comuna"
                        options={comunas.map(comuna => ({
                            label: comuna.nombre,
                            value: comuna.id_comuna
                        }))}
                        onChange={handleSelect}
                        isDisabled={!selectedRegion}
                        value={selectedComuna}
                        aria-label='Seleccion la comuna'
                    />
                </div>
            </div>
            <div className='flex flex-wrap mb-3'>
                <div className='w-full md:w-1/3 px-3 mb-6 md:mb-0'>
                    <label className='font-zen-kaku font-semibold'>
                        Rut unidad técnica
                    </label>
                    <input className="w-full px-3 py-2  rounded border border-gray-300 font-zen-kaku" id="grid-first-name" type="text" placeholder="Ingresar rut unidad técnica" name='rut_unidad_tecnica' aria-label="Ingresar rut unidad técnica" onChange={handleInput} value={formData.rut} />
                </div>
                <div className='w-full md:w-1/3 px-3 md:mb-0'>
                    <label className='font-zen-kaku font-semibold'>
                        Usuario
                    </label>
                    <Select
                        className={`basic-single font-zen-kaku`}
                        classNamePrefix="select"
                        isSearchable={isSearchable}
                        name="id_usuario"
                        placeholder="Seleccionar responsable del proyecto"
                        options={users}
                        onChange={handleSelect}
                        value={selectedUser}
                        aria-label="Seleccionar responsable del proyecto"
                    />
                </div>
            </div>
            <div className='flex flex-auto mb-3'>
                <div className='w-full  px-3 md:mb-0'>
                    <label className='font-zen-kaku font-semibold'>
                        Organización
                    </label>
                    <Select
                        className={`basic-single font-zen-kaku`}
                        classNamePrefix="select"
                        isSearchable={isSearchable}
                        name="id_organizacion"
                        placeholder="Seleccionar organización"
                        options={organizations}
                        onChange={handleSelect}
                        value={selectedOrganization}
                        aria-label='Seleccionar organización'
                    />
                </div>
            </div>
        </form>
    )
}

export default NewMinaForm;