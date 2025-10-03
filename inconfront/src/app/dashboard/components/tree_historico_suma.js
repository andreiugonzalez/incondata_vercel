import React, {
  useEffect,
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { ChevronRight, FileUp, Expand, SaveAll, Edit } from "lucide-react";
const { useRouter } = require("next/navigation");
import { unidadlist, getPartidasByProjectStd } from "@/app/services/project";
import {
  postpartida,
  postDatosPartidas,
  getTareasupdate,
} from "@/app/services/partidas";
import Select from "react-select";
import toast from "react-hot-toast";
import AutoWidthInput from "./automaticinput";
import Tooltip from "../../components/tooltip";
import { useSelector } from "react-redux";
import "../style/sololectura.css";
import ExcelJS from "exceljs";
import { BiCollapse } from "react-icons/bi";
import { getPrimaryRole } from "@/app/utils/roleUtils";

const HistoricoTreesuma = forwardRef(
  ({ partidas: initialPartidas, projectId, updatetabla, Hidebyrol }, ref) => {
    console.log(initialPartidas);

    const [expandedRows, setExpandedRows] = useState({});
    const [expandedSubpartidaRows, setExpandedSubpartidaRows] = useState({});
    const [expandedTareasRows, setExpandedTareasRows] = useState({});
    const [rotatedItems, setRotatedItems] = useState([]);
    const [partidasArr, setPartidasArr] = useState([]);
    const router = useRouter();
    const [isSearchable, setIsSearchable] = useState(true);
    const [idbyproyect, setidbyproyect] = useState(null);
    const [expandButtonText, setExpandButtonText] = useState(
      "Expandir todas las partidas",
    );

    // Estado para moneda y función de conversión
    const [currency, setCurrency] = useState("CLP"); // 'USD' o 'CLP'
    const exchangeRate = 950; // 1 USD = 950 CLP (puedes hacerlo dinámico después)
    const convertCurrency = (value) => {
      if (currency === "USD") return value;
      if (typeof value !== "number") value = Number(value);
      if (isNaN(value)) return "";
      return Math.round(value * exchangeRate);
    };

    const expandedRowsRef = useRef({});
    const expandedSubpartidaRowsRef = useRef({});
    const expandedTareasRowsRef = useRef({});
    HistoricoTreesuma.displayName = "HistoricoTreesuma";

    // Exponer las funciones para que puedan ser llamadas desde el componente padre
    useImperativeHandle(ref, () => ({
      handleInsertAllItemsClick,
      handleExpandAllClick,
      exportToExcel,
    }));

    const userStore = useSelector((state) => state.user);
    const role = getPrimaryRole(userStore.user);

    const actualizarPartidasArr = (initialPartidas, setPartidasArr) => {
      setPartidasArr(initialPartidas);
      console.log("Partidas iniciales", initialPartidas);

      const idsPartida = initialPartidas.map((partida) => partida.id_partida);
    };
    useEffect(() => {
      setidbyproyect(projectId);
    }, [projectId]);

    useEffect(() => {
      actualizarPartidasArr(initialPartidas, setPartidasArr);
    }, [initialPartidas]);

    partidasArr.forEach((partida) => {
      console.log(`Partida ID: ${partida.id_partida}`);
      partida.subpartida_partida.forEach((subpartida) => {
        console.log(`Subpartida ID: ${subpartida.id_subpartida}`);
        subpartida.subpartida_tarea.forEach((tarea) => {
          console.log(`Tarea ID: ${tarea.id}`, typeof tarea.id); // Verifica el tipo de dato aquí
        });
      });
    });

    const handlePartidaClick = (item) => {
      console.log("Partida", item);
      const isRowExpanded = !!expandedRowsRef.current[item.id_partida];

      // Cambiar estado de expansión
      expandedRowsRef.current[item.id_partida] = !isRowExpanded;
      setExpandedRows({ ...expandedRowsRef.current }); // Actualizar el estado para que React lo reconozca
    };

    const handleSubpartidaClick = (item) => {
      console.log("Subpartida", item);
      const isRowExpanded =
        !!expandedSubpartidaRowsRef.current[item.id_subpartida];

      expandedSubpartidaRowsRef.current[item.id_subpartida] = !isRowExpanded;
      setExpandedSubpartidaRows({ ...expandedSubpartidaRowsRef.current });
    };

    const handleTareaClick = (item) => {
      console.log("Tarea", item);
      const isRowExpanded = !!expandedTareasRowsRef.current[item.id];

      expandedTareasRowsRef.current[item.id] = !isRowExpanded;
      setExpandedTareasRows({ ...expandedTareasRowsRef.current });
    };

    // Función para manejar el clic en el ícono y alternar la rotación
    const handleIconClick = (itemId) => {
      setRotatedItems((prevState) => {
        if (prevState.includes(itemId)) {
          return prevState.filter((id) => id !== itemId); // Si el ítem ya está rotado, lo eliminamos del estado
        } else {
          return [...prevState, itemId]; // Si el ítem no está rotado, lo agregamos al estado
        }
      });
    };

    const handleExpandAllClick = () => {
      // Obtener los IDs reales para partidas, subpartidas y tareas
      const allPartidaIds = partidasArr.map((partida) => partida.id_partida);
      const allSubpartidaIds = partidasArr.flatMap((partida) =>
        partida.subpartida_partida.map(
          (subpartida) => subpartida.id_subpartida,
        ),
      );
      const allTareaIds = partidasArr.flatMap((partida) =>
        partida.subpartida_partida.flatMap((subpartida) =>
          subpartida.subpartida_tarea.map((tarea) => tarea.id),
        ),
      );

      // Verificar si todas las filas están expandidas
      const areAllExpanded =
        Object.keys(expandedRowsRef.current).length === allPartidaIds.length &&
        Object.keys(expandedSubpartidaRowsRef.current).length ===
          allSubpartidaIds.length &&
        Object.keys(expandedTareasRowsRef.current).length ===
          allTareaIds.length;

      if (areAllExpanded) {
        // Si todas las filas están expandidas, colapsarlas
        expandedRowsRef.current = {};
        expandedSubpartidaRowsRef.current = {};
        expandedTareasRowsRef.current = {};
        setExpandedRows({}); // Actualizamos el estado para desencadenar un re-render
        setExpandedSubpartidaRows({});
        setExpandedTareasRows({});
        setExpandButtonText("Expandir todas las partidas");
      } else {
        // Si no están expandidas, expandirlas todas
        expandedRowsRef.current = Object.fromEntries(
          allPartidaIds.map((id) => [id, true]),
        );
        expandedSubpartidaRowsRef.current = Object.fromEntries(
          allSubpartidaIds.map((id) => [id, true]),
        );
        expandedTareasRowsRef.current = Object.fromEntries(
          allTareaIds.map((id) => [id, true]),
        );

        setExpandedRows({ ...expandedRowsRef.current });
        setExpandedSubpartidaRows({ ...expandedSubpartidaRowsRef.current });
        setExpandedTareasRows({ ...expandedTareasRowsRef.current });

        setExpandButtonText("Contraer todas las partidas");
      }
    };

    // Función para verificar si un ítem está rotado
    const isRotated = (itemId) => {
      return rotatedItems.includes(itemId); // Devuelve true si el ítem está rotado
    };

    const handleSpanClick = (
      subtarea,
      index,
      indexsub,
      tareaIndex,
      subtareaIndex,
    ) => {
      const selectedOptionLabel = unidadOptions.find(
        (option) => option.value === subtarea.id_material,
      )?.label;
      const queryParams = new URLSearchParams();
      queryParams.append("id_subtask", subtarea.id_subtask);
      queryParams.append("index", index + 1);
      queryParams.append("indexsub", indexsub + 1);
      queryParams.append("tareaIndex", tareaIndex + 1);
      queryParams.append("subtareaIndex", subtareaIndex + 1);
      queryParams.append("nombre", subtarea.nombre);
      queryParams.append("cantidad", subtarea.cantidad);
      queryParams.append("unidad", selectedOptionLabel);
      queryParams.append("idbyproyect", projectId);

      const queryString = queryParams.toString();
      const encodedParams = btoa(queryString);
      const url = `/dashboard/detalle_suma?data=${encodedParams}`;
      router.push(url);
    };

    //para confirmación
    const [showModal, setShowModal] = useState(false);

    /// aqui se viene lo weno jovenesssssssss
    const handleInsertAllPartidas_todas = async () => {
      try {
        const promises = partidasArr.map(async (partida) => {
          console.log(partida);

          const subpartidasIds = partida.subpartida_partida.map(
            (subpartida) => {
              const tareasIds = subpartida.subpartida_tarea.map((tarea) => {
                const subtareasIds = tarea.Task_Subtask.map(
                  (subtarea) => subtarea.id_subtask,
                );
                return { id_tarea: tarea.id, id_subtarea: subtareasIds };
              });
              return {
                id_subpartida: subpartida.id_subpartida,
                tareas: tareasIds,
              };
            },
          );

          const partidaInsert = {
            id_partida: partida.id_partida,
            subpartidas: subpartidasIds,
          };

          console.log("enviado datos de partidas al back:", partidaInsert);
          const response = await postDatosPartidas(partidaInsert, projectId);
          console.log("Partida insertada:", response);
          return response;
        });
        toast.success(`Todas las partidas insertadas correctamente`);
      } catch (error) {
        console.error("Error inserting partidas:", error);
      }
    };

    // Obtener la fecha actual formateada
    const getCurrentDate = () => {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    //llamada para insertar desde boton
    const handleInsertAllItemsClick = () => {
      setShowModal(true);
    };

    const handleConfirmInsert = async () => {
      setShowModal(false);
      await handleInsertAllPartidas_todas();
      toast.success("Se insertaron los datos correctamente");
    };

    const handleCancelInsert = () => {
      setShowModal(false);
      toast("Operación cancelada. Los datos no fueron insertados.", {
        icon: "⚠️",
        style: {
          background: "#f4f4f5",
          color: "#333",
        },
      });
    };

    const handleSubTareaChange = (id, value, cell) => {
      const calcularPrecioTotal = (cantidad, precioUnitario) => {
        return cantidad * precioUnitario;
      };

      // Crear un nuevo array de partidas con la cantidad actualizada localmente
      const nuevasPartidasArr = partidasArr.map((partida) => {
        if (partida.subpartida_partida) {
          const nuevasSubpartidas = partida.subpartida_partida.map(
            (subpartida) => {
              if (subpartida.subpartida_tarea) {
                const nuevasTareas = subpartida.subpartida_tarea.map(
                  (tarea) => {
                    if (tarea.Task_Subtask) {
                      const nuevasSubtareas = tarea.Task_Subtask.map(
                        (subtarea) => {
                          if (subtarea.id_subtask === id) {
                            const updatedSubtarea = {
                              ...subtarea,
                              [cell]: value,
                            };
                            if (cell === "cantidad" || cell === "precio_unit") {
                              updatedSubtarea.precio_total =
                                calcularPrecioTotal(
                                  cell === "cantidad"
                                    ? value
                                    : updatedSubtarea.cantidad,
                                  cell === "precio_unit"
                                    ? value
                                    : updatedSubtarea.precio_unit,
                                );
                            }
                            if (
                              cell === "cantidad_norma" ||
                              cell === "cantidad_parci"
                            ) {
                              updatedSubtarea.cantidad_acumu =
                                parseFloat(
                                  updatedSubtarea.cantidad_norma || 0,
                                ) +
                                parseFloat(updatedSubtarea.cantidad_parci || 0);
                            }
                            if (
                              [
                                "cantidad_acumu",
                                "cantidad",
                                "cantidad_norma",
                                "cantidad_parci",
                              ].includes(cell)
                            ) {
                              updatedSubtarea.porcentaje =
                                (parseFloat(
                                  updatedSubtarea.cantidad_acumu || 0,
                                ) /
                                  parseFloat(updatedSubtarea.cantidad || 0)) *
                                100;
                              updatedSubtarea.porcentaje =
                                updatedSubtarea.porcentaje.toFixed(1);
                            }
                            return updatedSubtarea;
                          }
                          return subtarea;
                        },
                      );

                      return { ...tarea, Task_Subtask: nuevasSubtareas };
                    }
                    return tarea;
                  },
                );

                return { ...subpartida, subpartida_tarea: nuevasTareas };
              }
              return subpartida;
            },
          );

          return { ...partida, subpartida_partida: nuevasSubpartidas };
        }
        return partida;
      });
      console.log(
        "nuevasPartidasArr después de actualizar:",
        nuevasPartidasArr,
      );
      setPartidasArr(nuevasPartidasArr);
    };

    useEffect(() => {
      setExpandedRows({ ...expandedRowsRef.current });
      setExpandedSubpartidaRows({ ...expandedSubpartidaRowsRef.current });
      setExpandedTareasRows({ ...expandedTareasRowsRef.current });
    }, [partidasArr]);

    const [unidadOptions, setunidadOptions] = useState([]);
    const [selectedunidad, setunidad] = useState(null);

    useEffect(() => {
      const fetchunidadOptions = async () => {
        try {
          const data = await unidadlist(); // Asegúrate de que unidadlist esté correctamente importado
          const formattedOptions = data.map((unidad) => ({
            value: unidad.id_unidad,
            label: unidad.nombre_unidad,
          }));
          setunidadOptions(formattedOptions);
        } catch (error) {
          console.error("Error fetching unidades options:", error);
        }
      };

      fetchunidadOptions();
    }, []);

    const handleSelectunidad = async (selectedOption, partidaId) => {
      const nuevasPartidas = partidasArr.map((partida) => {
        if (partida.id_partida === partidaId) {
          return {
            ...partida,
            id_unidad: selectedOption ? selectedOption.value : null,
          };
        }
        return partida;
      });

      setPartidasArr(nuevasPartidas);

      // Obtener la partida actualizada
      const partidaToUpdate = nuevasPartidas.find(
        (partida) => partida.id_partida === partidaId,
      );

      if (!partidaToUpdate) {
        throw new Error("Partida no encontrada para actualizar");
      }

      const partidaSUpdate = {
        nombre_partida: partidaToUpdate.nombre_partida || "",
        cantidad_normal: partidaToUpdate.cantidad_normal || "0",
        cantidad_acumulada: partidaToUpdate.cantidad_acumulada || "0",
        cantidad_parcial: partidaToUpdate.cantidad_parcial || "0",
        porcentaje: partidaToUpdate.porcentaje || "0",
        cantidad: partidaToUpdate.cantidad || "0",
        precio_unit: partidaToUpdate.precio_unit || "0",
        horas_hombre: partidaToUpdate.horas_hombre || "0",
        horas_maquina: partidaToUpdate.horas_maquina || "0",
        id_proyecto: projectId,
        updatedAt: new Date(),
        precio_total: partidaToUpdate.precio_total || "0",
        id_unidad: partidaToUpdate.id_unidad || null, // Asegurarse de incluir id_unidad
      };

      try {
        const response = await updatePartida(partidaId, partidaSUpdate);
        showToastSafely("Campo actualizado correctamente");
        console.log("Partida actualizada:", response);
      } catch (error) {
        console.error("Error updating partida:", error);
      }
    };

    const handleSelectunidadsub = async (selectedOption, id) => {
      const nuevasPartidasArr = partidasArr.map((partida) => {
        if (partida.subpartida_partida) {
          const nuevasSubpartidas = partida.subpartida_partida.map(
            (subpartida) => {
              if (subpartida.id_subpartida === id) {
                return {
                  ...subpartida,
                  id_unidad: selectedOption ? selectedOption.value : null,
                };
              }
              return subpartida;
            },
          );

          return { ...partida, subpartida_partida: nuevasSubpartidas };
        }
        return partida;
      });

      setPartidasArr(nuevasPartidasArr);

      // Obtener la subpartida actualizada
      const subpartidaToUpdate = nuevasPartidasArr
        .flatMap((partida) => partida.subpartida_partida)
        .find((subpartida) => subpartida.id_subpartida === id);

      if (!subpartidaToUpdate) {
        throw new Error("Subpartida no encontrada para actualizar");
      }

      const subpartidaSUpdate = {
        nombre_sub_partida: subpartidaToUpdate.nombre_sub_partida || "",
        cantidad_normal: subpartidaToUpdate.cantidad_normal || "0",
        cantidad_acumulada: subpartidaToUpdate.cantidad_acumulada || "0",
        cantidad_parcial: subpartidaToUpdate.cantidad_parcial || "0",
        porcentaje: subpartidaToUpdate.porcentaje || "0",
        cantidad: subpartidaToUpdate.cantidad || "0",
        precio_unit: subpartidaToUpdate.precio_unit || "0",
        precio_total: subpartidaToUpdate.precio_total || "0",
        horas_hombre: subpartidaToUpdate.horas_hombre || "0",
        horas_maquina: subpartidaToUpdate.horas_maquina || "0",
        id_unidad: subpartidaToUpdate.id_unidad || null,
      };

      try {
        const response = await updatesubPartida(id, subpartidaSUpdate);
        showToastSafely("Campo actualizado correctamente");
        console.log("Subpartida actualizada:", response);
      } catch (error) {
        console.error("Error actualizando subpartida:", error);
      }
    };

    const handleSelectunidadtarea = async (selectedOption, id) => {
      const nuevasPartidasArr = partidasArr.map((partida) => {
        if (partida.subpartida_partida) {
          const nuevasSubpartidas = partida.subpartida_partida.map(
            (subpartida) => {
              if (subpartida.subpartida_tarea) {
                const nuevasTareas = subpartida.subpartida_tarea.map(
                  (tarea) => {
                    if (tarea.id === id) {
                      return {
                        ...tarea,
                        id_unidad: selectedOption ? selectedOption.value : null,
                      };
                    }
                    return tarea;
                  },
                );

                return { ...subpartida, subpartida_tarea: nuevasTareas };
              }
              return subpartida;
            },
          );

          return { ...partida, subpartida_partida: nuevasSubpartidas };
        }
        return partida;
      });

      setPartidasArr(nuevasPartidasArr);

      // Obtener la tarea actualizada
      const tareaToUpdate = nuevasPartidasArr
        .flatMap((partida) => partida.subpartida_partida)
        .flatMap((subpartida) => subpartida.subpartida_tarea)
        .find((tarea) => tarea.id === id);

      if (!tareaToUpdate) {
        throw new Error("Tarea no encontrada para actualizar");
      }

      const tareaSUpdate = {
        nombre: tareaToUpdate.nombre || "",
        cantidad_normal: tareaToUpdate.cantidad_normal || "0",
        cantidad_acumulada: tareaToUpdate.cantidad_acumulada || "0",
        cantidad_parcial: tareaToUpdate.cantidad_parcial || "0",
        porcentaje: tareaToUpdate.porcentaje || "0",
        cantidad: tareaToUpdate.cantidad || "0",
        precio_unit: tareaToUpdate.precio_unit || "0",
        precio_total: tareaToUpdate.precio_total || "0",
        horas_hombre: tareaToUpdate.horas_hombre || "0",
        horas_maquina: tareaToUpdate.horas_maquina || "0",
        id_unidad: tareaToUpdate.id_unidad || null,
      };

      try {
        const response = await updateTarea(id, tareaSUpdate);
        showToastSafely("Campo actualizado correctamente");
        console.log("tarea actualizada:", response);
      } catch (error) {
        console.error("Error actualizando tarea:", error);
      }
    };

    const handleSelectunidadsubtarea = async (selectedOption, id) => {
      const nuevasPartidasArr = partidasArr.map((partida) => {
        if (partida.subpartida_partida) {
          const nuevasSubpartidas = partida.subpartida_partida.map(
            (subpartida) => {
              if (subpartida.subpartida_tarea) {
                const nuevasTareas = subpartida.subpartida_tarea.map(
                  (tarea) => {
                    if (tarea.Task_Subtask) {
                      const nuevasSubtareas = tarea.Task_Subtask.map(
                        (subtarea) => {
                          if (subtarea.id_subtask === id) {
                            return {
                              ...subtarea,
                              id_material: selectedOption
                                ? selectedOption.value
                                : null,
                            };
                          }
                          return subtarea;
                        },
                      );

                      return { ...tarea, Task_Subtask: nuevasSubtareas };
                    }
                    return tarea;
                  },
                );

                return { ...subpartida, subpartida_tarea: nuevasTareas };
              }
              return subpartida;
            },
          );

          return { ...partida, subpartida_partida: nuevasSubpartidas };
        }
        return partida;
      });

      setPartidasArr(nuevasPartidasArr);

      const subtareaToUpdate = nuevasPartidasArr
        .flatMap((partida) => partida.subpartida_partida)
        .flatMap((subpartida) => subpartida.subpartida_tarea)
        .flatMap((tarea) => tarea.Task_Subtask)
        .find((subtarea) => subtarea.id_subtask === id);

      if (!subtareaToUpdate) {
        throw new Error("Subtarea no encontrada para actualizar");
      }

      const subtareaSUpdate = {
        nombre: subtareaToUpdate.nombre || "",
        cantidad_normal: subtareaToUpdate.cantidad_normal || "0",
        cantidad_acumulada: subtareaToUpdate.cantidad_acumulada || "0",
        cantidad_parcial: subtareaToUpdate.cantidad_parcial || "0",
        porcentaje: subtareaToUpdate.porcentaje || "0",
        cantidad: subtareaToUpdate.cantidad || "0",
        precio_unit: subtareaToUpdate.precio_unit || "0",
        precio_total: subtareaToUpdate.precio_total || "0",
        horas_hombre: subtareaToUpdate.horas_hombre || "0",
        horas_maquina: subtareaToUpdate.horas_maquina || "0",
        id_material: subtareaToUpdate.id_material || null,
      };

      try {
        const response = await updateSubtarea(id, subtareaSUpdate);
        showToastSafely("Campo actualizado correctamente");
        console.log("subtarea actualizada:", response);
      } catch (error) {
        console.error("Error actualizando subtarea:", error);
      }
    };

    // const tableClassName = ['supervisor', 'ITO'].includes(role)
    //   ? 'w-full border-collapse border border-gray-400 font-zen-kaku h-full text-lg supervisor-mode'
    //   : 'w-full border-collapse border border-gray-400 font-zen-kaku h-full text-lg';

    const exportToExcel = () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Partidas");

      // Definir los encabezados
      const headers = [
        "Item",
        "Descripción de partidas",
        "Unidad",
        "Cantidad",
        "P. Unitaria",
        "HH",
        "HM",
        "Cantidad acumulada",
        "subtotal acumulada",
        "Cantidad Parcial",
        "subtotal parcial",
        "Porcentaje",
        "Precio Unitario (USD)",
        "Precio Total (USD)",
      ];

      // Agregar encabezados con estilo
      worksheet.columns = headers.map((header) => ({
        header: header,
        key: header,
        width: 20, // Ajustar el ancho de las columnas
      }));

      const tableData = [];

      partidasArr.forEach((item, index) => {
        tableData.push({
          Nivel: `${index + 1}`,
          Descripción: item.nombre_partida,
          Unidad: item.id_unidad,
          Cantidad: item.cantidad,
          "P. Unitaria": item.precio_unit,
          HH: item.horas_hombre,
          HM: item.horas_maquina,
          Cantidad_acumulada: item.cantidad_normal,
          subtotal_acumulada: item.cantidad_acumulada,
          Cantidad_Parcial: item.cantidad_parcial,
          subtotal_parcial: item.cantidad_parcial,
          Porcentaje: item.porcentaje,
          "Precio Unitario (USD)": item.precio_unit,
          "Precio Total (USD)": item.precio_total,
        });

        item.subpartida_partida?.forEach((subItem, indexsub) => {
          tableData.push({
            Nivel: `${index + 1}.${indexsub + 1}`,
            Descripción: subItem.nombre_sub_partida,
            Unidad: subItem.id_unidad,
            Cantidad: subItem.cantidad,
            "P. Unitaria": subItem.precio_unit,
            HH: subItem.horas_hombre,
            HM: subItem.horas_maquina,
            Cantidad_acumulada: subItem.cantidad_normal,
            subtotal_acumulada: subItem.cantidad_acumulada,
            Cantidad_Parcial: subItem.cantidad_parcial,
            subtotal_parcial: subItem.cantidad_parcial,
            Porcentaje: subItem.porcentaje,
            "Precio Unitario (USD)": subItem.precio_unit,
            "Precio Total (USD)": subItem.precio_total,
          });

          subItem.subpartida_tarea?.forEach((tarea, tareaIndex) => {
            tableData.push({
              Nivel: `${index + 1}.${indexsub + 1}.${tareaIndex + 1}`,
              Descripción: tarea.nombre,
              Unidad: tarea.id_unidad,
              Cantidad: tarea.cantidad,
              "P. Unitaria": tarea.precio_unit,
              HH: tarea.horas_hombre,
              HM: tarea.horas_maquina,
              Cantidad_acumulada: tarea.cantidad_normal,
              subtotal_acumulada: tarea.cantidad_acumulada,
              Cantidad_Parcial: tarea.cantidad_parcial,
              subtotal_parcial: tarea.cantidad_parcial,
              Porcentaje: tarea.porcentaje,
              "Precio Unitario (USD)": tarea.precio_unit,
              "Precio Total (USD)": tarea.precio_total,
            });

            tarea.Task_Subtask?.forEach((subtarea, subtareaIndex) => {
              tableData.push({
                Nivel: `${index + 1}.${indexsub + 1}.${tareaIndex + 1}.${subtareaIndex + 1}`,
                Descripción: subtarea.nombre,
                Unidad: subtarea.id_material,
                Cantidad: subtarea.cantidad,
                "P. Unitaria": subtarea.precio_unit,
                HH: subtarea.horas_hombre,
                HM: subtarea.horas_maquina,
                Cantidad_acumulada: subtarea.cantidad_norma,
                subtotal_acumulada: subtarea.cantidad_acumu,
                Cantidad_Parcial: subtarea.cantidad_parci,
                subtotal_parcial: subtarea.cantidad_parci,
                Porcentaje: subtarea.porcentaje,
                "Precio Unitario (USD)": subtarea.precio_unit,
                "Precio Total (USD)": subtarea.precio_total,
              });
            });
          });
        });
      });

      // Agregar los datos a la hoja
      tableData.forEach((row) => {
        worksheet.addRow(row);
      });

      // Estilizar encabezados
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFB6E7B5" },
        };
      });

      // Descargar el archivo
      workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `partidas_${new Date().toISOString().split("T")[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    };

    const [isAnimating, setIsAnimating] = useState(false);

    // Sistema para evitar toasts duplicados
    const [lastToastTime, setLastToastTime] = useState(0);
    const [lastToastMessage, setLastToastMessage] = useState("");
    
      // Sistema global para evitar toasts duplicados usando sessionStorage
  const showToastSafely = (message, type = "success") => {
    const now = Date.now();
    const storageKey = 'lastToast';
    
    // Obtener el último toast del storage
    const lastToastData = sessionStorage.getItem(storageKey);
    let shouldBlock = false;
    
    if (lastToastData) {
      const { message: lastMessage, timestamp: lastTime } = JSON.parse(lastToastData);
      const timeDiff = now - lastTime;
      
      // Si es el mismo mensaje y han pasado menos de 3 segundos, bloquear
      if (lastMessage === message && timeDiff < 3000) {
        console.log(`🚫 Toast GLOBAL bloqueado: "${message}" (${timeDiff}ms desde el último)`);
        shouldBlock = true;
      }
    }
    
    if (!shouldBlock) {
      console.log(`✅ Toast GLOBAL permitido: "${message}"`);
      
      // Guardar en sessionStorage
      sessionStorage.setItem(storageKey, JSON.stringify({
        message: message,
        timestamp: now
      }));
      
      if (type === "success") {
        toast.success(message);
      } else if (type === "error") {
        toast.error(message);
      }
    }
  };

    return (
      <div className="w-full max-w-[90vw] min-h-[50vh] max-h-[95vh] overflow-hidden">
        <div className="relative overflow-x-auto overflow-y-auto max-h-[50vh] sm:max-h-[60vh] md:max-h-[75vh] pb-10 w-full">
          {/* Selector de moneda sobre la tabla */}
          <div className="mb-4 flex items-center gap-4">
            <span className="font-semibold">Moneda:</span>
            <Select
              className="basic-single w-32"
              classNamePrefix="select"
              isSearchable={false}
              name="currency"
              options={[
                { value: "USD", label: "USD ($)" },
                { value: "CLP", label: "CLP (CLP$)" },
              ]}
              value={{
                value: currency,
                label: currency === "USD" ? "USD ($)" : "CLP (CLP$)",
              }}
              onChange={(option) => setCurrency(option.value)}
              menuPortalTarget={document.body}
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            />
          </div>
          {/* Si partidasArr está vacío, mostramos un mensaje al usuario */}

          <table
            className={
              ["supervisor", "ITO"].includes(role)
                ? "table-auto w-full border-collapse border border-gray-400 font-zen-kaku h-full text-lg supervisor-mode"
                : "table-auto w-full border-collapse border border-gray-400 font-zen-kaku h-full text-lg"
            }
          >
            <thead className="sticky top-0 z-20">
              {/* Primera fila con encabezados agrupados */}
              <tr style={{ background: "#5C7891" }}>
                <th className="px-4 py-2 text-white border-r border-black"></th>
                <th className="px-4 py-2 text-white border-r border-black"></th>
                <th className="px-4 py-2 text-white border-r border-black"></th>
                <th className="px-4 py-2 text-white border-r border-black"></th>
                <th className="px-4 py-2 text-white border-r border-black"></th>
                <th className="px-4 py-2 text-white border-r border-black"></th>
                <th className="px-4 py-2 text-white border-r border-black"></th>
                <th
                  className="px-4 py-2 text-white border-r border-black whitespace-nowrap"
                  colSpan="2"
                >
                  Cantidad acumulada
                </th>
                <th
                  className="px-4 py-2 text-white border-r border-black whitespace-nowrap"
                  colSpan="2"
                >
                  Cantidad parcial
                </th>
                <th className="px-4 py-2 text-white border-r border-black whitespace-nowrap">
                  Porcentaje
                </th>
                <th
                  className="px-4 py-2 text-white border-r border-black whitespace-nowrap"
                  colSpan="4"
                />
              </tr>
              <tr style={{ background: "#5C7891" }}>
                <th className="px-4 py-2 text-white border-r border-black whitespace-nowrap">
                  Item
                </th>
                <th className="px-4 py-2 text-white border-r border-black whitespace-nowrap">
                  Descripción de partidas
                </th>
                <th className="px-4 py-2 text-white border-r border-black whitespace-nowrap">
                  Unidad
                </th>
                <th className="px-4 py-2 text-white border-r border-black whitespace-nowrap">
                  Cantidad
                </th>
                <th className="px-4 py-2 text-white border-r border-black whitespace-nowrap">
                  P. Unitaria
                </th>
                <th className="px-4 py-2 text-white border-r border-black whitespace-nowrap">
                  HH
                </th>
                <th className="px-4 py-2 text-white border-r border-black whitespace-nowrap">
                  HM
                </th>
                <th className="px-4 py-2 text-white border-r border-black whitespace-nowrap">
                  Cantidad
                </th>
                <th className="px-4 py-2 text-white border-r border-black whitespace-nowrap">
                  sub-total
                </th>
                <th className="px-4 py-2 text-white border-r border-black whitespace-nowrap">
                  Cantidad
                </th>
                <th className="px-4 py-2 text-white border-r border-black whitespace-nowrap">
                  sub-total
                </th>
                <th className="px-4 py-2 text-white border-r border-black whitespace-nowrap">
                  Cantidad de %
                </th>
                <th className="px-4 py-2 text-white border-r border-black whitespace-nowrap">
                  Precio Unitario
                </th>
                <th className="px-4 py-2 text-white border-r border-black whitespace-nowrap">
                  Precio Total
                </th>
              </tr>
            </thead>

            <tbody>
              {partidasArr.length === 0 ? (
                <tr>
                  <td
                    colSpan="14"
                    className="text-center py-4 text-lg text-gray-600"
                  >
                    <div className="flex justify-center items-center min-h-[100px]">
                      No se encontraron datos para la fecha seleccionada.
                    </div>
                  </td>
                </tr>
              ) : (
                partidasArr.map((item, index) => (
                  <React.Fragment key={item.id_partida}>
                    <tr onClick={() => handlePartidaClick(item)}>
                      <td className="px-4 py-2 border border-gray-400">
                        {index + 1}
                      </td>
                      <td className="px-4 py-2 border border-gray-400 cursor-pointer">
                        <div
                          className="flex items-center w-96"
                          onClick={() => handleIconClick(item.id_partida)}
                        >
                          <ChevronRight
                            strokeWidth={3}
                            className={`w-8 h-8 cursor-pointer stroke-[#0fffc1] hover:stroke-[#ff26a9] drop-shadow-lg neon-glow transition-transform ${expandedRows[item.id_partida] ? "rotate-90" : ""}`}
                          />
                          <span className="ml-2 line-clamp-3 w-full">
                            {item.nombre_partida}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-2 border border-gray-400">
                        <Select
                          className="basic-single font-zen-kaku w-56"
                          classNamePrefix="select"
                          isSearchable={true}
                          name="unidad"
                          options={unidadOptions}
                          isDisabled={true}
                          value={
                            unidadOptions.find(
                              (option) => option.value === item.id_unidad,
                            ) || null
                          }
                          onChange={(selectedOption) =>
                            handleSelectunidad(selectedOption, item.id_partida)
                          }
                          menuPortalTarget={document.body} // Renderiza el menú en el body
                          styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                          }}
                          menuPlacement="auto" // Esto ajusta automáticamente la ubicación del menú según el espacio disponible
                          menuPosition="fixed" // Asegúrate de que el menú esté por encima de otros elementos
                        />
                      </td>
                      <td className="px-4 py-2 border border-gray-400">
                        <input
                          type="text"
                          className="text-center cursor-not-allowed"
                          disabled
                          value={item.cantidad}
                          onChange={(e) =>
                            handleCellChange(
                              item.id_partida,
                              e.target.value,
                              "cantidad",
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-2 border border-gray-400">
                        <div className="relative flex items-center">
                          <span>{currency}</span>
                          <input
                            type="text"
                            className="text-center"
                            disabled
                            value={convertCurrency(item.precio_unit)}
                            onChange={(e) =>
                              handleCellChange(
                                item.id_partida,
                                e.target.value,
                                "precio_unit",
                              )
                            }
                          />
                        </div>
                      </td>
                      <td className="px-4 py-2 border border-gray-400">
                        <input
                          type="text"
                          className="text-center"
                          disabled
                          value={item.horas_hombre}
                          onChange={(e) =>
                            handleCellChange(
                              item.id_partida,
                              e.target.value,
                              "horas_hombre",
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-2 border border-gray-400">
                        <input
                          type="text"
                          className="text-center"
                          disabled
                          value={item.horas_maquina}
                          onChange={(e) =>
                            handleCellChange(
                              item.id_partida,
                              e.target.value,
                              "horas_maquina",
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-2 border border-gray-400">
                        <input
                          type="text"
                          className="text-center"
                          disabled
                          value={item.cantidad_normal}
                          onChange={(e) =>
                            handleCellChange(
                              item.id_partida,
                              e.target.value,
                              "cantidad_normal",
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-2 border border-gray-400">
                        <input
                          type="text"
                          disabled
                          className="text-center"
                          value={item.cantidad_acumulada}
                          onChange={(e) =>
                            handleCellChange(
                              item.id_partida,
                              e.target.value,
                              "cantidad_acumulada",
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-2 border border-gray-400">
                        <input
                          type="text"
                          className="text-center"
                          disabled
                          value={item.cantidad_parcial}
                          onChange={(e) =>
                            handleCellChange(
                              item.id_partida,
                              e.target.value,
                              "cantidad_parcial",
                            )
                          }
                        />
                      </td>
                      <td className="px-14 py-2 border border-gray-400">
                        <div className="text-center">
                          {item.cantidad_parcial}
                        </div>
                      </td>
                      <td className="px-4 py-2 border border-gray-400">
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            className="text-right pr-4 max-w-24"
                            disabled
                            value={item.porcentaje}
                            onChange={(e) =>
                              handleCellChange(
                                item.id_partida,
                                e.target.value,
                                "porcentaje",
                              )
                            }
                          />
                          <span>%</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 border border-gray-400">
                        <div className="relative flex items-center">
                          <span className="ml-16">USD</span>
                          <input
                            type="text"
                            disabled
                            className="text-left ml-2 max-w-48"
                            value={item.precio_unit}
                            onChange={(e) =>
                              handleCellChange(
                                item.id_partida,
                                e.target.value,
                                "precio_unit",
                              )
                            }
                          />
                        </div>
                      </td>

                      <td className="px-4 py-2 border border-gray-400">
                        <div className="relative flex items-center">
                          <span className="ml-16">{currency}</span>
                          <input
                            type="text"
                            className="text-left ml-2 max-w-48"
                            disabled
                            value={convertCurrency(item.precio_total)}
                            onChange={(e) =>
                              handleCellChange(
                                item.id_partida,
                                e.target.value,
                                "precio_total",
                              )
                            }
                          />
                        </div>
                      </td>
                    </tr>
                    {expandedRows[item.id_partida] &&
                      // Itera sobre el array subpartida de cada item
                      item.subpartida_partida.map((subItem, indexsub) => (
                        <React.Fragment key={subItem.id_subpartida}>
                          <tr onClick={() => handleSubpartidaClick(subItem)}>
                            <td className="px-4 py-2 border border-gray-400 ">
                              {index + 1}.{indexsub + 1}
                            </td>
                            <td className="px-4 py-2 border border-gray-400 cursor-pointer">
                              <div
                                className="flex items-center w-96"
                                onClick={() =>
                                  handleIconClick(subItem.id_subpartida)
                                }
                              >
                                <ChevronRight
                                  strokeWidth={3}
                                  className={`w-8 h-8 cursor-pointer stroke-[#ff26a9] hover:stroke-[#0fffc1] drop-shadow-lg neon-glow transition-transform ${expandedSubpartidaRows[subItem.id_subpartida] ? "rotate-90" : ""}`}
                                />
                                <span className="ml-2 line-clamp-3 w-full">
                                  {subItem.nombre_sub_partida}
                                </span>
                                {/* <AutoWidthInput className="ml-2 select-none" disabled value={subItem.nombre_sub_partida} type='text' /> */}
                              </div>
                            </td>

                            <td className="px-4 py-2 border border-gray-400">
                              <Select
                                className="basic-single font-zen-kaku w-56"
                                classNamePrefix="select"
                                isSearchable={true}
                                name="unidad"
                                options={unidadOptions}
                                isDisabled={true}
                                value={
                                  unidadOptions.find(
                                    (option) =>
                                      option.value === subItem.id_unidad,
                                  ) || null
                                }
                                onChange={(selectedOption) =>
                                  handleSelectunidadsub(
                                    selectedOption,
                                    subItem.id_subpartida,
                                  )
                                }
                                menuPortalTarget={document.body} // Renderiza el menú en el body
                                styles={{
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                }}
                                menuPlacement="auto" // Esto ajusta automáticamente la ubicación del menú según el espacio disponible
                                menuPosition="fixed" // Asegúrate de que el menú esté por encima de otros elementos
                              />
                            </td>
                            <td className="px-4 py-2 border border-gray-400">
                              <input
                                type="text"
                                disabled
                                className="text-center"
                                value={subItem.cantidad}
                                onChange={(e) =>
                                  handleSubpartidaChange(
                                    subItem.id_subpartida,
                                    e.target.value,
                                    "cantidad",
                                  )
                                }
                              />
                            </td>
                            <td className="px-4 py-2 border border-gray-400">
                              <div className="relative flex items-center">
                                <span>{currency}</span>
                                <input
                                  type="text"
                                  className="text-center"
                                  disabled
                                  value={convertCurrency(subItem.precio_unit)}
                                  onChange={(e) =>
                                    handleSubpartidaChange(
                                      subItem.id_subpartida,
                                      e.target.value,
                                      "precio_unit",
                                    )
                                  }
                                />
                              </div>
                            </td>
                            <td className="px-4 py-2 border border-gray-400">
                              <input
                                type="text"
                                className="text-center"
                                disabled
                                value={subItem.horas_hombre}
                                onChange={(e) =>
                                  handleSubpartidaChange(
                                    subItem.id_subpartida,
                                    e.target.value,
                                    "horas_hombre",
                                  )
                                }
                              />
                            </td>
                            <td className="px-4 py-2 border border-gray-400">
                              <input
                                type="text"
                                className="text-center"
                                disabled
                                value={subItem.horas_maquina}
                                onChange={(e) =>
                                  handleSubpartidaChange(
                                    subItem.id_subpartida,
                                    e.target.value,
                                    "horas_maquina",
                                  )
                                }
                              />
                            </td>

                            <td className="px-4 py-2 border border-gray-400">
                              <input
                                type="text"
                                className="text-center"
                                disabled
                                value={subItem.cantidad_normal}
                                onChange={(e) =>
                                  handleSubpartidaChange(
                                    subItem.id_subpartida,
                                    e.target.value,
                                    "cantidad_normal",
                                  )
                                }
                              />
                            </td>
                            <td className="px-4 py-2 border border-gray-400">
                              <input
                                type="text"
                                disabled
                                className="text-center"
                                value={subItem.cantidad_acumulada}
                                onChange={(e) =>
                                  handleSubpartidaChange(
                                    subItem.id_subpartida,
                                    e.target.value,
                                    "cantidad_acumulada",
                                  )
                                }
                              />
                            </td>

                            <td className="px-4 py-2 border border-gray-400">
                              <input
                                type="text"
                                className="text-center"
                                disabled
                                value={subItem.cantidad_parcial}
                                onChange={(e) =>
                                  handleSubpartidaChange(
                                    subItem.id_subpartida,
                                    e.target.value,
                                    "cantidad_parcial",
                                  )
                                }
                              />
                            </td>
                            <td className="px-4 py-2 border border-gray-400">
                              <div className="text-center">
                                {subItem.cantidad_parcial}
                              </div>
                            </td>

                            <td className="px-4 py-2 border border-gray-400">
                              <div className="relative flex items-center">
                                <input
                                  type="text"
                                  className="text-right pr-4 max-w-24"
                                  disabled
                                  value={subItem.porcentaje}
                                  onChange={(e) =>
                                    handleSubpartidaChange(
                                      subItem.id_subpartida,
                                      e.target.value,
                                      "porcentaje",
                                    )
                                  }
                                />
                                <span>%</span>
                              </div>
                            </td>

                            <td className="px-4 py-2 border border-gray-400">
                              <div className="relative flex items-center">
                                <span className="ml-16">USD</span>
                                <input
                                  type="text"
                                  className="text-left ml-2 max-w-48"
                                  disabled
                                  value={subItem.precio_unit}
                                  onChange={(e) =>
                                    handleSubpartidaChange(
                                      subItem.id_subpartida,
                                      e.target.value,
                                      "precio_unit",
                                    )
                                  }
                                />
                              </div>
                            </td>
                            <td className="px-4 py-2 border border-gray-400">
                              <div className="relative flex items-center">
                                <span className="ml-16">{currency}</span>
                                <input
                                  type="text"
                                  className="text-left ml-2 max-w-48 "
                                  disabled
                                  value={convertCurrency(subItem.precio_total)}
                                  onChange={(e) =>
                                    handleSubpartidaChange(
                                      subItem.id_subpartida,
                                      e.target.value,
                                      "precio_total",
                                    )
                                  }
                                />
                              </div>
                            </td>
                          </tr>
                          {expandedSubpartidaRows[subItem.id_subpartida] &&
                            // Itera sobre el array de tareas de cada subItem
                            subItem.subpartida_tarea.map(
                              (tarea, tareaIndex) => (
                                <React.Fragment key={tarea.id}>
                                  <tr onClick={() => handleTareaClick(tarea)}>
                                    <td className="px-4 py-2 border border-gray-400">
                                      {index + 1}.{indexsub + 1}.
                                      {tareaIndex + 1}
                                    </td>
                                    <td className="px-4 py-2 border border-gray-400 cursor-pointer">
                                      <div
                                        className="flex items-center w-96"
                                        onClick={() =>
                                          handleIconClick(tarea.id)
                                        }
                                      >
                                        <ChevronRight
                                          strokeWidth={3}
                                          className={`w-8 h-8 cursor-pointer stroke-orange-500 hover:stroke-orange-600 transition-transform ${expandedTareasRows[tarea.id] ? "rotate-90" : ""}`}
                                        />
                                        <span className="ml-2 line-clamp-3 w-full">
                                          {tarea.nombre}
                                        </span>
                                        {/* <AutoWidthInput className="ml-2 select-none" value={tarea.nombre} type='text' disabled /> */}
                                      </div>
                                    </td>

                                    <td className="px-4 py-2 border border-gray-400">
                                      <Select
                                        className="basic-single font-zen-kaku w-56"
                                        classNamePrefix="select"
                                        isSearchable={true}
                                        name="unidad"
                                        options={unidadOptions}
                                        isDisabled={true}
                                        value={
                                          unidadOptions.find(
                                            (option) =>
                                              option.value === tarea.id_unidad,
                                          ) || null
                                        }
                                        onChange={(selectedOption) =>
                                          handleSelectunidadtarea(
                                            selectedOption,
                                            tarea.id,
                                          )
                                        }
                                        menuPortalTarget={document.body} // Renderiza el menú en el body
                                        styles={{
                                          menuPortal: (base) => ({
                                            ...base,
                                            zIndex: 9999,
                                          }),
                                        }}
                                        menuPlacement="auto" // Esto ajusta automáticamente la ubicación del menú según el espacio disponible
                                        menuPosition="fixed" // Asegúrate de que el menú esté por encima de otros elementos
                                      />
                                    </td>
                                    <td className="px-4 py-2 border border-gray-400">
                                      <input
                                        type="text"
                                        disabled
                                        className="text-center"
                                        value={tarea.cantidad}
                                        onChange={(e) =>
                                          handleTareaChange(
                                            tarea.id,
                                            e.target.value,
                                            "cantidad",
                                          )
                                        }
                                      />
                                    </td>
                                    <td className="px-4 py-2 border border-gray-400">
                                      <div className="relative flex items-center">
                                        <span>{currency}</span>
                                        <input
                                          type="text"
                                          className="text-center"
                                          disabled
                                          value={convertCurrency(
                                            tarea.precio_unit,
                                          )}
                                          onChange={(e) =>
                                            handleTareaChange(
                                              tarea.id,
                                              e.target.value,
                                              "precio_unit",
                                            )
                                          }
                                        />
                                      </div>
                                    </td>
                                    <td className="px-4 py-2 border border-gray-400">
                                      <input
                                        type="text"
                                        className="text-center"
                                        disabled
                                        value={tarea.horas_hombre}
                                        onChange={(e) =>
                                          handleTareaChange(
                                            tarea.id,
                                            e.target.value,
                                            "horas_hombre",
                                          )
                                        }
                                      />
                                    </td>
                                    <td className="px-4 py-2 border border-gray-400">
                                      <input
                                        type="text"
                                        className="text-center"
                                        disabled
                                        value={tarea.horas_maquina}
                                        onChange={(e) =>
                                          handleTareaChange(
                                            tarea.id,
                                            e.target.value,
                                            "horas_maquina",
                                          )
                                        }
                                      />
                                    </td>

                                    <td className="px-4 py-2 border border-gray-400">
                                      <input
                                        type="text"
                                        className="text-center"
                                        disabled
                                        value={tarea.cantidad_normal}
                                        onChange={(e) =>
                                          handleTareaChange(
                                            tarea.id,
                                            e.target.value,
                                            "cantidad_normal",
                                          )
                                        }
                                      />
                                    </td>
                                    <td className="px-4 py-2 border border-gray-400">
                                      <input
                                        type="text"
                                        disabled
                                        className="text-center"
                                        value={tarea.cantidad_acumulada}
                                        onChange={(e) =>
                                          handleTareaChange(
                                            tarea.id,
                                            e.target.value,
                                            "cantidad_acumulada",
                                          )
                                        }
                                      />
                                    </td>

                                    <td className="px-4 py-2 border border-gray-400">
                                      <input
                                        type="text"
                                        className="text-center"
                                        disabled
                                        value={tarea.cantidad_parcial}
                                        onChange={(e) =>
                                          handleTareaChange(
                                            tarea.id,
                                            e.target.value,
                                            "cantidad_parcial",
                                          )
                                        }
                                      />
                                    </td>
                                    <td className="px-4 py-2 border border-gray-400">
                                      <div className="text-center">
                                        {tarea.cantidad_parcial}
                                      </div>
                                    </td>

                                    <td className="px-4 py-2 border border-gray-400">
                                      <div className="relative flex items-center">
                                        <input
                                          type="text"
                                          className="text-right pr-4 max-w-24"
                                          disabled
                                          value={tarea.porcentaje}
                                          onChange={(e) =>
                                            handleSubpartidaChange(
                                              tarea.id,
                                              e.target.value,
                                              "porcentaje",
                                            )
                                          }
                                        />
                                        <span>%</span>
                                      </div>
                                    </td>

                                    <td className="px-4 py-2 border border-gray-400">
                                      <div className="relative flex items-center">
                                        <span className="ml-16">USD</span>
                                        <input
                                          type="text"
                                          disabled
                                          className="text-left ml-2 max-w-48"
                                          value={tarea.precio_unit}
                                          onChange={(e) =>
                                            handleTareaChange(
                                              tarea.id,
                                              e.target.value,
                                              "precio_unit",
                                            )
                                          }
                                        />
                                      </div>
                                    </td>
                                    <td className="px-4 py-2 border border-gray-400">
                                      <div className="relative flex items-center">
                                        <span className="ml-16">
                                          {currency}
                                        </span>
                                        <input
                                          type="text"
                                          disabled
                                          className="text-left ml-2 max-w-48"
                                          value={convertCurrency(
                                            tarea.precio_total,
                                          )}
                                          onChange={(e) =>
                                            handleTareaChange(
                                              tarea.id,
                                              e.target.value,
                                              "precio_total",
                                            )
                                          }
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                  {expandedTareasRows[tarea.id] &&
                                    tarea.Task_Subtask.map(
                                      (subtarea, subtareaIndex) => (
                                        <React.Fragment key={subtarea.id}>
                                          <tr>
                                            <td className="px-4 py-2 border border-gray-400">
                                              <div className="flex items-center">
                                                {index + 1}.{indexsub + 1}.
                                                {tareaIndex + 1}.
                                                {subtareaIndex + 1}
                                                {/* <button
                                            onClick={() => handleSpanClick(subtarea, index, indexsub, tareaIndex, subtareaIndex)}
                                            className="ml-2 text-gray-500 hover:text-gray-700"
                                            type='button'
                                          >
                                            <Edit className="w-4 h-4" />
                                          </button> */}
                                              </div>
                                            </td>
                                            {/* <AutoWidthInput type="text" className='text-center cursor-pointer' value={subtarea.nombre} readOnly /> */}

                                            <td className="px-4 py-2 border border-gray-400">
                                              <div className="flex items-center w-96">
                                                <ChevronRight
                                                  strokeWidth={3}
                                                  className="w-8 h-8 cursor-pointer stroke-purple-700 hover:stroke-purple-500 transition-transform"
                                                />
                                                <span className="ml-2 line-clamp-3 w-full">
                                                  {subtarea.nombre}
                                                </span>
                                              </div>
                                            </td>

                                            {/*     <td className="px-4 py-2 border border-gray-400"><AutoWidthInput type="text" className='text-center cursor-pointer' onDoubleClick={() => handleSpanClick(subtarea, index, indexsub, tareaIndex, subtareaIndex)} value={subtarea.nombre} readOnly /></td>                                    */}

                                            <td className="px-4 py-2 border border-gray-400">
                                              <Select
                                                className="basic-single font-zen-kaku w-56"
                                                classNamePrefix="select"
                                                isSearchable={true}
                                                name="unidad"
                                                options={unidadOptions}
                                                isDisabled={true}
                                                value={
                                                  unidadOptions.find(
                                                    (option) =>
                                                      option.value ===
                                                      subtarea.id_material,
                                                  ) || null
                                                }
                                                onChange={(selectedOption) =>
                                                  handleSelectunidadsubtarea(
                                                    selectedOption,
                                                    subtarea.id_subtask,
                                                  )
                                                }
                                                menuPortalTarget={document.body} // Renderiza el menú en el body
                                                styles={{
                                                  menuPortal: (base) => ({
                                                    ...base,
                                                    zIndex: 9999,
                                                  }),
                                                }}
                                                menuPlacement="auto" // Esto ajusta automáticamente la ubicación del menú según el espacio disponible
                                                menuPosition="fixed"
                                                // Esto asegura que el menú no se mueva con el scroll // Asegúrate de que el menú esté por encima de otros elementos
                                              />
                                            </td>
                                            <td className="px-4 py-2 border border-gray-400">
                                              <input
                                                type="text"
                                                disabled
                                                className="text-center"
                                                value={subtarea.cantidad}
                                                onChange={(e) =>
                                                  handleSubTareaChange(
                                                    subtarea.id_subtask,
                                                    e.target.value,
                                                    "cantidad",
                                                  )
                                                }
                                              />
                                            </td>
                                            <td className="px-4 py-2 border border-gray-400">
                                              <div className="relative flex items-center">
                                                <span>{currency}</span>
                                                <input
                                                  type="text"
                                                  className="text-center"
                                                  disabled
                                                  value={convertCurrency(
                                                    subtarea.precio_unit,
                                                  )}
                                                  onChange={(e) =>
                                                    handleSubTareaChange(
                                                      subtarea.id_subtask,
                                                      e.target.value,
                                                      "precio_unit",
                                                    )
                                                  }
                                                />
                                              </div>
                                            </td>
                                            <td className="px-4 py-2 border border-gray-400">
                                              <input
                                                disabled
                                                type="text"
                                                className="text-center"
                                                value={subtarea.horas_hombre}
                                                onChange={(e) =>
                                                  handleSubTareaChange(
                                                    subtarea.id_subtask,
                                                    e.target.value,
                                                    "horas_hombre",
                                                  )
                                                }
                                              />
                                            </td>
                                            <td className="px-4 py-2 border border-gray-400">
                                              <input
                                                disabled
                                                type="text"
                                                className="text-center"
                                                value={subtarea.horas_maquina}
                                                onChange={(e) =>
                                                  handleSubTareaChange(
                                                    subtarea.id_subtask,
                                                    e.target.value,
                                                    "horas_maquina",
                                                  )
                                                }
                                              />
                                            </td>

                                            <td className="px-4 py-2 border border-gray-400">
                                              <input
                                                disabled
                                                type="text"
                                                className="text-center"
                                                value={subtarea.cantidad_norma}
                                                onChange={(e) =>
                                                  handleSubTareaChange(
                                                    subtarea.id_subtask,
                                                    e.target.value,
                                                    "cantidad_norma",
                                                  )
                                                }
                                              />
                                            </td>
                                            <td className="px-4 py-2 border border-gray-400">
                                              <input
                                                type="text"
                                                disabled
                                                className="text-center"
                                                value={subtarea.cantidad_acumu}
                                                onChange={(e) =>
                                                  handleSubTareaChange(
                                                    subtarea.id_subtask,
                                                    e.target.value,
                                                    "cantidad_acumu",
                                                  )
                                                }
                                              />
                                            </td>

                                            <td className="px-4 py-2 border border-gray-400">
                                              <input
                                                disabled
                                                type="text"
                                                className="text-center"
                                                value={subtarea.cantidad_parci}
                                                onChange={(e) =>
                                                  handleSubTareaChange(
                                                    subtarea.id_subtask,
                                                    e.target.value,
                                                    "cantidad_parci",
                                                  )
                                                }
                                              />
                                            </td>
                                            <td className="px-4 py-2 border border-gray-400">
                                              <div
                                                disabled
                                                className="text-center"
                                              >
                                                {subtarea.cantidad_parci}
                                              </div>
                                            </td>

                                            <td className="px-4 py-2 border border-gray-400">
                                              <div className="relative flex items-center">
                                                <input
                                                  type="text"
                                                  className="text-right pr-4 max-w-24"
                                                  disabled
                                                  value={subtarea.porcentaje}
                                                  onChange={(e) =>
                                                    handleSubTareaChange(
                                                      subtarea.id_subtask,
                                                      e.target.value,
                                                      "porcentaje",
                                                    )
                                                  }
                                                />
                                                <span>%</span>
                                              </div>
                                            </td>

                                            <td className="px-4 py-2 border border-gray-400">
                                              <div className="relative flex items-center">
                                                <span className="ml-16">
                                                  USD
                                                </span>
                                                <input
                                                  type="text"
                                                  className="text-left ml-2 max-w-48"
                                                  disabled
                                                  value={subtarea.precio_unit}
                                                  onChange={(e) =>
                                                    handleSubTareaChange(
                                                      subtarea.id_subtask,
                                                      e.target.value,
                                                      "precio_unit",
                                                    )
                                                  }
                                                />
                                              </div>
                                            </td>
                                            <td className="px-4 py-2 border border-gray-400">
                                              <div className="relative flex items-center">
                                                <span className="ml-16">
                                                  {currency}
                                                </span>
                                                <input
                                                  type="text"
                                                  className="text-left ml-2 max-w-48"
                                                  disabled
                                                  value={convertCurrency(
                                                    subtarea.precio_total,
                                                  )}
                                                  onChange={(e) =>
                                                    handleSubTareaChange(
                                                      subtarea.id_subtask,
                                                      e.target.value,
                                                      "precio_total",
                                                    )
                                                  }
                                                />
                                              </div>
                                            </td>
                                          </tr>
                                        </React.Fragment>
                                      ),
                                    )}
                                </React.Fragment>
                              ),
                            )}
                        </React.Fragment>
                      ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
);

export default HistoricoTreesuma;
