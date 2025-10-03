import React, { useState, useEffect, useCallback } from "react";
import {
  getConnectedUsersAndProjects,
  // getUsersByIds,
} from "../services/socket_service";
import { getProjectDetails } from "../services/project"; // Importa el servicio para obtener todos los usuarios del proyecto
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import UserCard from "./usercard";
import { useSocket } from "@/app/services/SocketContext";
import EmailModal from "./emailModal";

const getInitials = (name) => {
  if (!name) return "";
  const names = name.split(" ");
  return names
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join("");
};

const getRandomColor = (id) => {
  const colors = [
    "#e57373",
    "#f06292",
    "#ba68c8",
    "#9575cd",
    "#7986cb",
    "#64b5f6",
    "#4fc3f7",
    "#4db6ac",
    "#81c784",
    "#aed581",
  ];
  return colors[id % colors.length];
};

const LoginOnProject = () => {
  const [allUsers, setAllUsers] = useState([]); // Todos los usuarios del proyecto
  const [connectedUserIds, setConnectedUserIds] = useState([]); // IDs de usuarios conectados
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [cardPosition, setCardPosition] = useState({ top: 0, left: 0 });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [modalUser, setModalUser] = useState(null); // Usuario seleccionado para el modal
  // Nueva bandera para controlar el fetch del usuario en el modal

  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") || "";

  //const userId = useSelector((state) => state.user.user.id);

  const { socket } = useSocket();

  const fetchData = useCallback(async () => {
    try {
      // 1. Trae todos los usuarios asignados al proyecto
      const details = await getProjectDetails(projectId);
      // Suponiendo que el backend retorna los usuarios en details.project.users
      setAllUsers(details.project?.users || []);

      // 2. Trae los conectados
      const { users } = await getConnectedUsersAndProjects();
      const connected = users
        .filter((user) => user.projectId === projectId)
        .map((u) => u.userId);
      setConnectedUserIds(connected);
    } catch (err) {
      setError(err.message);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId, fetchData]);

  useEffect(() => {
    if (socket) {
      socket.on("update-users", fetchData);

      return () => {
        socket.off("update-users", fetchData);
      };
    }
  }, [socket, fetchData]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleUserClick = (user, event) => {
    const rect = event.target.getBoundingClientRect();
    setSelectedUser(user);
    setCardPosition({
      top: rect.top + window.scrollY + rect.height,
      left: rect.left + window.scrollX,
    });
  };

  // const handleSendMail = async () => {
  //   setShowEmailModal(true);
  // };

  const handleOpenEmailModal = (user) => {
    setModalUser(user);
    // setShowEmailModal(true);
    setSelectedUser(null);
  };
  const handleCloseEmailModal = () => {
    setModalUser(null);
    // setSelectedUser(null);
  };
  return (
    <div>
      <div className="flex space-x-2">
        {allUsers.map((user) => {
          const isOnline = connectedUserIds
            .map(String)
            .includes(String(user.id));
          return (
            <div
              key={user.id}
              className="relative flex items-center justify-center w-10 h-10 text-white rounded-full border-2 border-white shadow-md hover:cursor-pointer"
              onClick={(event) => handleUserClick(user, event)}
              title={user.names}
              style={{
                backgroundColor: getRandomColor(user.id),
                opacity: isOnline ? 1 : 0.5,
              }}
            >
              <span className="text-lg font-bold">
                {getInitials(user.names)}
              </span>
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}
              ></span>
            </div>
          );
        })}
      </div>

      {selectedUser && (
        <UserCard
          user={selectedUser}
          isOnline={connectedUserIds
            .map(String)
            .includes(String(selectedUser.id))}
          onClose={() => setSelectedUser(null)}
          position={cardPosition}
          onSendMail={() => handleOpenEmailModal(selectedUser)}
        />
      )}
      {modalUser && (
        <>
          {console.log("Abriendo EmailModal con projectId:", projectId)}
          <EmailModal
            user={modalUser}
            id_proyecto={projectId}
            onClose={handleCloseEmailModal}
          />
        </>
      )}
    </div>
  );
};

export default LoginOnProject;
