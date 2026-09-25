import InstitucionVerificada from './InstitucionVerificada.js';
import CanalOficial from './CanalOficial.js';

InstitucionVerificada.hasMany(CanalOficial, {
  foreignKey: 'institucionId',
  as: 'canales',
  onDelete: 'CASCADE',
});
CanalOficial.belongsTo(InstitucionVerificada, {
  foreignKey: 'institucionId',
  as: 'institucion',
});

export { InstitucionVerificada, CanalOficial };
