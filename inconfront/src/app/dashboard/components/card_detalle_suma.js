import React from "react";
import { Ticket, Columns4, Paperclip, CirclePlus } from "lucide-react";
import "../style/media_query.css";

function Card({
  index,
  indexsub,
  tareaIndex,
  subtareaIndex,
  nombre,
  cantidad,
  unidad,
}) {
  return (
    <div className="bg-gray-100 w-[18rem] relative flex flex-col rounded-lg p-4 space-y-1 right-0 top-40 custom-tablet-responsive">
      <div className="custom-card">
        <Item icon={<Ticket size={20} color="#5C7891" />} text="Item " />
        <span className="ml-10 text-base font-normal font-zen-kaku">
          {index}.{indexsub}.{tareaIndex}.{subtareaIndex}
        </span>
      </div>
      <div className="custom-card">
        <Item icon={<Columns4 size={20} color="#5C7891" />} text="Número " />
        <span className="ml-10 text-base font-normal font-zen-kaku">
          {unidad}
        </span>
      </div>
      <div className="custom-card">
        <Item
          icon={
            <Paperclip
              strokeWidth={1}
              size={20}
              color="#5C7891"
              className="-rotate-45"
            />
          }
          text="Nombre "
        />
        <span className="ml-10 text-base font-normal font-zen-kaku">
          {nombre}
        </span>
      </div>
      <div className="custom-card">
        <Item icon={<CirclePlus size={20} color="#5C7891" />} text="Cantidad" />
        <span className="ml-10 text-base font-normal font-zen-kaku">
          {cantidad}
        </span>
      </div>
    </div>
  );
}

function Item({ icon, text }) {
  return (
    <div className="flex items-center">
      <span className="mr-4">{icon}</span>
      <p>{text}</p>
    </div>
  );
}

export default Card;
