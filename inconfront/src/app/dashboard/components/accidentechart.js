import React, { useEffect, useState, useCallback } from "react";
import { Bar, Line } from "react-chartjs-2";
import "chart.js/auto";
import {
  chartinc,
  saveUserChartSettings,
  getUserChartSettings,
} from "@/app/services/chart_service"; // Ajusta la ruta según tu estructura de archivos
import {
  parse,
  format,
  startOfWeek,
  addDays,
  endOfWeek,
  isWithinInterval,
  subWeeks,
  addWeeks,
} from "date-fns";
import { toDate } from "date-fns-tz";
import { es } from "date-fns/locale";
import Modal from "react-modal";
import { CogIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

import { useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Loader from "@/app/dashboard/components/loader"; // Asumimos que tienes un componente Loader

const countEventsByDayOfWeek = (
  events,
  start,
  end,
  timeZone = "America/Santiago",
) => {
  // Defensa: si events no es array, retorna estructura vacía
  if (!Array.isArray(events))
    return {
      LUN: { accidents: 0, trainings: 0, incidents: 0 },
      MAR: { accidents: 0, trainings: 0, incidents: 0 },
      MIE: { accidents: 0, trainings: 0, incidents: 0 },
      JUE: { accidents: 0, trainings: 0, incidents: 0 },
      VIE: { accidents: 0, trainings: 0, incidents: 0 },
      SAB: { accidents: 0, trainings: 0, incidents: 0 },
      DOM: { accidents: 0, trainings: 0, incidents: 0 },
    };

  const dayOfWeekCount = {
    LUN: { accidents: 0, trainings: 0, incidents: 0 },
    MAR: { accidents: 0, trainings: 0, incidents: 0 },
    MIE: { accidents: 0, trainings: 0, incidents: 0 },
    JUE: { accidents: 0, trainings: 0, incidents: 0 },
    VIE: { accidents: 0, trainings: 0, incidents: 0 },
    SAB: { accidents: 0, trainings: 0, incidents: 0 },
    DOM: { accidents: 0, trainings: 0, incidents: 0 },
  };

  events.forEach((event) => {
    const category = event.evento_tipo_evento.nombre.toLowerCase();
    const date = parse(event.fecha_inc, "dd/MM/yyyy, HH:mm:ss", new Date());
    const zonedDate = toDate(date, { timeZone });

    if (isWithinInterval(zonedDate, { start, end })) {
      let dayOfWeek = zonedDate.getDay();
      dayOfWeek = (dayOfWeek + 6) % 7; // Ajuste para que lunes sea 0 y domingo sea 6

      const dayLabels = ["LUN", "MAR", "MIE", "JUE", "VIE", "SAB", "DOM"];

      switch (category) {
        case "accidentes":
          dayOfWeekCount[dayLabels[dayOfWeek]].accidents++;
          break;
        case "capacitaciones y entrenamientos":
          dayOfWeekCount[dayLabels[dayOfWeek]].trainings++;
          break;
        case "incidentes":
          dayOfWeekCount[dayLabels[dayOfWeek]].incidents++;
          break;
        default:
          break;
      }
    }
  });

  return dayOfWeekCount;
};

const getWeekLabels = (start) => {
  const labels = [];
  const daysInSpanish = ["LUN", "MAR", "MIE", "JUE", "VIE", "SAB", "DOM"];
  for (let i = 0; i < 7; i++) {
    const day = addDays(start, i);
    labels.push(`${daysInSpanish[i]} ${format(day, "dd/MM", { locale: es })}`);
  }
  return labels;
};

const ChartComponentaccidente = ({ projectId, fetchProjects }) => {
  const searchParams = useSearchParams();
  const userStore = useSelector((state) => state.user);
  const userId = userStore.user ? userStore.user.id : "";

  const chartId = 2; // Identificador único del gráfico

  const initialSettings = {
    chartType: "bar",
    categories: { accidents: true, trainings: true, incidents: true },
    showLegend: true,
    gridLines: true,
    yAxisMin: 0,
    yAxisMax: null,
  };

  const [currentWeek, setCurrentWeek] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [chartData, setChartData] = useState({
    labels: getWeekLabels(currentWeek),
    datasets: [
      {
        label: "Accidentes",
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderRadius: 8,
      },
      {
        label: "Capacitaciones y entrenamientos",
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderRadius: 8,
      },
      {
        label: "Incidentes",
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: "rgba(255, 206, 86, 0.5)",
        borderRadius: 8,
      },
    ],
  });

  const [actualizado, setActualizado] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartType, setChartType] = useState(initialSettings.chartType);
  const [categories, setCategories] = useState(initialSettings.categories);
  const [showLegend, setShowLegend] = useState(initialSettings.showLegend);
  const [gridLines, setGridLines] = useState(initialSettings.gridLines);
  const [yAxisMin, setYAxisMin] = useState(initialSettings.yAxisMin);
  const [yAxisMax, setYAxisMax] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para cargar las configuraciones del usuario
  useEffect(() => {
    const fetchChartSettings = async () => {
      setLoading(true); // Muestra el loader
      try {
        const savedSettings = await getUserChartSettings(
          userId,
          projectId,
          chartId,
        );
        if (
          savedSettings &&
          savedSettings.length > 0 &&
          savedSettings[0].settings
        ) {
          const {
            chartType,
            categories,
            showLegend,
            gridLines,
            yAxisMin,
            yAxisMax,
          } = savedSettings[0].settings;
          setChartType(chartType);
          setCategories(categories);
          setShowLegend(showLegend);
          setGridLines(gridLines);
          setYAxisMin(yAxisMin);
          setYAxisMax(yAxisMax);
        }
      } catch (error) {
        console.error("Error al cargar las configuraciones:", error);
        toast.error("Error al cargar las configuraciones");
      } finally {
        setLoading(false);
      }
    };

    if (userId && projectId) {
      fetchChartSettings();
    }
  }, [userId, projectId, chartId]);

  const fetchEventos = useCallback(
    async (weekStart) => {
      try {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        const response = await chartinc(projectId);
        const eventos = Array.isArray(response.data) ? response.data : [];

        const eventCounts = countEventsByDayOfWeek(eventos, weekStart, weekEnd);

        const datasets = [];
        if (categories.accidents) {
          datasets.push({
            label: "Accidentes",
            data: Object.values(eventCounts).map(
              (dayCounts) => dayCounts.accidents,
            ),
            backgroundColor: "rgba(255, 99, 132, 0.5)",
            borderRadius: 8,
          });
        }
        if (categories.trainings) {
          datasets.push({
            label: "Capacitaciones y entrenamientos",
            data: Object.values(eventCounts).map(
              (dayCounts) => dayCounts.trainings,
            ),
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderRadius: 8,
          });
        }
        if (categories.incidents) {
          datasets.push({
            label: "Incidentes",
            data: Object.values(eventCounts).map(
              (dayCounts) => dayCounts.incidents,
            ),
            backgroundColor: "rgba(255, 206, 86, 0.5)",
            borderRadius: 8,
          });
        }

        const allDataValues = datasets.flatMap((dataset) => dataset.data);
        const maxValue = Math.max(...allDataValues); // Obtener el valor máximo de la data
        setYAxisMax(maxValue + 2); // Asignar un valor 3 puntos mayor al máximo

        setChartData({
          labels: getWeekLabels(weekStart),
          datasets: datasets,
        });

        setActualizado(new Date().toLocaleString());
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    },
    [projectId, categories],
  );

  useEffect(() => {
    fetchEventos(currentWeek);
  }, [fetchEventos, currentWeek]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: chartType === "stackedBar",
        grid: {
          display: gridLines,
        },
      },
      y: {
        stacked: chartType === "stackedBar",
        beginAtZero: true,
        min: yAxisMin,
        max: yAxisMax,
        ticks: {
          callback: function (value) {
            return value;
          },
        },
        grid: {
          display: gridLines,
        },
      },
    },
    plugins: {
      legend: {
        display: showLegend,
        position: "bottom",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return tooltipItem.raw;
          },
        },
      },
    },
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    saveSettings(); // Guardar configuraciones al cerrar el modal
    setIsModalOpen(false);
  };

  const handleChartTypeChange = (e) => {
    const selectedChartType = e.target.value;
    setChartType(selectedChartType);
  };

  const handleCategoryChange = (e) => {
    setCategories({ ...categories, [e.target.name]: e.target.checked });
  };

  const handleLegendChange = (e) => {
    setShowLegend(e.target.checked);
  };

  const handleGridLinesChange = (e) => {
    setGridLines(e.target.checked);
  };

  const handleYAxisMinChange = (e) => {
    const value = Number(e.target.value);
    if (value >= 0 && (yAxisMax === null || value < yAxisMax)) {
      setYAxisMin(value);
    } else {
      alert(
        "El valor mínimo debe ser mayor o igual a 0 y menor que el valor máximo.",
      );
    }
  };

  const handleYAxisMaxChange = (e) => {
    const value = Number(e.target.value);
    if (value > yAxisMin) {
      setYAxisMax(value);
    } else {
      alert("El valor máximo debe ser mayor que el valor mínimo.");
    }
  };

  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleRefresh = () => {
    fetchEventos(currentWeek);
    if (fetchProjects) {
      fetchProjects();
    }
  };

  const handleReset = () => {
    const allDataValues = chartData.datasets.flatMap((dataset) => dataset.data);
    const maxValue = Math.max(...allDataValues); // Obtener el valor máximo de la data

    setChartType(initialSettings.chartType);
    setCategories(initialSettings.categories);
    setShowLegend(initialSettings.showLegend);
    setGridLines(initialSettings.gridLines);
    setYAxisMin(initialSettings.yAxisMin);
    setYAxisMax(maxValue + 2);
  };

  const saveSettings = async () => {
    if (!userId || !projectId) {
      toast.error("Faltan el userId o projectId");
      return;
    }

    const settingsData = {
      userId,
      projectId,
      chartId,
      settings: {
        chartType,
        categories,
        showLegend,
        gridLines,
        yAxisMin,
        yAxisMax,
      },
    };

    try {
      await saveUserChartSettings(settingsData);
      toast.success("Configuraciones guardadas correctamente");
    } catch (error) {
      console.error("Error al guardar las configuraciones:", error);
      toast.error("Error al guardar las configuraciones");
    }
  };

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return <Bar options={options} data={chartData} />;
      case "stackedBar":
        return (
          <Bar
            options={{
              ...options,
              scales: { x: { stacked: true }, y: { stacked: true } },
            }}
            data={chartData}
          />
        );
      case "line":
        return <Line options={options} data={chartData} />;
      default:
        return <Bar options={options} data={chartData} />;
    }
  };

  const getFormattedWeekRange = (week) => {
    const startOfWeekFormatted = format(week, "dd/MM/yyyy", { locale: es });
    const endOfWeekFormatted = format(
      endOfWeek(week, { weekStartsOn: 1 }),
      "dd/MM/yyyy",
      { locale: es },
    );
    return `${startOfWeekFormatted} - ${endOfWeekFormatted}`;
  };

  return (
    <div className="p-4 w-full mx-auto bg-white shadow-lg h-full max-w-lg relative">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <Loader /> {/* Muestra el loader */}
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mr-10 mt-4">
            <h2 className="text-base font-bold mb-4 font-zen-kaku">
              Estado de prevención y/o accidente
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={handleRefresh}
                className="p-2 rounded hover:text-[#5c7891] transition-colors flex items-center justify-center"
              >
                <ArrowPathIcon className="h-6 w-6 transition-transform duration-200 ease-in-out hover:rotate-180" />
              </button>
              <button
                onClick={openModal}
                className="p-2 rounded hover:text-[#5c7891] transition-colors flex items-center justify-center"
              >
                <CogIcon className="h-6 w-6 transition-transform duration-200 ease-in-out hover:rotate-90" />
              </button>
            </div>
          </div>

          <div className="relative h-5/6">{renderChart()}</div>
          <div className="text-center font-zen-kaku">
            <p>{actualizado}</p>
          </div>

          <Modal
            isOpen={isModalOpen}
            onRequestClose={closeModal}
            contentLabel="Configuraciones"
            ariaHideApp={false}
            style={{
              content: {
                width: "fit-content",
                height: "fit-content",
                margin: "auto",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                backgroundColor: "#fff",
              },
            }}
          >
            <h2 className="text-xl font-bold mb-4">
              Configuraciones del Gráfico
            </h2>

            {/* Mostrar la semana actual */}
            <div className="text-center text-gray-600 mb-4">
              <div className="font-semibold">Semana Actual:</div>
              <div>{getFormattedWeekRange(currentWeek)}</div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">
                  Tipo de Gráfico:
                </label>
                <select
                  value={chartType}
                  onChange={handleChartTypeChange}
                  aria-label="Seleccionar tipo de gráfico"
                  className="w-full border border-gray-300 rounded p-2"
                >
                  <option value="bar">Barras</option>
                  <option value="stackedBar">Barras Apiladas</option>
                  <option value="line">Líneas</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  <input
                    type="checkbox"
                    name="accidents"
                    aria-label="Casiila de mostrar accidentes"
                    checked={categories.accidents}
                    onChange={handleCategoryChange}
                    className="mr-2"
                  />
                  Mostrar Accidentes
                </label>
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  <input
                    type="checkbox"
                    name="trainings"
                    aria-label="Casilla de mostrar capacitaciones y entrenamientos"
                    checked={categories.trainings}
                    onChange={handleCategoryChange}
                    className="mr-2"
                  />
                  Mostrar Capacitaciones y Entrenamientos
                </label>
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  <input
                    type="checkbox"
                    name="incidents"
                    checked={categories.incidents}
                    onChange={handleCategoryChange}
                    aria-label="Casilla de mostrar incidentes"
                    className="mr-2"
                  />
                  Mostrar Incidentes
                </label>
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  <input
                    type="checkbox"
                    checked={showLegend}
                    onChange={handleLegendChange}
                    className="mr-2"
                    aria-label="Casilla mostrar leyend"
                  />
                  Mostrar Leyenda
                </label>
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  <input
                    type="checkbox"
                    checked={gridLines}
                    onChange={handleGridLinesChange}
                    className="mr-2"
                    aria-label="Casilla de mostrar líneas de cuadrícula"
                  />
                  Mostrar Líneas de Cuadrícula
                </label>
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Rango Mínimo del Eje Y:
                  <input
                    type="number"
                    value={yAxisMin}
                    onChange={handleYAxisMinChange}
                    className="ml-2 border border-gray-300 rounded p-2"
                    aria-label="Ingresar rango mínimo del eje y"
                  />
                </label>
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Rango Máximo del Eje Y:
                  <input
                    type="number"
                    value={yAxisMax || 1}
                    onChange={handleYAxisMaxChange}
                    aria-label="Ingresar rango maximo del eje y"
                    className="ml-2 border border-gray-300 rounded p-2"
                  />
                </label>
              </div>
            </div>
            <div className="mt-4 flex justify-center space-x-4">
              <button
                onClick={handlePreviousWeek}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg flex flex-col items-center"
              >
                <span className="font-semibold">Semana Anterior</span>
                <span className="text-sm text-gray-200">
                  {getFormattedWeekRange(subWeeks(currentWeek, 1))}
                </span>
              </button>
              <button
                onClick={handleNextWeek}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg flex flex-col items-center"
              >
                <span className="font-semibold">Semana Siguiente</span>
                <span className="text-sm text-gray-200">
                  {getFormattedWeekRange(addWeeks(currentWeek, 1))}
                </span>
              </button>
            </div>

            <div className="mt-4 flex justify-center space-x-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-yellow-500 text-white rounded"
              >
                Reiniciar Configuraciones
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Cerrar
              </button>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default ChartComponentaccidente;
