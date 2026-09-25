import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const InstitucionVerificada = sequelize.define('InstitucionVerificada', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'instituciones_verificadas',
  timestamps: true,
  updatedAt: false,
});

export default InstitucionVerificada;
