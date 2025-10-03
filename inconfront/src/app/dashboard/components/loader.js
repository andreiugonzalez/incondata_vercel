import React from 'react';
import "../style/loader_page.scss";

const Loader = () => {
  return (
    <div className="wrap">
      <div className="loading">
        <div className="bounceball"></div>
        <div className="text font-zen-kaku select-none">Cargando, por favor espere</div>
      </div>
    </div>
  );
};

export default Loader;
