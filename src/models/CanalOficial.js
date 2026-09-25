import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const CanalOficial = sequelize.define('CanalOficial', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tipo: {
    type: DataTypes.ENUM('telefono', 'sitio_web', 'red_social', 'cbu_cvu_alias'),
    allowNull: false,
  },
  valor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'canales_oficiales',
  timestamps: false,
});

export default CanalOficial;
