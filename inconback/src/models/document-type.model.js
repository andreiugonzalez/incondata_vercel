const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DocumentType = sequelize.define('DocumentType', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING,
  }, {
    tableName: 'document_type'
  });

  return DocumentType;
};