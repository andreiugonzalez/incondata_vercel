import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from "react-redux";
import "../style/sololectura.css";
import { getPrimaryRole } from "@/app/utils/roleUtils";

const AutoWidthInput = ({ value, onChange, onBlur, onDoubleClick }) => {
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef(null);
  const spanRef = useRef(null);

  const userStore = useSelector((state) => state.user);
  const role = getPrimaryRole(userStore.user);

  useEffect(() => {
    if (spanRef.current && inputRef.current) {
      const newWidth = spanRef.current.scrollWidth + 20;
      if (!isNaN(newWidth) && newWidth > 0) {
        inputRef.current.style.width = `${newWidth}px`;
      } else {
        inputRef.current.style.width = '100px'; // fallback width
      }
    }
  }, [inputValue]);

  return (
    <div className="inline-block">
      <span ref={spanRef} className="invisible absolute whitespace-pre-wrap select-none ">{inputValue || ''}</span>
      <input
        ref={inputRef}
        type='text'
        className={`ml-2 px-2 py-1 select-none  no-border ${['supervisor', 'ITO'].includes(role) ? 'no-disable' : 'allow-pointer-events'}`}
        readOnly
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          onChange(e);
        }}
        onBlur={onBlur}
        onDoubleClick={onDoubleClick}
        style={{ width: 'auto', minWidth: '100px'  }}
      />
    </div>
  );
};

export default AutoWidthInput;