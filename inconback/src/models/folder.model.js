const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Folder = sequelize.define('Folder', {
    id_folder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    nombre_carpeta: {
      type: DataTypes.STRING(),
      allowNull: true
    },
    nombre_S3_cloud: {
      type: DataTypes.STRING(),
      allowNull: true
    },
    enlace: {
      type: DataTypes.STRING(),
      allowNull: true
    },
    usuario_id : {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    parent_folder_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
    ,
    path: {
      type: DataTypes.STRING(),
      allowNull: true
    },
    depth: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    favorited_by_users: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: []
    },
    trashed_by_users: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: []
    },
    deleted_by_users: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: []
    },
    id_proyecto: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_partida: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_subpartida: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_tarea: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_subtarea: {
      type: DataTypes.INTEGER,
      allowNull: true
    },size:{
      type:DataTypes.BIGINT,
      defaultValue: 0,  
    }, write: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    trashed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    updatable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    trashedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
      allowNull: true
    }
    
    
     
     

  }, { 
    tableName: 'Folder',
    timestamps: true 
  });

  return Folder;
};
