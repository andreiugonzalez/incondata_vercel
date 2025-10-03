import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faTimes } from "@fortawesome/free-solid-svg-icons";
import { getrol, assignRolesToUser } from '../../services/user';

const highlightMatch = (text, searchTerm) => {
    if (!text) return '';
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.split(regex).map((part, index) =>
        part.toLowerCase() === searchTerm.toLowerCase() ? <span key={index} style={{ backgroundColor: 'yellow' }}>{part}</span> : part
    );
};

const RoleDrawer = ({ isOpen, onClose, user, onUpdateRoles }) => {
    const [availableRoles, setAvailableRoles] = useState([]);
    const [assignedRoles, setAssignedRoles] = useState([]);
    const [searchTermAvailable, setSearchTermAvailable] = useState('');
    const [searchTermAssigned, setSearchTermAssigned] = useState('');

//console.log(searchTermAssigned);
//console.log(searchTermAvailable);
//console.log(assignedRoles);

useEffect(() => {
    const fetchRoles = async () => {
        try {
            const data = await getrol();
            const userRoles = user ? user.roles.map(role => role.user_rol.rolId) : [];
            const filteredRoles = data.filter(role => !userRoles.includes(role.id));
            setAvailableRoles(filteredRoles.map(role => ({
                id: role.id,
                nombre: role.nombre
            })));
            if (user) {
                setAssignedRoles(user.roles.map(role => ({
                    id: role.user_rol.rolId,
                    nombre: role.name
                })));

            }
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    if (isOpen) {
        fetchRoles();
    }
}, [isOpen, user]);




    const handleAssignRole = (role) => {
        setAssignedRoles([...assignedRoles, role]);
        setAvailableRoles(availableRoles.filter(r => r.id !== role.id));
    };

    const handleRemoveRole = (role) => {
        setAvailableRoles([...availableRoles, role]);
        setAssignedRoles(assignedRoles.filter(r => r.id !== role.id));
    };

    const handleAccept = async () => {
        try {
            if (!user.id) {
                throw new Error('User ID is not defined');
            }
            await assignRolesToUser(user.id, assignedRoles.map(role => role.id));

            onUpdateRoles(assignedRoles); // Pasa los roles actualizados al componente padre
            onClose(); // Cierra el drawer después de asignar los roles
            window.location.reload(); // Recarga la página
        } catch (error) {
            console.error('Error assigning roles:', error);
        }
    };


    const filteredAvailableRoles = availableRoles.filter(role =>
        role.nombre?.toLowerCase().includes(searchTermAvailable.toLowerCase())
    );

    const filteredAssignedRoles = assignedRoles.filter(role =>
        role.nombre?.toLowerCase().includes(searchTermAssigned.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center font-zen-kaku">
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50" onClick={onClose}></div>
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-4xl mx-auto my-8 p-6 overflow-y-auto max-h-screen">
                <h2 className="text-xl font-semibold mb-4">Asignar Roles para {user?.names}</h2>
                <div className="flex justify-between space-x-4">
                    <div className="w-1/2">
                        <h3 className="text-lg font-medium mb-2 ">Roles Disponibles</h3>
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full p-2 border rounded mb-2"
                            aria-label="Campo de busqueda de roles disponibles"
                            value={searchTermAvailable}
                            onChange={(e) => setSearchTermAvailable(e.target.value)}
                        />
                        <ul className="border rounded p-2 max-h-96 overflow-y-auto">
                            {filteredAvailableRoles.map((role, index) => (
                                <li key={index} className="flex justify-between items-center p-2 hover:bg-gray-100 shadow transition-all ease-linear duration-150">
                                    <span>{highlightMatch(role.nombre, searchTermAvailable)}</span>
                                    <button className="text-green-500 hover:text-green-700" onClick={() => handleAssignRole(role)}>
                                        <FontAwesomeIcon icon={faArrowRight} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="w-1/2">
                        <h3 className="text-lg font-medium mb-2">Roles Asignados</h3>
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full p-2 border rounded mb-2"
                            aria-label="Campo de busqueda de roles asignados"
                            value={searchTermAssigned}
                            onChange={(e) => setSearchTermAssigned(e.target.value)}
                        />
                        <ul className="border rounded p-2 max-h-96 overflow-y-auto">
                            {filteredAssignedRoles.map((role, index) => (
                                <li key={index} className="flex justify-between items-center p-2 hover:bg-gray-100 shadow transition-all ease-linear duration-150">
                                    <span>{highlightMatch(role.nombre, searchTermAssigned)}</span>
                                    <button className="text-red-500 hover:text-red-700" onClick={() => handleRemoveRole(role)}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="flex justify-end mt-4 space-x-2">
                    <button className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-all ease-linear duration-150" onClick={onClose}>
                        Cancelar
                    </button>
                    <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-all ease-linear duration-150" onClick={handleAccept}>
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleDrawer;
