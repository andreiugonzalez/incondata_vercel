import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { BorderAllRounded } from "@mui/icons-material";
import { Smile } from "lucide-react";
import Image from "next/image";
import "../style/progressbar.css";
const { useRouter } = require("next/navigation");
import {
  faArrowUpFromBracket,
  faArrowDown,
  faTrashCan,
  faPenToSquare,
  faSearch,
  faHandPaper,
  faFileUpload,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const CircularChartv2 = ({
  percentage,
  label,
  subLabel,
  color,
  mainLabel,
  labelcon,
  color2,
  fechaini,
  fechaterm,
  tiempo,
  hora,
  isHighlighted,
  // Removed unused prop
}) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const router = useRouter();
  const progressBarStyle = {
    "--progress-color": color,
  };
  const progressBarStyle2 = {
    "--progress-color": color,
  };

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const data = {
      datasets: [
        {
          data: percentage === 100 ? [100] : [percentage, 100 - percentage],
          backgroundColor: percentage === 100 ? [color] : [color, "#ecf0f1"],
          borderWidth: 2,
          borderRadius: 10,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "80%",
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
      },
    };

    chartInstanceRef.current = new Chart(ctx, {
      type: "doughnut",
      data: data,
      options: options,
    });
  }, [percentage, color]);

  return (
    <div className="relative flex space-x-4 group">
      <div className="bg-white rounded-lg p-2 w-[22rem] h-full flex flex-col justify-between select-none">
        <div className="flex flex-row gap-2 justify-center">
          <div
            className={`text-center text-base font-bold font-zen-kaku ${isHighlighted ? "bg-yellow-300 rounded-md" : ""}`}
          >
            {subLabel}
          </div>

          {/* <button onClick={() => {
                                          handleproyectid(data);
                                        }}>
                                            <FontAwesomeIcon icon={faPenToSquare} size="lg" />
                                        </button> */}
        </div>
        <div className="border-b-2 border-gray-200"></div>
        <div className="flex justify-between font-zen-kaku items-center p-1">
          <div className="flex flex-col items-center">
            <h1 className="font-bold font-zen-kaku">Inicio</h1>
            <span className="font-zen-kaku">{fechaini}</span>
          </div>
          <div className="flex flex-col items-center">
            <h1 className="font-bold font-zen-kaku">Fin</h1>
            <span className="font-zen-kaku">{fechaterm}</span>
          </div>
        </div>
        <div className="border-b-2 border-gray-200"></div>
        <div className="relative flex-grow flex items-center justify-center p-10">
          <div className="w-28 h-28 relative">
            <canvas ref={chartRef} className="absolute left-0 w-full h-10" />
          </div>
          <span className="absolute text-2xl font-bold font-zen-kaku">
            {percentage}%
          </span>
        </div>
        <div className="border-b-2 border-gray-200"></div>
        <div className="text-center">
          <div className="text-base font-zen-kaku flex flex-row justify-center items-center p-2">
            <div
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: color }}
            ></div>
            <span className="font-zen-kaku">{label}</span>
          </div>
          <div className="border-b-2 border-gray-200"></div>
          <div className=" text-base font-zen-kaku p-2 items-center flex justify-center">
            <Image
              className="rounded-full mr-4"
              src="/profile.png"
              width={30}
              height={30}
              alt=""
            />
            {mainLabel}
          </div>
          <div className="border-b-2 border-gray-200"></div>
          <div className=" text-base font-zen-kaku p-2 items-center flex justify-center">
            Sin asignación específica
          </div>
          <div className="border-b-2 border-gray-200"></div>
        </div>

        <div className="text-center">
          <div className="text-base font-zen-kaku flex flex-row justify-between items-center p-2 ml-4">
            <progress
              className="rounded-md progress-bar opacity-60"
              style={progressBarStyle}
              max="100"
              value={tiempo}
            ></progress>
            <span className="font-zen-kaku">{tiempo} meses</span>
          </div>
          <div className="text-base font-zen-kaku flex flex-row justify-between items-center p-2 ml-4">
            <progress
              className="rounded-md progress-bar"
              style={progressBarStyle2}
              max="100"
              value={hora}
            ></progress>
            <span className="font-zen-kaku">{hora} horas</span>
          </div>
          <div className="border-b-2 border-gray-200"></div>
        </div>
        <div className="text-center">
          <div className="text-base font-zen-kaku flex flex-row justify-between items-center p-2 ml-4">
            <Smile style={{ color: color2 }} />
            <span className="font-zen-kaku">{labelcon}</span>
          </div>
          <div className="border-b-2 border-gray-200"></div>
        </div>
        <div className="text-center">
          <div className=" text-base font-zen-kaku p-2 items-center flex justify-center">
            <Image
              className="rounded-full mr-4"
              src="/profile.png"
              width={30}
              height={30}
              alt=""
            />
            {mainLabel}
          </div>
        </div>
      </div>
      {/* Agrega más tarjetas aquí */}
    </div>
  );
};

export default CircularChartv2;
