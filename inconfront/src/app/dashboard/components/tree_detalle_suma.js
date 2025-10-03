import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { getComponentes } from "@/app/services/componente";
import {
  updateMaterial,
  getproyectbysubtarea,
  updatematerialbyid,
  unidadlist,
  updateSubtarea,
  updatePartida,
  updatesubPartida,
  updateTarea,
  getPartidasByProjectStd,
  deleteMaterial,
} from "@/app/services/project";
import toast from "react-hot-toast";
import Select from "react-select";
import { useSelector } from "react-redux";
import "../style/sololectura.css";
import { Info, Trash2 } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { getPrimaryRole } from "@/app/utils/roleUtils";

/**
 * Modal de confirmación reutilizable, usando React Portal para asegurar que
 * siempre se muestre centrado y sobre toda la pantalla, sin importar el layout del componente padre.
 * Se usa para confirmar acciones críticas como eliminar materiales.
 */
const ConfirmModal = ({ open, mensaje, onConfirm, onCancel }) => {
  if (!open) return null;
  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2147483647,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "2.5rem 2rem",
          borderRadius: "1rem",
          minWidth: 340,
          maxWidth: "90vw",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <p
          style={{
            marginBottom: 32,
            color: "#222",
            fontSize: 20,
            fontWeight: 600,
          }}
        >
          {mensaje ? mensaje : "¿Estás seguro que quieres continuar?"}
        </p>
        
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "10px 28px",
              background: "#e5e7eb",
              color: "#222",
              border: "none",
              borderRadius: 8,
              fontWeight: "bold",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: "10px 28px",
              background:
                mensaje && mensaje.toLowerCase().includes("eliminar")
                  ? "#e11d48"
                  : "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: "bold",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            {mensaje && mensaje.toLowerCase().includes("eliminar")
              ? "Eliminar"
              : "Guardar"}
          </button>
        </div>
      </div>
    </div>,
    typeof window !== "undefined" ? document.body : null,
  );
};

const Treedetallesuma = ({ id, idKey, Hidebyrol, id_proyecto }) => {
  console.log(id);
  console.log(idKey);
  console.log(id_proyecto);

  const [componentes, setComponentes] = useState([]);
  // Estado local para la moneda por componente
  const [currencyByComponent, setCurrencyByComponent] = useState({});
  const userStore = useSelector((state) => state.user);
  const role = getPrimaryRole(userStore.user);

  // Estados para confirmación de eliminación
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null); // { componenteId, materialId, materialName }

  // Conversión simple, puedes reemplazar por tu lógica real
  const CLPtoUSD = (clp) => {
    const rate = 900; // Valor de ejemplo, reemplaza por el real si tienes uno dinámico
    return (parseFloat(clp) / rate).toFixed(2);
  };
  const USDToCLP = (usd) => {
    const rate = 900;
    return Math.round(parseFloat(usd) * rate);
  };

  useEffect(() => {
    const fetchComponentes = async () => {
      const componentesRes = await getComponentes(id, idKey);
      console.log(componentesRes);
      setComponentes(componentesRes.data);
    };

    fetchComponentes();
  }, [id, idKey]);

  const handleInputChange = (componenteId, materialId, field, value) => {
    const updatedData = componentes.map((componente) => {
      if (componente.id_componente === componenteId) {
        const updatedMaterials = componente.material_componente.map(
          (material) => {
            if (material.id_Material === materialId) {
              const updatedMaterial = { ...material, [field]: value };

              // Calcular el precio total si los campos relevantes cambian
              if (
                field === "cantidad" ||
                field === "valor_unitario" ||
                field === "valor_neto"
              ) {
                // cantidad × valor_neto × valor_unitario
                // Para materiales normales: cantidad × rendimiento × precio_unitario
                updatedMaterial.valor_total =
                  updatedMaterial.cantidad *
                  updatedMaterial.valor_neto *
                  updatedMaterial.valor_unitario;
                updatedMaterial.valor_total = parseFloat(
                  updatedMaterial.valor_total.toFixed(2),
                );
              }

              // Realizar cálculo específico para componente ID 5 equipos y maquinarias
              if (
                componente.Nombre === "Equipos y Maquinarias" &&
                (field === "cantidad" ||
                  field === "valor_neto" ||
                  field === "utilizacion" ||
                  field === "valor_unitario")
              ) {
                //  cantidad × precio_unitario × (utilización/100)
                const utilizacionPorcentaje = updatedMaterial.utilizacion / 100;
                const valorTotal =
                  updatedMaterial.cantidad *
                  updatedMaterial.valor_unitario *
                  utilizacionPorcentaje;
                updatedMaterial.valor_total = parseFloat(valorTotal.toFixed(2));
              }
              // Realizar cálculo específico para componente ID 2 herramientas y fundibles
              if (
                componente.Nombre === "Herramientas y fungiles" &&
                (field === "cantidad" ||
                  field === "valor_neto" ||
                  field === "perdida" ||
                  field === "valor_unitario")
              ) {
                // cantidad × precio_unitario × (perdida/100)
                const perdidaPorcentaje = updatedMaterial.perdida / 100;
                const valorTotal =
                  updatedMaterial.cantidad *
                  updatedMaterial.valor_unitario *
                  perdidaPorcentaje;
                updatedMaterial.valor_total = parseFloat(valorTotal.toFixed(2));
              }

              // Realizar cálculo específico para componente ID 4 OTROS
              if (
                componente.Nombre === "Otros" &&
                (field === "cantidad" ||
                  field === "valor_neto" ||
                  field === "perdidas" ||
                  field === "valor_unitario")
              ) {
                // 🔧 CÁLCULO CORREGIDO: cantidad × precio_unitario × (perdidas/100)
                const perdidasPorcentaje = updatedMaterial.perdidas / 100;
                const valorTotal =
                  updatedMaterial.cantidad *
                  updatedMaterial.valor_unitario *
                  perdidasPorcentaje;
                updatedMaterial.valor_total = parseFloat(valorTotal.toFixed(2));
              }

              return updatedMaterial;
            }
            return material;
          },
        );
        return { ...componente, material_componente: updatedMaterials };
      }
      return componente;
    });

    setComponentes(updatedData);
  };

  // Manejador de eventos para la tecla Enter
  const handleInputKeyDown = (e, componenteId, materialId, field, value) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInputBlur(componenteId, materialId, field, value);
      e.target.blur(); // Quitar el foco del campo
    }
  };

  // Actualizar componentes y niveles
  // actualizar componentes y niveles
  const handleInputBlur = async (componenteId, materialId, field, value) => {
    try {
      const componenteToUpdate = componentes.find(
        (componente) => componente.id_componente === componenteId,
      );
      if (!componenteToUpdate) return;

      const materialToUpdate = componenteToUpdate.material_componente.find(
        (material) => material.id_Material === materialId,
      );
      if (!materialToUpdate) return;

      const overallSums = calculateOverallSums(componentes);

      const materialUpdateData = {
        nombre_Material: materialToUpdate.nombre_Material,
        cantidad: materialToUpdate.cantidad,
        valor_neto: materialToUpdate.valor_neto,
        valor_unitario: materialToUpdate.valor_unitario,
        valor_total: materialToUpdate.valor_total,
        id_componente: componenteToUpdate.id_componente,
        [idKey]: id,
        projectId: id_proyecto,
        valor_bruto: "0",
        id_tipomaterial: "1",
        id_organizacion: "1",
        id_unidad: materialToUpdate.id_unidad || "10", // Usar "personalizado" como fallback
        utilizacion: materialToUpdate.utilizacion || 0,
        perdida: materialToUpdate.perdida || 0,
        perdidas: materialToUpdate.perdidas || 0,
      };

      const materialUpdatesubtask = { 
        precio_unit: overallSums.valor_total,
        horas_hombre: overallSums.horas_hombre,
        horas_maquina: overallSums.horas_maquina
      };

      // Actualizar material
      await updatematerialbyid(materialId, materialUpdateData);
      console.log("Material actualizado manteniendo unidad:", {
        materialId,
        unidad_conservada: materialToUpdate.id_unidad,
        campo_editado: field
      });
      showToastSafely("Material actualizado correctamente");

      // Decidir el nivel a actualizar
      let updatedData = await getPartidasByProjectStd(id_proyecto);

      if (idKey === "id_task") {
        // Actualizar tareas y niveles superiores
        await processAndUpdateTareas(updatedData);
        updatedData = await getPartidasByProjectStd(id_proyecto);
        await processAndUpdateSubpartidas(updatedData);
        updatedData = await getPartidasByProjectStd(id_proyecto);
        await processAndUpdatePartidas(updatedData);
      } else if (idKey === "id_subpartida") {
        // Actualizar subpartidas y niveles superiores
        await processAndUpdateSubpartidas(updatedData);
        updatedData = await getPartidasByProjectStd(id_proyecto);
        await processAndUpdatePartidas(updatedData);
      } else if (idKey === "id_partida") {
        // Actualizar partidas directamente
        await processAndUpdatePartidas(updatedData);
      } else {
        // Si viene de una subtarea o no especificado, actualizar todo
        await updateSubtarea(id, materialUpdatesubtask);
        console.log(
          "Subtarea actualizada con precio_unit:",
          materialUpdatesubtask,
        );
        updatedData = await getPartidasByProjectStd(id_proyecto);
        await processAndUpdateSubtareas(updatedData, id);
        updatedData = await getPartidasByProjectStd(id_proyecto);
        await processAndUpdateTareas(updatedData);
        updatedData = await getPartidasByProjectStd(id_proyecto);
        await processAndUpdateSubpartidas(updatedData);
        updatedData = await getPartidasByProjectStd(id_proyecto);
        await processAndUpdatePartidas(updatedData);
      }

      // toast.success("Actualización completada correctamente"); // Comentado para evitar duplicados
    } catch (error) {
      console.error("Error durante la actualización:", error);
      toast.error("Error al actualizar los datos.");
    }
  };

  // Función para extraer subtareas
  const extractSubtareas = (data) => {
    return data
      .flatMap((partida) => partida.subpartida_partida || [])
      .flatMap((subpartida) => subpartida.subpartida_tarea || [])
      .flatMap((tarea) => tarea.Task_Subtask || []);
  };

  // Función para extraer subpartidas
  const extractSubpartidas = (data) => {
    return data.flatMap((partida) => partida.subpartida_partida || []);
  };

  // Función para actualizar subtareas
  const processAndUpdateSubtareas = async (updatedData, subtareaId) => {
    const subtareas = extractSubtareas(updatedData);

    const subtareaToUpdate = subtareas.find(
      (subtarea) => subtarea.id_subtask === subtareaId,
    );
    if (subtareaToUpdate) {
      const { precio_unit, cantidad } = subtareaToUpdate;
      const totalPrecioSubtarea =
        parseFloat(precio_unit || 0) * parseFloat(cantidad || 0);
      await updateSubtarea(subtareaId, { precio_total: totalPrecioSubtarea });
      console.log(
        `Subtarea específica actualizada (ID: ${subtareaId}):`,
        totalPrecioSubtarea,
      );
    }

    const subtareasActualizadas = subtareas.reduce((acc, subtarea) => {
      const { id_subtask, precio_unit, cantidad } = subtarea;
      acc[id_subtask] = {
        precio_total: parseFloat(precio_unit || 0) * parseFloat(cantidad || 0),
      };
      return acc;
    }, {});

    await Promise.all(
      Object.entries(subtareasActualizadas).map(([id, data]) =>
        updateSubtarea(id, data),
      ),
    );
    console.log("Subtareas actualizadas");
  };

  // Función para actualizar tareas
  const processAndUpdateTareas = async (updatedData) => {
    const tareasActualizadas = {};

    updatedData.forEach((partida) => {
      partida.subpartida_partida?.forEach((subpartida) => {
        subpartida.subpartida_tarea?.forEach((tarea) => {
          // Inicializar totales
          tareasActualizadas[tarea.id] = tareasActualizadas[tarea.id] || {
            precio_unit: 0,
            precio_total: 0,
            horas_hombre: 0,
            horas_maquina: 0,
          };

          // Acumular valores de subtareas
          tarea.Task_Subtask?.forEach((subtarea) => {
            tareasActualizadas[tarea.id].precio_unit += parseFloat(
              subtarea.precio_unit || 0,
            );
            tareasActualizadas[tarea.id].precio_total += parseFloat(
              subtarea.precio_total || 0,
            );
            tareasActualizadas[tarea.id].horas_hombre += parseFloat(
              subtarea.horas_hombre || 0,
            );
            tareasActualizadas[tarea.id].horas_maquina += parseFloat(
              subtarea.horas_maquina || 0,
            );
          });

          // Acumular valores de task_material (materiales directos de la tarea)
          tarea.task_material?.forEach((material) => {
            tareasActualizadas[tarea.id].precio_unit += parseFloat(
              material.valor_unitari || 0,
            ); // Ajuste aquí
            tareasActualizadas[tarea.id].precio_total += parseFloat(
              material.valor_total || 0,
            );
            
            //  Calcular HH y HM desde materiales directos de tarea
            // Buscar la unidad del material
            const unidadMaterial = unidadOptions.find(unidad => unidad.value === material.id_unidad);
            const esUnidadHora = unidadMaterial && unidadMaterial.label.toLowerCase().includes('hora');
            
            // Obtener el componente del material para determinar si es Mano de Obra o Equipos
            if (material.id_componente === 1 && esUnidadHora) {
              // Componente 1 = Mano de Obra
              tareasActualizadas[tarea.id].horas_hombre += parseFloat(material.cantidad || 0);
            }
            
            if (material.id_componente === 3 && esUnidadHora) {
              // Componente 3 = Equipos y Maquinarias (CORREGIDO: era 5, ahora es 3)
              tareasActualizadas[tarea.id].horas_maquina += parseFloat(material.cantidad || 0);
            }
          });
        });
      });
    });

    // Actualizar las tareas en la base de datos
    await Promise.all(
      Object.entries(tareasActualizadas).map(([id_task, data]) =>
        updateTarea(id_task, data),
      ),
    );
  };

  // Función para actualizar subpartidas
  const processAndUpdateSubpartidas = async (updatedData) => {
    const subpartidasActualizadas = {};

    updatedData.forEach((partida) => {
      partida.subpartida_partida?.forEach((subpartida) => {
        const {
          id_subpartida,
          subpartida_tarea = [],
          subpartida_material = [],
        } = subpartida;

        // Inicializar totales
        subpartidasActualizadas[id_subpartida] = subpartidasActualizadas[
          id_subpartida
        ] || {
          precio_unit: 0,
          precio_total: 0,
          horas_hombre: 0,
          horas_maquina: 0,
        };

        // 1. Acumular valores de tareas
        subpartida_tarea?.forEach((tarea) => {
          subpartidasActualizadas[id_subpartida].precio_unit += parseFloat(
            tarea.precio_unit || 0,
          );
          subpartidasActualizadas[id_subpartida].precio_total += parseFloat(
            tarea.precio_total || 0,
          );
          subpartidasActualizadas[id_subpartida].horas_hombre += parseFloat(
            tarea.horas_hombre || 0,
          );
          subpartidasActualizadas[id_subpartida].horas_maquina += parseFloat(
            tarea.horas_maquina || 0,
          );
        });

        // 2. Acumular valores de materiales directos
        subpartida_material?.forEach((material) => {
          subpartidasActualizadas[id_subpartida].precio_unit += parseFloat(
            material.valor_unitario || 0,
          );
          subpartidasActualizadas[id_subpartida].precio_total += parseFloat(
            material.valor_total || 0,
          );
          
          // Calcular HH y HM desde materiales directos
          // Buscar la unidad del material
          const unidadMaterial = unidadOptions.find(unidad => unidad.value === material.id_unidad);
          const esUnidadHora = unidadMaterial && unidadMaterial.label.toLowerCase().includes('hora');
          
          // Obtener el componente del material para determinar si es Mano de Obra o Equipos
          if (material.id_componente === 1 && esUnidadHora) {
            // Componente 1 = Mano de Obra
            subpartidasActualizadas[id_subpartida].horas_hombre += parseFloat(material.cantidad || 0);
          }
          
                  if (material.id_componente === 3 && esUnidadHora) {
          // Componente 3 = Equipos y Maquinarias (CORREGIDO: era 5, ahora es 3)
          subpartidasActualizadas[id_subpartida].horas_maquina += parseFloat(material.cantidad || 0);
        }
        });

        // Log intermedio para verificar acumulación
        console.log(
          `Totales acumulados en subpartida ID ${id_subpartida}:`,
          subpartidasActualizadas[id_subpartida],
        );
      });
    });

    // Actualizar las subpartidas en la base de datos
    await Promise.all(
      Object.entries(subpartidasActualizadas).map(([id_subpartida, data]) =>
        updatesubPartida(id_subpartida, data),
      ),
    );

  };

  // Función para actualizar partidas
  const processAndUpdatePartidas = async (updatedData) => {
    const partidasActualizadas = {};

    updatedData.forEach((partida) => {
      const {
        id_partida,
        subpartida_partida = [],
        partida_material = [],
      } = partida;

      // Inicializar totales
      partidasActualizadas[id_partida] = partidasActualizadas[id_partida] || {
        precio_unit: 0,
        precio_total: 0,
        horas_hombre: 0,
        horas_maquina: 0,
      };

      // 1. Acumular valores de subpartidas
      subpartida_partida?.forEach((subpartida) => {
        partidasActualizadas[id_partida].precio_unit += parseFloat(
          subpartida.precio_unit || 0,
        );
        partidasActualizadas[id_partida].precio_total += parseFloat(
          subpartida.precio_total || 0,
        );
        partidasActualizadas[id_partida].horas_hombre += parseFloat(
          subpartida.horas_hombre || 0,
        );
        partidasActualizadas[id_partida].horas_maquina += parseFloat(
          subpartida.horas_maquina || 0,
        );
      });

      // 2. Acumular valores de materiales directos de la partida
      partida_material?.forEach((material) => {
        partidasActualizadas[id_partida].precio_unit += parseFloat(
          material.valor_unitario || 0,
        );
        partidasActualizadas[id_partida].precio_total += parseFloat(
          material.valor_total || 0,
        );
        
        // NUEVO: Calcular HH y HM desde materiales directos de partida
        // Buscar la unidad del material
        const unidadMaterial = unidadOptions.find(unidad => unidad.value === material.id_unidad);
        const esUnidadHora = unidadMaterial && unidadMaterial.label.toLowerCase().includes('hora');
        
        // Obtener el componente del material para determinar si es Mano de Obra o Equipos
        if (material.id_componente === 1 && esUnidadHora) {
          // Componente 1 = Mano de Obra
          partidasActualizadas[id_partida].horas_hombre += parseFloat(material.cantidad || 0);
        }
        
        if (material.id_componente === 3 && esUnidadHora) {
          // Componente 3 = Equipos y Maquinarias (CORREGIDO: era 5, ahora es 3)
          partidasActualizadas[id_partida].horas_maquina += parseFloat(material.cantidad || 0);
        }
      });

      // Log intermedio para verificar acumulación
      console.log(
        `Totales acumulados en partida ID ${id_partida}:`,
        partidasActualizadas[id_partida],
      );
    });

    // Actualizar las partidas en la base de datos
    await Promise.all(
      Object.entries(partidasActualizadas).map(([id_partida, data]) =>
        updatePartida(id_partida, data),
      ),
    );

    console.log(
      "Partidas actualizadas correctamente con HH, HM, precio_unit y materiales directos.",
    );
  };

  const handleAddRow = async (componenteId) => {
    let newMaterial = {
      nombre_Material: "",
      cantidad: 0,
      descripcion: "",
      valor_unitario: 0,
      valor_neto: 0,
      valor_bruto: 0,
      valor_total: 0,
      id_tipomaterial: 1,
      id_organizacion: 1,
      [idKey]: id,
      id_proyecto: id_proyecto,
      id_unidad: 10, //CAMBIO: Usar "personalizado" en lugar de "Metro (m)"
      id_componente: componenteId,
    };

    if (componenteId === 5) {
      newMaterial = {
        ...newMaterial,
        utilizacion: 0,
        perdida: 0,
        perdidas: 0,
      };
    }
    if (componenteId === 2) {
      newMaterial = {
        ...newMaterial,
        utilizacion: 0,
        perdida: 0,
        perdidas: 0,
      };
    }
    if (componenteId === 4) {
      newMaterial = {
        ...newMaterial,
        utilizacion: 0,
        perdida: 0,
        perdidas: 0,
      };
    }

    try {
      // Llama a updateMaterial con los datos de newMaterial
      const response = await updateMaterial(newMaterial);
      toast.success("Fila creada correctamente");
      console.log("Fila creado:", response);

      // Actualiza localmente el estado solo después de que la operación haya tenido éxito
      const updatedData = componentes.map((componente) => {
        if (componente.id_componente === componenteId) {
          return {
            ...componente,
            material_componente: [
              ...componente.material_componente,
              response.data,
            ],
          };
        }
        return componente;
      });

      setComponentes(updatedData);
    } catch (error) {
      console.error("Error al crear la fila:", error);
      toast.error("Error al crear la fila");
    }
  };

  const handleDeleteRow = (componenteId, materialId, materialName) => {
    // Guardar la información del material a eliminar y mostrar el modal
    setPendingDelete({ componenteId, materialId, materialName });
    setShowConfirm(true);
  };

  // Función para confirmar la eliminación desde el modal
  const handleConfirmDelete = async () => {
    if (!pendingDelete) {
      console.warn("handleConfirmDelete: No hay pendingDelete.");
      return;
    }

    const { componenteId, materialId, materialName } = pendingDelete;

    try {
      // Llamar al servicio para eliminar el material
      const response = await deleteMaterial(materialId);
      
      if (response.statusCode === 200) {
        toast.success("Material eliminado correctamente");
        
        // Actualizar el estado local removiendo el material eliminado
        const updatedData = componentes.map((componente) => {
          if (componente.id_componente === componenteId) {
            return {
              ...componente,
              material_componente: componente.material_componente.filter(
                (material) => material.id_Material !== materialId
              ),
            };
          }
          return componente;
        });

        setComponentes(updatedData);
      } else {
        toast.error("Error al eliminar el material");
      }
    } catch (error) {
      console.error("Error al eliminar el material:", error);
      toast.error("Error al eliminar el material");
    } finally {
      // Siempre se ejecuta, para limpiar el estado del modal
      setShowConfirm(false);
      setPendingDelete(null);
    }
  };

  // Función para cancelar la eliminación
  const handleCancelDelete = () => {
    setShowConfirm(false);
    setPendingDelete(null);
  };

  const calculateSums = (componente) => {
    // console.log('aaaaa', componente);
    const sums = {
      valor_total: 0,
    };

    componente.material_componente.forEach((material) => {
      sums.valor_total += Number(material.valor_total) || 0;
    });
    sums.valor_total = Math.round(sums.valor_total);

    return sums;
  };

  const calculateOverallSums = (componentes) => {
    const overallSums = {
      cantidad: 0,
      valor_neto: 0,
      valor_unitario: 0,
      valor_total: 0,
      utilizacion: 0,
      perdida: 0,
      perdidas: 0,
      horas_hombre: 0,
      horas_maquina: 0,
    };

    componentes.forEach((componente) => {
      componente.material_componente.forEach((material) => {
        overallSums.cantidad += Number(material.cantidad) || 0;
        overallSums.valor_neto += Number(material.valor_neto) || 0;
        overallSums.valor_unitario += Number(material.valor_unitario) || 0;
        overallSums.valor_total += Number(material.valor_total) || 0;

        // LÓGICA CON VALIDACIÓN DE UNIDAD: Solo contar horas cuando la unidad sea "Hora (h)"
        
        // Buscar la unidad del material
        const unidadMaterial = unidadOptions.find(unidad => unidad.value === material.id_unidad);
        const esUnidadHora = unidadMaterial && unidadMaterial.label.toLowerCase().includes('hora');
        
        if (componente.Nombre === "Mano de Obra" && esUnidadHora) {
          // Para Mano de Obra: solo contar si la unidad es "Hora (h)"
          overallSums.horas_hombre += Number(material.cantidad) || 0;
        }
        
        if (componente.Nombre === "Equipos y Maquinarias" && esUnidadHora) {
          // Para Equipos y Maquinarias: solo contar si la unidad es "Hora (h)"
          overallSums.horas_maquina += Number(material.cantidad) || 0;
        }
      });
    });
    overallSums.valor_total = Math.round(overallSums.valor_total);
    overallSums.horas_hombre = parseFloat(overallSums.horas_hombre.toFixed(2));
    overallSums.horas_maquina = parseFloat(overallSums.horas_maquina.toFixed(2));
    return overallSums;
  };

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

  const handleSelectChange = async (
    selectedOption,
    componenteId,
    materialId,
  ) => {
    const updatedComponentes = componentes.map((componente) => {
      if (componente.id_componente === componenteId) {
        const updatedMaterials = componente.material_componente.map(
          (material) => {
            if (material.id_Material === materialId) {
              const updatedMaterial = {
                ...material,
                id_unidad: selectedOption ? selectedOption.value : null,
              };

              return updatedMaterial;
            }
            return material;
          },
        );
        return { ...componente, material_componente: updatedMaterials };
      }
      return componente;
    });

    setComponentes(updatedComponentes);

    // Obtener el material actualizado
    const componenteToUpdate = updatedComponentes.find(
      (componente) => componente.id_componente === componenteId,
    );
    const materialToUpdate = componenteToUpdate.material_componente.find(
      (material) => material.id_Material === materialId,
    );

    if (!materialToUpdate) {
      throw new Error("Material no encontrado para actualizar");
    }

    const materialSUpdate = {
      cantidad: materialToUpdate.cantidad || "0",
      valor_unitario: materialToUpdate.valor_unitario || "0",
      valor_total: materialToUpdate.valor_total || "0",
      id_unidad: materialToUpdate.id_unidad || null,
      id_componente: componenteToUpdate.id_componente,
      [idKey]: id,
      projectId: id_proyecto,
    };

    try {
      const response = await updatematerialbyid(materialId, materialSUpdate);
      showToastSafely("Unidad actualizada correctamente");
      console.log("Unidad actualizada:", {
        materialId,
        nuevaUnidad: selectedOption?.label,
        id_unidad: selectedOption?.value,
        response
      });
    } catch (error) {
      console.error("Error updating unidad:", error);
    }
  };

  const tableClassName = ["supervisor", "ITO"].includes(role)
    ? "table-auto w-full border-collapse border border-gray-400 font-zen-kaku mb-14 supervisor-mode"
    : "table-auto w-full border-collapse border border-gray-400 font-zen-kaku mb-14";

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
        shouldBlock = true;
      }
    }
    
    if (!shouldBlock) {      
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
    <div className="p-4 select-none font-zen-kaku w-full">
      {componentes.map((componente) => {
        const sums = calculateSums(componente);
        const tieneId1 = componente.Nombre === "Equipos y Maquinarias";
        const tieneId2 = componente.Nombre === "Herramientas y fungiles";
        const tieneId3 = componente.Nombre === "Otros";
        const moneda = currencyByComponent[componente.id_componente] || "CLP";

        return (
          <div className="mb-10" key={componente?.id_componente}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-lg">{componente?.Nombre}</h2>
              {/* Selector de moneda local para cada tabla */}
              <div>
                <label className="mr-2 font-semibold">Moneda:</label>
                <select
                  value={moneda}
                  onChange={(e) =>
                    setCurrencyByComponent({
                      ...currencyByComponent,
                      [componente.id_componente]: e.target.value,
                    })
                  }
                  className="border rounded px-2 py-1"
                >
                  <option value="CLP">CLP</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto w-full">
              <table
                className={`table-auto w-full border-collapse border border-gray-400 font-zen-kaku mb-14 ${
                  ["supervisor", "ITO"].includes(role) ? "supervisor-mode" : ""
                }`}
              >
                <thead style={{ backgroundColor: "#5C7891", color: "white" }}>
                  <tr>
                    <th className="px-2 py-2 border border-gray-400">
                      <div className="flex items-center gap-2">
                        <span>Item </span>
                        <Info
                          size={16}
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Identificador único del ítem"
                        />
                      </div>
                    </th>
                    <th className="px-20 py-2 border border-gray-400">
                      <div className="flex items-center gap-2">
                        <span>Nombre </span>
                        <Info
                          size={16}
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Nombre descriptivo del recurso"
                        />
                      </div>
                    </th>
                    <th className="px-24 py-2 border border-gray-400">
                      <div className="flex items-center gap-2">
                        <span>Unidad </span>
                        <Info
                          size={16}
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Unidad de medida asociada al ítem"
                        />
                      </div>
                    </th>
                    <th className="px-4 py-2 border border-gray-400">
                      <div className="flex items-center gap-2">
                        <span>Cantidad </span>
                        <Info
                          size={16}
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Cantidad requerida o utilizada"
                        />
                      </div>
                    </th>
                    <th className="px-4 py-2 border border-gray-400">
                      <div className="flex items-center gap-2">
                        <span>Rend. Unit </span>
                        <Info
                          size={16}
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Rendimiento unitario del ítem"
                        />
                      </div>
                    </th>
                    {tieneId1 && (
                      <th className="px-4 py-2 border border-gray-400">
                        <div className="flex items-center gap-2">
                          <span>% Utilización </span>
                          <Info
                            size={16}
                            data-tooltip-id="tooltip"
                            data-tooltip-content="Porcentaje de utilización del recurso"
                          />
                        </div>
                      </th>
                    )}
                    {tieneId2 && (
                      <th
                        className="px-4 py-2 border border-gray-400"
                        data-tooltip-id="tooltip"
                        data-tooltip-content="Porcentaje de pérdidas relacionadas al recurso"
                      >
                        <div className="flex items-center gap-2">
                          <span>% Perdidas </span>
                          <Info size={16} />
                        </div>
                      </th>
                    )}
                    {tieneId3 && (
                      <th className="px-4 py-2 border border-gray-400">
                        <div className="flex items-center gap-2">
                          <span>% Perdidas </span>
                          <Info
                            size={16}
                            data-tooltip-id="tooltip"
                            data-tooltip-content="Porcentaje de pérdidas relacionadas al recurso"
                          />
                        </div>
                      </th>
                    )}
                    <th className="px-1 py-2 border border-gray-400">
                      <div className="flex items-center gap-2">
                        <span>Precio Unitario ({moneda})</span>
                        <Info
                          size={16}
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Costo unitario del ítem"
                        />
                      </div>
                    </th>
                    <th className="px-5 py-2 border border-gray-400">
                      <div className="flex items-center gap-2">
                        <span>Precio Total ({moneda})</span>
                        <Info
                          size={16}
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Costo total del ítem"
                        />
                      </div>
                    </th>
                    <th className="px-4 py-2 border border-gray-400">
                      <div className="flex items-center gap-2">
                        <span>Acciones</span>
                        <Info
                          size={16}
                          data-tooltip-id="tooltip"
                          data-tooltip-content="Acciones disponibles para el ítem"
                        />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {componente?.material_componente?.map((material, index) => (
                    <tr key={material?.id_Material}>
                      <td className="px-2 text-center py-2 border border-gray-400">
                        {index + 1}
                      </td>
                      <td className="px-4 py-2 border border-gray-400">
                        <input
                          type="text"
                          value={material?.nombre_Material}
                          disabled={[
                            "supervisor",
                            "ITO",
                            "superintendente",
                          ].includes(role)}
                          onChange={(e) =>
                            handleInputChange(
                              componente.id_componente,
                              material.id_Material,
                              "nombre_Material",
                              e.target.value,
                            )
                          }
                          onKeyDown={(e) =>
                            handleInputKeyDown(
                              e,
                              componente.id_componente,
                              material.id_Material,
                              "nombre_Material",
                              e.target.value,
                            )
                          }
                          onBlur={(e) =>
                            handleInputBlur(
                              componente.id_componente,
                              material.id_Material,
                              "nombre_Material",
                              e.target.value,
                            )
                          }
                          className="w-full"
                        />
                      </td>
                      <td className="px-4 py-2 border border-gray-400">
                        <Select
                          className="basic-single font-zen-kaku min-w-40"
                          disabled={[
                            "supervisor",
                            "ITO",
                            "superintendente",
                          ].includes(role)}
                          classNamePrefix="select"
                          isSearchable={true}
                          name="unidad"
                          isDisabled={[
                            "supervisor",
                            "ITO",
                            "superintendente",
                          ].includes(role)}
                          placeholder="Seleccione unidad"
                          options={unidadOptions}
                          value={
                            unidadOptions.find(
                              (option) => option.value === material.id_unidad,
                            ) || null
                          }
                          onChange={(selectedOption) =>
                            handleSelectChange(
                              selectedOption,
                              componente.id_componente,
                              material.id_Material,
                            )
                          }
                          menuPortalTarget={document.body} // Renderiza el menú en el body
                          styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                          }} // Asegúrate de que el menú esté por encima de otros elementos
                        />
                      </td>
                      <td className="px-4 py-2 border border-gray-400">
                        <input
                          type="number"
                          value={material?.cantidad}
                          disabled={[
                            "supervisor",
                            "ITO",
                            "superintendente",
                          ].includes(role)}
                          onChange={(e) =>
                            handleInputChange(
                              componente.id_componente,
                              material.id_Material,
                              "cantidad",
                              e.target.value,
                            )
                          }
                          onKeyDown={(e) =>
                            handleInputKeyDown(
                              e,
                              componente.id_componente,
                              material.id_Material,
                              "cantidad",
                              e.target.value,
                            )
                          }
                          onBlur={(e) =>
                            handleInputBlur(
                              componente.id_componente,
                              material.id_Material,
                              "cantidad",
                              e.target.value,
                            )
                          }
                          className="w-full"
                        />
                      </td>
                      <td className="px-4 py-2 border border-gray-400">
                        <input
                          type="number"
                          value={material?.valor_neto}
                          disabled={[
                            "supervisor",
                            "ITO",
                            "superintendente",
                          ].includes(role)}
                          onChange={(e) =>
                            handleInputChange(
                              componente.id_componente,
                              material.id_Material,
                              "valor_neto",
                              e.target.value,
                            )
                          }
                          onKeyDown={(e) =>
                            handleInputKeyDown(
                              e,
                              componente.id_componente,
                              material.id_Material,
                              "valor_neto",
                              e.target.value,
                            )
                          }
                          onBlur={(e) =>
                            handleInputBlur(
                              componente.id_componente,
                              material.id_Material,
                              "valor_neto",
                              e.target.value,
                            )
                          }
                          className="w-full"
                        />
                      </td>
                      {componente.Nombre === "Equipos y Maquinarias" && (
                        <td className="px-4 py-2 border border-gray-400">
                          <input
                            type="number"
                            value={material?.utilizacion}
                            disabled={[
                              "supervisor",
                              "ITO",
                              "superintendente",
                            ].includes(role)}
                            onChange={(e) =>
                              handleInputChange(
                                componente.id_componente,
                                material.id_Material,
                                "utilizacion",
                                e.target.value,
                              )
                            }
                            onKeyDown={(e) =>
                              handleInputKeyDown(
                                e,
                                componente.id_componente,
                                material.id_Material,
                                "utilizacion",
                                e.target.value,
                              )
                            }
                            onBlur={(e) =>
                              handleInputBlur(
                                componente.id_componente,
                                material.id_Material,
                                "utilizacion",
                                e.target.value,
                              )
                            }
                            className="w-full"
                          />
                        </td>
                      )}
                      {componente.Nombre === "Herramientas y fungiles" && (
                        <td className="px-4 py-2 border border-gray-400">
                          <input
                            type="number"
                            value={material?.perdida}
                            disabled={[
                              "supervisor",
                              "ITO",
                              "superintendente",
                            ].includes(role)}
                            onChange={(e) =>
                              handleInputChange(
                                componente.id_componente,
                                material.id_Material,
                                "perdida",
                                e.target.value,
                              )
                            }
                            onKeyDown={(e) =>
                              handleInputKeyDown(
                                e,
                                componente.id_componente,
                                material.id_Material,
                                "perdida",
                                e.target.value,
                              )
                            }
                            onBlur={(e) =>
                              handleInputBlur(
                                componente.id_componente,
                                material.id_Material,
                                "perdida",
                                e.target.value,
                              )
                            }
                            className="w-full"
                          />
                        </td>
                      )}
                      {componente.Nombre === "Otros" && (
                        <td className="px-4 py-2 border border-gray-400">
                          <input
                            type="number"
                            value={material?.perdidas}
                            disabled={[
                              "supervisor",
                              "ITO",
                              "superintendente",
                            ].includes(role)}
                            onChange={(e) =>
                              handleInputChange(
                                componente.id_componente,
                                material.id_Material,
                                "perdidas",
                                e.target.value,
                              )
                            }
                            onKeyDown={(e) =>
                              handleInputKeyDown(
                                e,
                                componente.id_componente,
                                material.id_Material,
                                "perdidas",
                                e.target.value,
                              )
                            }
                            onBlur={(e) =>
                              handleInputBlur(
                                componente.id_componente,
                                material.id_Material,
                                "perdidas",
                                e.target.value,
                              )
                            }
                            className="w-full"
                          />
                        </td>
                      )}
                      <td className="px-4 py-2 border border-gray-400">
                        <input
                          type="number"
                          value={
                            moneda === "USD"
                              ? CLPtoUSD(material?.valor_unitario)
                              : material?.valor_unitario
                          }
                          disabled={[
                            "supervisor",
                            "ITO",
                            "superintendente",
                          ].includes(role)}
                          onChange={(e) => {
                            let value = e.target.value;
                            // Si está en USD, convierte a CLP antes de guardar
                            if (moneda === "USD" && value !== "") {
                              value = USDToCLP(value);
                            }
                            handleInputChange(
                              componente.id_componente,
                              material.id_Material,
                              "valor_unitario",
                              value,
                            );
                          }}
                          onKeyDown={(e) => {
                            let value = e.target.value;
                            if (moneda === "USD" && value !== "") {
                              value = USDToCLP(value);
                            }
                            handleInputKeyDown(
                              e,
                              componente.id_componente,
                              material.id_Material,
                              "valor_unitario",
                              value,
                            );
                          }}
                          onBlur={(e) => {
                            let value = e.target.value;
                            if (moneda === "USD" && value !== "") {
                              value = USDToCLP(value);
                            }
                            handleInputBlur(
                              componente.id_componente,
                              material.id_Material,
                              "valor_unitario",
                              value,
                            );
                          }}
                          className="w-full"
                        />
                      </td>
                      <td className="px-4 py-2 border border-gray-400">
                        <input
                          type="text"
                          value={
                            moneda === "USD"
                              ? CLPtoUSD(material?.valor_total)
                              : material?.valor_total
                          }
                          disabled
                          onChange={(e) =>
                            handleInputChange(
                              componente.id_componente,
                              material.id_Material,
                              "valor_total",
                              e.target.value,
                            )
                          }
                          onBlur={(e) =>
                            handleInputBlur(
                              componente.id_componente,
                              material.id_Material,
                              "valor_total",
                              e.target.value,
                            )
                          }
                          className="w-full"
                        />
                      </td>
                      <td className="px-4 py-2 border border-gray-400 text-center">
                        <Hidebyrol
                          hiddenRoles={["supervisor", "ITO", "superintendente"]}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteRow(
                                componente.id_componente,
                                material.id_Material,
                                material.nombre_Material
                              )
                            }
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all duration-150"
                            title="Eliminar material"
                          >
                            <Trash2 size={16} />
                          </button>
                        </Hidebyrol>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="px-2 py-2 border border-gray-400 font-bold"></td>
                    <td className="px-4 py-2 border border-gray-400"></td>
                    <td className="px-4 py-2 border border-gray-400"></td>
                    <td className="px-4 py-2 border border-gray-400 font-bold"></td>
                    <td className="px-4 py-2 border border-gray-400 font-bold"></td>
                    {componente.Nombre === "Equipos y Maquinarias" && (
                      <td className="px-4 py-2 border border-gray-400 font-bold"></td>
                    )}
                    {componente.Nombre === "Herramientas y fungiles" && (
                      <td className="px-4 py-2 border border-gray-400 font-bold"></td>
                    )}
                    {componente.Nombre === "Otros" && (
                      <td className="px-4 py-2 border border-gray-400 font-bold"></td>
                    )}
                    <td className="px-4 py-2 border border-gray-400 font-bold">
                      Total
                    </td>
                    <td className="px-4 py-2 border border-gray-400 font-bold">
                      {sums.valor_total}
                    </td>
                    <td className="px-4 py-2 border border-gray-400"></td>
                  </tr>
                  <tr key={`row-${componente.id_componente}`}>
                    <Hidebyrol
                      hiddenRoles={["supervisor", "ITO", "superintendente"]}
                    >
                      <td
                        colSpan="8"
                        className="px-4 py-2 border border-gray-400 text-center"
                      >
                        <button
                          type="button"
                          onClick={() => handleAddRow(componente.id_componente)}
                          className="ml-12 mt-2 px-2 py-1 flex flex-row items-center  text-[#635F60] hover:text-black transition-all ease-linear duration-150"
                        >
                          Añadir Componente
                        </button>
                      </td>
                    </Hidebyrol>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* 🔧 TOOLTIP MOVIDO FUERA DE LA TABLA PARA EVITAR WARNING HTML */}
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
          </div>
        );
      })}

      {/* Modal de confirmación para eliminar material */}
      <ConfirmModal
        open={showConfirm}
        mensaje={
          pendingDelete
            ? `¿Estás seguro que quieres eliminar "${pendingDelete.materialName}"?`
            : "¿Estás seguro que quieres eliminar este material?"
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default Treedetallesuma;