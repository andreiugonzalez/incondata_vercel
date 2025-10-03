import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  ChevronRight,
  Plus,
  BadgeHelp,
  ArrowRightCircle,
  RefreshCcw,
  FilePenLine,
  Trash2,
  CornerDownLeft,
} from "lucide-react";
import {
  getPartidasByProject,
  postCreatePartida,
  postSubpartida,
  postSubtask,
  postTask,
  getnivelbytype,
  validateMaterials,
} from "@/app/services/project";

import MaterialTransportModal from "@/app/components/MaterialTransportModal";

const { useRouter } = require("next/navigation");
import Tooltip from "../../components/tooltip";
import Sidebarpartida from "./new_partida";
import toast from "react-hot-toast";
import Hidebyrol from "./hiddenroles";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import "../style/media_query.css";
import { FileText } from "lucide-react";

const TaskComponent = ({ id_proyecto, id_usuario }) => {
  const [tasks, setTasks] = useState([]);
  const [nivel, setNivel] = useState(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState("hidden"); // 'full', 'partial', 'hidden'

  const [activeTaskId, setActiveTaskId] = useState(null);
  const router = useRouter();
  const [invalidInputId, setInvalidInputId] = useState(null);
  const [focusInputId, setFocusInputId] = useState(null);
  const [idtask, setidtask] = useState(0);
  const [titleinput, settitleinput] = useState("");
  const inputRef = useRef(null);
  const [isCancelled, setIsCancelled] = useState(false);

  const userStore = useSelector((state) => state.user);
  const role = userStore?.user?.roles?.[0]?.name || "";
  const [areAllExpanded, setAreAllExpanded] = useState(false);
  const [blockClose, setBlockClose] = useState(false);

  const [isAnimating, setIsAnimating] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await getPartidasByProject(id_proyecto);
      const fetchedTasks = response.data;

      setTasks((prevTasks) => {
        // Crear un mapa que considere tanto `realId` como `parentRealId`
        const prevTasksMap = new Map(
          prevTasks.map((task) => [
            `${task.realId}-${task.parentRealId || "root"}`,
            task,
          ]),
        );

        return fetchedTasks.map((fetchedTask) => {
          const taskKey = `${fetchedTask.realId}-${fetchedTask.parentRealId || "root"}`;
          const previousTask = prevTasksMap.get(taskKey);

          // Mantener el estado `expanded` si ya existía
          return {
            ...fetchedTask,
            expanded: previousTask ? previousTask.expanded : false,
            hasMaterials: previousTask ? previousTask.hasMaterials : false, // Inicializar hasMaterials
            materialCount: previousTask ? previousTask.materialCount : 0, // Inicializar materialCount
          };
        });
      });

      // Validar materiales después de que las tareas estén configuradas
      try {
        const tasksWithMaterials = await Promise.all(
          fetchedTasks.map(async (fetchedTask) => {
            try {
              const materialValidation = await validateMaterials(
                fetchedTask.realId,
                fetchedTask.type,
              );
              return {
                id: fetchedTask.id,
                hasMaterials: materialValidation.data.hasMaterials,
                materialCount: materialValidation.data.count, // Agregar el conteo
              };
            } catch (error) {
              console.error(
                `Error validando materiales para ${fetchedTask.title}:`,
                error,
              );
              return {
                id: fetchedTask.id,
                hasMaterials: false,
                materialCount: 0,
              };
            }
          }),
        );

        // Actualizar las tareas con la validación de materiales
        setTasks((prevTasks) =>
          prevTasks.map((task) => {
            const materialInfo = tasksWithMaterials.find((t) => t.id === task.id);
            return {
              ...task,
              hasMaterials: materialInfo
                ? materialInfo.hasMaterials
                : task.hasMaterials,
              materialCount: materialInfo
                ? materialInfo.materialCount
                : task.materialCount,
            };
          }),
        );
      } catch (materialError) {
        console.error("Error al validar materiales:", materialError);
        // No interrumpir el flujo si falla la validación de materiales
      }
    } catch (error) {
      console.error("Error al obtener tareas:", error);
      toast.error("Error al cargar las tareas del proyecto");
    }
  }, [id_proyecto]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAddTask = (parentId, level, type, parentRealId) => {
    const newTask = {
      id: Math.random().toString(36).substr(2, 9),
      title: "",
      parentId: parentId,
      expanded: true,
      isEditing: true,
      type: type,
      parentRealId,
    };
    setTasks([...tasks, newTask]);
  };

  const normalizeNivel = (nivel) => {
    
    if (!nivel) return { nombre: "", user: null };
    
    if (nivel.nombre_partida) {
      
      const precioUnitCalculado = nivel.cantidad > 0 ? (parseFloat(nivel.precio_total || 0) / parseFloat(nivel.cantidad || 1)) : 0;
      
      return {
        id: nivel.id_partida,
        id_estado: nivel.id_EstadoTarea,
        prioridadpart: nivel.prioridad,
        fechainicio: nivel.fecha_inicio,
        fechatermino: nivel.fecha_termino,
        avancepart: nivel.porcentaje,
        nombre: nivel.nombre_partida,
        user: nivel.partida_User,
        precio_total: nivel.precio_total,
        precio_unit: precioUnitCalculado,
        cantidad_acumulada: nivel.cantidad_acumulada,
        cantidad_parcial: nivel.cantidad_parcial,
      };
    } else if (nivel.nombre_sub_partida) {
      
      const precioUnitCalculado = nivel.cantidad > 0 ? (parseFloat(nivel.precio_total || 0) / parseFloat(nivel.cantidad || 1)) : 0;
      
      return {
        id: nivel.id_subpartida,
        id_estado: nivel.id_EstadoTarea,
        prioridadpart: nivel.prioridad,
        fechainicio: nivel.fecha_inicio,
        fechatermino: nivel.fecha_termino,
        avancepart: nivel.porcentaje,
        nombre: nivel.nombre_sub_partida,
        user: nivel.Subpartida_User,
        precio_total: nivel.precio_total,
        precio_unit: precioUnitCalculado,
        cantidad_acumulada: nivel.cantidad_acumulada,
        cantidad_parcial: nivel.cantidad_parcial,
      };
    } else if (nivel.nombre) {
      
      const precioUnitCalculado = nivel.cantidad > 0 ? (parseFloat(nivel.precio_total || 0) / parseFloat(nivel.cantidad || 1)) : 0;
      
      return {
        id: nivel.id || nivel.id_subtask,
        id_estado: nivel.id_EstadoTarea,
        prioridadpart: nivel.prioridad,
        fechainicio: nivel.fecha_inicio,
        fechatermino: nivel.fecha_termino,
        avancepart: nivel.porcentaje,
        nombre: nivel.nombre,
        user: nivel.user_taks || nivel.user_Subtask,
        precio_total: nivel.precio_total,
        precio_unit: precioUnitCalculado,
        cantidad_acumulada: nivel.cantidad_acumu,
        cantidad_parcial: nivel.cantidad_parci,
      };
    } else {
      return { nombre: "", user: null };
    }
  };

  const [tipo, settipo] = useState(null);
  const [id, setid] = useState(null);

  const handleToggleExpand = async (taskId, realId, type) => {
    if (!taskId || !realId || !type) {
      toast.error("Asigna un nombre para crear la tarea");
      return;
    }

    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, expanded: !task.expanded } : task,
      ),
    );

    try {
      const nivel = await getnivelbytype(type, realId);

      const normalizedNivel = normalizeNivel(nivel);
      setNivel(normalizedNivel);
      const rolesNoSidebar = ["supervisor", "ITO"];
      setIsSidebarOpen(!rolesNoSidebar.includes(role));
      setActiveTaskId(taskId);
      settipo(type);
      setid(realId);
    } catch (error) {
      console.log(error);
      toast.error("Error al obtener el nivel de la tarea.");
    }
  };

  const handleEditTask = (taskId, newTitle) => {
    if (invalidInputId === taskId) {
      setInvalidInputId(null);
      setFocusInputId(null);
    }

    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, title: newTitle } : task,
      ),
    );
  };

  const handleCancelTaskEditing = (taskId) => {
    setIsCancelled(true);

    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) =>
        task.id === taskId ? { ...task, title: "", isEditing: false } : task,
      );
      return updatedTasks.filter(
        (task) => task.id !== taskId || task.title.trim() !== "",
      );
    });
    setIsCancelled(true);
    setActiveTaskId(null);
  };

  const focusAndScroll = useCallback(() => {
    if (invalidInputId === idtask && inputRef.current) {
      const inputElement = inputRef.current;
      inputElement.focus();
      inputElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [invalidInputId, idtask]);

  useEffect(() => {
    if (invalidInputId && idtask) {
      focusAndScroll();
    }
  }, [focusAndScroll, invalidInputId, idtask]);

  const handleFinishEditing = async (taskId, newTitle) => {
    settitleinput(newTitle);

    if (isCancelled) {
      setIsCancelled(false);
      return;
    }

    const editedTask = tasks.find((task) => task.id === taskId);
    setidtask(taskId);

    if (!newTitle.trim()) {
      setInvalidInputId(taskId);
      setFocusInputId(taskId);
      toast.error("El nombre no puede estar vacío");
      return;
    }

    const duplicateTask = tasks.find(
      (task) =>
        task.id !== taskId &&
        task.title === newTitle &&
        task.type === editedTask.type &&
        task.parentId === editedTask.parentId,
    );

    if (duplicateTask) {
      const parentTask = tasks.find(
        (task) => task.id === duplicateTask.parentId,
      );
      const parentName = parentTask ? parentTask.title : "Nivel partida";

      toast.error(
        <div>
          Ya existe una tarea con el nombre de{" "}
          <strong>{duplicateTask.title}</strong> bajo el padre{" "}
          <strong>{parentName}</strong>.
        </div>,
        {
          style: {
            padding: "16px",
            color: "#713200",
            fontFamily: '"Zen Kaku Gothic Antique", sans-serif',
          },
          iconTheme: {
            primary: "#713200",
            secondary: "#FFFAEE",
          },
        },
      );
      setFocusInputId(taskId);
      return;
    }

    try {
      editedTask.title = newTitle;

      let respId = null;
      let response;

      if (!editedTask.parentId) {
        response = await createPartida(editedTask);
        respId = response?.data?.id_partida;
      } else if (editedTask.type === "subpartida") {
        response = await createSubpartida(editedTask);
        respId = response?.data?.id_subpartida;
      } else if (editedTask.type === "tarea") {
        response = await createTask(editedTask);
        respId = response?.data?.id;
      } else if (editedTask.type === "subtarea") {
        response = await createSubtask(editedTask);
        respId = response?.data?.id_subtask;
      }

      if (!respId) {
        console.error("Error: ID de respuesta no encontrado", response);
        throw new Error("ID de respuesta no encontrado");
      }

      editedTask.realId = respId;
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...editedTask, isEditing: false } : task,
        ),
      );
      toast.success(
        <div>
          Se ha creado <strong>{editedTask.title}</strong> correctamente.
        </div>,
        {
          style: {
            padding: "16px",
            color: "#000",
            fontFamily: '"Zen Kaku Gothic Antique", sans-serif',
          },
        },
      );
      setIsCancelled(false);
      
      // Recargar las tareas para actualizar la vista
      fetchTasks();
    } catch (error) {
      console.log(error);
      toast.error("Error al crear el elemento. Por favor, inténtelo de nuevo.");
    }
  };

  const createTask = async (task) => {
    try {
      const taskSend = {
        nombre: task.title,
        cantidad_normal: "0",
        cantidad_acumulada: "0",
        cantidad_parcial: "0",
        porcentaje: "0",
        cantidad: "0",
        precio_unit: "0",
        precio_total: "0",
        horas_hombre: "0",
        horas_maquina: "0",
        id_unidad: "10", //  CAMBIO: Usar "personalizado" como unidad por defecto
        id_EstadoTarea: "1",
        id_usuario: "1",
        telefono_user: "0",
        email_user: "test@gmail.com",
        id_subpartida: task.parentRealId,
        fecha_inicio: "2024-01-01",
        fecha_termino: "2024-03-01",
        prioridad: "1",
        avance: "0",
        id_proyecto: id_proyecto,
      };
      const response = await postTask(taskSend);
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  const createSubtask = async (subtask) => {
    try {
      const subtaskSend = {
        nombre: subtask.title,
        cantidad_norma: "0",
        cantidad_acumu: "0",
        cantidad_parci: "0",
        porcentaje: "0",
        cantidad: "0",
        precio_unit: "0",
        precio_total: "0",
        horas_hombre: "0",
        horas_maquina: "0",
        projectId: id_proyecto,
        id_unidad: "10", //  CAMBIO: Usar "personalizado" como unidad por defecto
        id_task: subtask.parentRealId,
        id_EstadoTarea: "1",
        id_material: "2",
        id_usuario: "1",
        telefono_user: "0",
        email_user: "test@gmail.com",
        fecha_inicio: "2024-01-01",
        fecha_termino: "2024-03-01",
        prioridad: "1",
        avance: "0",
      };
      const response = await postSubtask(subtaskSend);
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  const createSubpartida = async (subpartida) => {
    try {
      const subpartidaSend = {
        nombre_sub_partida: subpartida.title,
        cantidad_normal: "0",
        cantidad_acumulada: "0",
        cantidad_parcial: "0",
        porcentaje: "0",
        cantidad: "0",
        precio_unit: "0",
        precio_total: "0",
        horas_hombre: "0",
        horas_maquina: "0",
        id_unidad: "10", // CAMBIO: Usar "personalizado" como unidad por defecto
        id_EstadoTarea: "1",
        id_usuario: id_usuario,
        id_partida: subpartida.parentRealId,
        telefono_user: "0",
        email_user: "test@gmail.com",
        fecha_inicio: "2024-01-01",
        fecha_termino: "2024-03-01",
        prioridad: "1",
        avance: "0",
        id_proyecto: id_proyecto,
      };

      const response = await postSubpartida(subpartidaSend);
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  const createPartida = async (partida) => {
    try {
      const partidaSend = {
        nombre_partida: partida.title,
        cantidad_normal: "0",
        cantidad_acumulada: "0",
        cantidad_parcial: "0",
        porcentaje: "0",
        cantidad: "0",
        precio_unit: "0",
        precio_total: "0",
        horas_hombre: "0",
        horas_maquina: "0",
        id_proyecto: id_proyecto,
        id_unidad: "10", //  CAMBIO: Usar "personalizado" como unidad por defecto
        id_EstadoTarea: "1",
        id_usuario: id_usuario,
        telefono_user: "0",
        email_user: "test@gmail.com",
        fecha_inicio: "2024-01-01",
        fecha_termino: "2024-03-01",
        prioridad: "1",
        avance: "0",
      };
      const response = await postCreatePartida(partidaSend);
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  const renderAddButtons = (parentId, level) => {
    const parentTask = tasks.find((task) => task.id === parentId);
    const parentRealId = parentTask ? parentTask.realId : null;
    if (parentTask && parentTask.expanded) {
      switch (level) {
        case 2:
          return (
            <Hidebyrol hiddenRoles={["supervisor", "ITO", "superintendente"]}>
              <button
                type="button"
                className={`ml-${level * 4} mt-2 px-2 py-1 flex flex-row items-center  text-[#635F60] hover:text-black transition-all ease-linear duration-150`}
                onClick={() =>
                  handleAddTask(parentId, level, "subpartida", parentRealId)
                }
              >
                <Plus size={20} strokeWidth={3} className="mr-2" />
                Agregar sub-partida
              </button>
            </Hidebyrol>
          );
        case 3:
          return (
            <Hidebyrol hiddenRoles={["supervisor", "ITO", "superintendente"]}>
              <button
                type="button"
                className={`ml-${level * 4} mt-2 px-2 py-1 flex flex-row items-center  text-[#635F60] hover:text-black transition-all ease-linear duration-150`}
                onClick={() =>
                  handleAddTask(parentId, level, "tarea", parentRealId)
                }
              >
                <Plus size={20} strokeWidth={3} className="mr-2" />
                Agregar tarea
              </button>
            </Hidebyrol>
          );
        case 4:
          return (
            <Hidebyrol hiddenRoles={["supervisor", "ITO", "superintendente"]}>
              <button
                type="button"
                className={`ml-${level * 4} mt-2 px-2 py-1 flex flex-row items-center  text-[#635F60] hover:text-black transition-all ease-linear duration-150`}
                onClick={() =>
                  handleAddTask(parentId, level, "subtarea", parentRealId)
                }
              >
                <Plus size={20} strokeWidth={3} className="mr-2" />
                Agregar sub-tarea
              </button>
            </Hidebyrol>
          );
        default:
          return null;
      }
    }
    return null;
  };

  const handleLabelClick = () => {
    router.push(`/dashboard/partida_suma?project=${id_proyecto}`);
  };

  const handleTaskClick = async (taskId, realId, type) => {
    // Reutiliza la lógica de expandir/cerrar
    await handleToggleExpand(taskId, realId, type);

    // Verifica si el candado está activado
    if (!blockClose) {
      // Si no está activado, permite cambiar el sidebar a 'partial'
      setIsSidebarOpen("partial"); // Si no hay candado, se pone en partial
    } else {
      // Si el candado está activado, mantiene el sidebar en 'full'
      setIsSidebarOpen("full");
    }

    // Establece la tarea como activa
    setActiveTaskId(taskId);
    settipo(type);
    setid(realId);
  };

  const renderTasks = (parentId, level) => {
    const levelColors = {
      1: "stroke-green-400 hover:stroke-green-600",
      2: "stroke-blue-400 hover:stroke-blue-500",
      3: "stroke-orange-500 hover:stroke-orange-600",
      4: "stroke-indigo-500 hover:stroke-indigo-600",
    };

    const variants = {
      hidden: { height: 0, opacity: 0, y: -20, overflow: "hidden" },
      visible: { height: "auto", opacity: 1, y: 0, overflow: "visible" },
    };

    return tasks
      .filter((task) => task.parentId === parentId)
      .map((task) => (
        <div key={task.id} className={`ml-${level * 4}`}>
          <div className="flex items-center">
            <button
              type="button"
              className="mr-2 px-2 py-1 rounded"
              onClick={() =>
                handleToggleExpand(task.id, task.realId, task.type)
              }
            >
              {task.expanded ? (
                <ChevronRight
                  strokeWidth={3}
                  className={`transition-all ease-linear rotate-90 ${levelColors[level] || "stroke-teal-500 hover:stroke-teal-600"}`}
                />
              ) : (
                <ChevronRight
                  strokeWidth={3}
                  className={`transition-all ease-linear rotate-0 ${levelColors[level] || "stroke-teal-500 hover:stroke-teal-600"}`}
                />
              )}
            </button>
            {task.isEditing ? (
              <div className="relative flex items-center gap-4">
                <motion.input
                  type="text"
                  value={task.title}
                  ref={inputRef}
                  onChange={(e) =>
                    handleEditTask(task.id, e.target.value, task.type)
                  }
                  placeholder="Agregar item"
                  initial={{ borderColor: "transparent", x: 0 }}
                  animate={{
                    borderColor:
                      invalidInputId === task.id ? "red" : "transparent",
                    boxShadow:
                      invalidInputId === task.id
                        ? [
                            "0px 0px 0px 0px rgba(255, 0, 0, 0)",
                            "0px 0px 8px 4px rgba(255, 0, 0, 0.8)",
                            "0px 0px 0px 0px rgba(255, 0, 0, 0)",
                          ]
                        : "0px 0px 0px 0px rgba(0, 0, 0, 0)",
                    x:
                      invalidInputId === task.id
                        ? [-15, 15, -15, 15, -10, 10, -5, 5, 0]
                        : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 8,
                    boxShadow:
                      invalidInputId === task.id
                        ? {
                            duration: 0.8,
                            repeat: Infinity,
                            repeatType: "reverse",
                          }
                        : { duration: 0 },
                  }}
                  className="border-2 rounded-md p-2 outline-none"
                />
                <button
                  type="button"
                  className="ml-2 font-zen-kaku flex flex-row gap-1 bg-teal-500 text-white py-1 px-2 rounded-md hover:bg-teal-600 transition-all ease-linear duration-150 shadow-md"
                  onClick={() => handleFinishEditing(task.id, task.title)}
                >
                  <CornerDownLeft />
                  Guardar
                </button>

                <button
                  type="button"
                  className=" font-zen-kaku mr-2 flex flex-row gap-1 text-white bg-red-400 py-1 px-1 rounded-md hover:bg-red-700 transition-all ease-linear duration-150 shadow-md"
                  onClick={() => {
                    handleCancelTaskEditing(task.id);
                  }}
                >
                  <Trash2 className="stroke-white" />
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <p
                  className={`cursor-pointer ${activeTaskId === task.id ? "font-bold text-blue-600" : ""}`}
                  onClick={() =>
                    handleTaskClick(task.id, task.realId, task.type)
                  }
                >
                  {task.title}
                </p>
                {/* Aquí agregas el ícono */}
                {/* Mostrar ícono con un tooltip que indica el conteo de materiales */}
                {task.hasMaterials && (
                  <Tooltip text={`Materiales: ${task.materialCount || 0}`}>
                    <FileText
                      size={16}
                      className="ml-2 text-green-500 cursor-pointer"
                      title="Tiene materiales"
                    />
                  </Tooltip>
                )}

                <Hidebyrol hiddenRoles={["supervisor", "ITO"]}>
                  {activeTaskId === task.id && (
                    <ArrowRightCircle
                      size={20}
                      className="ml-2 text-teal-500"
                    />
                  )}
                </Hidebyrol>
              </div>
            )}
          </div>
          <div className="border-b-2 mt-2 border-[#DDD9D8]"></div>
          <AnimatePresence>
            {task.expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -20, overflow: "hidden" }}
                animate={{
                  height: "auto",
                  opacity: 1,
                  y: 0,
                  overflow: "visible",
                }}
                exit={{ height: 0, opacity: 0, y: -20, overflow: "hidden" }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {renderTasks(task.id, level + 1)}
                {renderAddButtons(task.id, level + 1)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ));
  };

  const toggleBlockClose = () => {
    setBlockClose(!blockClose); // Cambia el estado de bloqueo
  };

  const toggleSidebar = () => {
    if (blockClose) {
      // Si el candado está activo, no permitimos el cambio a partial y activamos la animación
      setIsSidebarOpen("full");
      setIsAnimating(true); // Inicia la animación
      setTimeout(() => setIsAnimating(false), 3000); // Detén la animación después de 3 segundos
    } else {
      // Si no está bloqueado, permitimos los cambios normales
      setIsSidebarOpen((prevState) =>
        prevState === "full" ? "partial" : "full",
      );
    }
  };

  const toggleExpandAllTasks = () => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => ({
        ...task,
        expanded: !areAllExpanded, // Alterna entre expandido o colapsado
      })),
    );
    setAreAllExpanded(!areAllExpanded); // Cambia el estado para la próxima acción
  };

  return (
    <div className="flex flex-col h-full">
      <div>
        <div className="flex flex-row gap-5 custom-nodos">
          <div className="flex items-center gap-1">
            <div className="rounded-full bg-green-400 h-3 w-3"></div>
            <label>Partida</label>
          </div>
          <div className="flex items-center gap-1">
            <div className="rounded-full bg-blue-400 h-3 w-3"></div>
            <label>Subpartida</label>
          </div>
          <div className="flex items-center gap-1">
            <div className="rounded-full bg-orange-500 h-3 w-3"></div>
            <label>Tarea</label>
          </div>
          <div className="flex items-center gap-1">
            <div className="rounded-full bg-indigo-500 h-3 w-3"></div>
            <label>Subtarea</label>
          </div>
          <button
            type="button"
            className="px-2 py-1 flex flex-row items-center text-[#635F60] hover:text-black transition-all ease-linear duration-150"
            onClick={toggleExpandAllTasks}
          >
            {areAllExpanded ? (
              <>
                <ChevronRight size={20} strokeWidth={3} className="mr-2" />
                Colapsar todas las tareas
              </>
            ) : (
              <>
                <Plus size={20} strokeWidth={3} className="mr-2" />
                Expandir todas las tareas
              </>
            )}
          </button>

          {/* <div className='flex items-center'>
            <Tooltip text={
              <>

                Dato importante: Con 1 click en su icono, se abre sus niveles y tambien se abre<br />
                el editar partida indicado con una flecha.<br />

              </>
            }>
              <div className='cursor-pointer hover:scale-110 transition-all ease-linear duration-150'>
                <BadgeHelp size={20} className='stroke-black' />
              </div>
            </Tooltip>
          </div> */}

          <div className="flex items-center gap-2" onClick={fetchTasks}>
            <Tooltip text={<>Recargar tabla</>}>
              <div className="cursor-pointer hover:rotate-90 transition-all ease-linear duration-300">
                <RefreshCcw size={20} className="stroke-black" />
              </div>
            </Tooltip>
          </div>

          {/* <div className='flex items-center gap-2' onClick={handleLabelClick}>
            <Tooltip text={
              <>
                Ir suma alzada
              </>
            }>
              <div className='cursor-pointer hover:scale-125 transition-transform ease-linear duration-300'>
                <FilePenLine size={20} className='stroke-black' />
              </div>
            </Tooltip>
          </div> */}
        </div>
        <br></br>
        <Hidebyrol hiddenRoles={["supervisor", "ITO", "superintendente"]}>
          <button
            type="button"
            className="px-2 py-1 flex flex-row items-center  text-[#635F60] hover:text-black transition-all ease-linear duration-150"
            onClick={() => handleAddTask(null, 1, "partida")}
          >
            <Plus size={20} strokeWidth={3} className="mr-2" />
            Agregar partida
          </button>
        </Hidebyrol>
        <div className="flex-grow overflow-auto pt-6">
          {renderTasks(null, 1)}
        </div>
      </div>

      <Sidebarpartida
        isAnimating={isAnimating}
        blockClose={blockClose}
        toggleBlockClose={toggleBlockClose}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        nivel={nivel}
        tipo={tipo}
        id={id}
        recargartabla={fetchTasks}
        id_proyecto={id_proyecto}
      />
    </div>
  );
};

export default TaskComponent;
