import React, {
  useEffect,
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  ChevronRight,
  FileUp,
  Expand,
  SaveAll,
  Edit,
  Info,
} from "lucide-react";
const { useRouter } = require("next/navigation");
import {
  updatePartida,
  updatesubPartida,
  updateTarea,
  updateSubtarea,
  unidadlist,
  getPartidasByProjectStd,
} from "@/app/services/project";
import { getPrimaryRole } from "@/app/utils/roleUtils";
import {
  postpartida,
  postDatosPartidas,
  getTareasupdate,
} from "@/app/services/partidas";
import Select from "react-select";
import toast from "react-hot-toast";
import AutoWidthInput from "./automaticinput";
// import Tooltip from '../../components/tooltip';
import { useSelector } from "react-redux";
import "../style/sololectura.css";
import "../style/estados_gantt.css";
import ExcelJS from "exceljs";
import { Tooltip } from "react-tooltip";

import { BiCollapse } from "react-icons/bi";

const Treesuma = forwardRef(
  ({ partidas: initialPartidas, projectId, updatetabla, Hidebyrol }, ref) => {
    // console.log( initialPartidas);

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
    // ATENCIÓN: Todos los valores base están en CLP. La conversión a USD es DIVIDIENDO por el tipo de cambio.
    const [currency, setCurrency] = useState("CLP"); // 'USD' o 'CLP'
    const exchangeRate = 950; // 1 USD = 950 CLP (puedes hacerlo dinámico después)
    const convertCurrency = (value) => {
      if (typeof value !== "number") value = Number(value);
      if (isNaN(value)) return "";
      if (currency === "USD") return Math.round(value / exchangeRate); // CLP a USD
      return Math.round(value); // CLP se muestra tal cual
    };

    const expandedRowsRef = useRef({});
    const expandedSubpartidaRowsRef = useRef({});
    const expandedTareasRowsRef = useRef({});
    Treesuma.displayName = "Treesuma";

    // Exponer las funciones para que puedan ser llamadas desde el componente padre
    useImperativeHandle(ref, () => ({
      handleInsertAllItemsClick,
      handleExpandAllClick,
      exportToExcel,
    }));

    const userStore = useSelector((state) => state.user);
    const role = getPrimaryRole(userStore.user);
    const isBlockedRole = ["prevencionista", "superintendente", "ITO"].includes(
      role,
    );

    // Estados para modal de depuración
    const [showDebugModal, setShowDebugModal] = useState(false);
    const [debugLogs, setDebugLogs] = useState([]);
    const [isDebugEnabled, setIsDebugEnabled] = useState(false);
    
    // Estados para modal de confirmación personalizado
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmModalData, setConfirmModalData] = useState({
      title: '',
      message: '',
      onConfirm: () => {},
      onCancel: () => {}
    });
    

    
    // **NUEVA FUNCIONALIDAD**: Funciones para manejar estados visuales
    const getEstadoInfo = (id_EstadoTarea) => {
      const estados = {
        1: { nombre: 'SIN EJECUTAR', texto: 'SIN EJECUTAR', clase: 'estado-sin-ejecutar' },
        2: { nombre: 'EN EJECUCIÓN', texto: 'EN EJECUCIÓN', clase: 'estado-ejecucion' },
        3: { nombre: 'SUSPENDIDA', texto: 'SUSPENDIDA', clase: 'estado-suspendida' },
        4: { nombre: 'COMPLETADA', texto: 'COMPLETADA', clase: 'estado-completada' }
      };
      return estados[id_EstadoTarea] || estados[1];
    };

    // Función para verificar si está suspendida
    const estaSuspendida = (item) => {
      return item.id_EstadoTarea === 3;
    };

    // Función para verificar si puede expandirse (no suspendida)
    const puedeExpandirse = (item) => {
      // Verificar si el elemento tiene hijos reales
      const tieneHijos = () => {
        if (item.subpartida_partida && item.subpartida_partida.length > 0) {
          return true; // Partida con subpartidas
        }
        if (item.subpartida_tarea && item.subpartida_tarea.length > 0) {
          return true; // Subpartida con tareas
        }
        if (item.Task_Subtask && item.Task_Subtask.length > 0) {
          return true; // Tarea con subtareas
        }
        return false;
      };

      return tieneHijos() && !estaSuspendida(item);
    };

    // Función para obtener clases CSS según estado - SOLO para indicadores
    const getClasesEstado = (item) => {
      // Ya no aplicamos fondos a filas, solo devolvemos clase del indicador
      return '';
    };

    // Función para agregar logs de depuración
    const addDebugLog = (message, data = null, type = 'info') => {
      if (!isDebugEnabled) return;
      
      const timestamp = new Date().toLocaleTimeString();
      const newLog = {
        id: Date.now(),
        timestamp,
        message,
        data,
        type
      };
      
      setDebugLogs(prev => [...prev.slice(-20), newLog]); // Mantener últimos 20 logs
    };
    
    // Función para limpiar logs
    const clearDebugLogs = () => {
      setDebugLogs([]);
    };
    
    // Función para toggle del modal de depuración
    const toggleDebugModal = () => {
      setShowDebugModal(!showDebugModal);
    };
    
    // Función auxiliar para toast de advertencia
    const showWarningToast = (message) => {
      toast(message, { 
        icon: "⚠️",
        duration: 4000,
        style: {
          background: '#f59e0b',
          color: 'white',
        }
      });
    };
    
    // Función para mostrar modal de confirmación personalizado
    const showCustomConfirm = (title, message) => {
      return new Promise((resolve) => {
        setConfirmModalData({
          title,
          message,
          onConfirm: () => {
            setShowConfirmModal(false);
            resolve(true);
          },
          onCancel: () => {
            setShowConfirmModal(false);
            resolve(false);
          }
        });
        setShowConfirmModal(true);
      });
    };

    const actualizarPartidasArr = (initialPartidas, setPartidasArr) => {
      setPartidasArr(initialPartidas);
      // console.log("Partidas iniciales", initialPartidas);

      const idsPartida = initialPartidas.map((partida) => partida.id_partida);
    };
    useEffect(() => {
      setidbyproyect(projectId);
    }, [projectId]);

    useEffect(() => {
      actualizarPartidasArr(initialPartidas, setPartidasArr);
      
      // **DEBUG**: Verificar estados al cargar datos
      if (initialPartidas && initialPartidas.length > 0) {
        let elementosSuspendidos = 0;
        let elementosEnEjecucion = 0;
        
        initialPartidas.forEach(partida => {
          if (estaSuspendida(partida)) elementosSuspendidos++;
          if (partida.id_EstadoTarea === 2) elementosEnEjecucion++;
          
          partida.subpartida_partida?.forEach(subpartida => {
            if (estaSuspendida(subpartida)) elementosSuspendidos++;
            if (subpartida.id_EstadoTarea === 2) elementosEnEjecucion++;
          });
        });
        
        if (elementosSuspendidos > 0 || elementosEnEjecucion > 0) {
          console.log(`🎯 Estados detectados: ${elementosSuspendidos} suspendidos, ${elementosEnEjecucion} en ejecución`);
        }
      }
    }, [initialPartidas]);

    partidasArr.forEach((partida) => {
      // console.log(`Partida ID: ${partida.id_partida}`);
      partida.subpartida_partida.forEach((subpartida) => {
        // console.log(`Subpartida ID: ${subpartida.id_subpartida}`);
        subpartida.subpartida_tarea.forEach((tarea) => {
          // console.log(`Tarea ID: ${tarea.id}`, typeof tarea.id); // Verifica el tipo de dato aquí
        });
      });
    });

    const handlePartidaClick = (item) => {
      // Verificar si tiene subpartidas
      const tieneSubpartidas = item.subpartida_partida && item.subpartida_partida.length > 0;
      
      if (!tieneSubpartidas) {
        // No tiene hijos, no hacer nada (sin mensaje)
        return;
      }
      
      // **BLOQUEO**: Solo mostrar mensaje si TIENE subpartidas pero está suspendida
      if (estaSuspendida(item)) {
        showWarningToast(`No se puede expandir: ${getEstadoInfo(item.id_EstadoTarea).nombre}`);
        return;
      }
      
      addDebugLog("Clic en Partida", { id: item.id_partida, nombre: item.nombre_partida }, 'info');
      const isRowExpanded = !!expandedRowsRef.current[item.id_partida];

      // Cambiar estado de expansión
      expandedRowsRef.current[item.id_partida] = !isRowExpanded;
      setExpandedRows({ ...expandedRowsRef.current }); // Actualizar el estado para que React lo reconozca
    };

    const handleSubpartidaClick = (item) => {
      // Verificar si tiene tareas
      const tieneTareas = item.subpartida_tarea && item.subpartida_tarea.length > 0;
      
      if (!tieneTareas) {
        // No tiene hijos, no hacer nada (sin mensaje)
        return;
      }
      
      // **BLOQUEO**: Solo mostrar mensaje si TIENE tareas pero está suspendida
      if (estaSuspendida(item)) {
        showWarningToast(`No se puede expandir: ${getEstadoInfo(item.id_EstadoTarea).nombre}`);
        return;
      }
      
      addDebugLog("Clic en Subpartida", { id: item.id_subpartida, nombre: item.nombre_subpartida }, 'info');
      const isRowExpanded =
        !!expandedSubpartidaRowsRef.current[item.id_subpartida];

      expandedSubpartidaRowsRef.current[item.id_subpartida] = !isRowExpanded;
      setExpandedSubpartidaRows({ ...expandedSubpartidaRowsRef.current });
    };

    const handleTareaClick = (item) => {
      // Verificar si tiene subtareas
      const tieneSubtareas = item.Task_Subtask && item.Task_Subtask.length > 0;
      
      if (!tieneSubtareas) {
        // No tiene hijos, no hacer nada (sin mensaje)
        return;
      }
      
      // **BLOQUEO**: Solo mostrar mensaje si TIENE subtareas pero está suspendida
      if (estaSuspendida(item)) {
        showWarningToast(`No se puede expandir: ${getEstadoInfo(item.id_EstadoTarea).nombre}`);
        return;
      }
      
      addDebugLog("Clic en Tarea", { id: item.id, nombre: item.Task_Name }, 'info');
      const isRowExpanded = !!expandedTareasRowsRef.current[item.id];

      expandedTareasRowsRef.current[item.id] = !isRowExpanded;
      setExpandedTareasRows({ ...expandedTareasRowsRef.current });
    };

    // Función para manejar el clic en el ícono y alternar la rotación
    const handleIconClick = (itemId, item = null) => {
      // **QUITADO**: El bloqueo se maneja en las funciones específicas (handlePartidaClick, etc.)
      // para evitar toast duplicados
      
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
      item,
      level,
      index = 0,
      indexsub = 0,
      tareaIndex = 0,
      subtareaIndex = 0,
    ) => {
      console.log(`${level}:`, item);
      console.log("Item data:", JSON.stringify(item, null, 2)); // Ver el objeto completo de item

      console.log("index:", index);
      console.log("indexsub:", indexsub);
      console.log("tareaIndex:", tareaIndex);
      console.log("subtareaIndex:", subtareaIndex);

      let idField = ""; // Determinar campo ID según el nivel
      if (level === "partida") idField = "id_partida";
      else if (level === "subpartida") idField = "id_subpartida";
      else if (level === "tarea")
        idField = "id"; // Para tareas
      else if (level === "subtarea") idField = "id_subtask";

      const selectedOptionLabel = unidadOptions.find(
        (option) =>
          option.value === item.id_material || option.value === item.id_unidad,
      )?.label;

      console.log("Selected Option Label:", selectedOptionLabel);

      const queryParams = new URLSearchParams();
      queryParams.append("id", item[idField]); // Enviar el ID correcto según el nivel
      console.log("id:", item[idField]);

      queryParams.append("level", level);
      queryParams.append("index", index + 1);
      queryParams.append("indexsub", indexsub + 1);
      queryParams.append("tareaIndex", tareaIndex + 1);
      queryParams.append("subtareaIndex", subtareaIndex + 1);
      queryParams.append(
        "nombre",
        item.nombre || item.nombre_partida || item.nombre_sub_partida || "N/A",
      );
      queryParams.append("cantidad", item.cantidad || "N/A"); // Valor predeterminado si es null
      queryParams.append("unidad", selectedOptionLabel || "N/A");
      queryParams.append("idbyproyect", projectId);

      const queryString = queryParams.toString();
      const encodedParams = btoa(queryString);
      const url = `/dashboard/detalle_suma?data=${encodedParams}`;
      router.push(url);
          };

    // **FUNCIÓN AUXILIAR**: Formatea el display del porcentaje con indicador visual
    const formatearPorcentajeDisplay = (item, tipoNivel) => {
      const porcentajeAutomatico = item.porcentaje_automatico;
      const porcentajeManual = item.porcentaje || 0;
      
      if (porcentajeAutomatico && parseFloat(porcentajeAutomatico) > 0) {
        return {
          valor: porcentajeAutomatico,
          esAutomatico: true,
          tooltip: `📊 Porcentaje automático calculado desde ${tipoNivel}s hijos`
        };
      }
      
      return {
        valor: porcentajeManual,
        esAutomatico: false,
        tooltip: `✏️ Porcentaje manual basado en cantidad ejecutada`
      };
    };

    // **NUEVA FUNCIÓN**: Propaga porcentajes automáticamente desde niveles inferiores
    const propagarPorcentajes = (partidasArray) => {
      return partidasArray.map((partida) => {
        // Clonar la partida para no mutar el original
        const updatedPartida = { ...partida };
        
        if (updatedPartida.subpartida_partida && updatedPartida.subpartida_partida.length > 0) {
          // Actualizar subpartidas y tareas primero
          updatedPartida.subpartida_partida = updatedPartida.subpartida_partida.map((subpartida) => {
            const updatedSubpartida = { ...subpartida };
            
            if (updatedSubpartida.subpartida_tarea && updatedSubpartida.subpartida_tarea.length > 0) {
              // Actualizar tareas primero
              updatedSubpartida.subpartida_tarea = updatedSubpartida.subpartida_tarea.map((tarea) => {
                const updatedTarea = { ...tarea };
                
                if (updatedTarea.Task_Subtask && updatedTarea.Task_Subtask.length > 0) {
                  // **Tarea con subtareas**: Calcular porcentaje basado en promedio de subtareas
                  const totalSubtareas = updatedTarea.Task_Subtask.length;
                  const sumaSubtareas = updatedTarea.Task_Subtask.reduce((suma, subtarea) => {
                    return suma + parseFloat(subtarea.porcentaje || 0);
                  }, 0);
                  updatedTarea.porcentaje_automatico = (sumaSubtareas / totalSubtareas).toFixed(1);
                  // ACTUALIZAR EL PORCENTAJE REAL para que se refleje en sidebar
                  updatedTarea.porcentaje = updatedTarea.porcentaje_automatico;
                  
                  addDebugLog(`🔄 Tarea "${updatedTarea.nombre}": ${totalSubtareas} subtareas → ${updatedTarea.porcentaje_automatico}% automático`, {
                    tarea: updatedTarea.nombre,
                    totalSubtareas,
                    porcentajeAutomatico: updatedTarea.porcentaje_automatico
                  }, 'success');
                }
                
                return updatedTarea;
              });
              
              // **Subpartida con tareas**: Calcular porcentaje basado en promedio de tareas
              const totalTareas = updatedSubpartida.subpartida_tarea.length;
              const sumaTareas = updatedSubpartida.subpartida_tarea.reduce((suma, tarea) => {
                // Usar porcentaje automático si existe, sino el manual
                const porcentajeATomar = tarea.porcentaje_automatico || tarea.porcentaje || 0;
                return suma + parseFloat(porcentajeATomar);
              }, 0);
              updatedSubpartida.porcentaje_automatico = (sumaTareas / totalTareas).toFixed(1);
              // ACTUALIZAR EL PORCENTAJE REAL para que se refleje en sidebar
              updatedSubpartida.porcentaje = updatedSubpartida.porcentaje_automatico;
              
              addDebugLog(`🔄 Subpartida "${updatedSubpartida.nombre_sub_partida}": ${totalTareas} tareas → ${updatedSubpartida.porcentaje_automatico}% automático`, {
                subpartida: updatedSubpartida.nombre_sub_partida,
                totalTareas,
                porcentajeAutomatico: updatedSubpartida.porcentaje_automatico
              }, 'success');
            }
            
            return updatedSubpartida;
          });
          
          // **Partida con subpartidas**: Calcular porcentaje basado en promedio de subpartidas
          const totalSubpartidas = updatedPartida.subpartida_partida.length;
          const sumaSubpartidas = updatedPartida.subpartida_partida.reduce((suma, subpartida) => {
            // Usar porcentaje automático si existe, sino el manual
            const porcentajeATomar = subpartida.porcentaje_automatico || subpartida.porcentaje || 0;
            return suma + parseFloat(porcentajeATomar);
          }, 0);
          updatedPartida.porcentaje_automatico = (sumaSubpartidas / totalSubpartidas).toFixed(1);
          // ACTUALIZAR EL PORCENTAJE REAL para que se refleje en sidebar
          updatedPartida.porcentaje = updatedPartida.porcentaje_automatico;
          
          addDebugLog(`🔄 Partida "${updatedPartida.nombre_partida}": ${totalSubpartidas} subpartidas → ${updatedPartida.porcentaje_automatico}% automático`, {
            partida: updatedPartida.nombre_partida,
            totalSubpartidas,
            porcentajeAutomatico: updatedPartida.porcentaje_automatico
          }, 'success');
        }
        
        return updatedPartida;
      });
    };

    // **NUEVA FUNCIÓN**: Persistir porcentajes automáticos en la base de datos
    const persistirPorcentajesAutomaticos = async (partidasArray) => {
      try {
        addDebugLog("Iniciando persistencia de porcentajes automáticos", { 
          totalPartidas: partidasArray.length 
        }, 'info');

        const updatePromises = [];

        for (const partida of partidasArray) {
          // Actualizar partida si tiene porcentaje automático
          if (partida.porcentaje_automatico) {
            const partidaUpdate = {
              porcentaje: partida.porcentaje,
              updatedAt: new Date()
            };

            addDebugLog(`Preparando actualización partida ${partida.nombre_partida}`, { 
              porcentaje: partida.porcentaje,
              id: partida.id_partida 
            }, 'success');

            updatePromises.push(updatePartida(partida.id_partida, partidaUpdate));
          }

          // Actualizar subpartidas si tienen porcentaje automático
          if (partida.subpartida_partida) {
            for (const subpartida of partida.subpartida_partida) {
              if (subpartida.porcentaje_automatico) {
                const subpartidaUpdate = {
                  porcentaje: subpartida.porcentaje,
                  updatedAt: new Date()
                };

                addDebugLog(`Preparando actualización subpartida ${subpartida.nombre_sub_partida}`, { 
                  porcentaje: subpartida.porcentaje,
                  id: subpartida.id_subpartida 
                }, 'success');

                updatePromises.push(updatesubPartida(subpartida.id_subpartida, subpartidaUpdate));
              }

              // Actualizar tareas si tienen porcentaje automático
              if (subpartida.subpartida_tarea) {
                for (const tarea of subpartida.subpartida_tarea) {
                  if (tarea.porcentaje_automatico) {
                    const tareaUpdate = {
                      porcentaje: tarea.porcentaje,
                      updatedAt: new Date()
                    };

                    addDebugLog(`Preparando actualización tarea ${tarea.nombre}`, { 
                      porcentaje: tarea.porcentaje,
                      id: tarea.id 
                    }, 'success');

                    updatePromises.push(updateTarea(tarea.id, tareaUpdate));
                  }
                }
              }
            }
          }
        }

        // Ejecutar todas las actualizaciones en paralelo
        if (updatePromises.length > 0) {
          await Promise.all(updatePromises);
          addDebugLog("Persistencia de porcentajes automáticos completada", { 
            totalActualizaciones: updatePromises.length 
          }, 'success');
          // showToastSafely(`${updatePromises.length} porcentajes automáticos guardados correctamente`);
        }

      } catch (error) {
        addDebugLog("Error al persistir porcentajes automáticos", { 
          error: error.message 
        }, 'error');
        console.error("Error persisting automatic percentages:", error);
        showToastSafely("Error al guardar porcentajes automáticos", "error");
      }
    };
    
    const handleCellChange = async (id, value, cell) => {
      if (isBlockedRole) return;
      
      // **BLOQUEO**: Verificar si la partida está suspendida
      const partida = partidasArr.find(p => p.id_partida === id);
      if (partida && estaSuspendida(partida)) {
        showWarningToast(`No se puede editar: ${getEstadoInfo(partida.id_EstadoTarea).nombre}`);
        return;
      }
      addDebugLog("Editando Partida", { 
        id, 
        nuevoValor: value, 
        celda: cell,
        cantidadPartidas: partidasArr.length 
      }, 'success');

      // Validación de presupuesto monetario para cantidad_parcial
      if (cell === "cantidad_parcial") {
        const partida = partidasArr.find(p => p.id_partida === id);
        if (partida) {
          const cantidadNormal = parseFloat(partida.cantidad_normal || 0);
          const nuevaCantidadParcial = parseFloat(value || 0);
          const cantidadTotal = parseFloat(partida.cantidad || 0);
          const totalPrecio = parseFloat(partida.precio_total || 0);
          
          // Calcular precio unitario real = precio_total ÷ cantidad
          const precioUnitarioReal = cantidadTotal > 0 ? (totalPrecio / cantidadTotal) : 0;
          
          // Calcular nueva cantidad_acumulada = cantidad_normal + nueva_cantidad_parcial
          const nuevaCantidadAcumulada = cantidadNormal + nuevaCantidadParcial;
          const nuevoValorGastado = nuevaCantidadAcumulada * precioUnitarioReal;
          
          if (nuevoValorGastado > totalPrecio && totalPrecio > 0) {
            const exceso = nuevoValorGastado - totalPrecio;
            
            const confirmar = await showCustomConfirm(
              "PARTIDA",
              `Valor Gastado: $${nuevoValorGastado.toLocaleString("es-CL")}\n` +
              `Presupuesto Total: $${totalPrecio.toLocaleString("es-CL")}\n` +
              `Exceso: $${exceso.toLocaleString("es-CL")}\n\n` +
              `¿Desea continuar y exceder el presupuesto?`
            );
            
            if (!confirmar) {
              showWarningToast("Operación cancelada. El presupuesto no se ha excedido.");
              return; // Cancelar la operación
            } else {
              toast.success("Excepción aprobada. Presupuesto excedido con autorización.", { duration: 4000 });
            }
          }
        }
      }

      // Multiplicar cantidad por suma de materiales directos para PARTIDAS
      const calcularPrecioTotal = (cantidad, precioUnitario, partida = null) => {
        // Si tiene materiales directos, calcular desde la suma de materiales
        if (partida && partida.partida_material && partida.partida_material.length > 0) {
          const sumaMateriales = partida.partida_material.reduce((suma, material) => {
            return suma + (parseFloat(material.valor_total) || 0);
          }, 0);
          addDebugLog('Cálculo con materiales - Partida', { 
            cantidad, 
            sumaMateriales, 
            resultado: cantidad * sumaMateriales 
          }, 'info');
          return cantidad * sumaMateriales;
        }
        
        // Si no tiene materiales directos, usar la fórmula tradicional
        return cantidad * precioUnitario;
      };

      // Crear un nuevo array de partidas con la cantidad actualizada localmente
      const nuevasPartidas = partidasArr.map((partida) => {
        if (partida.id_partida === id) {
          const updatedPartida = { ...partida, [cell]: value };
       
          if (cell === "precio_unit") {
            // SOLO recalcular precio_total cuando cambie precio_unit, NO cuando cambie cantidad
            updatedPartida.precio_total = calcularPrecioTotal(
              updatedPartida.cantidad,
              value, // nuevo precio_unit
              updatedPartida
            );
          }
          if (cell === "cantidad_normal" || cell === "cantidad_parcial") {
            updatedPartida.cantidad_acumulada =
              parseFloat(updatedPartida.cantidad_normal || 0) +
              parseFloat(updatedPartida.cantidad_parcial || 0);
          }
          
          if (
            [
              "cantidad_acumulada",
              "cantidad",
              "cantidad_normal",
              "cantidad_parcial",
            ].includes(cell)
          ) {
            updatedPartida.porcentaje =
              (parseFloat(updatedPartida.cantidad_acumulada || 0) /
                parseFloat(updatedPartida.cantidad || 0)) *
              100;
            updatedPartida.porcentaje = updatedPartida.porcentaje.toFixed(1);
            

          }
          
          return updatedPartida;
        }
        return partida;
      });

              // **PROPAGACIÓN AUTOMÁTICA**: Actualizar porcentajes automáticos
        const partidasConPropagacion = propagarPorcentajes(nuevasPartidas);
        setPartidasArr(partidasConPropagacion);
        
        // **PERSISTIR PORCENTAJES AUTOMÁTICOS**: Guardar en base de datos
        await persistirPorcentajesAutomaticos(partidasConPropagacion);
      };

    // Manejador de eventos para la tecla Enter en partidas
    const handlePartidaKeyDown = (e, id, value, cell) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        
        // Logs de diagnóstico
        const partida = partidasArr.find(p => p.id_partida === id);
        addDebugLog('Enter presionado en partida', { 
          id, 
          tieneSubpartidas: partida?.subpartida_partida?.length > 0,
          cantidadSubpartidas: partida?.subpartida_partida?.length || 0
        }, 'info');
        
        // Permitir actualización siempre que el rol no esté bloqueado
        if (!isBlockedRole) {
          handleInputBlur(id, value, cell);
          e.target.blur(); // Quitar el foco del campo
        } else {
          addDebugLog('Actualización bloqueada', { id, motivo: 'Rol bloqueado', rol: role }, 'error');
          e.target.blur(); // Quitar el foco del campo de todas formas
        }
      }
    };

    // Manejador de eventos para la tecla Enter en subpartidas
    const handleSubpartidaKeyDown = (e, id, value, cell) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!isBlockedRole) {
          handleSubpartidaBlur(id, value, cell);
          e.target.blur(); // Quitar el foco del campo
        }
      }
    };

    // Manejador de eventos para la tecla Enter en tareas
    const handleTareaKeyDown = (e, id, value, cell) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!isBlockedRole) {
          handleTareaBlur(id, value, cell);
          e.target.blur(); // Quitar el foco del campo
        }
      }
    };

    // Manejador de eventos para la tecla Enter en subtareas
    const handleSubTareaKeyDown = (e, id, value, cell) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!isBlockedRole) {
          handleSubTareaBlur(id, value, cell);
          e.target.blur(); // Quitar el foco del campo
        }
      }
    };

    const handleInputBlur = async (id, value, cell) => {
      try {
        const partidaToUpdate = partidasArr.find(
          (partida) => partida.id_partida === id,
        );

        if (!partidaToUpdate) {
          throw new Error("Partida no encontrada para actualizar");
        }

        // Log para diagnóstico
        addDebugLog("Datos enviados al backend", partidaToUpdate, 'info');

        const partidaSUpdate = {
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
          id_unidad: partidaToUpdate.id_unidad || null,
        };

        addDebugLog("Datos enviados al backend", partidaSUpdate, 'info');
        const response = await updatePartida(id, partidaSUpdate);
        showToastSafely("Campo actualizado correctamente");
        addDebugLog("Respuesta del backend", response, 'success');
      } catch (error) {
        addDebugLog('Error al actualizar partida', { id, error: error.message }, 'error');
        console.error("Error updating partida:", error);
      }
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
        icon: "!",
        style: {
          background: "#f4f4f5",
          color: "#333",
        },
      });
    };

    const handleSubpartidaChange = async (id, value, cell) => {
      if (isBlockedRole) return;
      
      // **BLOQUEO**: Verificar si la subpartida está suspendida
      const subpartida = partidasArr.flatMap(p => p.subpartida_partida).find(s => s.id_subpartida === id);
      if (subpartida && estaSuspendida(subpartida)) {
        showWarningToast(`No se puede editar: ${getEstadoInfo(subpartida.id_EstadoTarea).nombre}`);
        return;
      }
      
      addDebugLog("Editando Subpartida", { 
        id, 
        nuevoValor: value, 
        celda: cell 
      }, 'success');

      // Validación de presupuesto monetario para cantidad_parcial en subpartidas
      if (cell === "cantidad_parcial") {
        const subpartida = partidasArr
          .flatMap(p => p.subpartida_partida || [])
          .find(s => s.id_subpartida === id);
        
        if (subpartida) {
          const cantidadNormal = parseFloat(subpartida.cantidad_normal || 0);
          const nuevaCantidadParcial = parseFloat(value || 0);
          const cantidadTotal = parseFloat(subpartida.cantidad || 0);
          const totalPrecio = parseFloat(subpartida.precio_total || 0);
          
          // Calcular precio unitario real = precio_total ÷ cantidad
          const precioUnitarioReal = cantidadTotal > 0 ? (totalPrecio / cantidadTotal) : 0;
          
          // Calcular nueva cantidad_acumulada = cantidad_normal + nueva_cantidad_parcial
          const nuevaCantidadAcumulada = cantidadNormal + nuevaCantidadParcial;
          const nuevoValorGastado = nuevaCantidadAcumulada * precioUnitarioReal;
          
          if (nuevoValorGastado > totalPrecio && totalPrecio > 0) {
            const exceso = nuevoValorGastado - totalPrecio;
            
            const confirmar = await showCustomConfirm(
              "SUBPARTIDA",
              `Valor Gastado: $${nuevoValorGastado.toLocaleString("es-CL")}\n` +
              `Presupuesto Total: $${totalPrecio.toLocaleString("es-CL")}\n` +
              `Exceso: $${exceso.toLocaleString("es-CL")}\n\n` +
              `¿Desea continuar y exceder el presupuesto?`
            );
            
            if (!confirmar) {
              showWarningToast("Operación cancelada. El presupuesto no se ha excedido.");
              return; // Cancelar la operación
            } else {
              toast.success("Excepción aprobada. Presupuesto excedido con autorización.", { duration: 4000 });
            }
          }
        }
      }

      // Multiplicar cantidad por suma de materiales directos
      const calcularPrecioTotal = (cantidad, precioUnitario, subpartida = null) => {
        // Si tiene materiales directos, calcular desde la suma de materiales
        if (subpartida && subpartida.subpartida_material && subpartida.subpartida_material.length > 0) {
          const sumaMateriales = subpartida.subpartida_material.reduce((suma, material) => {
            return suma + (parseFloat(material.valor_total) || 0);
          }, 0);
          addDebugLog('Cálculo con materiales - Subpartida', { 
            cantidad, 
            sumaMateriales, 
            resultado: cantidad * sumaMateriales 
          }, 'info');
          return cantidad * sumaMateriales;
        }
        
        // Si no tiene materiales directos, usar la fórmula tradicional
        return cantidad * precioUnitario;
      };

      // Crear un nuevo array de partidas con la cantidad actualizada localmente
      const nuevasPartidasArr = partidasArr.map((partida) => {
        if (partida.subpartida_partida) {
          const nuevasSubpartidas = partida.subpartida_partida.map(
            (subpartida) => {
              if (subpartida.id_subpartida === id) {
                const updatedSubpartida = { ...subpartida, [cell]: value };
                
                if (cell === "precio_unit") {
                  // SOLO recalcular precio_total cuando cambie precio_unit, NO cuando cambie cantidad
                  updatedSubpartida.precio_total = calcularPrecioTotal(
                    updatedSubpartida.cantidad,
                    value, // nuevo precio_unit
                    updatedSubpartida
                  );
                }
                
                if (cell === "cantidad_normal" || cell === "cantidad_parcial") {
                  updatedSubpartida.cantidad_acumulada =
                    parseFloat(updatedSubpartida.cantidad_normal || 0) +
                    parseFloat(updatedSubpartida.cantidad_parcial || 0);
                }
                
                if (
                  [
                    "cantidad_acumulada",
                    "cantidad",
                    "cantidad_normal",
                    "cantidad_parcial",
                  ].includes(cell)
                ) {
                  updatedSubpartida.porcentaje =
                    (parseFloat(updatedSubpartida.cantidad_acumulada || 0) /
                      parseFloat(updatedSubpartida.cantidad || 0)) *
                    100;
                  updatedSubpartida.porcentaje =
                    updatedSubpartida.porcentaje.toFixed(1);
                }
                return updatedSubpartida;
              }
              return subpartida;
            },
          );

          return { ...partida, subpartida_partida: nuevasSubpartidas };
        }
        return partida;
      });

              // **PROPAGACIÓN AUTOMÁTICA**: Actualizar porcentajes automáticos
        const partidasConPropagacion = propagarPorcentajes(nuevasPartidasArr);
        setPartidasArr(partidasConPropagacion);
        
        // **PERSISTIR PORCENTAJES AUTOMÁTICOS**: Guardar en base de datos
        await persistirPorcentajesAutomaticos(partidasConPropagacion);
      };

      const handleSubpartidaBlur = async (id, value, cell) => {
      try {
        const nuevasPartidasArr = partidasArr.map((partida) => {
          if (partida.subpartida_partida) {
            const nuevasSubpartidas = partida.subpartida_partida.map(
              (subpartida) => {
                if (subpartida.id_subpartida === id) {
                  const updatedSubpartida = { ...subpartida, [cell]: value };
                  return updatedSubpartida;
                }
                return subpartida;
              },
            );

            return { ...partida, subpartida_partida: nuevasSubpartidas };
          }
          return partida;
        });

        const subpartidaToUpdate = nuevasPartidasArr
          .flatMap((partida) => partida.subpartida_partida)
          .find((subpartida) => subpartida.id_subpartida === id);

        if (!subpartidaToUpdate) {
          throw new Error("Subpartida no encontrada para actualizar");
        }

        const subpartidaSUpdate = {
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


        const response = await updatesubPartida(id, subpartidaSUpdate);
        showToastSafely("Campo actualizado correctamente");
      } catch (error) {
        console.error("Error updating subpartida:", error);
      }
    };

    const handleTareaChange = async (id, value, cell) => {
      if (isBlockedRole) return;

      // **BLOQUEO**: Verificar si la tarea está suspendida
      const tarea = partidasArr
        .flatMap(p => p.subpartida_partida || [])
        .flatMap(s => s.subpartida_tarea || [])
        .find(t => t.id === id);
      if (tarea && estaSuspendida(tarea)) {
        showWarningToast(`No se puede editar: ${getEstadoInfo(tarea.id_EstadoTarea).nombre}`);
        return;
      }

      // Validación de presupuesto monetario para cantidad_parcial en tareas
      if (cell === "cantidad_parcial") {
        const tarea = partidasArr
          .flatMap(p => p.subpartida_partida || [])
          .flatMap(s => s.subpartida_tarea || [])
          .find(t => t.id === id);
        
        if (tarea) {
          const cantidadNormal = parseFloat(tarea.cantidad_normal || 0);
          const nuevaCantidadParcial = parseFloat(value || 0);
          const cantidadTotal = parseFloat(tarea.cantidad || 0);
          const totalPrecio = parseFloat(tarea.precio_total || 0);
          
          // Calcular precio unitario real = precio_total ÷ cantidad
          const precioUnitarioReal = cantidadTotal > 0 ? (totalPrecio / cantidadTotal) : 0;
          
          // Calcular nueva cantidad_acumulada = cantidad_normal + nueva_cantidad_parcial
          const nuevaCantidadAcumulada = cantidadNormal + nuevaCantidadParcial;
          const nuevoValorGastado = nuevaCantidadAcumulada * precioUnitarioReal;
          
          if (nuevoValorGastado > totalPrecio && totalPrecio > 0) {
            const exceso = nuevoValorGastado - totalPrecio;
            
            const confirmar = await showCustomConfirm(
              "TAREA",
              `Valor Gastado: $${nuevoValorGastado.toLocaleString("es-CL")}\n` +
              `Presupuesto Total: $${totalPrecio.toLocaleString("es-CL")}\n` +
              `Exceso: $${exceso.toLocaleString("es-CL")}\n\n` +
              `¿Desea continuar y exceder el presupuesto?`
            );
            
            if (!confirmar) {
              showWarningToast("Operación cancelada. El presupuesto no se ha excedido.");
              return; // Cancelar la operación
            } else {
              toast.success("Excepción aprobada. Presupuesto excedido con autorización.", { duration: 4000 });
            }
          }
        }
      }

      // NUEVA LÓGICA: Multiplicar cantidad por suma de materiales directos para TAREAS
      const calcularPrecioTotal = (cantidad, precioUnitario, tarea = null) => {
        // Si tiene materiales directos, calcular desde la suma de materiales
        if (tarea && tarea.task_material && tarea.task_material.length > 0) {
          const sumaMateriales = tarea.task_material.reduce((suma, material) => {
            return suma + (parseFloat(material.valor_total) || 0);
          }, 0);
          console.log(`Tarea con materiales: Cantidad(${cantidad}) × Suma materiales(${sumaMateriales}) = ${cantidad * sumaMateriales}`);
          return cantidad * sumaMateriales;
        }
        
        // Si no tiene materiales directos, usar la fórmula tradicional
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
                    if (tarea.id === id) {
                      const updatedTarea = { ...tarea, [cell]: value };
                      
                
                      
                      if (cell === "precio_unit") {
                        // SOLO recalcular precio_total cuando cambie precio_unit, NO cuando cambie cantidad
                        updatedTarea.precio_total = calcularPrecioTotal(
                          updatedTarea.cantidad,
                          value, // nuevo precio_unit
                          updatedTarea
                        );
                      }
                      
                      if (
                        cell === "cantidad_normal" ||
                        cell === "cantidad_parcial"
                      ) {
                        updatedTarea.cantidad_acumulada =
                          parseFloat(updatedTarea.cantidad_normal || 0) +
                          parseFloat(updatedTarea.cantidad_parcial || 0);
                      }
                      
                      if (
                        [
                          "cantidad_acumulada",
                          "cantidad",
                          "cantidad_normal",
                          "cantidad_parcial",
                        ].includes(cell)

                      ) {
                        updatedTarea.porcentaje =
                          (parseFloat(updatedTarea.cantidad_acumulada || 0) /
                            parseFloat(updatedTarea.cantidad || 0)) *
                          100;
                        updatedTarea.porcentaje =
                          updatedTarea.porcentaje.toFixed(1);
                        

                      }
                      return updatedTarea;
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

              // **PROPAGACIÓN AUTOMÁTICA**: Actualizar porcentajes automáticos
        const partidasConPropagacion = propagarPorcentajes(nuevasPartidasArr);
        setPartidasArr(partidasConPropagacion);
        
        // **PERSISTIR PORCENTAJES AUTOMÁTICOS**: Guardar en base de datos
        await persistirPorcentajesAutomaticos(partidasConPropagacion);
      };

      const handleTareaBlur = async (id, value, cell) => {
      try {
        const nuevasPartidasArr = partidasArr.map((partida) => {
          if (partida.subpartida_partida) {
            const nuevasSubpartidas = partida.subpartida_partida.map(
              (subpartida) => {
                if (subpartida.subpartida_tarea) {
                  const nuevasTareas = subpartida.subpartida_tarea.map(
                    (tarea) => {
                      if (tarea.id === id) {
                        const updatedTarea = { ...tarea, [cell]: value };
                        return updatedTarea;
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

        const tareaToUpdate = nuevasPartidasArr
          .flatMap((partida) => partida.subpartida_partida)
          .flatMap((subpartida) => subpartida.subpartida_tarea)
          .find((tarea) => tarea.id === id);

        if (!tareaToUpdate) {
          throw new Error("Tarea no encontrada para actualizar");
        }

        const tareaSUpdate = {
          cantidad_normal: tareaToUpdate.cantidad_normal || "0",
          cantidad_acumulada: tareaToUpdate.cantidad_acumulada || "0",
          cantidad_parcial: tareaToUpdate.cantidad_parcial || "0",
          porcentaje: tareaToUpdate.porcentaje || "0",
          cantidad: tareaToUpdate.cantidad || "0",
          precio_unit: tareaToUpdate.precio_unit || "0",
          precio_total: tareaToUpdate.precio_total || "0",
          horas_hombre: tareaToUpdate.horas_hombre || "0",
          horas_maquina: tareaToUpdate.horas_maquina || "0",
        };

        console.log("Datos a enviar al backend:", tareaSUpdate);

        const response = await updateTarea(id, tareaSUpdate);
        showToastSafely("Campo actualizado correctamente");
        console.log("Tarea actualizada:", response);
      } catch (error) {
        console.error("Error updating tarea:", error);
      }
    };

    const handleSubTareaChange = async (id, value, cell) => {
      // **BLOQUEO**: Verificar si la subtarea está suspendida
      const subtarea = partidasArr
        .flatMap(p => p.subpartida_partida || [])
        .flatMap(s => s.subpartida_tarea || [])
        .flatMap(t => t.Task_Subtask || [])
        .find(st => st.id_subtask === id);
      if (subtarea && estaSuspendida(subtarea)) {
        showWarningToast(`No se puede editar: ${getEstadoInfo(subtarea.id_EstadoTarea).nombre}`);
        return;
      }

      // Validación de presupuesto monetario para cantidad_parci en subtareas
      if (cell === "cantidad_parci") {
        const subtarea = partidasArr
          .flatMap(p => p.subpartida_partida || [])
          .flatMap(s => s.subpartida_tarea || [])
          .flatMap(t => t.Task_Subtask || [])
          .find(st => st.id_subtask === id);
        
        if (subtarea) {
          const cantidadNorma = parseFloat(subtarea.cantidad_norma || 0);
          const nuevaCantidadParci = parseFloat(value || 0);
          const cantidadTotal = parseFloat(subtarea.cantidad || 0);
          const totalPrecio = parseFloat(subtarea.precio_total || 0);
          
          // Calcular precio unitario real = precio_total ÷ cantidad
          const precioUnitarioReal = cantidadTotal > 0 ? (totalPrecio / cantidadTotal) : 0;
          
          // Calcular nueva cantidad_acumu = cantidad_norma + nueva_cantidad_parci
          const nuevaCantidadAcumu = cantidadNorma + nuevaCantidadParci;
          const nuevoValorGastado = nuevaCantidadAcumu * precioUnitarioReal;
          
          if (nuevoValorGastado > totalPrecio && totalPrecio > 0) {
            const exceso = nuevoValorGastado - totalPrecio;
            
            const confirmar = await showCustomConfirm(
              "SUBTAREA",
              `Valor Gastado: $${nuevoValorGastado.toLocaleString("es-CL")}\n` +
              `Presupuesto Total: $${totalPrecio.toLocaleString("es-CL")}\n` +
              `Exceso: $${exceso.toLocaleString("es-CL")}\n\n` +
              `¿Desea continuar y exceder el presupuesto?`
            );
            
            if (!confirmar) {
              showWarningToast("Operación cancelada. El presupuesto no se ha excedido.");
              return; // Cancelar la operación
            } else {
              toast.success("Excepción aprobada. Presupuesto excedido con autorización.", { duration: 4000 });
            }
          }
        }
      }

      // NUEVA LÓGICA: Multiplicar cantidad por suma de materiales directos para SUBTAREAS
      const calcularPrecioTotal = (cantidad, precioUnitario, subtarea = null) => {
        // Si tiene materiales directos, calcular desde la suma de materiales
        if (subtarea && subtarea.material_Subtask && subtarea.material_Subtask.length > 0) {
          const sumaMateriales = subtarea.material_Subtask.reduce((suma, material) => {
            return suma + (parseFloat(material.valor_total) || 0);
          }, 0);
          return cantidad * sumaMateriales;
        }
        
        // Si no tiene materiales directos, usar la fórmula tradicional
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
                            
                           
                            
                            if (cell === "precio_unit") {
                              // SOLO recalcular precio_total cuando cambie precio_unit, NO cuando cambie cantidad
                              updatedSubtarea.precio_total = calcularPrecioTotal(
                                updatedSubtarea.cantidad,
                                value, // nuevo precio_unit
                                updatedSubtarea
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
              // **PROPAGACIÓN AUTOMÁTICA**: Actualizar porcentajes automáticos
        const partidasConPropagacion = propagarPorcentajes(nuevasPartidasArr);
        setPartidasArr(partidasConPropagacion);
        
        // **PERSISTIR PORCENTAJES AUTOMÁTICOS**: Guardar en base de datos
        await persistirPorcentajesAutomaticos(partidasConPropagacion);
      };

      const handleSubTareaBlur = async (id, value, cell) => {
      try {
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

        //nuevo actualizar cada tarea con el id segun subtarea -> id_task
        const subtareaToUpdate = nuevasPartidasArr
          .flatMap((partida) => partida.subpartida_partida)
          .flatMap((subpartida) => subpartida.subpartida_tarea)
          .flatMap((tarea) => tarea.Task_Subtask)
          .find((subtarea) => subtarea.id_subtask === id);

        const subtareaSUpdate = {
          cantidad_norma: subtareaToUpdate.cantidad_norma || "0",
          cantidad_acumu: subtareaToUpdate.cantidad_acumu || "0",
          cantidad_parci: subtareaToUpdate.cantidad_parci || "0",
          porcentaje: subtareaToUpdate.porcentaje || "0",
          cantidad: subtareaToUpdate.cantidad || "0",
          precio_unit: subtareaToUpdate.precio_unit || "0",
          precio_total: subtareaToUpdate.precio_total || "0",
          horas_hombre: subtareaToUpdate.horas_hombre || "0",
          horas_maquina: subtareaToUpdate.horas_maquina || "0",
        };

        const response = await updateSubtarea(id, subtareaSUpdate);
        showToastSafely("Campo actualizado correctamente");
        console.log("Subtarea actualizada:", response);
        //Actualizar datos de subtarea
        setPartidasArr(nuevasPartidasArr);

        const subtareas = nuevasPartidasArr
          .flatMap((partida) => partida.subpartida_partida || [])
          .flatMap((subpartida) => subpartida.subpartida_tarea || [])
          .flatMap((tarea) => tarea.Task_Subtask || []);

        const tareaHoras = subtareas.reduce((acc, subtarea) => {
          const {
            id_task,
            horas_hombre = 0,
            horas_maquina = 0,
            cantidad = 0,
            cantidad_norma = 0,
            cantidad_acumu = 0,
            cantidad_parci = 0,
          } = subtarea;

          if (!acc[id_task]) {
            acc[id_task] = {
              horas_hombre: 0,
              horas_maquina: 0,
              cantidad: 0,
              cantidad_normal: 0,
              cantidad_acumulada: 0,
              cantidad_parcial: 0,
            };
          }

          acc[id_task].horas_hombre = parseFloat((acc[id_task].horas_hombre + parseFloat(horas_hombre)).toFixed(2));
          acc[id_task].horas_maquina = parseFloat((acc[id_task].horas_maquina + parseFloat(horas_maquina)).toFixed(2));
          acc[id_task].cantidad += parseFloat(cantidad);
          acc[id_task].cantidad_normal += parseFloat(cantidad_norma);
          acc[id_task].cantidad_acumulada += parseFloat(cantidad_acumu);
          acc[id_task].cantidad_parcial += parseFloat(cantidad_parci);

          return acc;
        }, {});

        const updatedTareasPromises = Object.entries(tareaHoras).map(
          async ([
            id_task,
            {
              horas_hombre,
              horas_maquina,
              cantidad,
              cantidad_normal,
              cantidad_acumulada,
              cantidad_parcial,
            },
          ]) => {
            const tareaToUpdate = nuevasPartidasArr
              .flatMap((partida) => partida.subpartida_partida || [])
              .flatMap((subpartida) => subpartida.subpartida_tarea || [])
              .find((tarea) => tarea.id === parseInt(id_task));

            if (tareaToUpdate) {
              const updatedTarea = {
                ...tareaToUpdate,
                horas_hombre,
                horas_maquina,
                cantidad,
                cantidad_normal,
                cantidad_acumulada,
                cantidad_parcial,
              };

              if (cantidad > 0) {
                updatedTarea.porcentaje = (
                  (parseFloat(cantidad_acumulada) / parseFloat(cantidad)) *
                  100
                ).toFixed(2);
              } else {
                updatedTarea.porcentaje = "0.0";
              }

              try {
                const dataTarea = await updateTarea(id_task, updatedTarea);
                console.log("Tarea actualizada:", dataTarea);
              } catch (error) {
                console.error(
                  `Error al actualizar la tarea con id ${id_task}:`,
                  error,
                );
              }
            } else {
              console.error(`Tarea con id ${id_task} no encontrada`);
            }
          },
        );
        await Promise.all(updatedTareasPromises);

        const updatedData = await getPartidasByProjectStd(projectId);
        actualizarPartidasArr(updatedData, setPartidasArr);

        await new Promise((resolve) => setTimeout(resolve, 100));

        //Actualizacion de subpartida
        const tareasActualizadas = updatedData
          .flatMap((partida) => partida.subpartida_partida || [])
          .flatMap((subpartida) => subpartida.subpartida_tarea || []);

        const subpartidaHoras = tareasActualizadas.reduce((acc, tarea) => {
          const {
            id_subpartida,
            horas_hombre = 0,
            horas_maquina = 0,
            cantidad = 0,
            cantidad_normal = 0,
            cantidad_acumulada = 0,
            cantidad_parcial = 0,
          } = tarea;

          if (!acc[id_subpartida]) {
            acc[id_subpartida] = {
              horas_hombre: 0,
              horas_maquina: 0,
              cantidad: 0,
              cantidad_normal: 0,
              cantidad_acumulada: 0,
              cantidad_parcial: 0,
            };
          }

          acc[id_subpartida].horas_hombre = parseFloat((acc[id_subpartida].horas_hombre + parseFloat(horas_hombre)).toFixed(2));
          acc[id_subpartida].horas_maquina = parseFloat((acc[id_subpartida].horas_maquina + parseFloat(horas_maquina)).toFixed(2));
          acc[id_subpartida].cantidad += parseFloat(cantidad);
          acc[id_subpartida].cantidad_normal += parseFloat(cantidad_normal);
          acc[id_subpartida].cantidad_acumulada +=
            parseFloat(cantidad_acumulada);
          acc[id_subpartida].cantidad_parcial += parseFloat(cantidad_parcial);

          return acc;
        }, {});

        const updatedSubpartidasPromises = Object.entries(subpartidaHoras).map(
          async ([
            id_subpartida,
            {
              horas_hombre,
              horas_maquina,
              cantidad,
              cantidad_normal,
              cantidad_acumulada,
              cantidad_parcial,
            },
          ]) => {
            const subpartidaToUpdate = nuevasPartidasArr
              .flatMap((partida) => partida.subpartida_partida || [])
              .find(
                (subpartida) =>
                  subpartida.id_subpartida === parseInt(id_subpartida),
              );

            if (subpartidaToUpdate) {
              const updatedSubpartida = {
                ...subpartidaToUpdate,
                horas_hombre,
                horas_maquina,
                cantidad,
                cantidad_normal,
                cantidad_acumulada,
                cantidad_parcial,
              };

              if (cantidad > 0) {
                updatedSubpartida.porcentaje = (
                  (parseFloat(cantidad_acumulada) / parseFloat(cantidad)) *
                  100
                ).toFixed(2);
              } else {
                updatedSubpartida.porcentaje = "0.0";
              }

              try {
                const dataSubpartida = await updatesubPartida(
                  id_subpartida,
                  updatedSubpartida,
                );
                console.log("Subpartida actualizada:", dataSubpartida);
              } catch (error) {
                console.error(
                  `Error al actualizar la subpartida con id ${id_subpartida}:`,
                  error,
                );
              }
            } else {
              console.error(`Subpartida con id ${id_subpartida} no encontrada`);
            }
          },
        );
        await Promise.all(updatedSubpartidasPromises);
        const updatedData2 = await getPartidasByProjectStd(projectId);

        console.log(updatedData2);
        actualizarPartidasArr(updatedData2, setPartidasArr);

        await new Promise((resolve) => setTimeout(resolve, 100));

        //Actualizar a partidas
        const subpartidas = updatedData2.flatMap(
          (partida) => partida.subpartida_partida || [],
        );

        const partidaHoras = subpartidas.reduce((acc, subpartida) => {
          const {
            id_partida,
            horas_hombre = 0,
            horas_maquina = 0,
            cantidad = 0,
            cantidad_normal = 0,
            cantidad_acumulada = 0,
            cantidad_parcial = 0,
          } = subpartida;

          if (!acc[id_partida]) {
            acc[id_partida] = {
              horas_hombre: 0,
              horas_maquina: 0,
              cantidad: 0,
              cantidad_normal: 0,
              cantidad_acumulada: 0,
              cantidad_parcial: 0,
            };
          }

          acc[id_partida].horas_hombre = parseFloat((acc[id_partida].horas_hombre + parseFloat(horas_hombre)).toFixed(2));
          acc[id_partida].horas_maquina = parseFloat((acc[id_partida].horas_maquina + parseFloat(horas_maquina)).toFixed(2));
          acc[id_partida].cantidad += parseFloat(cantidad);
          acc[id_partida].cantidad_normal += parseFloat(cantidad_normal);
          acc[id_partida].cantidad_acumulada += parseFloat(cantidad_acumulada);
          acc[id_partida].cantidad_parcial += parseFloat(cantidad_parcial);

          return acc;
        }, {});

        for (const [
          id_partida,
          {
            horas_hombre,
            horas_maquina,
            cantidad,
            cantidad_normal,
            cantidad_acumulada,
            cantidad_parcial,
          },
        ] of Object.entries(partidaHoras)) {
          const partidaToUpdate = nuevasPartidasArr.find(
            (partida) => partida.id_partida === parseInt(id_partida),
          );

          if (partidaToUpdate) {
            const updatedPartida = {
              ...partidaToUpdate,
              horas_hombre,
              horas_maquina,
              cantidad,
              cantidad_normal,
              cantidad_acumulada,
              cantidad_parcial,
            };

            if (cantidad > 0) {
              updatedPartida.porcentaje = (
                (parseFloat(cantidad_acumulada) / parseFloat(cantidad)) *
                100
              ).toFixed(2);
            } else {
              updatedPartida.porcentaje = "0.0";
            }

            const dataPartida = await updatePartida(id_partida, updatedPartida);

            console.log("Partida actualizada:", dataPartida);
          } else {
            console.error(`Partida con id ${id_partida} no encontrada`);
          }
        }
        updatetabla();
      } catch (error) {
        console.error("Error updating subtarea:", error);
      }
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

    <style>
      {`
      .expandable-content {
        transition: max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.5s cubic-bezier(0.4,0,0.2,1);
        overflow: hidden;
        opacity: 1;
        max-height: 2000px;
        display: table-row-group;
      }
      .expandable-content.collapsed {
        opacity: 0;
        max-height: 0 !important;
        pointer-events: none;
        display: table-row-group;
      }
    `}
    </style>;

    const [isAnimating, setIsAnimating] = useState(false);

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
        console.log(`Toast GLOBAL permitido: "${message}"`);
        
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

    // Función para verificar si se excede el presupuesto
    const verificarExcesoPresupuesto = (item, tipoItem = 'partida') => {
      const cantidadAcum = parseFloat(item.cantidad_acumulada || item.cantidad_acumu || 0);
      const cantidadTotal = parseFloat(item.cantidad || 0);
      const totalPrecio = parseFloat(item.precio_total || 0);
      
      // Calcular precio unitario real = precio_total ÷ cantidad
      const precioUnitarioReal = cantidadTotal > 0 ? (totalPrecio / cantidadTotal) : 0;
      
      // Valor gastado = cantidad_acumulada × precio_unitario_real
      const valorGastado = cantidadAcum * precioUnitarioReal;
      
      return {
        excede: valorGastado > totalPrecio && totalPrecio > 0,
        valorGastado,
        totalPrecio,
        exceso: valorGastado - totalPrecio,
        precioUnitarioReal
      };
    };

    return (
      <div className="w-full max-w-[90vw] min-h-[50vh] max-h-[66vh] overflow-y-auto">
        {/* <div className="relative overflow-x-auto overflow-y-auto max-h-[50vh] sm:max-h-[60vh] md:max-h-[75vh] pb-10 w-full"> */}

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
        <table
          className={
            ["supervisor", "ITO"].includes(role)
              ? "table-auto w-full border-collapse border border-gray-400 font-zen-kaku h-full text-lg supervisor-mode"
              : "table-auto w-full border-collapse border border-gray-400 font-zen-kaku h-full text-lg"
          }
        >
          <thead className="sticky top-0 z-20">
            <tr style={{ background: "#5C7891" }}>
              <th className="text-white border-r border-black" colSpan="7"></th>

              <th
                className="px-4 py-1 border border-[#5C7891] border-r-black text-white font-bold shadow-lg"
                colSpan="2"
              >
                Cantidad acumulada
                <Info
                  size={18}
                  className="inline ml-2 cursor-pointer text-white hover:text-[#0fffc1] transition-colors"
                  data-tooltip-id="tooltip"
                  data-tooltip-content="Información sobre la cantidad acumulada"
                />
              </th>
              <th
                className="px-4 py-1 border border-[#5C7891] border-r-black text-white font-bold shadow-lg"
                colSpan="2"
              >
                Cantidad parcial
                <Info
                  size={18}
                  className="inline ml-2 cursor-pointer text-white hover:text-[#0fffc1] transition-colors"
                  data-tooltip-id="tooltip"
                  data-tooltip-content="Información sobre la cantidad acumulada"
                />
              </th>
              <th
                className="px-4 py-1 border border-[#5C7891] border-r-black text-white font-bold shadow-lg"
                colSpan="3"
              />
            </tr>
            <tr style={{ background: "#5C7891" }}>
              <th className="px-4 py-1 border border-[#5C7891] border-r-black text-white font-bold shadow">
                Item
                <Info
                  size={18}
                  className="inline ml-2 cursor-pointer text-white hover:text-[#0fffc1] transition-colors"
                  data-tooltip-id="tooltip"
                  data-tooltip-content="Información sobre la cantidad acumulada"
                />
              </th>
              <th className="px-4 py-1 border border-[#5C7891] border-r-black text-white font-bold shadow">
                Descripción de partidas
                <Info
                  size={18}
                  className="inline ml-2 cursor-pointer text-white hover:text-[#0fffc1] transition-colors"
                  data-tooltip-id="tooltip"
                  data-tooltip-content="Nombre de Partidas"
                />
              </th>
              <th className="px-4 py-1 border border-[#5C7891] border-r-black text-white font-bold shadow">
                Unidad
                <Info
                  size={18}
                  className="inline ml-2 cursor-pointer text-white hover:text-[#0fffc1] transition-colors"
                  data-tooltip-id="tooltip"
                  data-tooltip-content="Unidad de Medida de las Partida"
                />
              </th>
              <th className="px-4 py-1 border border-[#5C7891] border-r-black text-white font-bold shadow">
                Cantidad
                <Info
                  size={18}
                  className="inline ml-2 cursor-pointer text-white hover:text-[#0fffc1] transition-colors"
                  data-tooltip-id="tooltip"
                  data-tooltip-content="Cantidad Segun Unidad de Medida"
                />
              </th>
              <th className="px-4 py-1 border border-[#5C7891] border-r-black text-white font-bold shadow">
                P. Unitaria
                <Info
                  size={18}
                  className="inline ml-2 cursor-pointer text-white hover:text-[#0fffc1] transition-colors"
                  data-tooltip-id="tooltip"
                  data-tooltip-content="Precio unitario por unidad"
                />
              </th>
              <th className="px-4 py-1 border border-[#5C7891] border-r-black text-white font-bold shadow">
                HH
                <Info
                  size={18}
                  className="inline ml-2 cursor-pointer text-white hover:text-[#0fffc1] transition-colors"
                  data-tooltip-id="tooltip"
                  data-tooltip-content="Horas Hombre"
                />
              </th>
              <th className="px-4 py-1 border border-[#5C7891] border-r-black text-white font-bold shadow">
                HM
                <Info
                  size={18}
                  className="inline ml-2 cursor-pointer text-white hover:text-[#0fffc1] transition-colors"
                  data-tooltip-id="tooltip"
                  data-tooltip-content="Horas Maquina"
                />
              </th>
              <th className="px-4 py-1 border border-[#5C7891] border-r-black text-white font-bold shadow">
                Cantidad
                <Info
                  size={18}
                  className="inline ml-2 cursor-pointer text-white hover:text-[#0fffc1] transition-colors"
                  data-tooltip-id="tooltip"
                  data-tooltip-content="Cantidad Acumulada de avance"
                />
              </th>
              <th className="px-4 py-1 border border-[#5C7891] border-r-black text-white font-bold shadow">
                sub-total
                <Info
                  size={18}
                  className="inline ml-2 cursor-pointer text-white hover:text-[#0fffc1] transition-colors"
                  data-tooltip-id="tooltip"
                  data-tooltip-content="Costo Segun avance"
                />
              </th>
              <th className="px-4 py-1 border border-[#5C7891] border-r-black text-white font-bold shadow">
                Cantidad
                <Info
                  size={18}
                  className="inline ml-2 cursor-pointer text-white hover:text-[#0fffc1] transition-colors"
                  data-tooltip-id="tooltip"
                  data-tooltip-content="Cantidad total avance de Partida"
                />
              </th>
              <th className="px-4 py-1 border border-[#5C7891] border-r-black text-white font-bold shadow">
                sub-total
                <Info
                  size={18}
                  className="inline ml-2 cursor-pointer text-white hover:text-[#0fffc1] transition-colors"
                  data-tooltip-id="tooltip"
                  data-tooltip-content="Costo Subtotal Avance de Partida"
                />
              </th>
              <th className="px-4 py-1 border border-[#5C7891] border-r-black text-white font-bold shadow">
                Cantidad de %
                <Info
                  size={18}
                  className="inline ml-2 cursor-pointer text-white hover:text-[#0fffc1] transition-colors"
                  data-tooltip-id="tooltip"
                  data-tooltip-content="Porcentaje de completado de la partida "
                />
              </th>
              <th className="px-4 py-1 border border-[#5C7891] border-r-black text-white font-bold shadow">
                Precio Unitario ({currency})
                <Info
                  size={18}
                  className="inline ml-2 cursor-pointer text-white hover:text-[#0fffc1] transition-colors"
                  data-tooltip-id="tooltip"
                  data-tooltip-content="Precio unitario de materiales adjuntos"
                />
              </th>
              <th className="px-4 py-1 border border-[#5C7891] border-r-black text-white font-bold shadow">
                Precio Total ({currency})
                <Info
                  size={18}
                  className="inline ml-2 cursor-pointer text-white hover:text-[#0fffc1] transition-colors"
                  data-tooltip-id="tooltip"
                  data-tooltip-content="Monto Total calculado de la Partida, segun materiales incluidos en todos los niveles"
                />
              </th>
            </tr>
          </thead>

          <tbody>
            {/* PARTIDAS  */}
            {partidasArr?.map((item, index) => (
              <React.Fragment key={item.id_partida}>
                <tr className={getClasesEstado(item)}>
                  <td className="px-4 py-2 border border-gray-400">
                    {index + 1}

                    <button
                      onClick={() => {
                        if (estaSuspendida(item)) {
                          showWarningToast(`No se puede editar materiales: ${getEstadoInfo(item.id_EstadoTarea).nombre}`);
                          return;
                        }
                        handleSpanClick(item, "partida", index);
                      }}
                      className={`ml-2 rounded-full ${estaSuspendida(item) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#5C7891] hover:bg-[#7e30e1]'} transition-all duration-150 shadow-md flex items-center justify-center border-2 border-[#fff] focus:outline-none focus:ring-2 focus:ring-[#0fffc1]`}
                      type="button"
                      style={{ width: "2.5rem", height: "2.5rem", padding: 0 }}
                      disabled={estaSuspendida(item)}
                    >
                      <Edit className="w-5 h-5 text-white" />
                    </button>
                  </td>
                                    <td className="px-4 py-2 border border-gray-400 cursor-pointer">
                    <div
                      className="flex items-center w-96"
                      onClick={() => handleIconClick(item.id_partida, item)}
                    >
                      <span className={`mr-2 text-xs font-bold px-2 py-1 rounded estado-indicator ${getEstadoInfo(item.id_EstadoTarea).clase}`} title={getEstadoInfo(item.id_EstadoTarea).nombre}>
                        {getEstadoInfo(item.id_EstadoTarea).texto}
                      </span>
                      <ChevronRight
                        strokeWidth={3}
                        className={`w-8 h-8 transition-transform ${
                          estaSuspendida(item) 
                            ? "cursor-not-allowed stroke-gray-400" 
                            : "cursor-pointer stroke-green-400 hover:stroke-green-600 drop-shadow-lg neon-glow"
                        } ${expandedRows[item.id_partida] ? "rotate-90" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation(); // Evitar que se dispare el onClick del div padre
                          handlePartidaClick(item);
                        }}
                      />
                      <span
                        className="ml-2 line-clamp-3 w-full"
                        onClick={() => handlePartidaClick(item)}
                      >
                        {item.nombre_partida}
                      </span>
                      {/* <AutoWidthInput type='text' className="ml-2 select-none" disabled value={item.nombre_partida} /> */}
                    </div>

                  </td>

                  <td className="px-4 py-2 border border-gray-400">
                    <Select
                      className="basic-single font-zen-kaku w-56"
                      classNamePrefix="select"
                      isSearchable={true}
                      name="unidad"
                      placeholder="Seleccione unidad"
                      options={unidadOptions}
                      isDisabled={[
                        "supervisor",
                        "ITO",
                        "superintendente",
                        "prevencionista",
                      ].includes(role) || estaSuspendida(item)}
                      value={
                        unidadOptions.find(
                          (option) => option.value === item.id_unidad,
                        ) || null
                      }
                      onChange={(selectedOption) =>
                        !estaSuspendida(item) && handleSelectunidad(selectedOption, item.id_partida)
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
                      className={`text-center ${estaSuspendida(item) ? 'cursor-not-allowed' : ''}`}
                      value={item.cantidad}
                      disabled={isBlockedRole || estaSuspendida(item)}
                      onChange={(e) =>
                        !isBlockedRole && !estaSuspendida(item) &&
                        handleCellChange(
                          item.id_partida,
                          e.target.value,
                          "cantidad",
                        )
                      }
                      onKeyDown={(e) => 
                        handlePartidaKeyDown(
                          e,
                          item.id_partida,
                          e.target.value,
                          "cantidad"
                        )
                      }
                      onBlur={(e) => {
                        if (!isBlockedRole) {
                          // Log de diagnóstico
                          console.log("DIAGNÓSTICO - onBlur activado para partida:", item.id_partida);
                          handleInputBlur(
                            item.id_partida,
                            e.target.value,
                            "cantidad",
                          );
                        }
                      }}
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
                          item.cantidad > 0 
                            ? (parseFloat(item.precio_total || 0) / parseFloat(item.cantidad || 1))
                            : 0
                        )}
                        readOnly
                      />
                    </div>
                  </td>

                  <td className="px-4 py-2 border border-gray-400">
                    <input
                      type="text"
                      className={`text-center ${estaSuspendida(item) ? 'cursor-not-allowed' : ''}`}
                      value={item.horas_hombre}
                      disabled={isBlockedRole || estaSuspendida(item)}
                      onChange={(e) =>
                        !isBlockedRole && !estaSuspendida(item) &&
                        handleCellChange(
                          item.id_partida,
                          e.target.value,
                          "horas_hombre",
                        )
                      }
                      onKeyDown={(e) => 
                        handlePartidaKeyDown(
                          e,
                          item.id_partida,
                          e.target.value,
                          "horas_hombre"
                        )
                      }
                      onBlur={(e) => {
                        if (!isBlockedRole) {
                          handleInputBlur(
                            item.id_partida,
                            e.target.value,
                            "horas_hombre",
                          );
                        }
                      }}
                    />
                  </td>

                  <td className="px-4 py-2 border border-gray-400">
                    <input
                      type="text"
                      className={`text-center ${estaSuspendida(item) ? 'cursor-not-allowed' : ''}`}
                      value={item.horas_maquina}
                      disabled={isBlockedRole || estaSuspendida(item)}
                      onChange={(e) =>
                        !isBlockedRole && !estaSuspendida(item) &&
                        handleCellChange(
                          item.id_partida,
                          e.target.value,
                          "horas_maquina",
                        )
                      }
                      onKeyDown={(e) => 
                        handlePartidaKeyDown(
                          e,
                          item.id_partida,
                          e.target.value,
                          "horas_maquina"
                        )
                      }
                      onBlur={(e) => {
                        if (!isBlockedRole) {
                          handleInputBlur(
                            item.id_partida,
                            e.target.value,
                            "horas_maquina",
                          );
                        }
                      }}
                    />
                  </td>

                  <td className="px-4 py-2 border border-gray-400">
                    <input
                      type="text"
                      className={`text-center ${estaSuspendida(item) ? 'cursor-not-allowed' : ''}`}
                      value={item.cantidad_normal}
                      disabled={isBlockedRole || estaSuspendida(item)}
                      onChange={(e) =>
                        !isBlockedRole && !estaSuspendida(item) &&
                        handleCellChange(
                          item.id_partida,
                          e.target.value,
                          "cantidad_normal",
                        )
                      }
                      onKeyDown={(e) => 
                        handlePartidaKeyDown(
                          e,
                          item.id_partida,
                          e.target.value,
                          "cantidad_normal"
                        )
                      }
                      onBlur={(e) => {
                        if (!isBlockedRole) {
                          handleInputBlur(
                            item.id_partida,
                            e.target.value,
                            "cantidad_normal",
                          );
                        }
                      }}
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
                      onBlur={(e) =>
                        handleInputBlur(
                          item.id_partida,
                          e.target.value,
                          "cantidad_acumulada",
                        )
                      }
                    />
                  </td>

                  <td className="px-4 py-2 border border-gray-400 relative">
                    <input
                      type="text"
                      className={`text-center ${verificarExcesoPresupuesto(item, 'partida').excede ? 'bg-red-100 border-red-500 border-2' : ''} ${estaSuspendida(item) ? 'cursor-not-allowed' : ''}`}
                      value={item.cantidad_parcial}
                      disabled={estaSuspendida(item)}
                      onChange={(e) =>
                        !estaSuspendida(item) &&
                        handleCellChange(
                          item.id_partida,
                          e.target.value,
                          "cantidad_parcial",
                        )
                      }
                      onKeyDown={(e) => 
                        handlePartidaKeyDown(
                          e,
                          item.id_partida,
                          e.target.value,
                          "cantidad_parcial"
                        )
                      }
                      onBlur={(e) => {
                        if (!isBlockedRole) {
                          handleInputBlur(
                            item.id_partida,
                            e.target.value,
                            "cantidad_parcial",
                          );
                        }
                      }}
                    />
                    {verificarExcesoPresupuesto(item, 'partida').excede && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full z-10">
                        ⚠️
                      </div>
                    )}
                  </td>

                  <td className="px-14 py-2 border border-gray-400">
                    <input
                      type="text"
                      disabled
                      className="text-center"
                      value={item.cantidad_parcial}
                    />
                  </td>

                                      <td className="px-4 py-2 border border-gray-400">
                      <div className="relative flex items-center">
                        {(() => {
                          const porcentajeData = formatearPorcentajeDisplay(item, 'subpartida');
                          return (
                            <>
                              <input
                                type="text"
                                className={`text-right pr-4 max-w-24 ${
                                  porcentajeData.esAutomatico 
                                    ? 'bg-blue-50 border-blue-300 font-bold text-blue-700' 
                                    : 'bg-gray-50'
                                }`}
                                disabled
                                value={porcentajeData.valor}
                                title={porcentajeData.tooltip}
                                onChange={(e) =>
                                  handleCellChange(
                                    item.id_partida,
                                    e.target.value,
                                    "porcentaje",
                                  )
                                }
                                onBlur={(e) =>
                                  handleInputBlur(
                                    item.id_partida,
                                    e.target.value,
                                    "porcentaje",
                                  )
                                }
                              />
                              <span className={porcentajeData.esAutomatico ? 'text-blue-700 font-bold' : ''}>%</span>
                            </>
                          );
                        })()}
                      </div>
                    </td>
                  <td className="px-4 py-2 border border-gray-400">
                    <div className="relative flex items-center">
                      <span className="ml-16">{currency}</span>
                      <input
                        type="text"
                        disabled={isBlockedRole}
                        className="text-left ml-2 max-w-48"
                        value={convertCurrency(item.precio_unit)}
                        onChange={(e) =>
                          !isBlockedRole &&
                          handleCellChange(
                            item.id_partida,
                            e.target.value,
                            "precio_unit",
                          )
                        }
                        onKeyDown={(e) => 
                          handlePartidaKeyDown(
                            e,
                            item.id_partida,
                            e.target.value,
                            "precio_unit"
                          )
                        }
                        onBlur={(e) => {
                          if (!isBlockedRole) {
                            handleInputBlur(
                              item.id_partida,
                              e.target.value,
                              "precio_unit",
                            );
                          }
                        }}
                      />
                    </div>
                  </td>

                  <td className="px-4 py-2 border border-gray-400">
                    <div className="relative flex items-center">
                      <span className="ml-16">{currency}</span>
                      <input
                        type="text"
                        className="text-left ml-2 max-w-48"
                        disabled={isBlockedRole}
                        value={convertCurrency(item.precio_total)}
                        onChange={(e) =>
                          !isBlockedRole &&
                          handleCellChange(
                            item.id_partida,
                            e.target.value,
                            "precio_total",
                          )
                        }
                        onKeyDown={(e) => 
                          handlePartidaKeyDown(
                            e,
                            item.id_partida,
                            e.target.value,
                            "precio_total"
                          )
                        }
                        onBlur={(e) => {
                          if (!isBlockedRole) {
                            handleInputBlur(
                              item.id_partida,
                              e.target.value,
                              "precio_total",
                            );
                          }
                        }}
                      />
                    </div>
                  </td>
                </tr>

                {/* Fila de advertencia de presupuesto excedido para PARTIDAS */}
                {verificarExcesoPresupuesto(item, 'partida').excede && (
                  <tr className="bg-red-50 border-l-4 border-red-500">
                    <td colSpan="15" className="px-4 py-2 border border-gray-400">
                      <div className="flex items-center text-red-700 text-sm font-semibold">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>⚠️ PRESUPUESTO EXCEDIDO EN PARTIDA:</span>
                        <span className="ml-2">
                          Valor Gastado: ${verificarExcesoPresupuesto(item, 'partida').valorGastado.toLocaleString("es-CL")} | 
                          Presupuesto: ${verificarExcesoPresupuesto(item, 'partida').totalPrecio.toLocaleString("es-CL")} | 
                          Exceso: ${verificarExcesoPresupuesto(item, 'partida').exceso.toLocaleString("es-CL")}
                        </span>
                      </div>
                    </td>
                  </tr>
                )}

                {/* PARTIDAS  */}

                {/* SUBPARTIDAS  */}
                {expandedRows[item.id_partida] &&
                  // Itera sobre el array subpartida de cada item
                  item.subpartida_partida.map((subItem, indexsub) => (
                    <React.Fragment key={subItem.id_subpartida}>
                      <tr className={getClasesEstado(subItem)}>
                        <td className="px-4 py-2 border border-gray-400 ">
                          {index + 1}.{indexsub + 1}
                          {console.log(item.subpartida_partida)}
                          <button
                            onClick={() => {
                              if (estaSuspendida(subItem)) {
                                showWarningToast(`No se puede editar materiales: ${getEstadoInfo(subItem.id_EstadoTarea).nombre}`);
                                return;
                              }
                              handleSpanClick(
                                subItem,
                                "subpartida",
                                index,
                                indexsub,
                              );
                            }}
                            className={`ml-2 ${estaSuspendida(subItem) ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'}`}
                            type="button"
                            disabled={estaSuspendida(subItem)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>
                        <td className="px-4 py-2 border border-gray-400 cursor-pointer">
                          <div
                            className="flex items-center w-96"
                            onClick={() =>
                              handleIconClick(subItem.id_subpartida, subItem)
                            }
                          >
                            <span className={`mr-2 text-xs font-bold px-2 py-1 rounded estado-indicator ${getEstadoInfo(subItem.id_EstadoTarea).clase}`} title={getEstadoInfo(subItem.id_EstadoTarea).nombre}>
                              {getEstadoInfo(subItem.id_EstadoTarea).texto}
                            </span>
                            <ChevronRight
                              strokeWidth={3}
                              className={`w-8 h-8 transition-transform ${
                                estaSuspendida(subItem) 
                                  ? "cursor-not-allowed stroke-gray-400" 
                                  : "cursor-pointer stroke-teal-500 hover:stroke-teal-600 drop-shadow-lg neon-glow"
                              } ${expandedSubpartidaRows[subItem.id_subpartida] ? "rotate-90" : ""}`}
                              onClick={(e) => {
                                e.stopPropagation(); // Evitar que se dispare el onClick del div padre
                                handleSubpartidaClick(subItem);
                              }}
                            />
                            <span
                              className="ml-2 line-clamp-3 w-full"
                              onClick={() => handleSubpartidaClick(subItem)}
                            >
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
                            placeholder="Seleccione unidad"
                            options={unidadOptions}
                            isDisabled={[
                              "supervisor",
                              "ITO",
                              "superintendente",
                              "prevencionista",
                            ].includes(role) || estaSuspendida(subItem)}
                            value={
                              unidadOptions.find(
                                (option) => option.value === subItem.id_unidad,
                              ) || null
                            }
                            onChange={(selectedOption) =>
                              !estaSuspendida(subItem) && handleSelectunidadsub(
                                selectedOption,
                                subItem.id_subpartida,
                              )
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
                            className={`text-center ${estaSuspendida(subItem) ? 'cursor-not-allowed' : ''}`}
                            value={subItem.cantidad}
                            disabled={estaSuspendida(subItem)}
                            onChange={(e) =>
                              !estaSuspendida(subItem) &&
                              handleSubpartidaChange(
                                subItem.id_subpartida,
                                e.target.value,
                                "cantidad",
                              )
                            }
                            onKeyDown={(e) => 
                              handleSubpartidaKeyDown(
                                e,
                                subItem.id_subpartida,
                                e.target.value,
                                "cantidad"
                              )
                            }
                            onBlur={(e) =>
                              handleSubpartidaBlur(
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
                              value={convertCurrency(
                                subItem.cantidad > 0 
                                  ? (parseFloat(subItem.precio_total || 0) / parseFloat(subItem.cantidad || 1))
                                  : 0
                              )}
                              readOnly
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2 border border-gray-400">
                          <input
                            type="text"
                            className={`text-center ${estaSuspendida(subItem) ? 'cursor-not-allowed' : ''}`}
                            value={subItem.horas_hombre}
                            disabled={estaSuspendida(subItem)}
                            onChange={(e) =>
                              !estaSuspendida(subItem) &&
                              handleSubpartidaChange(
                                subItem.id_subpartida,
                                e.target.value,
                                "horas_hombre",
                              )
                            }
                            onKeyDown={(e) => 
                              handleSubpartidaKeyDown(
                                e,
                                subItem.id_subpartida,
                                e.target.value,
                                "horas_hombre"
                              )
                            }
                            onBlur={(e) =>
                              handleSubpartidaBlur(
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
                            className={`text-center ${estaSuspendida(subItem) ? 'cursor-not-allowed' : ''}`}
                            value={subItem.horas_maquina}
                            disabled={estaSuspendida(subItem)}
                            onChange={(e) =>
                              !estaSuspendida(subItem) &&
                              handleSubpartidaChange(
                                subItem.id_subpartida,
                                e.target.value,
                                "horas_maquina",
                              )
                            }
                            onKeyDown={(e) => 
                              handleSubpartidaKeyDown(
                                e,
                                subItem.id_subpartida,
                                e.target.value,
                                "horas_maquina"
                              )
                            }
                            onBlur={(e) =>
                              handleSubpartidaBlur(
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
                            className={`text-center ${estaSuspendida(subItem) ? 'cursor-not-allowed' : ''}`}
                            value={subItem.cantidad_normal}
                            disabled={estaSuspendida(subItem)}
                            onChange={(e) =>
                              !estaSuspendida(subItem) &&
                              handleSubpartidaChange(
                                subItem.id_subpartida,
                                e.target.value,
                                "cantidad_normal",
                              )
                            }
                            onKeyDown={(e) => 
                              handleSubpartidaKeyDown(
                                e,
                                subItem.id_subpartida,
                                e.target.value,
                                "cantidad_normal"
                              )
                            }
                            onBlur={(e) =>
                              handleSubpartidaBlur(
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
                            onBlur={(e) =>
                              handleSubpartidaBlur(
                                subItem.id_subpartida,
                                e.target.value,
                                "cantidad_acumulada",
                              )
                            }
                          />
                        </td>

                        <td className="px-4 py-2 border border-gray-400 relative">
                          <input
                            type="text"
                            className={`text-center ${verificarExcesoPresupuesto(subItem, 'subpartida').excede ? 'bg-red-100 border-red-500 border-2' : ''} ${estaSuspendida(subItem) ? 'cursor-not-allowed' : ''}`}
                            value={subItem.cantidad_parcial}
                            disabled={estaSuspendida(subItem)}
                            onChange={(e) =>
                              !estaSuspendida(subItem) &&
                              handleSubpartidaChange(
                                subItem.id_subpartida,
                                e.target.value,
                                "cantidad_parcial",
                              )
                            }
                            onKeyDown={(e) => 
                              handleSubpartidaKeyDown(
                                e,
                                subItem.id_subpartida,
                                e.target.value,
                                "cantidad_parcial"
                              )
                            }
                            onBlur={(e) =>
                              handleSubpartidaBlur(
                                subItem.id_subpartida,
                                e.target.value,
                                "cantidad_parcial",
                              )
                            }
                          />
                          {verificarExcesoPresupuesto(subItem, 'subpartida').excede && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full z-10">
                              ⚠️
                            </div>
                          )}
                        </td>
                        {/* falta value  */}
                        <td className="px-14 py-2 border border-gray-400">
                          <input
                            type="text"
                            disabled
                            className="text-center"
                            value={subItem.cantidad_parcial}
                          />
                        </td>

                                                  <td className="px-4 py-2 border border-gray-400">
                            <div className="relative flex items-center">
                              {(() => {
                                const porcentajeData = formatearPorcentajeDisplay(subItem, 'tarea');
                                return (
                                  <>
                                    <input
                                      type="text"
                                      className={`text-right pr-4 max-w-24 ${
                                        porcentajeData.esAutomatico 
                                          ? 'bg-green-50 border-green-300 font-bold text-green-700' 
                                          : 'bg-gray-50'
                                      }`}
                                      disabled
                                      value={porcentajeData.valor}
                                      title={porcentajeData.tooltip}
                                      onChange={(e) =>
                                        handleSubpartidaChange(
                                          subItem.id_subpartida,
                                          e.target.value,
                                          "porcentaje",
                                        )
                                      }
                                      onBlur={(e) =>
                                        handleSubpartidaBlur(
                                          subItem.id_subpartida,
                                          e.target.value,
                                          "porcentaje",
                                        )
                                      }
                                    />
                                                                         <span className={porcentajeData.esAutomatico ? 'text-green-700 font-bold' : ''}>%</span>
                                  </>
                                );
                              })()}
                            </div>
                          </td>

                        <td className="px-4 py-2 border border-gray-400">
                          <div className="relative flex items-center">
                            <span className="ml-16">{currency === "USD" ? "USD" : "CLP"}</span>
                            <input
                              type="text"
                              className={`text-left ml-2 max-w-48 ${estaSuspendida(subItem) ? 'cursor-not-allowed' : ''}`}
                              disabled={isBlockedRole || estaSuspendida(subItem)}
                              value={convertCurrency(subItem.precio_unit)}
                              onChange={(e) =>
                                !isBlockedRole && !estaSuspendida(subItem) &&
                                handleSubpartidaChange(
                                  subItem.id_subpartida,
                                  e.target.value,
                                  "precio_unit",
                                )
                              }
                              onKeyDown={(e) => 
                                handleSubpartidaKeyDown(
                                  e,
                                  subItem.id_subpartida,
                                  e.target.value,
                                  "precio_unit"
                                )
                              }
                              onBlur={(e) => {
                                if (!isBlockedRole) {
                                  handleSubpartidaBlur(
                                    subItem.id_subpartida,
                                    e.target.value,
                                    "precio_unit",
                                  );
                                }
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2 border border-gray-400">
                          <div className="relative flex items-center">
                            <span className="ml-16">{currency === "USD" ? "USD" : "CLP"}</span>
                            <input
                              type="text"
                              className={`text-left ml-2 max-w-48 ${estaSuspendida(subItem) ? 'cursor-not-allowed' : ''}`}
                              disabled={isBlockedRole || estaSuspendida(subItem)}
                              value={convertCurrency(subItem.precio_total)}
                              onChange={(e) =>
                                !isBlockedRole &&
                                handleSubpartidaChange(
                                  subItem.id_subpartida,
                                  e.target.value,
                                  "precio_total",
                                )
                              }
                              onKeyDown={(e) => 
                                handleSubpartidaKeyDown(
                                  e,
                                  subItem.id_subpartida,
                                  e.target.value,
                                  "precio_total"
                                )
                              }
                              onBlur={(e) => {
                                if (!isBlockedRole) {
                                  handleSubpartidaBlur(
                                    subItem.id_subpartida,
                                    e.target.value,
                                    "precio_total",
                                  );
                                }
                              }}
                            />
                          </div>
                        </td>
                      </tr>

                      {/* Fila de advertencia de presupuesto excedido para SUBPARTIDAS */}
                      {verificarExcesoPresupuesto(subItem, 'subpartida').excede && (
                        <tr className="bg-red-50 border-l-4 border-red-500">
                          <td colSpan="15" className="px-4 py-2 border border-gray-400">
                            <div className="flex items-center text-red-700 text-sm font-semibold">
                              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <span>⚠️ PRESUPUESTO EXCEDIDO EN SUBPARTIDA:</span>
                              <span className="ml-2">
                                Valor Gastado: ${verificarExcesoPresupuesto(subItem, 'subpartida').valorGastado.toLocaleString("es-CL")} | 
                                Presupuesto: ${verificarExcesoPresupuesto(subItem, 'subpartida').totalPrecio.toLocaleString("es-CL")} | 
                                Exceso: ${verificarExcesoPresupuesto(subItem, 'subpartida').exceso.toLocaleString("es-CL")}
                              </span>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* SUBPARTIDAS  */}

                      {/* TAREAS */}
                      {expandedSubpartidaRows[subItem.id_subpartida] &&
                        // Itera sobre el array de tareas de cada subItem
                        subItem.subpartida_tarea.map((tarea, tareaIndex) => (
                          <React.Fragment key={tarea.id}>
                            <tr>
                              <td className="px-4 py-2 border border-gray-400">
                                {index + 1}.{indexsub + 1}.{tareaIndex + 1}
                                <button
                                  onClick={() => {
                                    if (estaSuspendida(tarea)) {
                                      showWarningToast(`No se puede editar materiales: ${getEstadoInfo(tarea.id_EstadoTarea).nombre}`);
                                      return;
                                    }
                                    handleSpanClick(
                                      tarea,
                                      "tarea",
                                      index,
                                      indexsub,
                                      tareaIndex,
                                    );
                                  }}
                                  className={`ml-2 ${estaSuspendida(tarea) ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'}`}
                                  type="button"
                                  disabled={estaSuspendida(tarea)}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </td>
                              <td className="px-4 py-2 border border-gray-400 cursor-pointer">
                                <div
                                  className="flex items-center w-96"
                                  onClick={() => handleIconClick(tarea.id)}
                                >
                                  <span className={`mr-2 text-xs font-bold px-2 py-1 rounded estado-indicator ${getEstadoInfo(tarea.id_EstadoTarea).clase}`} title={getEstadoInfo(tarea.id_EstadoTarea).nombre}>
                                    {getEstadoInfo(tarea.id_EstadoTarea).texto}
                                  </span>
                                  <ChevronRight
                                    strokeWidth={3}
                                    className={`w-8 h-8 transition-transform ${
                                      estaSuspendida(tarea) 
                                        ? "cursor-not-allowed stroke-gray-400" 
                                        : "cursor-pointer stroke-orange-500 hover:stroke-orange-600 drop-shadow-lg neon-glow"
                                    } ${expandedTareasRows[tarea.id] ? "rotate-90" : ""}`}
                                    onClick={(e) => {
                                      e.stopPropagation(); // Evitar que se dispare el onClick del div padre
                                      handleTareaClick(tarea);
                                    }}
                                  />
                                  <span
                                    className="ml-2 line-clamp-3 w-full"
                                    onClick={() => handleTareaClick(tarea)}
                                  >
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
                                  placeholder="Seleccione unidad"
                                  options={unidadOptions}
                                  isDisabled={[
                                    "supervisor",
                                    "ITO",
                                    "superintendente",
                                    "prevencionista",
                                  ].includes(role) || estaSuspendida(tarea)}
                                  value={
                                    unidadOptions.find(
                                      (option) =>
                                        option.value === tarea.id_unidad,
                                    ) || null
                                  }
                                  onChange={(selectedOption) =>
                                    !estaSuspendida(tarea) && handleSelectunidadtarea(
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
                                  className={`text-center ${estaSuspendida(tarea) ? 'cursor-not-allowed' : ''}`}
                                  value={tarea.cantidad}
                                  disabled={[
                                    "supervisor",
                                    "ITO",
                                    "superintendente",
                                  ].includes(role) || estaSuspendida(tarea)}
                                  onChange={(e) =>
                                    !estaSuspendida(tarea) &&
                                    handleTareaChange(
                                      tarea.id,
                                      e.target.value,
                                      "cantidad",
                                    )
                                  }
                                  onKeyDown={(e) => 
                                    handleTareaKeyDown(
                                      e,
                                      tarea.id,
                                      e.target.value,
                                      "cantidad"
                                    )
                                  }
                                  onBlur={(e) => {
                                    if (!tarea.Task_Subtask?.length) {
                                      handleTareaBlur(
                                        tarea.id,
                                        e.target.value,
                                        "cantidad",
                                      );
                                    }
                                  }}
                                />
                              </td>
                              <td className="px-4 py-2 border border-gray-400">
                                <div className="relative flex items-center">
                                  <span>{currency === "USD" ? "USD" : "CLP"}</span>
                                  <input
                                    type="text"
                                    className="text-center"
                                    disabled
                                    value={convertCurrency(
                                      tarea.cantidad > 0 
                                        ? (parseFloat(tarea.precio_total || 0) / parseFloat(tarea.cantidad || 1))
                                        : 0
                                    )}
                                    readOnly
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-2 border border-gray-400">
                                <input
                                  type="text"
                                  className={`text-center ${estaSuspendida(tarea) ? 'cursor-not-allowed' : ''}`}
                                  value={tarea.horas_hombre}
                                  disabled={[
                                    "supervisor",
                                    "ITO",
                                    "superintendente",
                                  ].includes(role) || estaSuspendida(tarea)}
                                  onChange={(e) =>
                                    !estaSuspendida(tarea) &&
                                    handleTareaChange(
                                      tarea.id,
                                      e.target.value,
                                      "horas_hombre",
                                    )
                                  }
                                  onKeyDown={(e) => 
                                    handleTareaKeyDown(
                                      e,
                                      tarea.id,
                                      e.target.value,
                                      "horas_hombre"
                                    )
                                  }
                                  onBlur={(e) => {
                                    if (!tarea.Task_Subtask?.length) {
                                      handleTareaBlur(
                                        tarea.id,
                                        e.target.value,
                                        "horas_hombre",
                                      );
                                    }
                                  }}
                                />
                              </td>
                              <td className="px-4 py-2 border border-gray-400">
                                <input
                                  type="text"
                                  className={`text-center ${estaSuspendida(tarea) ? 'cursor-not-allowed' : ''}`}
                                  value={tarea.horas_maquina}
                                  disabled={estaSuspendida(tarea)}
                                  onChange={(e) =>
                                    !estaSuspendida(tarea) &&
                                    handleTareaChange(
                                      tarea.id,
                                      e.target.value,
                                      "horas_maquina",
                                    )
                                  }
                                  onKeyDown={(e) => 
                                    handleTareaKeyDown(
                                      e,
                                      tarea.id,
                                      e.target.value,
                                      "horas_maquina"
                                    )
                                  }
                                  onBlur={(e) => {
                                    if (!tarea.Task_Subtask?.length) {
                                      handleTareaBlur(
                                        tarea.id,
                                        e.target.value,
                                        "horas_maquina",
                                      );
                                    }
                                  }}
                                />
                              </td>

                              <td className="px-4 py-2 border border-gray-400">
                                <input
                                  type="text"
                                  className={`text-center ${estaSuspendida(tarea) ? 'cursor-not-allowed' : ''}`}
                                  value={tarea.cantidad_normal}
                                  disabled={estaSuspendida(tarea)}
                                  onChange={(e) =>
                                    !estaSuspendida(tarea) &&
                                    handleTareaChange(
                                      tarea.id,
                                      e.target.value,
                                      "cantidad_normal",
                                    )
                                  }
                                  onKeyDown={(e) => 
                                    handleTareaKeyDown(
                                      e,
                                      tarea.id,
                                      e.target.value,
                                      "cantidad_normal"
                                    )
                                  }
                                  onBlur={(e) => {
                                    if (!tarea.Task_Subtask?.length) {
                                      handleTareaBlur(
                                        tarea.id,
                                        e.target.value,
                                        "cantidad_normal",
                                      );
                                    }
                                  }}
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
                                  onBlur={(e) =>
                                    handleTareaBlur(
                                      tarea.id,
                                      e.target.value,
                                      "cantidad_acumulada",
                                    )
                                  }
                                />
                              </td>

                              <td className="px-4 py-2 border border-gray-400">
                                {" "}
                                <input
                                  type="text"
                                  className={`text-center ${estaSuspendida(tarea) ? 'cursor-not-allowed' : ''}`}
                                  value={tarea.cantidad_parcial}
                                  disabled={estaSuspendida(tarea)}
                                  onChange={(e) =>
                                    !estaSuspendida(tarea) &&
                                    handleTareaChange(
                                      tarea.id,
                                      e.target.value,
                                      "cantidad_parcial",
                                    )
                                  }
                                  onKeyDown={(e) => 
                                    handleTareaKeyDown(
                                      e,
                                      tarea.id,
                                      e.target.value,
                                      "cantidad_parcial"
                                    )
                                  }
                                  onBlur={(e) => {
                                    if (!tarea.Task_Subtask?.length) {
                                      handleTareaBlur(
                                        tarea.id,
                                        e.target.value,
                                        "cantidad_parcial",
                                      );
                                    }
                                  }}
                                />
                              </td>

                              <td className="px-14 py-2 border border-gray-400">
                                <input
                                  type="text"
                                  disabled
                                  className="text-center"
                                  value={tarea.cantidad_parcial}
                                />
                              </td>

                                                              <td className="px-4 py-2 border border-gray-400">
                                  <div className="relative flex items-center">
                                    {(() => {
                                      const porcentajeData = formatearPorcentajeDisplay(tarea, 'subtarea');
                                      return (
                                        <>
                                          <input
                                            type="text"
                                            className={`text-right pr-4 max-w-24 ${
                                              porcentajeData.esAutomatico 
                                                ? 'bg-orange-50 border-orange-300 font-bold text-orange-700' 
                                                : 'bg-gray-50'
                                            }`}
                                            disabled
                                            value={porcentajeData.valor}
                                            title={porcentajeData.tooltip}
                                            onChange={(e) =>
                                              handleSubpartidaChange(
                                                tarea.id,
                                                e.target.value,
                                                "porcentaje",
                                              )
                                            }
                                            onBlur={(e) =>
                                              handleTareaBlur(
                                                tarea.id,
                                                e.target.value,
                                                "porcentaje",
                                              )
                                            }
                                          />
                                                                                     <span className={porcentajeData.esAutomatico ? 'text-orange-700 font-bold' : ''}>%</span>
                                        </>
                                      );
                                    })()}
                                  </div>
                                </td>

                              <td className="px-4 py-2 border border-gray-400">
                                <div className="relative flex items-center">
                                  <span className="ml-16">{currency === "USD" ? "USD" : "CLP"}</span>
                                  <input
                                    type="text"
                                    disabled={isBlockedRole || estaSuspendida(tarea)}
                                    className={`text-left ml-2 max-w-48 ${estaSuspendida(tarea) ? 'cursor-not-allowed' : ''}`}
                                    value={convertCurrency(tarea.precio_unit)}
                                    onChange={(e) =>
                                      !isBlockedRole && !estaSuspendida(tarea) &&
                                      handleTareaChange(
                                        tarea.id,
                                        e.target.value,
                                        "precio_unit",
                                      )
                                    }
                                    onKeyDown={(e) => 
                                      handleTareaKeyDown(
                                        e,
                                        tarea.id,
                                        e.target.value,
                                        "precio_unit"
                                      )
                                    }
                                    onBlur={(e) => {
                                      if (!isBlockedRole) {
                                        handleTareaBlur(
                                          tarea.id,
                                          e.target.value,
                                          "precio_unit",
                                        );
                                      }
                                    }}
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-2 border border-gray-400">
                                <div className="relative flex items-center">
                                  <span className="ml-16">{currency === "USD" ? "USD" : "CLP"}</span>
                                  <input
                                    type="text"
                                    disabled={isBlockedRole || estaSuspendida(tarea)}
                                    className={`text-left ml-2 max-w-48 ${estaSuspendida(tarea) ? 'cursor-not-allowed' : ''}`}
                                    value={convertCurrency(tarea.precio_total)}
                                    onChange={(e) =>
                                      !isBlockedRole && !estaSuspendida(tarea) &&
                                      handleTareaChange(
                                        tarea.id,
                                        e.target.value,
                                        "precio_total",
                                      )
                                    }
                                    onKeyDown={(e) => 
                                      handleTareaKeyDown(
                                        e,
                                        tarea.id,
                                        e.target.value,
                                        "precio_total"
                                      )
                                    }
                                    onBlur={(e) => {
                                      if (!isBlockedRole && !estaSuspendida(tarea)) {
                                        handleTareaBlur(
                                          tarea.id,
                                          e.target.value,
                                          "precio_total",
                                        );
                                      }
                                    }}
                                  />
                                </div>
                              </td>
                            </tr>

                            {/* TAREAS */}
                            {/* sb tareas  */}
                            {expandedTareasRows[tarea.id] &&
                              tarea.Task_Subtask.map(
                                (subtarea, subtareaIndex) => (
                                  <React.Fragment key={subtarea.id}>
                                    <tr>
                                      <td className="px-4 py-2 border border-gray-400">
                                        <div className="flex items-center">
                                          {index + 1}.{indexsub + 1}.
                                          {tareaIndex + 1}.{subtareaIndex + 1}
                                          <button
                                            onClick={() => {
                                              if (estaSuspendida(subtarea)) {
                                                showWarningToast(`No se puede editar materiales: ${getEstadoInfo(subtarea.id_EstadoTarea).nombre}`);
                                                return;
                                              }
                                              handleSpanClick(
                                                subtarea,
                                                "subtarea",
                                                index,
                                                indexsub,
                                                tareaIndex,
                                                subtareaIndex,
                                              );
                                            }}
                                            className={`ml-2 ${estaSuspendida(subtarea) ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'}`}
                                            type="button"
                                            disabled={estaSuspendida(subtarea)}
                                          >
                                            <Edit className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </td>
                                      {/* <AutoWidthInput type="text" className='text-center cursor-pointer' value={subtarea.nombre} readOnly /> */}

                                      <td className="px-4 py-2 border border-gray-400">
                                        <div className="flex items-center w-96">
                                          <span className={`mr-2 text-xs font-bold px-2 py-1 rounded estado-indicator ${getEstadoInfo(subtarea.id_EstadoTarea).clase}`} title={getEstadoInfo(subtarea.id_EstadoTarea).nombre}>
                                            {getEstadoInfo(subtarea.id_EstadoTarea).texto}
                                          </span>
                                          <ChevronRight
                                            strokeWidth={3}
                                            className={`w-8 h-8 transition-transform ${
                                              estaSuspendida(subtarea) 
                                                ? "cursor-not-allowed stroke-gray-400" 
                                                : "cursor-pointer stroke-purple-700 hover:stroke-purple-500 drop-shadow-lg neon-glow"
                                            }`}
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
                                          placeholder="Seleccione unidad"
                                          options={unidadOptions}
                                          isDisabled={[
                                            "supervisor",
                                            "ITO",
                                            "superintendente",
                                            "prevencionista",
                                          ].includes(role) || estaSuspendida(subtarea)}
                                          value={
                                            unidadOptions.find(
                                              (option) =>
                                                option.value ===
                                                subtarea.id_material,
                                            ) || null
                                          }
                                          onChange={(selectedOption) =>
                                            !estaSuspendida(subtarea) && handleSelectunidadsubtarea(
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
                                          menuPosition="fixed" // Esto asegura que el menú no se mueva con el scroll // Asegúrate de que el menú esté por encima de otros elementos
                                        />
                                      </td>
                                      <td className="px-4 py-2 border border-gray-400">
                                        <input
                                          type="text"
                                          className={`text-center ${estaSuspendida(subtarea) ? 'cursor-not-allowed' : ''}`}
                                          value={subtarea.cantidad}
                                          disabled={estaSuspendida(subtarea)}
                                          onChange={(e) =>
                                            !estaSuspendida(subtarea) &&
                                            handleSubTareaChange(
                                              subtarea.id_subtask,
                                              e.target.value,
                                              "cantidad",
                                            )
                                          }
                                          onKeyDown={(e) => 
                                            handleSubTareaKeyDown(
                                              e,
                                              subtarea.id_subtask,
                                              e.target.value,
                                              "cantidad_normal"
                                            )
                                          }
                                          onBlur={(e) =>
                                            handleSubTareaBlur(
                                              subtarea.id_subtask,
                                              e.target.value,
                                              "cantidad_normal",
                                            )
                                          }
                                        />
                                      </td>
                                      <td className="px-4 py-2 border border-gray-400">
                                        <div className="relative flex items-center">
                                          <span>{currency === "USD" ? "USD" : "CLP"}</span>
                                          <input
                                            type="text"
                                            className="text-center"
                                            disabled
                                            value={convertCurrency(
                                              subtarea.cantidad > 0 
                                                ? (parseFloat(subtarea.precio_total || 0) / parseFloat(subtarea.cantidad || 1))
                                                : 0
                                            )}
                                            readOnly
                                          />
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 border border-gray-400">
                                        <input
                                          type="text"
                                          className={`text-center ${estaSuspendida(subtarea) ? 'cursor-not-allowed' : ''}`}
                                          value={subtarea.horas_hombre}
                                          disabled={estaSuspendida(subtarea)}
                                          onChange={(e) =>
                                            !estaSuspendida(subtarea) &&
                                            handleSubTareaChange(
                                              subtarea.id_subtask,
                                              e.target.value,
                                              "horas_hombre",
                                            )
                                          }
                                          onKeyDown={(e) => 
                                            handleSubTareaKeyDown(
                                              e,
                                              subtarea.id_subtask,
                                              e.target.value,
                                              "horas_hombre"
                                            )
                                          }
                                          onBlur={(e) =>
                                            handleSubTareaBlur(
                                              subtarea.id_subtask,
                                              e.target.value,
                                              "horas_hombre",
                                            )
                                          }
                                        />
                                      </td>
                                      <td className="px-4 py-2 border border-gray-400">
                                        <input
                                          type="text"
                                          className={`text-center ${estaSuspendida(subtarea) ? 'cursor-not-allowed' : ''}`}
                                          value={subtarea.horas_maquina}
                                          disabled={estaSuspendida(subtarea)}
                                          onChange={(e) =>
                                            !estaSuspendida(subtarea) &&
                                            handleSubTareaChange(
                                              subtarea.id_subtask,
                                              e.target.value,
                                              "horas_maquina",
                                            )
                                          }
                                          onKeyDown={(e) => 
                                            handleSubTareaKeyDown(
                                              e,
                                              subtarea.id_subtask,
                                              e.target.value,
                                              "horas_maquina"
                                            )
                                          }
                                          onBlur={(e) =>
                                            handleSubTareaBlur(
                                              subtarea.id_subtask,
                                              e.target.value,
                                              "horas_maquina",
                                            )
                                          }
                                        />
                                      </td>

                                      <td className="px-4 py-2 border border-gray-400">
                                        <input
                                          type="text"
                                          className={`text-center ${estaSuspendida(subtarea) ? 'cursor-not-allowed' : ''}`}
                                          value={subtarea.cantidad_norma}
                                          disabled={estaSuspendida(subtarea)}
                                          onChange={(e) =>
                                            !estaSuspendida(subtarea) &&
                                            handleSubTareaChange(
                                              subtarea.id_subtask,
                                              e.target.value,
                                              "cantidad_norma",
                                            )
                                          }
                                          onKeyDown={(e) => 
                                            handleSubTareaKeyDown(
                                              e,
                                              subtarea.id_subtask,
                                              e.target.value,
                                              "cantidad_normal"
                                            )
                                          }
                                          onBlur={(e) =>
                                            handleSubTareaBlur(
                                              subtarea.id_subtask,
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
                                          value={subtarea.cantidad_acumu}
                                          onChange={(e) =>
                                            handleSubTareaChange(
                                              subtarea.id_subtask,
                                              e.target.value,
                                              "cantidad_acumu",
                                            )
                                          }
                                          onBlur={(e) =>
                                            handleSubTareaBlur(
                                              subtarea.id_subtask,
                                              e.target.value,
                                              "cantidad_acumu",
                                            )
                                          }
                                        />
                                      </td>

                                      <td className="px-4 py-2 border border-gray-400">
                                        <input
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
                                          onKeyDown={(e) => 
                                            handleSubTareaKeyDown(
                                              e,
                                              subtarea.id_subtask,
                                              e.target.value,
                                              "cantidad_parcial"
                                            )
                                          }
                                          onBlur={(e) =>
                                            handleSubTareaBlur(
                                              subtarea.id_subtask,
                                              e.target.value,
                                              "cantidad_parcial",
                                            )
                                          }
                                        />
                                      </td>
                                      <td className="px-14 py-2 border border-gray-400">
                                        <input
                                          type="text"
                                          disabled
                                          className="text-center"
                                          value={subtarea.cantidad_parci}
                                        />
                                      </td>

                                                                              <td className="px-4 py-2 border border-gray-400">
                                          <div className="relative flex items-center">
                                            {/* Las subtareas siempre usan porcentaje manual ya que son el nivel más bajo */}
                                            <input
                                              type="text"
                                              className="text-right pr-4 max-w-24 bg-gray-50"
                                              disabled
                                              value={subtarea.porcentaje}
                                              title="Porcentaje manual basado en cantidad ejecutada"
                                              onChange={(e) =>
                                                handleSubTareaChange(
                                                  subtarea.id_subtask,
                                                  e.target.value,
                                                  "porcentaje",
                                                )
                                              }
                                              onBlur={(e) =>
                                                handleSubTareaBlur(
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
                                          <span className="ml-16">{currency === "USD" ? "USD" : "CLP"}</span>
                                          <input
                                            type="text"
                                            className="text-left ml-2 max-w-48"
                                            disabled={isBlockedRole}
                                            value={convertCurrency(subtarea.precio_unit)}
                                            onChange={(e) =>
                                              !isBlockedRole &&
                                              handleSubTareaChange(
                                                subtarea.id_subtask,
                                                e.target.value,
                                                "precio_unit",
                                              )
                                            }
                                            onKeyDown={(e) => 
                                              handleSubTareaKeyDown(
                                                e,
                                                subtarea.id_subtask,
                                                e.target.value,
                                                "precio_unit"
                                              )
                                            }
                                            onBlur={(e) => {
                                              if (!isBlockedRole) {
                                                handleSubTareaBlur(
                                                  subtarea.id_subtask,
                                                  e.target.value,
                                                  "precio_unit",
                                                );
                                              }
                                            }}
                                          />
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 border border-gray-400">
                                        <div className="relative flex items-center">
                                          <span className="ml-16">{currency === "USD" ? "USD" : "CLP"}</span>
                                          <input
                                            type="text"
                                            className="text-left ml-2 max-w-48"
                                            disabled={isBlockedRole}
                                            value={convertCurrency(subtarea.precio_total)}
                                            onChange={(e) =>
                                              !isBlockedRole &&
                                              handleSubTareaChange(
                                                subtarea.id_subtask,
                                                e.target.value,
                                                "precio_total",
                                              )
                                            }
                                            onKeyDown={(e) => 
                                              handleSubTareaKeyDown(
                                                e,
                                                subtarea.id_subtask,
                                                e.target.value,
                                                "precio_total"
                                              )
                                            }
                                            onBlur={(e) => {
                                              if (!isBlockedRole) {
                                                handleSubTareaBlur(
                                                  subtarea.id_subtask,
                                                  e.target.value,
                                                  "precio_total",
                                                );
                                              }
                                            }}
                                          />
                                        </div>
                                      </td>
                                    </tr>

                                    {/* sb tareas  */}
                                  </React.Fragment>
                                ),
                              )}
                          </React.Fragment>
                        ))}
                    </React.Fragment>
                  ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        
        {/* TOOLTIP MOVIDO FUERA DE LA TABLA PARA EVITAR WARNING HTML */}
        <Tooltip
          id="tooltip"
          place="top"
          style={{
            zIndex: 9999,
            backgroundColor: "white",
            color: "black",
            padding: "8px 12px",
            borderRadius: "4px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            fontSize: "14px",
          }}
        />

        {/* Modal de confirmación personalizado */}
        {showConfirmModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              {/* Header del modal con fondo de advertencia */}
              <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-200 rounded-t-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-yellow-600 text-lg">⚠️</span>
                    </div>
                  </div>
                                     <div className="ml-3">
                     <h3 className="text-lg font-semibold text-yellow-800">
                       ADVERTENCIA: PRESUPUESTO EXCEDIDO
                     </h3>
                     <p className="text-sm text-yellow-600 mt-1">
                       {confirmModalData.title}
                     </p>
                   </div>
                </div>
              </div>

              {/* Contenido del modal */}
              <div className="px-6 py-4">
                <div className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
                  {confirmModalData.message}
                </div>
              </div>

              {/* Footer del modal */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3 rounded-b-lg">
                <button
                  onClick={confirmModalData.onCancel}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors duration-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmModalData.onConfirm}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors duration-200 font-medium"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Botones flotantes para depuración */}
        <div className="fixed bottom-4 left-4 z-40">
          <button
            onClick={() => setIsDebugEnabled(!isDebugEnabled)}
            className={`rounded-full w-12 h-12 text-white font-bold shadow-lg transition-all duration-200 ${
              isDebugEnabled 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-gray-500 hover:bg-gray-600'
            }`}
            title={isDebugEnabled ? "Depuración Activada" : "Depuración Desactivada"}
          >
            🐛
          </button>
          {isDebugEnabled && (
            <button
              onClick={toggleDebugModal}
              className="ml-2 rounded-full w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white font-bold shadow-lg transition-all duration-200"
              title="Ver Logs de Depuración"
            >
              📋
            </button>
          )}
        </div>

        {/* Modal de depuración */}
        {showDebugModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
              {/* Header del modal */}
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  🐛 Depuración de Carta Gantt
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {debugLogs.length} logs
                  </span>
                  <button
                    onClick={clearDebugLogs}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors"
                  >
                    Limpiar
                  </button>
                  <button
                    onClick={toggleDebugModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Contenido del modal */}
              <div className="flex-1 overflow-auto p-6">
                {debugLogs.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>No hay logs de depuración disponibles.</p>
                    <p className="text-sm mt-2">Realiza alguna acción en la carta Gantt para ver los logs.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {debugLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-3 rounded-lg border-l-4 ${
                          log.type === 'success' 
                            ? 'bg-green-50 border-green-400' 
                            : log.type === 'error'
                            ? 'bg-red-50 border-red-400'
                            : 'bg-blue-50 border-blue-400'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className={`font-medium ${
                              log.type === 'success' 
                                ? 'text-green-800' 
                                : log.type === 'error'
                                ? 'text-red-800'
                                : 'text-blue-800'
                            }`}>
                              {log.message}
                            </p>
                            {log.data && (
                              <details className="mt-2">
                                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                                  Ver datos
                                </summary>
                                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                                  {JSON.stringify(log.data, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 ml-3">
                            {log.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer del modal */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Mostrando los últimos 20 logs
                </div>
                <button
                  onClick={toggleDebugModal}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        <Hidebyrol
          hiddenRoles={[
            "supervisor",
            "ITO",
            "superintendente",
            "prevencionista",
          ]}
        >
          <div className="flex justify-end">
            {showModal && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="bg-white p-4 rounded-md shadow-md font-zen-kaku">
                  <p className="text-black">
                    ¿Estás seguro de que deseas insertar todos los datos?
                  </p>
                  <p className="text-black">
                    Se insertarán los datos con la fecha de {getCurrentDate()}
                  </p>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleCancelInsert}
                      className="rounded-md bg-teal-500 hover:bg-teal-600 px-4 py-2 text-white transition-all ease-linear duration-150 mr-2"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmInsert}
                      className="rounded-md bg-teal-500 hover:bg-teal-600 px-4 py-2 text-white transition-all ease-linear duration-150"
                    >
                      Aceptar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Hidebyrol>
      </div>
    );
  },
);

export default Treesuma;
