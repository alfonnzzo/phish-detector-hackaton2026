import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const TIPOS_IDENTIFICADOR = ['cbu_cvu', 'alias', 'email', 'telefono', 'usuario'];

const IdentificadorReportado = sequelize.define('IdentificadorReportado', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tipo: {
    type: DataTypes.ENUM(...TIPOS_IDENTIFICADOR),
    allowNull: false,
  },
  valor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  motivo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'identificadores_reportados',
  timestamps: true,
  updatedAt: false,
  indexes: [{ unique: true, fields: ['tipo', 'valor'] }],
});

export default IdentificadorReportado;
