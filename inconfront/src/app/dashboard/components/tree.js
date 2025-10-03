import React, { useState } from "react";
import { ChevronRight, Plus } from "lucide-react";
import Sidebarpartida from "./new_partida";
const { useRouter } = require("next/navigation");

const TreeNode = ({
  label,
  children,
  column1,
  column2,
  onIconClick,
  onLabelClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <div className="flex flex-row">
        <div
          onClick={toggleOpen}
          className={`flex flex-row ease-linear transition-all duration-150 cursor-pointer`}
        >
          <ChevronRight
            strokeWidth={3}
            className={`stroke-teal-500 hover:stroke-teal-600 ${isOpen ? "transition-all rotate-90 ease-linear duration-150" : "transition-all rotate-0 ease-linear duration-150"}`}
          />
        </div>
        <span className="ml-2 cursor-pointer" onClick={onLabelClick}>
          {label}
        </span>
      </div>
      <div
        className={`ml-4 transition-all duration-150 ${isOpen ? "max-h-screen ease-in" : "max-h-0 overflow-hidden ease-out"}`}
      >
        {isOpen && <div>{children}</div>}
      </div>
    </div>
  );
};

const Tree = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [treeNodes, setTreeNodes] = useState([{ label: "Partida 1" }]);
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const router = useRouter();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const handleLabelClick = (label) => {
    router.push("/dashboard/partida_suma");
    setSelectedLabel(label);
  };
  const handleInputChange = (event) => {
    setNewNodeLabel(event.target.value);
  };
  const addTreeNode = () => {
    if (newNodeLabel.trim() !== "") {
      const newTreeNodes = [...treeNodes, { label: newNodeLabel }];
      setTreeNodes(newTreeNodes);
      setNewNodeLabel("");
    }
  };
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      addTreeNode();
    }
  };

  return (
    <div>
      {treeNodes.map((node, index) => (
        <div key={index}>
          <TreeNode
            label={node.label}
            onLabelClick={() => handleLabelClick(node.label)}
          >
            <TreeNode label="Sub-partida">
              <TreeNode label="Tarea">
                <TreeNode label="Sub-tarea" />
              </TreeNode>
            </TreeNode>
          </TreeNode>
        </div>
      ))}
      <div className="flex flex-row">
        <button type="button" onClick={addTreeNode}>
          <Plus
            strokeWidth={3}
            className="stroke-teal-500 hover:stroke-teal-600"
          />
        </button>
        <input
          className="ml-2 bg-gray-100"
          placeholder="Agregar partida"
          type="text"
          value={newNodeLabel}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
      </div>
      <Sidebarpartida
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        selectedLabel={selectedLabel}
      />
    </div>
  );
};
export default Tree;
