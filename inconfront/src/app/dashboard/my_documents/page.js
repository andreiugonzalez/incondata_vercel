"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from "next/navigation";
import { useSearchParams } from 'next/navigation';
import { usePermisos } from "../../hooks/usePermisos";
import Mydocuments from '../components/my_documents';
import Loader from '@/app/dashboard/components/loader';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { getFolders, postFolders, getFolderRaizUser, getFolderRaiz, updateUriFolder, getTotalFileSize, getFavoriteFolders, getFolderWithChildrenById, getFoldersByPath, getTrashedFolders } from '@/app/services/my_document';
import CryptoJS from 'crypto-js';
import { getPrimaryRole } from "@/app/utils/roleUtils";

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY; 

// Función para descifrar el folderId usando crypto-js
// Función para descifrar el folderId usando AES y decodeURIComponent
// Función para descifrar el folderId usando AES y devolverlo como número
const decryptFolderId = (encryptedFolderId) => {
    const decoded = decodeURIComponent(encryptedFolderId); // Primero, decodificar el valor de la URL
    const bytes = CryptoJS.AES.decrypt(decoded, secretKey); // Luego, descifrar
    const decrypted = bytes.toString(CryptoJS.enc.Utf8); // Convertir a texto plano

    // Convertir el valor descifrado a número
    const folderId = Number(decrypted); 

    if (isNaN(folderId)) {
        throw new Error('El folderId descifrado no es un número válido');
    }

    return folderId; // Devolver el valor como número
};
export default function MyDocumentsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [folders, setFolders] = useState([]);
    const [RespUrifolder, setRespUrifolder] = useState('');
    const [totalFileSizestoragelimit, setTotalFileSizeandStorageLimit] = useState(0);
    const searchParams = useSearchParams();
    let path = searchParams.get('path') || '';
    const userStore = useSelector((state) => state.user);
    const isInitialized = useRef(false);

    const [allFolders, setAllFolders] = useState([]);
    const [favoriteFolders, setFavoriteFolders] = useState([]);
    const [favoriteDocuments, setFavoriteDocuments] = useState([]);
    const [userFolder, setUserFolder] = useState(null);

    // Control de permisos
    const role = getPrimaryRole(userStore.user);
    const { tienePermiso } = usePermisos();
    const router = useRouter();

    // Verificar permisos de acceso
    useEffect(() => {
        if (!tienePermiso(role, "mis_documentos")) {
            router.push("/dashboard/dashboardproyect");
            return;
        }
    }, [role, router, tienePermiso]);

    console.log(path);


    // Verificar si el path no es un valor que ya esté en texto claro
    if (path !== 'MyDisk' && path !== 'papelera' && path !== 'proyectos' && path !== 'favoritos' && path !== 'users') {  
        try {
            path = decryptFolderId(path); // Desencriptar y convertir a número
            console.log("Decoded folderId:", path); // Verificar que el folderId es numérico
        } catch (e) {
            console.log("Error decrypting folderId:", e);
        }
    }
    console.log(path);

    const calculateTotalFileSize = async (userUriFolder) => {
        try {
            const response = await getTotalFileSize(userUriFolder);

            console.log(response);

            setTotalFileSizeandStorageLimit(response);
        } catch (error) {
            console.error("Error al calcular el peso total de los archivos:", error);
        }
    };

    // useEffect independiente para calcular el tamaño total de archivos
    useEffect(() => {
        if (RespUrifolder) {
            calculateTotalFileSize(RespUrifolder);
        }
    }, [RespUrifolder]); // Se ejecuta cuando RespUrifolder cambia

console.log(RespUrifolder);

    const checkAndCreateRootFolder = useCallback(async () => {
        try {
            let rootGlobal = await getFolderRaiz('root', null);

            if (!rootGlobal) {
                const rootFolderData = {
                    nombre_carpeta: 'root',
                    nombre_S3_cloud: 'root',
                    enlace: 'root',
                    parent_folder_id: null,
                    path: 'root',
                    depth: 0
                };
                const createdRootFolder = await postFolders(rootFolderData);
                rootGlobal = createdRootFolder.data;
            }

            let usuariosFolder = await getFolderRaiz('usuarios', rootGlobal.id);
            if (!usuariosFolder) {
                const usuariosFolderData = {
                    nombre_carpeta: 'usuarios',
                    nombre_S3_cloud: 'usuarios',
                    enlace: 'usuarios',
                    parent_folder_id: rootGlobal.id,
                    path: 'root/usuarios',
                    depth: 1
                };
                const createdUsuariosFolder = await postFolders(usuariosFolderData);
                usuariosFolder = createdUsuariosFolder.data;
            }
            const userUriFolder = userStore.user.urifolder;
            let userFolder = await getFolderRaizUser(userStore.user.id, userUriFolder);
    
            console.log(userFolder);

            setRespUrifolder(userUriFolder);

            if (!userFolder) {
                const userFolderData = {
                    nombre_carpeta: userStore.user.username.toString(),
                    nombre_S3_cloud: userStore.user.id.toString(),
                    enlace: userUriFolder,
                    usuario_id: userStore.user.id,
                    parent_folder_id: usuariosFolder.id_folder,
                    path: `${usuariosFolder.path}/${userUriFolder.toString()}`,
                    depth: 2
                };

                const createdUserFolder = await postFolders(userFolderData);
                userFolder = createdUserFolder.data;
            }
    

            setUserFolder(userFolder); 
        } catch (error) {
            console.error("Error al verificar o crear las carpetas:", error);
        }
    }, [userStore.user]);

 

    const fetchFolders = useCallback(async () => {
        // Verifica que userFolder esté definido antes de continuar
        if (!userFolder || !userFolder.id_folder) {
            console.error('userFolder es null o no tiene id_folder');
            return;
        }
    
        try {
            let response;
            const currentPath = (path === 'MyDisk') ? userFolder.id_folder : path; // Asigna 'MyDisk' al ID de la carpeta del usuario
        
            switch (currentPath) {
                case 'favoritos':
                    // Obtener carpetas y documentos favoritos
                    response = await getFavoriteFolders(userStore.user.id);
                    setFavoriteFolders(response.data.favoriteFolders || []);
                    setFavoriteDocuments(response.data.favoriteDocumentsOutsideFolders || []);
        
                    const allFavoriteDocuments = [
                        ...response.data.favoriteFolders.flatMap(folder => folder.documents || []),
                        ...response.data.favoriteDocumentsOutsideFolders || []
                    ];
                    setFolders(allFavoriteDocuments);
                    break;
        
                case 'MyDisk':
                    // Manejar 'MyDisk' con el ID de la carpeta del usuario
                    if (userFolder) {
                        response = await getFolderWithChildrenById(userFolder.id_folder);
                        setFolders(response || []);
                    }
                    break;
    
                case 'proyectos':
                    // Manejar 'proyectos' con el ID de la carpeta del proyecto
                  
                        response = await getFolderWithChildrenById(467);
                        setFolders(response || []);
                    
                    break;
    
                case 'users':
                    // Manejar 'users' con el ID de la carpeta del proyecto
                    if (userFolder) {
                        response = await getFolderWithChildrenById(581);
                        setFolders(response || []);
                    }
                    break;
    
                case 'papelera': // Asegúrate de que este case coincida con el valor pasado
                    if (userStore.user.id) {
                        response = await getTrashedFolders(userFolder.id_folder);
                        setFolders(response || []);
                        console.log("trash  ",response);
                    }
                    break;
                    
        
                default:
                    // Manejar cualquier otro path normalmente
                    response = await getFolderWithChildrenById(currentPath);
                    console.log("final",currentPath)
                    setFolders(response || []);
                    break;
            }
        
            const allFoldersResponse = await getFoldersByPath(userStore.user.id, userFolder.path);  // aplicado para el mover carpetas 
            setAllFolders(allFoldersResponse || []);
        

           
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [path, userFolder, userStore.user ]);
    
    

console.log(allFolders);



useEffect(() => {
    if (!isInitialized.current) {
        isInitialized.current = true;
        const initializePage = async () => {
            setIsLoading(true);

            try {
                // Aseguramos que checkAndCreateRootFolder se ejecute primero
                await checkAndCreateRootFolder();

                // Esperamos a que RespUrifolder esté disponible antes de seguir
                if (userStore.user.urifolder) {
                    setRespUrifolder(userStore.user.urifolder);
                }

                // Esperamos a que userFolder esté definido antes de continuar
                if (userFolder) {
                    await fetchFolders();
                }
                
                // Calcular tamaño total de archivos si userFolder está definido
                if (userStore.user.urifolder) {
                    await calculateTotalFileSize(userStore.user.urifolder);
                }

            } catch (error) {
                console.error("Error durante la inicialización de la página:", error);
            } finally {
                setIsLoading(false);
            }
        };
        initializePage();
    }
}, [path, checkAndCreateRootFolder, fetchFolders, userStore.user.urifolder, userFolder]);

    

    if (isLoading) {
        return <Loader />;
    }

    return (
        <ProtectedRoute roles={['admin', 'superadmin', 'ITO', 'superintendente', 'contratista', 'administrador de contrato', 'supervisor', 'prevencionista', 'planner', 'proyectista']}>
            <Mydocuments
                folders={path === 'favoritos' ? favoriteFolders : folders}
                favoriteDocuments={favoriteDocuments} // Pasar los documentos fuera de carpetas favoritas
                currentPath={path === 'MyDisk' && userFolder 
                    ? userFolder.id_folder 
                    : path === 'proyectos'  
                    ? 467
                    : path === 'users' && userFolder 
                    ? 581
                    : path === 'papelera'
                    ? 'papelera' // Reemplaza '999' con el ID correspondiente para la papelera
                    : path}

      
                // Pasar el path correcto
                fetchFolders={fetchFolders}
                RespUrifolderprop={RespUrifolder}
                totalFileSizestoragelimit={totalFileSizestoragelimit}
                allmove={allFolders}
                userFolder={userFolder}
            />
        </ProtectedRoute>
    );
}
