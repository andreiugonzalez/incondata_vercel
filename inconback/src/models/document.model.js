const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Document = sequelize.define('Document', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ruta_s3: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    filenames: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    documentTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    organizationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    folderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    estado: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fecha_expiracion: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    filesize:{
      type:DataTypes.INTEGER,
      allowNull: true
    },
    fileExtension:{
      type:DataTypes.STRING,
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
    id_partida: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_subpartida: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_tarea: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_mina: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_subtarea: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },permanentlyDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Puedes cambiar el valor por defecto si lo necesitas
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
    tableName: 'document',
    timestamps: true 
  });

  return Document;
};
