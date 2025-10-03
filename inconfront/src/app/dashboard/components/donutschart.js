import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { ChevronRight, ChevronLeft } from "lucide-react";

const DonutChart = ({ label, data, colors }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: label,
        datasets: [
          {
            data: data,
            backgroundColor: colors,
            borderColor: "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%",
        plugins: {
          legend: {
            position: "right",
            align: "center",
            labels: {
              usePointStyle: true,
              pointStyle: "circle",
              boxWidth: 12,
              generateLabels: function (chart) {
                return chart.data.labels.map((label, index) => ({
                  text: `${label} ${chart.data.datasets[0].data[index]}%`,
                  fillStyle: chart.data.datasets[0].backgroundColor[index],
                  lineWidth: 0,
                  hidden: chart.getDatasetMeta(0).data[index].hidden,
                  index: index,
                }));
              },
            },
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                const dataIndex = tooltipItem.dataIndex;
                const dataset = tooltipItem.dataset;
                const value = dataset.data[dataIndex];
                return `${value}%`;
              },
            },
          },
        },
        // Hover configuration to scale the segment
        interaction: {
          mode: "point",
          intersect: false,
        },
        elements: {
          arc: {
            borderWidth: 1,
            hoverBackgroundColor: colors.map((color) => color + "80"),
            hoverBorderColor: colors.map((color) => color + "80"),
          },
        },
      },
    });
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [label, data, colors]);

  const currentYear = new Date().getFullYear();

  const months = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  const [currentMonthIndex, setCurrentMonthIndex] = useState(
    new Date().getMonth(),
  );

  const handleNextMonth = () => {
    setCurrentMonthIndex((prevIndex) => (prevIndex + 1) % 12);
  };

  const handlePreviousMonth = () => {
    setCurrentMonthIndex((prevIndex) => (prevIndex - 1 + 12) % 12);
  };

  const currentMonth = months[currentMonthIndex];

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 max-w-full max-h-full w-full h-full flex flex-col justify-between items-center">
      <div className="flex flex-row gap-4 items-center justify-between text-center text-base font-bold font-zen-kaku">
        <ChevronLeft
          onClick={handlePreviousMonth}
          className="cursor-pointer transition-transform ease-linear duration-150 hover:scale-125"
        />
        <span className="select-none font-zen-kaku">
          {currentMonth} {currentYear}
        </span>
        <ChevronRight
          onClick={handleNextMonth}
          className="cursor-pointer transition-transform ease-linear duration-150 hover:scale-125"
        />
      </div>
      <div className="w-full h-44 relative">
        <canvas
          ref={chartRef}
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
      <span className="font-zen-kaku font-bold">Etapa del proyecto</span>
    </div>
  );
};

export default DonutChart;
