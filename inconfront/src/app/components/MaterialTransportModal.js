import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

const MaterialTransportModal = ({ isOpen, onClose, sourceMaterials, onTransport }) => {
  const [selectedMaterials, setSelectedMaterials] = useState([]);

  const toggleMaterialSelection = (materialId) => {
    setSelectedMaterials((prev) =>
      prev.includes(materialId)
        ? prev.filter((id) => id !== materialId)
        : [...prev, materialId]
    );
  };

  const handleTransport = () => {
    onTransport(selectedMaterials); // Callback para transportar materiales
    onClose(); // Cierra el modal
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Transportar Materiales</h2>
          <button onClick={onClose}>
            <X size={20} className="text-gray-600 hover:text-gray-900" />
          </button>
        </div>
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Selecciona los materiales:</h3>
          <ul className="space-y-2">
            {sourceMaterials.map((material) => (
              <li key={material.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`material-${material.id}`}
                  checked={selectedMaterials.includes(material.id)}
                  onChange={() => toggleMaterialSelection(material.id)}
                  className="mr-2"
                />
                <label htmlFor={`material-${material.id}`} className="text-sm text-gray-700">
                  {material.name} (Cantidad: {material.quantity})
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleTransport}
            className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600"
          >
            Transportar
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default MaterialTransportModal;
